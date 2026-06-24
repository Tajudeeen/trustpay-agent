"use client";

import { useState } from "react";
import {
  AppNav, DataRow, RiskBadge, VerdictHeadline, Eyebrow, ToolTraceEntry, Spinner,
} from "@/components/ui";
import type { TrustAssessment } from "@/lib/agent/trust-decision";

const SCENARIOS = [
  { id: "low",     label: "Low-trust provider",  desc: "Score 1.7 — 14 ratings — REJECT",  address: "0x0000000000000000000000000000000000000001" },
  { id: "high",    label: "Trusted provider",     desc: "Score 4.6 — 28 ratings — APPROVE", address: "0x0000000000000000000000000000000000000002" },
  { id: "new",     label: "New provider",         desc: "No history — CONFIRM / UNKNOWN",   address: "0x0000000000000000000000000000000000000003" },
  { id: "thin",    label: "Thin history",         desc: "Score 5.0 — 1 rating — CONFIRM",   address: "0x0000000000000000000000000000000000000004" },
];

interface ToolCall {
  tool: string;
  input: unknown;
  output: string;
}

interface RunResult {
  assessment: TrustAssessment;
  address: string;
  toolCalls: ToolCall[];
  finalMessage: string;
  source: string;
}

export default function ConsolePage() {
  const [active, setActive] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runScenario(scenarioId: string) {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setActive(scenarioId);
    setRunning(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`/api/trust/${scenario.address}`);
      if (!res.ok) throw new Error(`Trust API ${res.status}`);
      const data = await res.json();
      const assessment: TrustAssessment = data.assessment;

      const toolCalls: ToolCall[] = [
        {
          tool: "checkReputationTool",
          input: { providerAddress: scenario.address },
          output: JSON.stringify({
            providerAddress: scenario.address,
            averageScoreScaled: data.averageScoreScaled,
            ratingCount: data.ratingCount,
            source: data.source,
            assessment,
          }, null, 2),
        },
      ];

      if (assessment.decision !== "REJECT") {
        toolCalls.push({
          tool: "makePaymentTool",
          input: {
            providerAddress: scenario.address,
            amountUsdc: "0.003",
            riskDecision: assessment.decision,
          },
          output: JSON.stringify({
            txHash: `0xmock${Math.random().toString(16).slice(2, 10)}`,
            paymentId: `pay_${Date.now()}`,
            amountUsdc: 0.003,
            network: "arcTestnet",
            note: "Run agent.ts with BUYER_PRIVATE_KEY for a real GatewayClient payment.",
          }, null, 2),
        });
        toolCalls.push({
          tool: "submitFeedbackTool",
          input: { providerAddress: scenario.address, score: 5, paymentId: `pay_${Date.now()}` },
          output: JSON.stringify({ submitted: true, mockTxHash: `0xrating${Math.random().toString(16).slice(2, 8)}` }, null, 2),
        });
      }

      const finalMessage =
        assessment.decision === "REJECT"
          ? `I checked the on-chain reputation. ${assessment.reasoning}\n\nPayment blocked. Please choose a different provider.`
          : assessment.decision === "CONFIRM"
          ? `I checked the on-chain reputation. ${assessment.reasoning}\n\nProceeding with payment pending confirmation.`
          : `I checked the on-chain reputation. ${assessment.reasoning}\n\nPayment executed successfully.`;

      setResult({ assessment, address: scenario.address, toolCalls, finalMessage, source: data.source });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-base">
      <AppNav active="console" />

      <div className="mx-auto grid w-full max-w-[1400px] flex-1 grid-cols-1 gap-px bg-line md:grid-cols-[300px_1fr]">

        {/* Sidebar */}
        <aside className="bg-base p-6 md:p-8">
          <Eyebrow index="01" label="Scenarios" />
          <p className="mt-4 text-xs leading-relaxed text-text-dim">
            Each scenario calls the live <code className="font-mono text-text-faint">/api/trust/[address]</code> endpoint
            and shows the full agent tool trace.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                onClick={() => runScenario(s.id)}
                disabled={running}
                className={`border p-4 text-left transition-colors ${
                  active === s.id
                    ? "border-brass-dim bg-panel"
                    : "border-line bg-base hover:border-text-faint hover:bg-panel"
                }`}
              >
                <span className="text-sm text-text">{s.label}</span>
                <p className="mt-1 font-mono text-[10px] text-text-faint">{s.desc}</p>
              </button>
            ))}
          </div>

          <div className="mt-10 border-t border-line pt-6">
            <Eyebrow index="02" label="Thresholds" />
            <div className="mt-4 space-y-px">
              <DataRow label="REJECT if score" value="< 2.0" accent="oxide" />
              <DataRow label="CONFIRM if score" value="2.0 – 3.0" />
              <DataRow label="APPROVE if score" value="≥ 3.0 + ≥ 3 ratings" accent="brass" />
              <DataRow label="CONFIRM if ratings" value="< 3 (any score)" />
              <DataRow label="CONFIRM if ratings" value="= 0 (UNKNOWN)" />
            </div>
            <p className="mt-4 font-mono text-[10px] leading-relaxed text-text-faint">
              Hard-coded in trust-decision.ts. The LLM cannot override these via prompt injection.
            </p>
          </div>
        </aside>

        {/* Main output */}
        <main className="flex flex-col bg-base">
          {/* Verdict row */}
          <div className="grid grid-cols-1 gap-px bg-line lg:grid-cols-[1fr_280px]">
            <div className="bg-base p-8 md:p-12">
              <Eyebrow index="03" label="Agent Verdict" />
              <div className="mt-10">
                {running
                  ? <div className="flex items-center gap-3 font-mono text-xs text-text-faint"><Spinner />Running trust evaluation...</div>
                  : <VerdictHeadline decision={result?.assessment.decision ?? null} />
                }
              </div>
            </div>

            <div className="bg-panel p-8">
              <Eyebrow index="04" label="Observed Reputation" />
              <div className="mt-6 space-y-px">
                <DataRow label="Address" value={result ? result.address.slice(0, 14) + "…" : "—"} />
                <DataRow
                  label="Score"
                  value={!result ? "—" : result.assessment.ratingCount === 0 ? "No history" : `${result.assessment.averageScore.toFixed(1)} / 5`}
                  accent={result?.assessment.decision === "REJECT" ? "oxide" : result?.assessment.decision === "APPROVE" ? "brass" : undefined}
                />
                <DataRow label="Ratings" value={result ? String(result.assessment.ratingCount) : "—"} />
                <DataRow label="Risk" value={result ? <RiskBadge level={result.assessment.riskLevel} /> : "—"} />
                <DataRow label="Decision" value={result?.assessment.decision ?? "—"} accent={result?.assessment.decision === "REJECT" ? "oxide" : result?.assessment.decision === "APPROVE" ? "brass" : undefined} />
                <DataRow label="Source" value={result?.source ?? "—"} />
              </div>
              {result && (
                <pre className="mt-5 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-text-dim">
                  {result.assessment.reasoning}
                </pre>
              )}
              {!result && !running && (
                <p className="mt-6 font-mono text-xs text-text-faint">Select a scenario to run.</p>
              )}
              {error && <p className="mt-4 font-mono text-xs text-oxide">{error}</p>}
            </div>
          </div>

          {/* Tool trace */}
          <div className="flex-1 bg-base p-6 md:p-8">
            <div className="flex items-center justify-between">
              <Eyebrow index="05" label="Tool Trace" />
              {result && (
                <span className="font-mono text-[10px] text-text-faint">
                  {result.toolCalls.length} call{result.toolCalls.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {!result && !running && (
              <p className="mt-6 font-mono text-xs text-text-faint">Tool calls appear here once a scenario runs.</p>
            )}

            {result && (
              <div className="mt-6">
                {result.toolCalls.map((c, i) => (
                  <ToolTraceEntry key={i} tool={c.tool} input={c.input} output={c.output} index={i} />
                ))}
                <div className="mt-6 border-t border-line pt-6">
                  <p className="font-mono text-[10px] text-text-dim">Agent final message</p>
                  <pre className="mt-3 whitespace-pre-wrap font-mono text-xs leading-relaxed text-text-dim">
                    {result.finalMessage}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
