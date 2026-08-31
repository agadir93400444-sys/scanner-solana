import { CHECK_REGISTRY } from "./registry";
import { CheckResult, ScanReport } from "../types";

export function computeRiskLevel(totalScore: number, maxScore: number): ScanReport["riskLevel"] {
  const pct = (totalScore / maxScore) * 100;
  if (pct >= 80) return "LOW";
  if (pct >= 50) return "MEDIUM";
  if (pct >= 20) return "HIGH";
  return "CRITICAL";
}

export async function scanToken(mintAddress: string): Promise<ScanReport> {
  const errors: string[] = [];
  const checks: Record<string, CheckResult> = {};

  for (const check of CHECK_REGISTRY) {
    try {
      checks[check.id] = await check.run(mintAddress);
    } catch (err) {
      errors.push(`[${check.id}] ${(err as Error).message}`);
      checks[check.id] = {
        passed: false,
        score: 0,
        maxScore: check.weight,
        details: "Non verifiable",
      };
    }
  }

  // maxScore se calcule sur les checks reellement applicables : un check
  // exclu (applicable: false) ne doit ni penaliser ni avantager le score.
  const totalScore = Object.values(checks).reduce((sum, r) => sum + r.score, 0);
  const maxScore = Object.values(checks).reduce((sum, r) => sum + r.maxScore, 0);

  return {
    mint: mintAddress,
    timestamp: new Date().toISOString(),
    totalScore,
    maxScore,
    riskLevel: computeRiskLevel(totalScore, maxScore),
    checks,
    errors,
  };
}
