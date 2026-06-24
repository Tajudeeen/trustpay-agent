import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-base text-text">
      {/* Nav */}
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
          <span className="font-display text-lg tracking-tight">
            TrustPay <span className="text-brass">Agent</span>
          </span>
          <nav className="hidden md:flex items-center gap-8 text-[11px] uppercase tracking-[0.18em] text-text-dim">
            <Link href="/workspace" className="hover:text-text transition-colors">Workspace</Link>
            <Link href="/console"   className="hover:text-text transition-colors">Console</Link>
            <Link href="/dashboard" className="hover:text-text transition-colors">Dashboard</Link>
          </nav>
          <Link href="/workspace" className="border border-brass-dim px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-brass hover:border-brass hover:bg-brass/5 transition-colors">
            Try Agent
          </Link>
        </div>
      </header>

      {/* Hero — asymmetric, Aer-derived */}
      <section className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-col gap-8 md:pt-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-brass">/ 01 — Protocol</p>
            <div className="mt-2 h-px w-10 bg-brass-dim" />
          </div>
          <p className="max-w-[22ch] text-sm leading-relaxed text-text-dim">
            AI agents that pay for resources autonomously — but only after checking who they're paying.
          </p>
          <dl className="space-y-3 border-t border-line pt-6 font-mono text-xs text-text-dim">
            <div className="flex justify-between gap-4"><dt>Network</dt><dd className="text-text">Arc Testnet</dd></div>
            <div className="flex justify-between gap-4"><dt>Rail</dt><dd className="text-text">x402 / HTTP</dd></div>
            <div className="flex justify-between gap-4"><dt>Trust source</dt><dd className="text-text">On-chain registry</dd></div>
            <div className="flex justify-between gap-4"><dt>Min payment</dt><dd className="text-text">$0.0003 USDC</dd></div>
          </dl>
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight">
            It checks before<br />it <span className="text-brass">pays.</span>
          </h1>
          <p className="mt-8 max-w-[48ch] text-base leading-relaxed text-text-dim">
            Every x402 nanopayment passes through a reputation gate. Low-trust providers get rejected
            automatically. Approved payments execute in a single HTTP round-trip — no confirmations, no gas delays.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <Link href="/workspace" className="bg-brass px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-base hover:opacity-90 transition-opacity">
              Run a Payment
            </Link>
            <Link href="/console" className="px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-text-dim hover:text-text transition-colors">
              View Agent Reasoning →
            </Link>
          </div>
        </div>
      </section>

      {/* Flow */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] px-6 md:px-10 py-16 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">/ 02 — Flow</p>
          <div className="mt-8 md:mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line">
            {[
              { n: "01", title: "Discover", copy: "Agent finds an x402-protected resource and reads the provider address from the response header." },
              { n: "02", title: "Verify",   copy: "ReputationRegistry.sol returns score, rating count, and history. assessTrust() makes the call." },
              { n: "03", title: "Decide",   copy: "Fixed arithmetic thresholds — not the LLM — approve, confirm, or reject. Prompt injection cannot alter this." },
              { n: "04", title: "Settle",   copy: "GatewayClient signs and pays in one HTTP round-trip. Feedback writes back on-chain after settlement." },
            ].map((s) => (
              <div key={s.n} className="bg-base p-6">
                <span className="font-mono text-xs text-text-faint">{s.n}</span>
                <h3 className="mt-3 font-display text-xl text-text">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-dim">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example verdicts */}
      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-20">
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">/ 03 — Verdicts</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
            <article className="bg-panel p-8">
              <p className="font-mono text-xs text-oxide">RISK · HIGH</p>
              <p className="mt-4 font-display text-2xl text-text">Payment rejected</p>
              <dl className="mt-6 space-y-2 font-mono text-xs text-text-dim">
                <div className="flex justify-between"><dt>Score</dt><dd className="text-text">1.7 / 5</dd></div>
                <div className="flex justify-between"><dt>Ratings</dt><dd className="text-text">14</dd></div>
              </dl>
              <div className="mt-6 h-px w-8 bg-oxide-dim" />
              <p className="mt-6 text-sm leading-relaxed text-text-dim">Provider score is 1.7/5. 14 historical ratings found. Risk level HIGH. Payment rejected.</p>
            </article>
            <article className="bg-panel p-8">
              <p className="font-mono text-xs text-brass">RISK · LOW</p>
              <p className="mt-4 font-display text-2xl text-text">Payment approved</p>
              <dl className="mt-6 space-y-2 font-mono text-xs text-text-dim">
                <div className="flex justify-between"><dt>Score</dt><dd className="text-text">4.6 / 5</dd></div>
                <div className="flex justify-between"><dt>Ratings</dt><dd className="text-text">28</dd></div>
              </dl>
              <div className="mt-6 h-px w-8 bg-brass-dim" />
              <p className="mt-6 text-sm leading-relaxed text-text-dim">Provider score is 4.6/5. 28 historical ratings found. Risk level LOW. Payment approved.</p>
            </article>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1400px] flex flex-col md:flex-row gap-4 items-center justify-between px-6 md:px-10 py-10 text-[11px] uppercase tracking-[0.18em] text-text-faint">
          <span>TrustPay Agent — Built on Arc</span>
          <span>x402 · Reputation-gated payments · Hackathon 2025</span>
        </div>
      </footer>
    </main>
  );
}
