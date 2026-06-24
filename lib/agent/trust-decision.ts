export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
export type Decision = "APPROVE" | "REJECT" | "CONFIRM";

export interface TrustAssessment {
  decision: Decision;
  riskLevel: RiskLevel;
  averageScore: number;
  ratingCount: number;
  reasoning: string;
}

const REJECT_BELOW = 2;
const CONFIRM_BELOW = 3;
const MIN_RATINGS = 3;

/**
 * Pure deterministic function. The LLM reads this output; it never computes it.
 * Prompt injection in provider data cannot alter the outcome.
 */
export function assessTrust(averageScoreScaled: bigint, ratingCount: bigint): TrustAssessment {
  const count = Number(ratingCount);

  if (count === 0) {
    return {
      decision: "CONFIRM",
      riskLevel: "UNKNOWN",
      averageScore: 0,
      ratingCount: 0,
      reasoning: "This provider has no rating history on-chain. Risk level UNKNOWN. Manual confirmation required.",
    };
  }

  const avg = Number(averageScoreScaled) / 100;
  let risk: RiskLevel;
  let decision: Decision;

  if (avg < REJECT_BELOW) {
    risk = "HIGH"; decision = "REJECT";
  } else if (avg < CONFIRM_BELOW) {
    risk = "MEDIUM"; decision = "CONFIRM";
  } else {
    risk = "LOW"; decision = "APPROVE";
  }

  // Thin sample cap — a 5.0 from 1 rating is not strong evidence
  if (decision === "APPROVE" && count < MIN_RATINGS) {
    decision = "CONFIRM";
  }

  const outcome =
    decision === "REJECT" ? "Payment rejected." :
    decision === "CONFIRM" && count < MIN_RATINGS && risk === "LOW"
      ? "Rating history too thin to auto-approve. Confirmation required."
      : decision === "CONFIRM" ? "Payment requires manual confirmation."
      : "Payment approved.";

  return {
    decision,
    riskLevel: risk,
    averageScore: avg,
    ratingCount: count,
    reasoning: `Provider score is ${avg.toFixed(1)}/5.\n${count} historical rating${count === 1 ? "" : "s"} found.\nRisk level ${risk}.\n${outcome}`,
  };
}
