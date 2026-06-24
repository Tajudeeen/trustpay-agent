import { NextRequest, NextResponse } from "next/server";
import { withPayment, type PaymentInfo } from "@/lib/x402/middleware";

const QUOTES = [
  "Trust is the foundation of every transaction. Verify first, pay second.",
  "In the agentic economy, reputation is the only collateral that matters.",
  "Every payment is a vote of confidence. Make it count.",
  "The best payment is one that never needed to happen — but when it does, it's instant.",
  "Decentralised trust doesn't mean blind trust. It means verifiable trust.",
  "Sub-cent payments unlock an economy that subscription models can't reach.",
  "An agent that pays without checking is an agent that will be exploited.",
  "Reputation on-chain doesn't lie. It compounds.",
];

export const GET = withPayment("0.001", async (_req: NextRequest, payment: PaymentInfo) => {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return NextResponse.json({
    quote,
    source: "TrustPay Premium Intelligence",
    payment: {
      payer: payment.payer,
      amount: payment.amount,
      network: payment.network,
    },
    timestamp: new Date().toISOString(),
  });
});
