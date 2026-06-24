"use client";

import Link from "next/link";
import { type ReactNode } from "react";

export function AppNav({ active }: { active: "workspace" | "console" | "dashboard" }) {
  const links = [
    { href: "/workspace", key: "workspace", label: "Workspace" },
    { href: "/console", key: "console", label: "Decision Console" },
    { href: "/dashboard", key: "dashboard", label: "Dashboard" },
  ];
  return (
    <header className="border-b border-line sticky top-0 z-20 bg-base/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="font-display text-base tracking-tight text-text">
          TrustPay <span className="text-brass">Agent</span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-2 text-[11px] uppercase tracking-[0.18em] transition-colors ${
                active === l.key
                  ? "border-b border-brass text-brass"
                  : "text-text-dim hover:text-text"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-faint">/ {index}</p>
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">{label}</p>
    </div>
  );
}

export function DataRow({
  label,
  value,
  accent,
  mono = true,
}: {
  label: string;
  value: ReactNode;
  accent?: "brass" | "oxide";
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-3">
      <span className={`text-text-dim ${mono ? "font-mono text-xs" : "text-sm"}`}>{label}</span>
      <span
        className={`${mono ? "font-mono text-xs" : "text-sm"} ${
          accent === "brass"
            ? "text-brass"
            : accent === "oxide"
            ? "text-oxide"
            : "text-text"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export function RiskBadge({ level }: { level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN" }) {
  const s: Record<string, string> = {
    LOW: "text-brass border-brass-dim",
    MEDIUM: "text-[#d4a84b] border-[#8a7339]",
    HIGH: "text-oxide border-oxide-dim",
    UNKNOWN: "text-text-dim border-line",
  };
  return (
    <span className={`border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] ${s[level]}`}>
      {level}
    </span>
  );
}

export function VerdictHeadline({ decision }: { decision: "APPROVE" | "REJECT" | "CONFIRM" | null }) {
  if (!decision) {
    return (
      <p className="font-display text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-tight text-text-faint">
        Awaiting<br />evaluation
      </p>
    );
  }
  const map = {
    APPROVE: { word1: "Payment", word2: "approved", accent: "text-brass",    rule: "bg-brass-dim" },
    REJECT:  { word1: "Payment", word2: "rejected", accent: "text-oxide",    rule: "bg-oxide-dim" },
    CONFIRM: { word1: "Confirmation", word2: "required", accent: "text-text-dim", rule: "bg-line" },
  };
  const { word1, word2, accent, rule } = map[decision];
  return (
    <div>
      <div className={`mb-5 h-px w-12 ${rule}`} />
      <p className={`font-display text-[clamp(2.5rem,5vw,4.5rem)] font-medium leading-[1.02] tracking-tight ${accent}`}>
        {word1}<br /><span className="text-text">{word2}</span>
      </p>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  variant = "brass",
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "brass" | "oxide" | "ghost";
  type?: "button" | "submit";
}) {
  const s = {
    brass: "bg-brass text-base hover:opacity-90 disabled:opacity-40",
    oxide: "bg-oxide text-text hover:opacity-90 disabled:opacity-40",
    ghost: "border border-line text-text-dim hover:text-text hover:border-text-dim disabled:opacity-40",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] transition-opacity ${s[variant]}`}
    >
      {children}
    </button>
  );
}

export function Spinner() {
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-text-dim border-t-transparent" />
  );
}

export function ToolTraceEntry({
  tool,
  input,
  output,
  index,
}: {
  tool: string;
  input: unknown;
  output: string;
  index: number;
}) {
  let parsed: unknown = output;
  try { parsed = JSON.parse(output); } catch { /* keep string */ }
  return (
    <div className="border-b border-line py-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] text-text-faint">{String(index + 1).padStart(2, "0")}</span>
        <span className="font-mono text-xs text-brass">{tool}</span>
      </div>
      <pre className="mt-3 overflow-x-auto rounded bg-panel-raised p-3 font-mono text-[11px] leading-relaxed text-text-dim whitespace-pre-wrap">
        {JSON.stringify({ input, output: parsed }, null, 2)}
      </pre>
    </div>
  );
}
