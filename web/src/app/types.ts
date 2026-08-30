// Miroir de src/types/index.ts cote API - dupplique volontairement pour
// garder le frontend independant du backend (deux apps deployees separement).
export interface CheckResult {
  passed: boolean;
  score: number;
  maxScore: number;
  details: string;
  raw?: Record<string, unknown>;
}

export interface ScanReport {
  mint: string;
  timestamp: string;
  totalScore: number;
  maxScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  checks: Record<string, CheckResult>;
  errors: string[];
}

export interface ApiError {
  error: string;
}
