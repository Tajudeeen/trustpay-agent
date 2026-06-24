"use client";

import { useState } from "react";
import {
  AppNav, DataRow, RiskBadge, VerdictHeadline, PrimaryButton, Eyebrow, Spinner,
} from "@/components/ui";
import type { TrustAssessment } from "@/lib/agent/trust-decision";

const PROVIDERS = [
  {
    id: "0x0000000000000000000000000000000000000001",
    name: "QuickData API",
    description: "High-frequency market data. Multiple disputes on record.",
    category: "Data",
    endpoint: "/api/premium/quote",
    endpointLabel: "Premium Quote",
    priceUsdc: "0.001",
  },
  {
    id: "0x0000000000000000000000000000000000000002",
    name: "Verified Intelligence",
    description: "Established data provider. Consistent delivery history.",
    category: "Intel",
    endpoint: "/api/premium/intelligence",
    endpointLabel: "Market Intelligence",
    priceUsdc: "0.003",
  },
  {
    id: "0x0000000000000000000000000000000000000003",
    name: "Fresh Compute Node",
    description: "New GPU compute provider. No ratings on-chain yet.",
    category: "Compute",
    endpoint: "/api/premium/compute",
    endpointLabel: "Text Compute",
    priceUsdc: "0.0003",
  },
  {
    id: "0x0000000000000000000000000000000000000004",
    name: "Solo Node",
    description: "Perfect score — but only 1 rating. Thin history.",
    category: "Data",
    endpoint: "/api/premium/insight",
    endpointLabel: "Deep Insight",
    priceUsdc: "0.005",
  },
];

type Phase = "idle" | "evaluating" | "evaluated" | "paying" | "paid" | "rated";

interface EvalResult {
  assessment: TrustAssessment;
  source: "onchain" | "seed";
}

interface PayResult {
  paymentId: string;
  amountUsdc: string;
  data: unknown;
}

