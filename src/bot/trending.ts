import { logger } from "../utils/logger";

export interface TrendingToken {
  address: string;
  symbol: string;
  name: string;
}

// Adresses bien connues a ne jamais poster (SOL wrappe, stables) - pas
// interessantes pour un scan rug pull/honeypot.
const EXCLUDED_MINTS = new Set([
  "So11111111111111111111111111111111111111112", // wSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
]);

export async function fetchTrendingSolanaTokens(limit = 20): Promise<TrendingToken[]> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    throw new Error("BIRDEYE_API_KEY manquante");
  }

  const res = await fetch(
    `https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=${limit}`,
    {
      headers: {
        accept: "application/json",
        "x-chain": "solana",
        "X-API-KEY": apiKey,
      },
    }
  );

  if (!res.ok) {
    throw new Error(`Birdeye API a repondu ${res.status}`);
  }

  const data = (await res.json()) as {
    data?: { tokens?: { address: string; symbol: string; name: string }[] };
  };

  const tokens = data.data?.tokens ?? [];
  const filtered = tokens
    .filter((t) => t.address && !EXCLUDED_MINTS.has(t.address))
    .map((t) => ({ address: t.address, symbol: t.symbol, name: t.name }));

  logger.info({ count: filtered.length }, "Tokens tendance recuperes depuis Birdeye");
  return filtered;
}
