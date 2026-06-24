import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, isAddress } from "viem";
import { assessTrust } from "@/lib/agent/trust-decision";

// ARC_RPC_URL — server-only, not prefixed NEXT_PUBLIC_ so it stays out of the
// browser bundle. NEXT_PUBLIC_ARC_RPC_URL is kept in .env.local.example for
// the agent.ts CLI, but server-side reads use the non-public var.
const ARC_RPC_URL = process.env.ARC_RPC_URL ?? process.env.NEXT_PUBLIC_ARC_RPC_URL ?? "";
const ARC_CHAIN_ID = Number(process.env.ARC_CHAIN_ID ?? process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? 2039);
const REGISTRY_ADDRESS = (process.env.REGISTRY_ADDRESS ?? process.env.NEXT_PUBLIC_REGISTRY_ADDRESS ?? "") as `0x${string}`;

const arcTestnet = {
  id: ARC_CHAIN_ID,
  name: "Arc Testnet",
  nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: [ARC_RPC_URL || "https://rpc.arcscan.net"] } },
} as const;

const REGISTRY_ABI = [
  {
    inputs: [{ name: "provider", type: "address" }],
    name: "getReputation",
    outputs: [
      { name: "totalScore", type: "uint256" },
      { name: "ratingCount", type: "uint256" },
      { name: "averageScoreScaled", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Seed data for demo/offline mode
const SEED: Record<string, { avg: bigint; count: bigint }> = {
  "0x0000000000000000000000000000000000000001": { avg: 170n, count: 14n },
  "0x0000000000000000000000000000000000000002": { avg: 460n, count: 28n },
  "0x0000000000000000000000000000000000000003": { avg: 0n,   count: 0n  },
  "0x0000000000000000000000000000000000000004": { avg: 500n, count: 1n  },
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  if (!isAddress(address)) {
    return NextResponse.json({ error: "Invalid Ethereum address" }, { status: 400 });
  }

  // Reject zero address — no legitimate use case
  if (address === "0x0000000000000000000000000000000000000000") {
    return NextResponse.json({ error: "Zero address not permitted" }, { status: 400 });
  }

  // Try on-chain read first
  if (REGISTRY_ADDRESS && ARC_RPC_URL) {
    try {
      const client = createPublicClient({
        chain: arcTestnet,
        transport: http(ARC_RPC_URL),
      });
      const [totalScore, ratingCount, averageScoreScaled] = await client.readContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: "getReputation",
        args: [address as `0x${string}`],
      });
      const assessment = assessTrust(averageScoreScaled, ratingCount);
      return NextResponse.json({
        address,
        totalScore: totalScore.toString(),
        ratingCount: ratingCount.toString(),
        averageScoreScaled: averageScoreScaled.toString(),
        assessment,
        source: "onchain",
      });
    } catch {
      // Fall through to seed
    }
  }

  // Seed fallback
  const seed = SEED[address.toLowerCase()] ?? SEED[address] ?? { avg: 0n, count: 0n };
  const assessment = assessTrust(seed.avg, seed.count);
  return NextResponse.json({
    address,
    totalScore: seed.count > 0n ? ((seed.avg * seed.count) / 100n).toString() : "0",
    ratingCount: seed.count.toString(),
    averageScoreScaled: seed.avg.toString(),
    assessment,
    source: "seed",
  });
}
