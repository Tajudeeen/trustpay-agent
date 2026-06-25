"use client";

import { useState, useEffect, useCallback } from "react";
import { AppNav, Eyebrow } from "@/components/ui";

interface PaymentRecord {
  id: string;
  endpoint: string;
  amountUsdc: string;
  payer: string;
  network: string;
  settledAt: string;
}

interface DashboardStats {
  totalPayments: number;
  totalVolumeUsdc: string;
  uniquePayers: number;
}

// Seed data — always visible, even on fresh serverless instances
const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: "pay_seed_001",
    endpoint: "/api/premium/intelligence",
    amountUsdc: "0.003000",
    payer: "0xAgent...a1b2",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "pay_seed_002",
    endpoint: "/api/premium/quote",
    amountUsdc: "0.001000",
    payer: "0xAgent...c3d4",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "pay_seed_003",
    endpoint: "/api/premium/compute",
    amountUsdc: "0.000300",
    payer: "0xAgent...e5f6",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "pay_seed_004",
    endpoint: "/api/premium/insight",
    amountUsdc: "0.005000",
    payer: "0xAgent...g7h8",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 31).toISOString(),
  },
  {
    id: "pay_seed_005",
    endpoint: "/api/premium/intelligence",
    amountUsdc: "0.003000",
    payer: "0xAgent...i9j0",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 47).toISOString(),
  },
  {
    id: "pay_seed_006",
    endpoint: "/api/premium/quote",
    amountUsdc: "0.001000",
    payer: "0xAgent...k1l2",
    network: "arcTestnet",
    settledAt: new Date(Date.now() - 1000 * 60 * 68).toISOString(),
  },
];

const SEED_STATS: DashboardStats = {
  totalPayments: 6,
  totalVolumeUsdc: "0.013300",
  uniquePayers: 6,
};

