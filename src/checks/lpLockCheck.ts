import { linearScore } from "./scoring";
import { Check } from "./types";

const RAYDIUM_POOLS_ENDPOINT = "https://api-v3.raydium.io/pools/info/mint";
const FETCH_TIMEOUT_MS = 8000;

const FULL_SCORE_THRESHOLD_PCT = 90;
const ZERO_SCORE_THRESHOLD_PCT = 30;

interface RaydiumPool {
  type: string;
  id: string;
  tvl: number;
  burnPercent?: number;
  lpAmount?: number;
}

interface RaydiumPoolsResponse {
  success: boolean;
  data: {
    count: number;
    data: RaydiumPool[];
  };
}

// L'API publique Raydium calcule deja le % de LP tokens brules/verrouilles
// (burnPercent) par pool - on evite de re-deriver les adresses de pool et de
// parser les comptes LP nous-memes (layouts Raydium/Orca non stables).
async function fetchStandardPools(mintAddress: string): Promise<RaydiumPool[]> {
  const url = `${RAYDIUM_POOLS_ENDPOINT}?mint1=${mintAddress}&poolType=standard&poolSortField=liquidity&sortType=desc&pageSize=5&page=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });

  if (!res.ok) {
    throw new Error(`Raydium API a repondu ${res.status}`);
  }

  const json = (await res.json()) as RaydiumPoolsResponse;
  if (!json.success) {
    throw new Error("Raydium API: reponse non reussie");
  }

  return json.data.data;
}

export const lpLockCheck: Check = {
  id: "lpLock",
  weight: 20,
  async run(mintAddress) {
    let pools: RaydiumPool[];
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
