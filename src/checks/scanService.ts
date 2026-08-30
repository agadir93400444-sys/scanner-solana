import { CHECK_REGISTRY, MAX_TOTAL_SCORE } from "./registry";
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

  const totalScore = Object.values(checks).reduce((sum, r) => sum + r.score, 0);

  return {
    mint: mintAddress,
    timestamp: new Date().toISOString(),
    totalScore,
    maxScore: MAX_TOTAL_SCORE,
    riskLevel: computeRiskLevel(totalScore, MAX_TOTAL_SCORE),
    checks,
    errors,
  };
}
