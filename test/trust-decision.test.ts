import { describe, it, expect } from "vitest";
import { assessTrust } from "../lib/agent/trust-decision";

describe("assessTrust", () => {
  it("rejects below 2.0", () => {
    expect(assessTrust(170n, 14n).decision).toBe("REJECT");
    expect(assessTrust(170n, 14n).riskLevel).toBe("HIGH");
  });
  it("rejects just under 2.0", () => {
    expect(assessTrust(199n, 10n).decision).toBe("REJECT");
  });
  it("confirms between 2.0 and 3.0", () => {
    expect(assessTrust(250n, 10n).decision).toBe("CONFIRM");
    expect(assessTrust(250n, 10n).riskLevel).toBe("MEDIUM");
  });
  it("approves above 3.0 with sufficient history", () => {
    expect(assessTrust(450n, 20n).decision).toBe("APPROVE");
    expect(assessTrust(450n, 20n).riskLevel).toBe("LOW");
  });
  it("downgrades APPROVE to CONFIRM when rating count < 3", () => {
    expect(assessTrust(500n, 1n).decision).toBe("CONFIRM");
    expect(assessTrust(500n, 2n).decision).toBe("CONFIRM");
  });
  it("treats zero ratings as UNKNOWN risk requiring CONFIRM", () => {
    const r = assessTrust(0n, 0n);
    expect(r.decision).toBe("CONFIRM");
    expect(r.riskLevel).toBe("UNKNOWN");
    expect(r.averageScore).toBe(0);
  });
  it("never returns APPROVE for fewer than 3 ratings", () => {
    for (let n = 0; n < 3; n++) {
      expect(assessTrust(500n, BigInt(n)).decision).not.toBe("APPROVE");
    }
  });
  it("reasoning contains score, count, risk, and outcome", () => {
    const r = assessTrust(170n, 14n);
    expect(r.reasoning).toContain("1.7/5");
    expect(r.reasoning).toContain("14 historical ratings");
    expect(r.reasoning).toContain("HIGH");
    expect(r.reasoning).toContain("rejected");
  });
  it("is monotonic — higher score never produces stricter decision", () => {
    const rank = { REJECT: 0, CONFIRM: 1, APPROVE: 2 } as const;
    let last = -1;
    for (const s of [50n, 150n, 250n, 350n, 450n, 500n]) {
      const cur = rank[assessTrust(s, 20n).decision];
      expect(cur).toBeGreaterThanOrEqual(last);
      last = cur;
    }
  });
});
