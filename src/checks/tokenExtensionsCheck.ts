import { getMintInfoCached } from "../utils/mintAccountCache";
import { Check } from "./types";

// Le Token Program classique ne supporte aucune de ces extensions - seul
// Token-2022 le permet. Permanent delegate et default-frozen sont les plus
// graves : vol direct des tokens d'un holder / honeypot total des la reception.
export const tokenExtensionsCheck: Check = {
  id: "tokenExtensions",
  weight: 25,
  async run(mintAddress) {
    const info = await getMintInfoCached(mintAddress);

    if (!info.isToken2022 || !info.extensions) {
      return {
        passed: true,
        score: this.weight,
        maxScore: this.weight,
        details: "Token Program classique - aucune extension Token-2022 a risque possible (pas de permanent delegate, transfer hook, taxe ou gel par defaut).",
      };
    }

    const { extensions } = info;
    const risks: string[] = [];

    if (extensions.hasPermanentDelegate) {
      risks.push(
        `permanent delegate actif (${extensions.permanentDelegateAddress}) - cette adresse peut transferer ou bruler les tokens de N'IMPORTE QUEL holder sans son accord`
      );
    }
    if (extensions.defaultAccountStateFrozen) {
      risks.push(
        "les nouveaux comptes sont geles par defaut (DefaultAccountState=Frozen) - impossible de transferer sans une action prealable du createur, signal honeypot tres fort"
      );
    }
    if (extensions.hasTransferHook) {
      risks.push(
        `transfer hook actif (programme ${extensions.transferHookProgramId}) - un programme arbitraire s'execute a chaque transfert et peut bloquer les ventes`
      );
    }
    if (extensions.hasTransferFee) {
      const pct = ((extensions.transferFeeBasisPoints ?? 0) / 100).toFixed(2);
      risks.push(`taxe de transfert integree au mint de ${pct}% sur chaque transaction`);
    }

    const passed = risks.length === 0;
    // Vol direct ou blocage total des ventes : score nul. Taxe/hook seuls :
    // risque reel mais pas automatiquement fatal (score partiel).
    const critical = extensions.hasPermanentDelegate || extensions.defaultAccountStateFrozen;
    const score = passed ? this.weight : critical ? 0 : Math.round(this.weight * 0.4);

    return {
      passed,
      score,
      maxScore: this.weight,
      details: passed
        ? "Mint Token-2022 sans extension a risque detectee."
        : `Extensions Token-2022 a risque : ${risks.join("; ")}.`,
      raw: extensions as unknown as Record<string, unknown>,
    };
  },
};
