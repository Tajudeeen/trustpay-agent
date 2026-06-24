import type { Address, Hash, WalletClient, PublicClient } from "viem";
import { reputationRegistryAbi } from "./abi";

export class ReputationContractError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "ReputationContractError";
  }
}

export interface Reputation {
  totalScore: bigint;
  ratingCount: bigint;
  /** Average score scaled by 100 (370 = 3.70). Only meaningful if ratingCount > 0. */
  averageScoreScaled: bigint;
  /** True if no ratings have ever been submitted for this provider. */
  isUnrated: boolean;
}

/**
 * Fetch a provider's on-chain reputation. Returns isUnrated=true rather
 * than a misleading 0.00 average when no ratings exist — callers must
 * branch on this before displaying a score to the user.
 */
export async function getReputation(
  client: PublicClient,
  contractAddress: Address,
  provider: Address
): Promise<Reputation> {
  try {
    const [totalScore, ratingCount, averageScoreScaled] = (await client.readContract({
      address: contractAddress,
      abi: reputationRegistryAbi,
      functionName: "getReputation",
      args: [provider],
    })) as [bigint, bigint, bigint];

    return {
      totalScore,
      ratingCount,
      averageScoreScaled,
      isUnrated: ratingCount === 0n,
    };
  } catch (err) {
    throw new ReputationContractError(
      `Failed to read reputation for ${provider}. The contract address or network may be misconfigured.`,
      err
    );
  }
}

/**
 * Check whether a specific rater has already rated a provider for a given
 * payment, to pre-empt a DuplicateRating revert before the user signs.
 */
export async function hasRated(
  client: PublicClient,
  contractAddress: Address,
  rater: Address,
  provider: Address,
  paymentId: Hash
): Promise<boolean> {
  try {
    return (await client.readContract({
      address: contractAddress,
      abi: reputationRegistryAbi,
      functionName: "hasRated",
      args: [rater, provider, paymentId],
    })) as boolean;
  } catch (err) {
    throw new ReputationContractError(`Failed to check rating status for ${provider}.`, err);
  }
}

/**
 * Submit a 1-5 rating for a provider tied to a specific payment.
 * Requires a connected wallet client (browser-injected signer) — never
 * call this with a key constructed from a raw secret in app code.
 */
export async function submitRating(
  walletClient: WalletClient,
  publicClient: PublicClient,
  contractAddress: Address,
  account: Address,
  provider: Address,
  score: number,
  paymentId: Hash
): Promise<Hash> {
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new ReputationContractError(`Score must be an integer 1-5, received ${score}.`);
  }
  if (account.toLowerCase() === provider.toLowerCase()) {
    throw new ReputationContractError("Cannot submit a rating for your own address.");
  }

  try {
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      abi: reputationRegistryAbi,
      functionName: "submitRating",
      args: [provider, score, paymentId],
      account,
      chain: walletClient.chain,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    if (receipt.status !== "success") {
      throw new ReputationContractError(`Transaction ${txHash} reverted on-chain.`);
    }

    return txHash;
  } catch (err) {
    if (err instanceof ReputationContractError) throw err;
    throw new ReputationContractError(
      `Failed to submit rating for ${provider}. Check wallet connection and gas balance.`,
      err
    );
  }
}
