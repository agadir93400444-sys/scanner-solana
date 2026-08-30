import { PublicKey, ConfirmedSignatureInfo } from "@solana/web3.js";
import { withRpcFallback } from "../utils/rpcPool";
import { fetchStandardPools } from "./raydiumPools";
import { linearScore, bigintPercent } from "./scoring";
import { Check } from "./types";

const MAX_AGE_DAYS = 7;
const MAX_PAGES = 3;
const PAGE_SIZE = 1000;
const EARLY_TX_SAMPLE = 50;
const TOP_N_WALLETS = 5;
const CONCURRENCY = 10;

const FULL_SCORE_THRESHOLD_PCT = 20;
const ZERO_SCORE_THRESHOLD_PCT = 60;

interface GenesisSearchResult {
  reachedGenesis: boolean;
  oldestFirst: ConfirmedSignatureInfo[];
}

/**
 * getSignaturesForAddress ne remonte QUE depuis maintenant vers le passe
 * (cursor "before"). Retrouver les toutes premieres transactions d'un pool
 * ancien/a fort volume demanderait de re-parcourir tout son historique -
 * beaucoup trop couteux pour un scan en direct. On borne la recherche a
 * quelques pages : si on atteint la genese du compte dans ce budget, le
 * pool est assez jeune/peu actif pour etre analyse : sinon on abandonne
 * proprement plutot que de faire trainer le scan.
 */
async function findEarliestSignatures(poolPubkey: PublicKey): Promise<GenesisSearchResult> {
  let before: string | undefined;
  let lastBatch: ConfirmedSignatureInfo[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await withRpcFallback((connection) =>
      connection.getSignaturesForAddress(poolPubkey, { before, limit: PAGE_SIZE })
    );

    if (batch.length === 0) {
      return { reachedGenesis: true, oldestFirst: [...lastBatch].reverse() };
    }

    lastBatch = batch;
    if (batch.length < PAGE_SIZE) {
      return { reachedGenesis: true, oldestFirst: [...batch].reverse() };
    }

    before = batch[batch.length - 1].signature;
  }

  return { reachedGenesis: false, oldestFirst: [] };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function computeEarlyBuyerConcentration(mintAddress: string, signatures: ConfirmedSignatureInfo[]) {
  const sample = signatures.slice(0, EARLY_TX_SAMPLE);
  const buyerVolumes = new Map<string, bigint>();
  let totalVolume = 0n;

  const transactions = await mapWithConcurrency(sample, CONCURRENCY, (sigInfo) =>
    withRpcFallback((connection) =>
      connection.getParsedTransaction(sigInfo.signature, { maxSupportedTransactionVersion: 0 })
    ).catch(() => null)
  );

  for (const tx of transactions) {
    if (!tx?.meta) continue;
    const pre = tx.meta.preTokenBalances ?? [];
    const post = tx.meta.postTokenBalances ?? [];

    const ownerByIndex = new Map<number, string>();
    const preAmount = new Map<number, bigint>();
    const postAmount = new Map<number, bigint>();

    for (const b of pre) {
      if (b.mint !== mintAddress) continue;
      preAmount.set(b.accountIndex, BigInt(b.uiTokenAmount.amount));
      if (b.owner) ownerByIndex.set(b.accountIndex, b.owner);
    }
    for (const b of post) {
      if (b.mint !== mintAddress) continue;
      postAmount.set(b.accountIndex, BigInt(b.uiTokenAmount.amount));
      if (b.owner) ownerByIndex.set(b.accountIndex, b.owner);
    }

    const indices = new Set([...preAmount.keys(), ...postAmount.keys()]);
    for (const idx of indices) {
      const delta = (postAmount.get(idx) ?? 0n) - (preAmount.get(idx) ?? 0n);
      if (delta > 0n) {
        const owner = ownerByIndex.get(idx) ?? `compte_${idx}`;
        buyerVolumes.set(owner, (buyerVolumes.get(owner) ?? 0n) + delta);
        totalVolume += delta;
      }
    }
  }

  return { buyerVolumes, totalVolume, analyzed: sample.length };
}

export const earlySniperCheck: Check = {
  id: "earlySniperConcentration",
  weight: 15,
  async run(mintAddress) {
    let pools;
    try {
      pools = await fetchStandardPools(mintAddress);
    } catch (err) {
      return {
        passed: false,
        score: 0,
        maxScore: this.weight,
        details: `Impossible de recuperer le pool: ${(err as Error).message}`,
      };
    }

    if (pools.length === 0 || !pools[0].openTime) {
      return {
        passed: true,
        score: this.weight,
        maxScore: this.weight,
        details: "Pool ou date de lancement introuvable - analyse du lancement non applicable (score neutre, pas une penalite).",
      };
    }

    const openTimeMs = Number(pools[0].openTime) * 1000;
    const ageDays = (Date.now() - openTimeMs) / 86_400_000;

    if (ageDays > MAX_AGE_DAYS) {
      return {
        passed: true,
        score: this.weight,
        maxScore: this.weight,
        details: `Pool lance il y a ${Math.round(ageDays)} jours - trop ancien pour qu'une analyse du lancement soit pertinente (score neutre).`,
      };
    }

    const poolPubkey = new PublicKey(pools[0].id);
    const { reachedGenesis, oldestFirst } = await findEarliestSignatures(poolPubkey);

    if (!reachedGenesis) {
      return {
        passed: true,
        score: this.weight,
        maxScore: this.weight,
        details: "Volume de transactions trop eleve pour retrouver le lancement de facon fiable dans un temps raisonnable (score neutre, non applicable).",
      };
    }

    if (oldestFirst.length === 0) {
      return {
        passed: true,
        score: this.weight,
        maxScore: this.weight,
        details: "Pool tout juste cree, aucune transaction encore enregistree.",
      };
    }

    const { buyerVolumes, totalVolume, analyzed } = await computeEarlyBuyerConcentration(mintAddress, oldestFirst);

    if (totalVolume === 0n || buyerVolumes.size === 0) {
      return {
        passed: false,
        score: 0,
        maxScore: this.weight,
        details: `Aucun achat detecte parmi les ${analyzed} premieres transactions du pool - non verifiable.`,
      };
    }

    const sorted = [...buyerVolumes.entries()].sort((a, b) => (b[1] > a[1] ? 1 : a[1] > b[1] ? -1 : 0));
    const topWallets = sorted.slice(0, TOP_N_WALLETS);
    const topSum = topWallets.reduce((sum, [, v]) => sum + v, 0n);
    const topPct = bigintPercent(topSum, totalVolume);

    const score = linearScore(topPct, FULL_SCORE_THRESHOLD_PCT, ZERO_SCORE_THRESHOLD_PCT, this.weight, false);
    const passed = topPct <= FULL_SCORE_THRESHOLD_PCT;

    return {
      passed,
      score,
      maxScore: this.weight,
      details:
        `Sur les ${analyzed} premieres transactions du pool (${buyerVolumes.size} acheteurs distincts), ` +
        `les ${Math.min(TOP_N_WALLETS, topWallets.length)} plus gros acheteurs precoces detiennent ${topPct.toFixed(1)}% du volume achete. ` +
        (passed
          ? "Distribution raisonnable entre acheteurs au lancement."
          : "Concentration elevee au lancement - signal possible de sniping/bundling (bots ou wallets lies ayant raffle le supply des le debut)."),
      raw: { earlyBuyersAnalyzed: analyzed, distinctBuyers: buyerVolumes.size, topBuyersPct: topPct },
    };
  },
};
