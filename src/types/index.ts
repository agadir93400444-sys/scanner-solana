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
  // false quand le critere n'a pas pu etre evalue (donnee introuvable/non
  // pertinente) - le check est alors exclu du score (score et maxScore a 0)
  // plutot que de compter comme un point gagne par defaut. Absent/true sinon.
  applicable?: boolean;
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