const ENDPOINT_LABELS: Record<string, string> = {
  "/api/premium/quote": "Premium Quote",
  "/api/premium/intelligence": "Market Intel",
  "/api/premium/compute": "Text Compute",
  "/api/premium/insight": "Deep Insight",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function DashboardPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(SEED_PAYMENTS);
  const [stats, setStats] = useState<DashboardStats>(SEED_STATS);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [live, setLive] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      if (!res.ok) return;
      const data = await res.json();
      const livePayments: PaymentRecord[] = data.payments ?? [];
      if (livePayments.length > 0) {
        // Merge live payments on top of seed, deduplicate by id
        const merged = [...livePayments, ...SEED_PAYMENTS].filter(
          (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i,
        );
        setPayments(merged);
        setStats({
          totalPayments: merged.length,
          totalVolumeUsdc: merged
            .reduce((s, p) => s + parseFloat(p.amountUsdc), 0)
            .toFixed(6),
          uniquePayers: new Set(merged.map((p) => p.payer)).size,
        });
        setLive(true);
      }
      setLastFetch(new Date());
    } catch {
      // Non-fatal — seed data remains visible
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <AppNav active="dashboard" />

      <div className="mx-auto w-full max-w-[1400px] p-6 md:p-10">
        {/* Header */}
        <div className="flex items-start justify-between">
          <Eyebrow index="01" label="Payment Activity" />
          <div className="flex items-center gap-2 font-mono text-xs text-text-faint">
            <span
              className={`h-1.5 w-1.5 rounded-full animate-pulse ${live ? "bg-brass" : "bg-text-faint"}`}
            />
            {live ? "Live" : "Demo data"} ·{" "}
            {lastFetch
              ? `Updated ${timeAgo(lastFetch.toISOString())}`
              : "Loading…"}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
          <div className="bg-panel p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              Total Payments
            </p>
            <p className="mt-3 font-display text-5xl text-text">
              {stats.totalPayments}
            </p>
          </div>
          <div className="bg-panel p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              Volume (USDC)
            </p>
            <p className="mt-3 font-display text-5xl text-brass">
              ${stats.totalVolumeUsdc}
            </p>
          </div>
          <div className="bg-panel p-6">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint">
              Unique Payers
            </p>
            <p className="mt-3 font-display text-5xl text-text">
              {stats.uniquePayers}
            </p>
          </div>
        </div>

        {/* Payment log */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <Eyebrow index="02" label="Recent Settlements" />
            <button
              onClick={fetchData}
              className="font-mono text-xs uppercase tracking-[0.18em] text-text-faint hover:text-text transition-colors"
            >
              Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-line">
                  {[
                    "Time",
                    "Endpoint",
                    "Amount (USDC)",
                    "Payer",
                    "Network",
                    "Payment ID",
                  ].map((h) => (
                    <th
                      key={h}
                      className="pb-3 text-left font-mono text-xs uppercase tracking-[0.12em] text-text-faint pr-6"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-line hover:bg-panel transition-colors"
                  >
                    <td className="py-4 pr-6 font-mono text-sm text-text-dim whitespace-nowrap">
                      {timeAgo(p.settledAt)}
                    </td>
                    <td className="py-4 pr-6 text-sm text-text whitespace-nowrap">
                      {ENDPOINT_LABELS[p.endpoint] ?? p.endpoint}
                    </td>
                    <td className="py-4 pr-6 font-mono text-sm text-brass whitespace-nowrap">
                      ${p.amountUsdc}
                    </td>
                    <td className="py-4 pr-6 font-mono text-sm text-text-dim whitespace-nowrap">
                      {p.payer}
                    </td>
                    <td className="py-4 pr-6 font-mono text-sm text-text-dim whitespace-nowrap">
                      {p.network}
                    </td>
                    <td className="py-4 font-mono text-xs text-text-faint whitespace-nowrap">
                      {p.id.slice(0, 20)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust decisions */}
        <div className="mt-14">
          <Eyebrow index="03" label="Trust Decisions" />
          <div className="mt-6 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                provider: "QuickData API",
                score: "1.7",
                ratings: 14,
                verdict: "REJECT",
                color: "text-oxide",
                rule: "bg-oxide-dim",
              },
              {
                provider: "Verified Intelligence",
                score: "4.6",
                ratings: 28,
                verdict: "APPROVE",
                color: "text-brass",
                rule: "bg-brass-dim",
              },
              {
                provider: "Fresh Compute Node",
                score: "—",
                ratings: 0,
                verdict: "CONFIRM",
                color: "text-text-dim",
                rule: "bg-line",
              },
              {
                provider: "Solo Node",
                score: "5.0",
                ratings: 1,
                verdict: "CONFIRM",
                color: "text-text-dim",
                rule: "bg-line",
              },
            ].map((t) => (
              <div key={t.provider} className="bg-panel p-6">
                <p className="text-sm text-text-dim">{t.provider}</p>
                <div className={`mt-3 h-px w-8 ${t.rule}`} />
                <p className={`mt-3 font-mono text-sm font-medium ${t.color}`}>
                  {t.verdict}
                </p>
                <dl className="mt-3 space-y-1 font-mono text-xs text-text-faint">
                  <div className="flex justify-between">
                    <dt>Score</dt>
                    <dd>{t.score}/5</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Ratings</dt>
                    <dd>{t.ratings}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>

        {/* Protected endpoints */}
        <div className="mt-14">
          <Eyebrow index="04" label="Protected Endpoints" />
          <div className="mt-6 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                endpoint: "/api/premium/quote",
                price: "$0.001",
                label: "Premium Quote",
                method: "GET",
              },
              {
                endpoint: "/api/premium/intelligence",
                price: "$0.003",
                label: "Market Intel",
                method: "GET",
              },
              {
                endpoint: "/api/premium/compute",
                price: "$0.0003",
                label: "Text Compute",
                method: "POST",
              },
              {
                endpoint: "/api/premium/insight",
                price: "$0.005",
                label: "Deep Insight",
                method: "GET",
              },
            ].map((e) => (
              <div key={e.endpoint} className="bg-panel p-6">
                <span className="font-mono text-xs uppercase tracking-[0.12em] text-text-faint">
                  {e.method}
                </span>
                <p className="mt-3 text-base text-text">{e.label}</p>
                <p className="mt-1 font-mono text-xs text-text-dim">
                  {e.endpoint}
                </p>
                <p className="mt-4 font-display text-3xl text-brass">
                  {e.price}
                </p>
                <p className="mt-1 font-mono text-xs text-text-faint">
                  per request · USDC · x402
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
