import { describe, it, expect } from "vitest";
import { checkReputationTool, makePaymentTool, submitFeedbackTool } from "../lib/agent/tools";

describe("checkReputationTool", () => {
  it("returns REJECT for the known low-trust provider", async () => {
    const raw = await checkReputationTool.invoke({ providerAddress: "0xLowTrustProvider" });
    const result = JSON.parse(raw as string);
    expect(result.decision).toBe("REJECT");
    expect(result.riskLevel).toBe("HIGH");
  });

  it("returns APPROVE for the known trusted provider", async () => {
    const raw = await checkReputationTool.invoke({ providerAddress: "0xTrustedProvider" });
    const result = JSON.parse(raw as string);
    expect(result.decision).toBe("APPROVE");
  });

  it("returns CONFIRM with UNKNOWN risk for a provider with no history", async () => {
    const raw = await checkReputationTool.invoke({ providerAddress: "0xNewProvider" });
    const result = JSON.parse(raw as string);
    expect(result.decision).toBe("CONFIRM");
    expect(result.riskLevel).toBe("UNKNOWN");
  });

  it("throws for an unknown provider address rather than silently approving", async () => {
    await expect(checkReputationTool.invoke({ providerAddress: "0xGhost" })).rejects.toThrow();
  });
});

describe("makePaymentTool — payment gate", () => {
  it("executes payment when riskDecision is APPROVE", async () => {
    const raw = await makePaymentTool.invoke({
      providerAddress: "0xTrustedProvider",
      amountUsdc: 5,
      riskDecision: "APPROVE",
    });
    const receipt = JSON.parse(raw as string);
    expect(receipt.txHash).toMatch(/^0xmock/);
    expect(receipt.amountUsdc).toBe(5);
  });

  it("blocks payment when riskDecision is REJECT, even if explicitly told to pay anyway", async () => {
    // Simulates a prompt-injection scenario: the tool itself enforces the
    // gate, independent of any instruction the LLM might have been fed.
    await expect(
      makePaymentTool.invoke({
        providerAddress: "0xLowTrustProvider",
        amountUsdc: 5,
        riskDecision: "REJECT",
      })
    ).rejects.toThrow(/Payment blocked/);
  });

  it("rejects a non-positive amount", async () => {
    await expect(
      makePaymentTool.invoke({
        providerAddress: "0xTrustedProvider",
        amountUsdc: 0,
        riskDecision: "APPROVE",
      })
    ).rejects.toThrow();
  });

  it("rejects an amount outside the demo safety ceiling", async () => {
    await expect(
      makePaymentTool.invoke({
        providerAddress: "0xTrustedProvider",
        amountUsdc: 1000,
        riskDecision: "APPROVE",
      })
    ).rejects.toThrow(/outside allowed demo range/);
  });
});

describe("submitFeedbackTool", () => {
  it("accepts a valid score and returns a mock tx hash", async () => {
    const raw = await submitFeedbackTool.invoke({
      providerAddress: "0xTrustedProvider",
      score: 5,
      paymentId: "pay_123",
    });
    const result = JSON.parse(raw as string);
    expect(result.submitted).toBe(true);
    expect(result.score).toBe(5);
  });

  it("rejects a score of 0", async () => {
    await expect(
      submitFeedbackTool.invoke({ providerAddress: "0xTrustedProvider", score: 0, paymentId: "pay_123" })
    ).rejects.toThrow();
  });

  it("rejects a score above 5", async () => {
    await expect(
      submitFeedbackTool.invoke({ providerAddress: "0xTrustedProvider", score: 6, paymentId: "pay_123" })
    ).rejects.toThrow();
  });
});
