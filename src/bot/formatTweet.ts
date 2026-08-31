import { ScanReport } from "../types";

const RISK_EMOJI: Record<ScanReport["riskLevel"], string> = {
  LOW: "🟢",
  MEDIUM: "🟡",
  HIGH: "🟠",
  CRITICAL: "🔴",
};

const RISK_LABEL: Record<ScanReport["riskLevel"], string> = {
  LOW: "Low risk",
  MEDIUM: "Moderate risk",
  HIGH: "High risk",
  CRITICAL: "Critical risk",
};

// Libelles courts en anglais pour le bot (le detail des checks vient de
// l'API en francais - inadapte a un post X en anglais).
const CHECK_FLAG_LABELS: Record<string, string> = {
  mintAuthority: "mint authority not revoked",
  freezeAuthority: "freeze authority not revoked",
  holderConcentration: "high holder concentration",
  metadataAuthority: "metadata still mutable",
  lpLock: "LP not locked",
  tokenExtensions: "risky Token-2022 extensions",
  earlySniperConcentration: "early sniper concentration",
};

export function formatTweet(report: ScanReport, symbol: string): string {
  const emoji = RISK_EMOJI[report.riskLevel];
  const label = RISK_LABEL[report.riskLevel];
  const link = `https://tokenscanner.cloud/?mint=${report.mint}`;

  const failedFlags = Object.entries(report.checks)
    .filter(([, check]) => !check.passed)
    .map(([id]) => CHECK_FLAG_LABELS[id] ?? id)
    .slice(0, 2);

  const flagsLine = failedFlags.length > 0 ? `⚠️ ${failedFlags.join(", ")}` : "✅ No red flags in the 7 checks";

  return [
    `${emoji} $${symbol} scored ${report.totalScore}/${report.maxScore} - ${label}`,
    "",
    flagsLine,
    "",
    `Full breakdown: ${link}`,
  ].join("\n");
}
