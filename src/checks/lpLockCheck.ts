import { linearScore } from "./scoring";
import { fetchStandardPools } from "./raydiumPools";
import { Check } from "./types";

const FULL_SCORE_THRESHOLD_PCT = 90;
const ZERO_SCORE_THRESHOLD_PCT = 30;

export const lpLockCheck: Check = {
  id: "lpLock",
  weight: 20,
  async run(mintAddress) {
    let pools;
    try {
      pools = await fetchStandardPools(mintAddress);
    } catch (err) {
      return {
        passed: false,
        score: 0,
        maxScore: this.weight,
        details: `Impossible de recuperer les pools Raydium: ${(err as Error).message}`,
      };
    }

    if (pools.length === 0) {
      return {
        passed: false,
        score: 0,
        maxScore: this.weight,
        details: "Aucun pool Raydium (Standard AMM) trouve pour ce token - liquidite non verifiable via cette source.",
      };
    }

    // Deja trie par liquidite (poolSortField=liquidity) - le premier est le pool principal.
    const mainPool = pools[0];
    const burnPercent = mainPool.burnPercent ?? 0;

    const score = linearScore(burnPercent, FULL_SCORE_THRESHOLD_PCT, ZERO_SCORE_THRESHOLD_PCT, this.weight, true);
    const passed = burnPercent >= FULL_SCORE_THRESHOLD_PCT;
    const lowLiquidityNote =
      mainPool.tvl < 1000 ? " Attention, TVL tres faible - liquidite quasi inexistante." : "";

    return {
      passed,
      score,
      maxScore: this.weight,
      details:
        `${burnPercent.toFixed(1)}% des LP tokens du pool principal sont brules/verrouilles (TVL: $${mainPool.tvl.toFixed(0)}).` +
        (passed
          ? " Le createur ne peut pas retirer cette liquidite."
          : " Le createur garde le controle d'une partie significative de la liquidite - risque de rug pull.") +
        lowLiquidityNote,
      raw: { poolId: mainPool.id, burnPercent, tvl: mainPool.tvl },
    };
  },
};
