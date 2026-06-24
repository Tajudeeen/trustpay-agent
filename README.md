# TrustPay Agent

Reputation-backed AI payment agent for x402 nanopayments on Arc.

Before any USDC moves, TrustPay reads the provider's on-chain reputation and makes a deterministic decision — approve, confirm, or reject. A fixed threshold in TypeScript computes the decision. The LLM explains it. Prompt injection cannot override it.

---

## How it works

1. Agent finds an x402-protected endpoint
2. `/api/trust/[address]` reads reputation from `ReputationRegistry.sol`
3. `assessTrust()` computes: APPROVE / CONFIRM / REJECT (pure arithmetic, not LLM)
4. `GatewayClient.pay()` executes the payment on Arc Testnet if approved
5. Agent posts a rating back — reputation updates on-chain

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.local.example .env.local
# Fill in ARC_RPC_URL, SELLER_ADDRESS, BUYER_PRIVATE_KEY

# 3. Deploy contract (needs Hardhat + funded wallet)
cd contracts-workspace
node scripts/compile-direct.js
npx hardhat run scripts/deploy.js --network arc
# Paste the deployed address into REGISTRY_ADDRESS in .env.local

# 4. Start seller
cd ..
npm run dev

# 5. Run buyer agent (real x402 payments)
npx tsx agent.ts
```

---

## x402-Protected endpoints

| Method | Endpoint | Price | Description |
|---|---|---|---|
| GET | `/api/premium/quote` | $0.001 | Curated insight quote |
| GET | `/api/premium/intelligence` | $0.003 | Market intel report |
| POST | `/api/premium/compute` | $0.0003 | Text analysis (send `{text}` in body) |
| GET | `/api/premium/insight` | $0.005 | Deep provider analytics |

---

## Trust decision thresholds

| Condition | Decision |
|---|---|
| score < 2.0 | REJECT — payment blocked |
| score 2.0 – 3.0 | CONFIRM — user must approve |
| score >= 3.0 AND ratings >= 3 | APPROVE — automatic |
| ratings < 3 (any score) | CONFIRM — too thin to auto-approve |
| ratings = 0 | CONFIRM / UNKNOWN |

Thresholds live in `lib/agent/trust-decision.ts`. They cannot be overridden by LLM instruction or provider metadata.

---

## Project structure

```
trustpay-agent/
├── agent.ts                    # Buyer agent CLI — real GatewayClient.pay() calls
├── app/
│   ├── page.tsx                # Landing page
│   ├── workspace/page.tsx      # Payment Workspace (main demo)
│   ├── console/page.tsx        # Agent Decision Console
│   ├── dashboard/page.tsx      # Live payment dashboard
│   └── api/
│       ├── premium/{quote,intelligence,compute,insight}/  # x402-gated endpoints
│       ├── trust/[address]/    # Reputation read (free)
│       ├── trust/submit/       # Rating write (free, validated)
│       └── payments/           # Payment log for dashboard
├── lib/
│   ├── agent/trust-decision.ts # Deterministic trust logic (tested)
│   └── x402/middleware.ts      # createGatewayMiddleware adapter for App Router
├── contracts/
│   └── ReputationRegistry.sol  # On-chain reputation store
├── contracts-workspace/
│   ├── test/
│   │   ├── ReputationRegistry.test.js  # Hardhat suite (runnable here)
│   │   └── ReputationRegistry.t.sol    # Foundry suite (portable)
│   └── scripts/{compile-direct,deploy}.js
├── docs/SECURITY_AUDIT.md
└── .env.local.example
```

---

## Tests

```bash
# Trust decision logic
npx vitest run

# Smart contract (Hardhat — no internet required)
cd contracts-workspace
node scripts/compile-direct.js
npx hardhat test --no-compile

# Smart contract (Foundry — requires forge)
forge test
```

---

## Demo script (3 minutes)

**Workspace:**
1. Select QuickData API → Evaluate → show REJECT verdict (score 1.7, HIGH, payment blocked)
2. Select Verified Intelligence → Evaluate → APPROVE → Pay 0.003 USDC → rate 5/5
3. Select Fresh Compute Node → CONFIRM (no history) → show confirmation gate

**Console:**
1. Run Low-trust scenario → show full tool trace: `checkReputationTool` → REJECT verdict
2. Run Trusted provider → show 3-tool chain: check → pay → feedback
3. Run Thin history → show CONFIRM despite perfect score (1 rating is not enough)
4. Point out: thresholds are in TypeScript, not in the prompt — injection-proof

**Dashboard:**
- Show live payment log, volume, unique payers, endpoint breakdown

---

## Security highlights

- Trust decision is deterministic arithmetic — LLM cannot alter it
- `makePaymentTool` throws on REJECT regardless of LLM instruction (tested)
- RPC URL is server-only — not exposed in browser bundle
- In-memory stores capped at fixed sizes (no memory DoS)
- Self-rating blocked at both contract level and HTTP layer
- CORS, CSP, X-Frame-Options, Referrer-Policy all set

Full audit: `docs/SECURITY_AUDIT.md`

---

## Known gaps before mainnet

- No per-IP rate limiting (needs Upstash/Vercel KV)
- Sybil resistance on ratings (needs stake or payment proof gate)
- In-memory stores (swap for Supabase — schema-compatible)
- x402 middleware adapter uses Express shim — test against real Gateway in staging
