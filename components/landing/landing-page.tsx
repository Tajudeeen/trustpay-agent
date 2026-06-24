import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-base text-text">
      <Nav />
      <Hero />
      <Principle />
      <Demo />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 md:px-10">
        <span className="font-display text-lg tracking-tight text-text">
          TrustPay <span className="text-brass">Agent</span>
        </span>
        <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.18em] text-text-dim md:flex">
          <Link href="/workspace" className="transition-colors hover:text-text">
            Workspace
          </Link>
          <Link href="/console" className="transition-colors hover:text-text">
            Decision Console
          </Link>
          <a
            href="https://github.com/circlefin/arc-nanopayments"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-text"
          >
            Protocol
          </a>
        </nav>
        <Link
          href="/workspace"
          className="border border-brass-dim px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-brass transition-colors hover:border-brass hover:bg-brass/5"
        >
          Open Workspace
        </Link>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[280px_1fr] md:gap-16 md:px-10 md:py-24">
      {/* Left column — evidence, eyebrow, small caps. Mirrors Aer's "/01" label column. */}
      <div className="flex flex-col gap-8 md:pt-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-brass">/ 01 — Protocol</p>
          <div className="mt-2 h-px w-10 bg-brass-dim" />
        </div>
        <p className="max-w-[22ch] text-sm leading-relaxed text-text-dim">
          An AI agent that checks a provider&apos;s on-chain reputation before it ever moves a cent —
          not after.
        </p>
        <dl className="space-y-3 border-t border-line pt-6 font-mono text-xs text-text-dim">
          <div className="flex justify-between gap-4">
            <dt>Network</dt>
            <dd className="text-text">Arc Testnet</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Payment rail</dt>
            <dd className="text-text">x402</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>Trust source</dt>
            <dd className="text-text">On-chain registry</dd>
          </div>
        </dl>
      </div>

      {/* Right column — the verdict headline, treated like Aer's "Work Anywhere" */}
      <div className="flex flex-col justify-center">
        <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-medium leading-[1.02] tracking-tight text-text">
          It checks before
          <br />
          it <span className="text-brass">pays.</span>
        </h1>
        <p className="mt-8 max-w-[48ch] text-base leading-relaxed text-text-dim">
          Every x402 nanopayment request passes through a reputation gate first. Low-trust providers
          get rejected automatically. The agent explains exactly why, in plain language, before any
          funds move.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/workspace"
            className="bg-brass px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-base transition-opacity hover:opacity-90"
          >
            Try a Payment
          </Link>
          <Link
            href="/console"
            className="px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-text-dim transition-colors hover:text-text"
          >
            View Agent Reasoning →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Principle() {
  const steps = [
    {
      label: "Discover",
      copy: "Agent finds a payable resource and reads its provider address.",
    },
    {
      label: "Verify",
      copy: "Reputation registry returns score, rating count, and risk level.",
    },
    {
      label: "Decide",
      copy: "A fixed threshold — not the language model — approves, confirms, or rejects.",
    },
    {
      label: "Settle",
      copy: "Approved payments execute over x402. Feedback writes back on-chain.",
    },
  ];

  return (
    <section className="border-t border-line">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 px-6 py-16 md:grid-cols-[280px_1fr] md:px-10 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">/ 02 — Flow</p>
        <div className="mt-8 grid grid-cols-1 gap-px bg-line sm:grid-cols-2 md:mt-0 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.label} className="bg-base p-6">
              <span className="font-mono text-xs text-text-faint">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 font-display text-xl text-text">{step.label}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-dim">{step.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section className="border-t border-line bg-panel">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-10 px-6 py-16 md:grid-cols-[280px_1fr] md:gap-16 md:px-10 md:py-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-dim">/ 03 — Example</p>
        <div className="grid grid-cols-1 gap-px bg-line md:grid-cols-2">
          <article className="bg-panel p-8">
            <p className="font-mono text-xs text-oxide">RISK · HIGH</p>
            <p className="mt-4 font-display text-2xl text-text">Payment rejected</p>
            <dl className="mt-6 space-y-2 font-mono text-xs text-text-dim">
              <div className="flex justify-between">
                <dt>Score</dt>
                <dd className="text-text">1.7 / 5</dd>
              </div>
              <div className="flex justify-between">
                <dt>Ratings</dt>
                <dd className="text-text">14</dd>
              </div>
            </dl>
            <div className="mt-6 h-px w-8 bg-oxide-dim" />
            <p className="mt-6 text-sm leading-relaxed text-text-dim">
              Provider score is 1.7/5. 14 historical ratings found. Risk level HIGH. Payment rejected.
            </p>
          </article>
          <article className="bg-panel p-8">
            <p className="font-mono text-xs text-brass">RISK · LOW</p>
            <p className="mt-4 font-display text-2xl text-text">Payment approved</p>
            <dl className="mt-6 space-y-2 font-mono text-xs text-text-dim">
              <div className="flex justify-between">
                <dt>Score</dt>
                <dd className="text-text">4.6 / 5</dd>
              </div>
              <div className="flex justify-between">
                <dt>Ratings</dt>
                <dd className="text-text">28</dd>
              </div>
            </dl>
            <div className="mt-6 h-px w-8 bg-brass-dim" />
            <p className="mt-6 text-sm leading-relaxed text-text-dim">
              Provider score is 4.6/5. 28 historical ratings found. Risk level LOW. Payment approved.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-6 py-10 text-[11px] uppercase tracking-[0.18em] text-text-faint md:flex-row md:items-center md:justify-between md:px-10">
        <span>TrustPay Agent — Built on Arc</span>
        <span>Hackathon submission · not audited for mainnet use</span>
      </div>
    </footer>
  );
}
