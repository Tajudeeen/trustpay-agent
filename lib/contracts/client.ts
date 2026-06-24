import { createPublicClient, createWalletClient, http, custom, type Address, type Hash } from "viem";

/**
 * Arc Testnet chain definition. Confirm RPC URL and chain ID against
 * Circle's official Arc documentation before deploying — placeholder
 * values below must be replaced with verified network parameters.
 */
export const arcTestnet = {
  id: Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID ?? 0),
  name: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 6 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_ARC_RPC_URL ?? ""] },
  },
} as const;

/**
 * Public client for read-only contract calls (getReputation, hasRated).
 * Safe to use from both server and client components — never carries
 * a private key.
 */
export function getPublicClient() {
  if (!process.env.NEXT_PUBLIC_ARC_RPC_URL) {
    throw new Error(
      "NEXT_PUBLIC_ARC_RPC_URL is not set. Configure it in .env.local before making reads."
    );
  }
  return createPublicClient({
    chain: arcTestnet,
    transport: http(process.env.NEXT_PUBLIC_ARC_RPC_URL),
  });
}

/**
 * Wallet client for write calls (submitRating). Intended for browser use
 * with an injected provider (e.g. window.ethereum) so the private key
 * never leaves the user's wallet and never touches application code or
 * server logs. Do not construct a wallet client from a raw private key
 * in server-side code paths that handle untrusted input.
 */
export function getWalletClient(injectedProvider: unknown) {
  return createWalletClient({
    chain: arcTestnet,
    transport: custom(injectedProvider as any),
  });
}

export type { Address, Hash };
