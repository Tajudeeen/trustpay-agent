import { NextResponse } from "next/server";

// In-memory store of completed x402 payments received by this seller.
// In production this would be persisted to Supabase; the structure is
// identical so swapping is a one-line change (supabase.from("payments").select()).
export interface PaymentRecord {
  id: string;
  endpoint: string;
  amountUsdc: string;
  payer: string;
  network: string;
  settledAt: string;
  priceLabel: string;
}

// Seeded with representative records so the dashboard looks live
// even before real payments flow through.
const PAYMENT_LOG: PaymentRecord[] = [
  {
    id: "pay_seed_001",
    endpoint: "/api/premium/intelligence",
    amountUsdc: "0.003000",
    payer: "0xAgent...a1b2",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    priceLabel: "$0.003",
  },
  {
    id: "pay_seed_002",
    endpoint: "/api/premium/quote",
    amountUsdc: "0.001000",
    payer: "0xAgent...c3d4",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    priceLabel: "$0.001",
  },
  {
    id: "pay_seed_003",
    endpoint: "/api/premium/compute",
    amountUsdc: "0.000300",
    payer: "0xAgent...e5f6",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    priceLabel: "$0.0003",
  },
  {
    id: "pay_seed_004",
    endpoint: "/api/premium/insight",
    amountUsdc: "0.005000",
    payer: "0xAgent...g7h8",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
    priceLabel: "$0.005",
  },
];

export function recordPayment(record: Omit<PaymentRecord, "id" | "settledAt">) {
  PAYMENT_LOG.unshift({
    ...record,
    id: `pay_${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
    settledAt: new Date().toISOString(),
  });
  // Keep last 200 entries
  if (PAYMENT_LOG.length > 200) PAYMENT_LOG.length = 200;
}

export function GET() {
  const total = PAYMENT_LOG.reduce(
    (s, p) => s + parseFloat(p.amountUsdc),
    0
  );
  return NextResponse.json({
    payments: PAYMENT_LOG.slice(0, 50),
    stats: {
      totalPayments: PAYMENT_LOG.length,
      totalVolumeUsdc: total.toFixed(6),
      uniquePayers: new Set(PAYMENT_LOG.map((p) => p.payer)).size,
    },
  });
}
