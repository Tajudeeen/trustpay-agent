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
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-text-dim">
            <Link href="/workspace" className="hover:text-text transition-colors">Workspace</Link>
            <Link href="/console"   className="hover:text-text transition-colors">Console</Link>
            <Link href="/dashboard" className="hover:text-text transition-colors">Dashboard</Link>
            <a href="https://github.com/Tajudeeen/trustpay-agent" target="_blank" rel="noreferrer" className="hover:text-text transition-colors">GitHub</a>
          </nav>
          <Link href="/workspace" className="border border-brass-dim px-4 py-2 text-xs uppercase tracking-[0.18em] text-brass hover:border-brass hover:bg-brass/5 transition-colors">
            Try Agent
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-24">
        <div className="flex flex-col gap-8 md:pt-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brass">/ 01 — Protocol</p>
            <div className="mt-2 h-px w-10 bg-brass-dim" />
          </div>
          <p className="max-w-[22ch] text-base leading-relaxed text-text-dim">
            AI agents that pay for resources autonomously — but only after verifying who they are paying.
          </p>
          <dl className="space-y-3 border-t border-line pt-6 font-mono text-sm text-text-dim">
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
          <p className="mt-8 max-w-[52ch] text-base leading-relaxed text-text-dim">
            Every x402 nanopayment passes through a reputation gate first. Low-trust providers get
            rejected automatically. Approved payments execute in a single HTTP round-trip via
            GatewayClient on Arc — no confirmations, no gas delays, no blind trust.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            <Link href="/workspace" className="bg-brass px-6 py-3 text-xs uppercase tracking-[0.18em] text-base hover:opacity-90 transition-opacity">
              Run a Payment
            </Link>
            <Link href="/console" className="px-6 py-3 text-xs uppercase tracking-[0.18em] text-text-dim hover:text-text transition-colors">
              View Agent Reasoning →
            </Link>
          </div>
        </div>
      </section>

      {/* Problem statement */}
      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-dim">/ 02 — Problem</p>
            <div className="mt-3 h-px w-10 bg-line" />
          </div>
          <div className="max-w-[60ch]">
            <h2 className="font-display text-3xl text-text">AI agents pay blindly.</h2>
            <p className="mt-5 text-base leading-relaxed text-text-dim">
              As autonomous agents begin executing payments on behalf of users, there is no standard
              way to verify whether a provider is trustworthy before funds move. A malicious or
              low-quality provider can receive payment from any agent that discovers their endpoint —
              with no consequences and no history.
            </p>
            <p className="mt-4 text-base leading-relaxed text-text-dim">
              The result is a payment layer with no reputation, no accountability, and no protection
              for the agents or users relying on it. TrustPay fixes this by putting an on-chain
              reputation check in front of every payment — before the wallet is ever touched.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-px bg-line">
              {[
                { stat: "0", label: "Reputation checks in standard x402 flows" },
                { stat: "$0.001", label: "Minimum payment to a gated endpoint" },
                { stat: "100%", label: "Of payments blocked when score is below 2.0" },
              ].map((s) => (
                <div key={s.stat} className="bg-panel p-6">
                  <p className="font-display text-3xl text-brass">{s.stat}</p>
                  <p className="mt-2 text-sm leading-relaxed text-text-dim">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-dim">/ 03 — How it works</p>
            <div className="mt-3 h-px w-10 bg-line" />
            <p className="mt-6 text-sm leading-relaxed text-text-dim">
              Four steps from resource discovery to settled payment and updated reputation.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line">
            {[
              {
                n: "01",
                title: "Discover",
                copy: "The agent finds an x402-protected resource. The server returns a 402 response with a payment challenge including the provider's wallet address and price in USDC.",
              },
              {
                n: "02",
                title: "Verify",
                copy: "Before touching a wallet, the agent reads the provider's reputation from ReputationRegistry.sol on Arc Testnet — total score, rating count, and historical average.",
              },
              {
                n: "03",
                title: "Decide",
                copy: "Fixed arithmetic thresholds in TypeScript compute the trust verdict: APPROVE, CONFIRM, or REJECT. This logic runs before the LLM, so prompt injection in provider metadata cannot override it.",
              },
              {
                n: "04",
                title: "Settle",
                copy: "If approved, GatewayClient signs the payment and retries the request. After settlement, the agent submits a rating back on-chain, permanently updating the provider's reputation for every future agent.",
              },
            ].map((s) => (
              <div key={s.n} className="bg-base p-6 md:p-8">
                <span className="font-mono text-xs text-text-faint">{s.n}</span>
                <h2 className="mt-3 font-display text-2xl text-text">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-text-dim">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust thresholds */}
      <section className="border-t border-line bg-panel">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-dim">/ 04 — Trust thresholds</p>
            <div className="mt-3 h-px w-10 bg-line" />
            <p className="mt-6 text-sm leading-relaxed text-text-dim">
              Hard-coded in trust-decision.ts. The language model reads these results — it does not compute them and cannot override them.
            </p>
          </div>
          <div className="space-y-px bg-line">
            {[
              { condition: "Score below 2.0", verdict: "REJECT", color: "text-oxide", desc: "Payment blocked automatically. No wallet interaction. No funds at risk." },
              { condition: "Score 2.0 to 3.0", verdict: "CONFIRM", color: "text-text-dim", desc: "Medium risk. The agent flags this for manual confirmation before proceeding." },
              { condition: "Score above 3.0 with 3+ ratings", verdict: "APPROVE", color: "text-brass", desc: "Low risk. GatewayClient executes the payment immediately in a single round-trip." },
              { condition: "Fewer than 3 ratings (any score)", verdict: "CONFIRM", color: "text-text-dim", desc: "Too little history to auto-approve. A perfect score from one rater is not strong evidence." },
            ].map((t) => (
              <div key={t.condition} className="bg-panel p-6 grid grid-cols-1 sm:grid-cols-[1fr_120px_2fr] gap-4 items-start">
                <p className="text-sm text-text-dim">{t.condition}</p>
                <p className={`font-mono text-sm font-medium ${t.color}`}>{t.verdict}</p>
                <p className="text-sm text-text-dim">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Example verdicts */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16 px-6 md:px-10 py-16 md:py-20">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-text-dim">/ 05 — Live verdicts</p>
            <div className="mt-3 h-px w-10 bg-line" />
            <p className="mt-6 text-sm leading-relaxed text-text-dim">
              Two real scenarios from the demo. Try them yourself in the Workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line">
            <article className="bg-base p-8">
              <p className="font-mono text-xs text-oxide uppercase tracking-[0.18em]">Risk · High</p>
              <p className="mt-4 font-display text-2xl text-text">Payment rejected</p>
              <dl className="mt-6 space-y-2 font-mono text-sm text-text-dim">
                <div className="flex justify-between"><dt>Score</dt><dd className="text-text">1.7 / 5</dd></div>
                <div className="flex justify-between"><dt>Ratings</dt><dd className="text-text">14</dd></div>
                <div className="flex justify-between"><dt>Provider</dt><dd className="text-text">QuickData API</dd></div>
              </dl>
              <div className="mt-6 h-px w-8 bg-oxide-dim" />
              <p className="mt-6 text-sm leading-relaxed text-text-dim">
                Provider score is 1.7/5. 14 historical ratings found. Risk level HIGH. Payment blocked
                before the wallet is touched — no funds at risk.
              </p>
            </article>
            <article className="bg-base p-8">
              <p className="font-mono text-xs text-brass uppercase tracking-[0.18em]">Risk · Low</p>
              <p className="mt-4 font-display text-2xl text-text">Payment approved</p>
              <dl className="mt-6 space-y-2 font-mono text-sm text-text-dim">
                <div className="flex justify-between"><dt>Score</dt><dd className="text-text">4.6 / 5</dd></div>
                <div className="flex justify-between"><dt>Ratings</dt><dd className="text-text">28</dd></div>
                <div className="flex justify-between"><dt>Provider</dt><dd className="text-text">Verified Intelligence</dd></div>
              </dl>
              <div className="mt-6 h-px w-8 bg-brass-dim" />
              <p className="mt-6 text-sm leading-relaxed text-text-dim">
                Provider score is 4.6/5. 28 historical ratings found. Risk level LOW. GatewayClient
                executes the $0.003 USDC payment in a single HTTP round-trip.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div>
              <p className="font-display text-base text-text">TrustPay <span className="text-brass">Agent</span></p>
              <p className="mt-1 text-sm text-text-faint">Reputation-backed x402 payments on Arc · Hackathon 2025</p>
            </div>
            <nav className="flex flex-wrap gap-6 text-sm text-text-dim">
              <Link href="/workspace" className="hover:text-text transition-colors">Workspace</Link>
              <Link href="/console" className="hover:text-text transition-colors">Console</Link>
              <Link href="/dashboard" className="hover:text-text transition-colors">Dashboard</Link>
              <a href="https://github.com/Tajudeeen/trustpay-agent" target="_blank" rel="noreferrer" className="hover:text-text transition-colors">GitHub</a>
              <a href="https://developers.circle.com/arc" target="_blank" rel="noreferrer" className="hover:text-text transition-colors">Arc Docs</a>
            </nav>
          </div>
          <div className="mt-8 border-t border-line pt-6 flex flex-col sm:flex-row gap-3 justify-between text-xs text-text-faint">
            <p>© 2025 TrustPay Agent. Built for the Arc x402 Hackathon.</p>
            <p>Testnet only — not audited for mainnet use.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
