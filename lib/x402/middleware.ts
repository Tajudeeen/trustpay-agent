import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

const SELLER_ADDRESS = (process.env.SELLER_ADDRESS ?? "") as `0x${string}`;

type Handler = (req: NextRequest, paymentInfo: PaymentInfo) => Promise<NextResponse>;

export interface PaymentInfo {
  payer: string;
  amount: string;
  network: string;
  transaction?: string;
}

/**
 * Adapts createGatewayMiddleware (Express-style) for Next.js App Router.
 * Issues real HTTP 402 challenges; GatewayClient.pay() handles the retry.
 */
export function withPayment(priceUsdc: string, handler: Handler) {
  const gateway = createGatewayMiddleware({ sellerAddress: SELLER_ADDRESS });
  const requirePayment = (gateway as any).require(priceUsdc);

  return async function (req: NextRequest): Promise<NextResponse> {
    return new Promise<NextResponse>((resolve) => {
      const url = req.nextUrl.pathname + req.nextUrl.search;
      const headers: Record<string, string> = {};
      req.headers.forEach((v, k) => { headers[k] = v; });

      const nodeReq = Object.assign(new Readable({ read() {} }), {
        method: req.method,
        url,
        headers,
        socket: { remoteAddress: "127.0.0.1" },
        payment: undefined as PaymentInfo | undefined,
      });

      let _status = 200;
      const resHeaders: Record<string, string> = {};

      const nodeRes = {
        get statusCode() { return _status; },
        set statusCode(v: number) { _status = v; },
        setHeader(k: string, v: string) { resHeaders[k] = v; },
        getHeader(k: string) { return resHeaders[k]; },
        end(chunk?: string) {
          if (_status !== 200) {
            const r = new NextResponse(chunk ?? null, { status: _status });
            Object.entries(resHeaders).forEach(([k, v]) => r.headers.set(k, v));
            resolve(r);
          }
          // else next() handled it
        },
        write() {},
        writeHead() {},
      };

      const next = async () => {
        const paymentInfo: PaymentInfo = (nodeReq as any).payment ?? {
          payer: "",
          amount: priceUsdc,
          network: "arcTestnet",
        };
        try {
          const handlerRes = await handler(req, paymentInfo);
          if (resHeaders["PAYMENT-RESPONSE"]) {
            handlerRes.headers.set("PAYMENT-RESPONSE", resHeaders["PAYMENT-RESPONSE"]);
          }
          resolve(handlerRes);
        } catch {
          resolve(NextResponse.json({ error: "Handler error" }, { status: 500 }));
        }
      };

      Promise.resolve(requirePayment(nodeReq as any, nodeRes as any, next)).catch((err: Error) => {
        resolve(NextResponse.json({ error: err.message }, { status: 500 }));
      });
    });
  };
}
