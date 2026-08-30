import { Check } from "./types";
import { mintAuthorityCheck, freezeAuthorityCheck } from "./authorityChecks";
import { holderConcentrationCheck } from "./holderConcentrationCheck";
import { metadataAuthorityCheck } from "./metadataAuthorityCheck";
import { lpLockCheck } from "./lpLockCheck";
import { tokenExtensionsCheck } from "./tokenExtensionsCheck";
import { earlySniperCheck } from "./earlySniperCheck";

export const CHECK_REGISTRY: Check[] = [
  mintAuthorityCheck,
  freezeAuthorityCheck,
  holderConcentrationCheck,
  metadataAuthorityCheck,
  lpLockCheck,
  tokenExtensionsCheck,
  earlySniperCheck,
];

export const MAX_TOTAL_SCORE = CHECK_REGISTRY.reduce((sum, check) => sum + check.weight, 0);
