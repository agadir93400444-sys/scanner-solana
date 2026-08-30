import { PublicKey } from "@solana/web3.js";
import { withRpcFallback } from "../utils/rpcPool";
import { getMintInfoCached } from "../utils/mintAccountCache";
import { linearScore, bigintPercent } from "./scoring";
import { Check } from "./types";

const TOP_N = 10;
const FULL_SCORE_THRESHOLD_PCT = 20;
const ZERO_SCORE_THRESHOLD_PCT = 80;

// Ne distingue pas les wallets des comptes de pool LP (Raydium/Orca) parmi
// les plus gros holders - un pool legitime peut donc faire baisser le score
// meme sans risque de dump. A affiner quand le check LP sera ajoute.
export const holderConcentrationCheck: Check = {
  id: "holderConcentration",
  weight: 20,
  async run(mintAddress) {
    const mintPubkey = new PublicKey(mintAddress);
    const mintInfo = await getMintInfoCached(mintAddress);
    const totalSupply = BigInt(mintInfo.supply);

    if (totalSupply === 0n) {
      return {
        passed: false,
        score: 0,
        maxScore: this.weight,
        details: "Supply nulle - impossible d'evaluer la concentration des holders.",
      };
    }

    const largestAccounts = await withRpcFallback((connection) =>
      connection.getTokenLargestAccounts(mintPubkey)
    );

    const topAccounts = largestAccounts.value.slice(0, TOP_N);
    const topSum = topAccounts.reduce((sum, acc) => sum + BigInt(acc.amount), 0n);

    const topPct = bigintPercent(topSum, totalSupply);

    const score = linearScore(topPct, FULL_SCORE_THRESHOLD_PCT, ZERO_SCORE_THRESHOLD_PCT, this.weight, false);
    const passed = topPct <= FULL_SCORE_THRESHOLD_PCT;
    const summary = `Les ${topAccounts.length} plus gros comptes detiennent ${topPct.toFixed(1)}% du supply.`;
    const verdict =
      topPct >= ZERO_SCORE_THRESHOLD_PCT
        ? "Concentration extreme - quelques wallets peuvent dump et faire chuter le prix massivement."
        : topPct > FULL_SCORE_THRESHOLD_PCT
          ? "Concentration moderee a surveiller."
          : "Distribution raisonnable entre les holders.";

    return {
      passed,
      score,
      maxScore: this.weight,
      details: `${summary} ${verdict}`,
      raw: { topHoldersPct: topPct, accountsAnalyzed: topAccounts.length },
    };
  },
};
