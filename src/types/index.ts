export interface Token2022ExtensionsSummary {
  hasTransferFee: boolean;
  transferFeeBasisPoints: number | null;
  hasPermanentDelegate: boolean;
  permanentDelegateAddress: string | null;
  hasTransferHook: boolean;
  transferHookProgramId: string | null;
  defaultAccountStateFrozen: boolean;
}

export interface MintAuthorityCheck {
  mintAuthorityRevoked: boolean;
  mintAuthorityAddress: string | null;
  freezeAuthorityRevoked: boolean;
  freezeAuthorityAddress: string | null;
  decimals: number;
  supply: string;
  isInitialized: boolean;
  isToken2022: boolean;
  // Uniquement rempli si isToken2022 est vrai.
  extensions?: Token2022ExtensionsSummary;
}

export interface CheckResult {
  passed: boolean;
  score: number; // contribution au score total (0 -> poids max du critere)
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
