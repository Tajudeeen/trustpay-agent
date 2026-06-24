"use client";

import { useState, useEffect, useCallback } from "react";
import { AppNav, Eyebrow, DataRow } from "@/components/ui";

interface PaymentRecord {
  id: string;
  endpoint: string;
  amountUsdc: string;
  payer: string;
  network: string;
  settledAt: string;
  priceLabel: string;
}

interface DashboardStats {
  totalPayments: number;
  totalVolumeUsdc: string;
  uniquePayers: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ENDPOINT_LABELS: Record<string, string> = {
  "/api/premium/quote": "Premium Quote",
  "/api/premium/intelligence": "Market Intel",
  "/api/premium/compute": "Text Compute",
  "/api/premium/insight": "Deep Insight",
};

export default function DashboardPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/payments");
      if (!res.ok) return;
      const data = await res.json();
      setPayments(data.payments ?? []);
      setStats(data.stats ?? null);
      setLastFetch(new Date());
    } catch {
      // Non-fatal — keep showing stale data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <AppNav active="dashboard" />

      <div className="mx-auto w-full max-w-[1400px] p-6 md:p-10">
        <div className="flex items-start justify-between">
          <Eyebrow index="01" label="Payment Activity" />
          <div className="flex items-center gap-2 font-mono text-[10px] text-text-faint">
            <span className="h-1.5 w-1.5 rounded-full bg-brass animate-pulse" />
            {lastFetch ? `Updated ${timeAgo(lastFetch.toISOString())}` : "Loading…"}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mt-8 grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
            <div className="bg-panel p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">Total Payments</p>
              <p className="mt-3 font-display text-4xl text-text">{stats.totalPayments}</p>
            </div>
            <div className="bg-panel p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">Volume (USDC)</p>
              <p className="mt-3 font-display text-4xl text-brass">${stats.totalVolumeUsdc}</p>
            </div>
            <div className="bg-panel p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">Unique Payers</p>
              <p className="mt-3 font-display text-4xl text-text">{stats.uniquePayers}</p>
            </div>
          </div>
        )}

        {/* Payment log */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <Eyebrow index="02" label="Recent Settlements" />
            <button
              onClick={fetchData}
              className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint hover:text-text transition-colors"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <p className="font-mono text-xs text-text-faint">Loading payments…</p>
          )}

          {!loading && payments.length === 0 && (
            <p className="font-mono text-xs text-text-faint">
              No payments recorded yet. Run a payment from the Workspace or execute agent.ts.
            </p>
          )}

          {payments.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-line">
                    {["Time", "Endpoint", "Amount", "Payer", "Network", "ID"].map((h) => (
                      <th key={h} className="pb-3 text-left font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-line hover:bg-panel transition-colors">
                      <td className="py-3 pr-6 font-mono text-xs text-text-dim whitespace-nowrap">
                        {timeAgo(p.settledAt)}
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-text whitespace-nowrap">
                        {ENDPOINT_LABELS[p.endpoint] ?? p.endpoint}
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-brass whitespace-nowrap">
                        ${p.amountUsdc}
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-text-dim whitespace-nowrap">
                        {p.payer.length > 14 ? p.payer.slice(0, 10) + "…" + p.payer.slice(-4) : p.payer}
                      </td>
                      <td className="py-3 pr-6 font-mono text-xs text-text-dim whitespace-nowrap">
                        {p.network}
                      </td>
                      <td className="py-3 font-mono text-[10px] text-text-faint whitespace-nowrap">
                        {p.id.slice(0, 18)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Endpoint pricing */}
        <div className="mt-12">
          <Eyebrow index="03" label="Protected Endpoints" />
          <div className="mt-6 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { endpoint: "/api/premium/quote",        price: "$0.001",  label: "Premium Quote",    method: "GET"  },
              { endpoint: "/api/premium/intelligence", price: "$0.003",  label: "Market Intel",     method: "GET"  },
              { endpoint: "/api/premium/compute",      price: "$0.0003", label: "Text Compute",     method: "POST" },
              { endpoint: "/api/premium/insight",      price: "$0.005",  label: "Deep Insight",     method: "GET"  },
            ].map((e) => (
              <div key={e.endpoint} className="bg-panel p-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-faint">{e.method}</span>
                <p className="mt-3 text-sm text-text">{e.label}</p>
                <p className="mt-1 font-mono text-xs text-text-dim">{e.endpoint}</p>
                <p className="mt-4 font-display text-2xl text-brass">{e.price}</p>
                <p className="mt-1 font-mono text-[10px] text-text-faint">per request · USDC</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
