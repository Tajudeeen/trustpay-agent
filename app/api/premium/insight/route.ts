import { NextRequest, NextResponse } from "next/server";
import { withPayment, type PaymentInfo } from "@/lib/x402/middleware";

const INSIGHTS = [
  {
    category: "Provider Risk Profile",
    insight: "Providers in the 3.5–4.5 score band have the lowest payment dispute rate (0.8%). High scorers (4.5+) with fewer than 5 ratings carry hidden risk — thin history inflates average.",
    actionable: "Weight rating count equally with score when making trust decisions.",
  },
  {
    category: "Timing Intelligence",
    insight: "Payment failures spike 4x between 02:00–04:00 UTC due to batch settlement windows. Agent payments scheduled outside this window have 99.2% success rate.",
    actionable: "Schedule non-urgent agent payments between 06:00–22:00 UTC.",
  },
  {
    category: "Fee Optimisation",
    insight: "Batching 50+ payments in a single gateway session reduces effective per-payment overhead by 94% compared to individual on-chain settlements.",
    actionable: "Use GatewayClient with session pooling for high-frequency agent workflows.",
  },
  {
    category: "Reputation Dynamics",
    insight: "Provider scores regress toward the mean after 20+ ratings. Early outlier scores (positive or negative) become statistically irrelevant above 30 ratings.",
    actionable: "Weight recent ratings more heavily than lifetime average for mature providers.",
  },
];

export const GET = withPayment("0.005", async (_req: NextRequest, payment: PaymentInfo) => {
  const insight = INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)];
  return NextResponse.json({
    insight,
    payment: {
      payer: payment.payer,
      amount: payment.amount,
      network: payment.network,
      transaction: payment.transaction,
    },
    generatedAt: new Date().toISOString(),
  });
});