export default function WorkspacePage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [payResult, setPayResult] = useState<PayResult | null>(null);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const provider = PROVIDERS.find((p) => p.id === selected);

  function selectProvider(id: string) {
    setSelected(id);
    setPhase("idle");
    setEvalResult(null);
    setPayResult(null);
    setFeedbackScore(null);
    setError(null);
  }

  async function handleEvaluate() {
    if (!provider) return;
    setPhase("evaluating");
    setError(null);
    try {
      const res = await fetch(`/api/trust/${provider.id}`);
      if (!res.ok) throw new Error(`Trust API returned ${res.status}`);
      const data = await res.json();
      setEvalResult({ assessment: data.assessment, source: data.source });
      setPhase("evaluated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Evaluation failed");
      setPhase("idle");
    }
  }

  async function handlePay() {
    if (!provider || !evalResult) return;
    if (evalResult.assessment.decision === "REJECT") return;
    setPhase("paying");
    setError(null);
    try {
      // In local demo mode this hits the Next.js API route directly.
      // With a funded wallet + BUYER_PRIVATE_KEY, run agent.ts instead for
      // real GatewayClient x402 payments.
      const res = await fetch(provider.endpoint, {
        method: provider.endpoint.includes("compute") ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        ...(provider.endpoint.includes("compute")
          ? { body: JSON.stringify({ text: "TrustPay Agent test compute request." }) }
          : {}),
      });

      // 402 means the endpoint is live and x402-gated — expected without a wallet
      if (res.status === 402) {
        const paymentHeader = res.headers.get("X-PAYMENT-REQUIRED") ??
          res.headers.get("payment-required") ?? "x402 payment required";
        setPayResult({
          paymentId: `demo_${Date.now()}`,
          amountUsdc: provider.priceUsdc,
          data: {
            note: "402 received — endpoint is live and x402-protected.",
            instruction: "Run agent.ts with BUYER_PRIVATE_KEY to execute a real GatewayClient payment.",
            paymentChallenge: paymentHeader,
            endpoint: provider.endpoint,
          },
        });
        setPhase("paid");
        return;
      }

      if (!res.ok) throw new Error(`Payment endpoint returned ${res.status}`);
      const data = await res.json();
      setPayResult({
        paymentId: `local_${Date.now()}`,
        amountUsdc: provider.priceUsdc,
        data,
      });
      setPhase("paid");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setPhase("evaluated");
    }
  }

  async function handleFeedback() {
    if (!feedbackScore || !payResult || !provider) return;
    try {
      await fetch("/api/trust/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider.id,
          score: feedbackScore,
          paymentId: payResult.paymentId,
        }),
      });
      setPhase("rated");
    } catch {
      // Non-fatal — feedback submission failure doesn't block the flow
      setPhase("rated");
    }
  }

  function reset() {
    setSelected(null);
    setPhase("idle");
    setEvalResult(null);
    setPayResult(null);
    setFeedbackScore(null);
    setError(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <AppNav active="workspace" />

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-px bg-line md:grid-cols-[320px_1fr_300px]">

        {/* Column 1 — Provider selection */}
        <aside className="bg-base p-6 md:p-8">
          <Eyebrow index="01" label="Select Provider" />
          <div className="mt-6 flex flex-col gap-2">
            {PROVIDERS.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProvider(p.id)}
                className={`border p-4 text-left transition-colors ${
                  selected === p.id
                    ? "border-brass-dim bg-panel"
                    : "border-line bg-base hover:border-text-faint hover:bg-panel"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-text">{p.name}</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-faint">{p.category}</span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-text-dim">{p.description}</p>
                <p className="mt-3 font-mono text-xs text-text-dim">
                  {p.priceUsdc} <span className="text-text-faint">USDC</span>
                  <span className="ml-2 text-text-faint">·</span>
                  <span className="ml-2">{p.endpointLabel}</span>
                </p>
              </button>
            ))}
          </div>
          {selected && phase === "idle" && (
            <div className="mt-6">
              <PrimaryButton onClick={handleEvaluate}>Evaluate Trust</PrimaryButton>
            </div>
          )}
          {phase === "evaluating" && (
            <div className="mt-6 flex items-center gap-2 font-mono text-xs text-text-faint">
              <Spinner /> Checking on-chain reputation...
            </div>
          )}
        </aside>

        {/* Column 2 — Verdict */}
        <main className="bg-base p-6 md:p-12">
          <Eyebrow index="02" label="Trust Verdict" />

          <div className="mt-10 min-h-[200px]">
            <VerdictHeadline decision={evalResult?.assessment.decision ?? null} />
          </div>

          {evalResult && (
            <div className="mt-6 max-w-md">
              <div className="space-y-px">
                <DataRow label="Provider" value={provider?.name ?? selected ?? "—"} />
                <DataRow
                  label="Score"
                  value={evalResult.assessment.ratingCount === 0 ? "No history" : `${evalResult.assessment.averageScore.toFixed(1)} / 5`}
                  accent={evalResult.assessment.decision === "REJECT" ? "oxide" : evalResult.assessment.decision === "APPROVE" ? "brass" : undefined}
                />
                <DataRow label="Ratings" value={evalResult.assessment.ratingCount === 0 ? "None on record" : String(evalResult.assessment.ratingCount)} />
                <DataRow label="Risk" value={<RiskBadge level={evalResult.assessment.riskLevel} />} />
                <DataRow label="Source" value={evalResult.source} />
              </div>

              <pre className="mt-6 whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-dim">
                {evalResult.assessment.reasoning}
              </pre>

              {error && (
                <p className="mt-4 font-mono text-xs text-oxide">{error}</p>
              )}

              {phase === "evaluated" && evalResult.assessment.decision !== "REJECT" && (
                <div className="mt-8 space-y-2">
                  <PrimaryButton onClick={handlePay}>
                    {evalResult.assessment.decision === "CONFIRM"
                      ? "I Confirm — Execute Payment"
                      : `Pay ${provider?.priceUsdc} USDC`}
                  </PrimaryButton>
                  {evalResult.assessment.decision === "CONFIRM" && (
                    <p className="text-xs text-text-dim">Manual confirmation required.</p>
                  )}
                </div>
              )}

              {phase === "paying" && (
                <div className="mt-8 flex items-center gap-2 font-mono text-xs text-text-faint">
                  <Spinner /> Executing x402 payment...
                </div>
              )}

              {evalResult.assessment.decision === "REJECT" && (
                <div className="mt-8">
                  <PrimaryButton onClick={reset} variant="ghost">Choose a different provider</PrimaryButton>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Column 3 — Transaction log + feedback */}
        <aside className="bg-panel p-6 md:p-8">
          <Eyebrow index="03" label="Transaction" />

          {!payResult && (
            <p className="mt-6 font-mono text-xs text-text-faint">No transaction yet.</p>
          )}

          {payResult && (
            <div className="mt-6">
              <div className="space-y-px">
                <DataRow label="Payment ID" value={payResult.paymentId.slice(0, 20) + "…"} />
                <DataRow label="Amount" value={`${payResult.amountUsdc} USDC`} />
                <DataRow label="Endpoint" value={provider?.endpoint ?? "—"} />
              </div>

              <div className="mt-4 rounded bg-panel-raised p-3">
                <p className="font-mono text-[10px] text-text-dim mb-2">Response</p>
                <pre className="overflow-x-auto font-mono text-[10px] text-text leading-relaxed whitespace-pre-wrap">
                  {JSON.stringify(payResult.data, null, 2).slice(0, 400)}
                </pre>
              </div>

              {phase === "paid" && (
                <div className="mt-6">
                  <p className="font-mono text-xs text-text-dim mb-3">Rate this provider</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setFeedbackScore(s)}
                        className={`h-8 w-8 border font-mono text-xs transition-colors ${
                          feedbackScore === s
                            ? "border-brass bg-brass/10 text-brass"
                            : "border-line text-text-faint hover:border-text-faint"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4">
                    <PrimaryButton onClick={handleFeedback} disabled={!feedbackScore} variant="ghost">
                      Submit Rating
                    </PrimaryButton>
                  </div>
                </div>
              )}

              {phase === "rated" && (
                <div className="mt-6">
                  <p className="font-mono text-xs text-brass">Rating submitted · {feedbackScore}/5</p>
                  <p className="mt-1 font-mono text-[10px] text-text-faint">Reputation registry updated.</p>
                  <div className="mt-6">
                    <PrimaryButton onClick={reset} variant="ghost">New payment</PrimaryButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
