import "dotenv/config";
/**
 * TrustPay Buyer Agent
 *
 * Autonomously discovers x402-gated resources, checks provider reputation,
 * and executes real nanopayments via GatewayClient.pay() — only when the
 * trust assessment approves.
 *
 * Required env vars:
 *   BUYER_PRIVATE_KEY   — funded Arc Testnet wallet private key (0x...)
 *   SELLER_BASE_URL     — base URL of the TrustPay seller (e.g. http://localhost:3000)
 *   NEXT_PUBLIC_ARC_RPC_URL — Arc Testnet RPC endpoint (optional for arcTestnet)
 *
 * Run:
 *   npx tsx agent.ts
 *   # or
 *   npx ts-node --esm agent.ts
 */

import { GatewayClient } from "@circle-fin/x402-batching/client";
import { assessTrust, type Decision } from "./lib/agent/trust-decision.js";

// ── Types ──────────────────────────────────────────────────────────────────

interface ReputationApiResponse {
  address: string;
  averageScoreScaled: string;
  ratingCount: string;
  assessment: {
    decision: Decision;
    riskLevel: string;
    averageScore: number;
    ratingCount: number;
    reasoning: string;
  };
  source: "onchain" | "seed";
}

interface PayResult {
  data: unknown;
  amount: bigint;
  formattedAmount: string;
  transaction: string;
  status: number;
}

interface AgentRunResult {
  endpoint: string;
  providerAddress: string;
  trustDecision: Decision;
  riskLevel: string;
  reasoning: string;
  paymentExecuted: boolean;
  payResult?: PayResult;
  feedbackSubmitted?: boolean;
  error?: string;
}

// ── Trust check ────────────────────────────────────────────────────────────

async function checkTrust(
  sellerBase: string,
  providerAddress: string,
): Promise<ReputationApiResponse> {
  const res = await fetch(`${sellerBase}/api/trust/${providerAddress}`);
  if (!res.ok) throw new Error(`Trust check failed: ${res.status}`);
  return res.json() as Promise<ReputationApiResponse>;
}

// ── Feedback submission ────────────────────────────────────────────────────

async function submitFeedback(
  sellerBase: string,
  provider: string,
  score: number,
  paymentId: string,
  rater: string,
): Promise<void> {
  try {
    await fetch(`${sellerBase}/api/trust/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, score, paymentId, rater }),
    });
    console.log(
      `[TrustPay] Feedback submitted — score ${score}/5 for ${provider}`,
    );
  } catch (err) {
    console.warn("[TrustPay] Feedback submission failed (non-fatal):", err);
  }
}

// ── Main agent function ────────────────────────────────────────────────────

export async function runAgent(config: {
  privateKey: string;
  sellerBase: string;
  providerAddress: string;
  endpoint: string;
  method?: "GET" | "POST";
  body?: unknown;
  rpcUrl?: string;
  postPaymentScore?: number;
}): Promise<AgentRunResult> {
  const {
    privateKey,
    sellerBase,
    providerAddress,
    endpoint,
    method = "GET",
    body,
    rpcUrl,
    postPaymentScore = 5,
  } = config;

  // Step 1 — Check trust before touching the wallet
  console.log(`\n[TrustPay] Checking reputation for ${providerAddress}...`);
  const trustData = await checkTrust(sellerBase, providerAddress);
  const { decision, riskLevel, reasoning } = trustData.assessment;

  console.log(`[TrustPay] Assessment:`);
  console.log(`  Score: ${trustData.assessment.averageScore.toFixed(1)}/5`);
  console.log(`  Ratings: ${trustData.assessment.ratingCount}`);
  console.log(`  Risk: ${riskLevel}`);
  console.log(`  Decision: ${decision}`);

  if (decision === "REJECT") {
    console.log(`[TrustPay] BLOCKED — payment rejected. Reason: ${reasoning}`);
    return {
      endpoint,
      providerAddress,
      trustDecision: "REJECT",
      riskLevel,
      reasoning,
      paymentExecuted: false,
      error: "Payment blocked by trust gate — provider score too low.",
    };
  }

  if (decision === "CONFIRM") {
    console.log(
      `[TrustPay] CONFIRM required — proceeding as agent (would prompt user in production).`,
    );
  }

  // Step 2 — Build GatewayClient with the buyer's private key
  const gatewayClient = new GatewayClient({
    chain: "arcTestnet",
    privateKey: privateKey as `0x${string}`,
    ...(rpcUrl ? { rpcUrl } : {}),
  });

  // Step 3 — Execute the x402 payment via GatewayClient.pay()
  const url = `${sellerBase}${endpoint}`;
  console.log(`[TrustPay] Paying ${url}...`);

  try {
    const payResult = (await gatewayClient.pay(url, {
      method,
      ...(body ? { body } : {}),
    })) as PayResult;

    console.log(`[TrustPay] Payment succeeded!`);
    console.log(`  Amount: ${payResult.formattedAmount} USDC`);
    console.log(
      `  Transaction: ${payResult.transaction || "batch (off-chain)"}`,
    );
    console.log(`  Response:`, JSON.stringify(payResult.data, null, 2));

    // Step 4 — Submit post-payment feedback
    const paymentId = payResult.transaction || `pay_${Date.now()}`;
    const account = (gatewayClient as any).account;
    await submitFeedback(
      sellerBase,
      providerAddress,
      postPaymentScore,
      paymentId,
      account?.address ?? "unknown",
    );

    return {
      endpoint,
      providerAddress,
      trustDecision: decision,
      riskLevel,
      reasoning,
      paymentExecuted: true,
      payResult,
      feedbackSubmitted: true,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[TrustPay] Payment failed:`, message);
    return {
      endpoint,
      providerAddress,
      trustDecision: decision,
      riskLevel,
      reasoning,
      paymentExecuted: false,
      error: message,
    };
  }
}

