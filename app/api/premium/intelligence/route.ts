import { NextRequest, NextResponse } from "next/server";
import { withPayment, type PaymentInfo } from "@/lib/x402/middleware";

const INTEL_REPORTS = [
  {
    title: "Arc Testnet Activity",
    summary: "Transaction volume up 340% week-over-week. AI agent wallets account for 67% of unique senders.",
    signal: "BULLISH",
    confidence: 0.82,
  },
  {
    title: "x402 Payment Protocol Adoption",
    summary: "14 new integrations registered this week. Average payment size: $0.0023 USDC. Rejection rate: 3.1%.",
    signal: "GROWING",
    confidence: 0.91,
  },
  {
    title: "Reputation Registry Insights",
    summary: "Providers with 10+ ratings have 94% payment success rate. New providers (<3 ratings) show 41% rejection rate.",
    signal: "TRUST_MATTERS",
    confidence: 0.88,
  },
  {
    title: "Gateway Settlement Batch",
    summary: "Last batch settled 2,847 payments in a single onchain tx. Gas cost per payment equivalent: $0.000003.",
    signal: "EFFICIENT",
    confidence: 0.95,
  },
];

export const GET = withPayment("0.003", async (_req: NextRequest, payment: PaymentInfo) => {
  const report = INTEL_REPORTS[Math.floor(Math.random() * INTEL_REPORTS.length)];
  return NextResponse.json({
    report,
    payment: {
      payer: payment.payer,
      amount: payment.amount,
      network: payment.network,
      transaction: payment.transaction,
    },
    generatedAt: new Date().toISOString(),
  });
});
