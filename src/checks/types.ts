import { CheckResult } from "../types";

/**
 * Interface commune a tous les checks. Un nouveau critere (holders,
 * liquidite, metadata...) s'ajoute en implementant cette interface et en
 * l'enregistrant dans registry.ts - sans toucher au reste du pipeline.
 */
export interface Check {
  id: string;
  weight: number;
  run(mintAddress: string): Promise<CheckResult>;
}