// ── CLI demo ───────────────────────────────────────────────────────────────

async function main() {
  const PRIVATE_KEY = process.env.BUYER_PRIVATE_KEY;
  const SELLER_BASE = process.env.SELLER_BASE_URL ?? "http://localhost:3000";
  const RPC_URL = process.env.NEXT_PUBLIC_ARC_RPC_URL;

  if (!PRIVATE_KEY) {
    console.error("[TrustPay] Error: BUYER_PRIVATE_KEY is required.");
    console.error(
      "  Set it in .env.local: BUYER_PRIVATE_KEY=0x<your-arc-testnet-key>",
    );
    process.exit(1);
  }

  console.log("╔══════════════════════════════════════════╗");
  console.log("║         TrustPay Agent Demo              ║");
  console.log(`║  Seller: ${SELLER_BASE.padEnd(32)}║`);
  console.log("╚══════════════════════════════════════════╝");

  const baseConfig = {
    privateKey: PRIVATE_KEY,
    sellerBase: SELLER_BASE,
    rpcUrl: RPC_URL,
  };

  // Scenario 1 — LOW trust provider: should be REJECTED, no payment
  console.log("\n═══ Scenario 1: Low-trust provider ═══");
  const r1 = await runAgent({
    ...baseConfig,
    providerAddress: "0x0000000000000000000000000000000000000001",
    endpoint: "/api/premium/quote",
  });
  console.log(`Result: ${r1.trustDecision} | Paid: ${r1.paymentExecuted}`);

  // Scenario 2 — HIGH trust provider: should APPROVE and pay
  console.log("\n═══ Scenario 2: Trusted provider ═══");
  const r2 = await runAgent({
    ...baseConfig,
    providerAddress: "0x0000000000000000000000000000000000000002",
    endpoint: "/api/premium/intelligence",
    postPaymentScore: 5,
  });
  console.log(`Result: ${r2.trustDecision} | Paid: ${r2.paymentExecuted}`);

  // Scenario 3 — POST request to compute endpoint
  console.log("\n═══ Scenario 3: Compute endpoint (POST) ═══");
  const r3 = await runAgent({
    ...baseConfig,
    providerAddress: "0x0000000000000000000000000000000000000002",
    endpoint: "/api/premium/compute",
    method: "POST",
    body: {
      text: "TrustPay Agent verifies provider reputation before every nanopayment on Arc.",
    },
    postPaymentScore: 5,
  });
  console.log(`Result: ${r3.trustDecision} | Paid: ${r3.paymentExecuted}`);

  // Scenario 4 — NEW provider with no history: CONFIRM decision
  console.log("\n═══ Scenario 4: New provider (CONFIRM) ═══");
  const r4 = await runAgent({
    ...baseConfig,
    providerAddress: "0x0000000000000000000000000000000000000003",
    endpoint: "/api/premium/insight",
    postPaymentScore: 3,
  });
  console.log(`Result: ${r4.trustDecision} | Paid: ${r4.paymentExecuted}`);

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║              Run complete                ║");
  console.log(
    `║  Paid: ${[r1, r2, r3, r4].filter((r) => r.paymentExecuted).length}/4 attempts               ║`,
  );
  console.log("╚══════════════════════════════════════════╝");
}

main().catch(console.error);
