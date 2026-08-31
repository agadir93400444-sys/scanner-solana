import "../quietDotenv";
import "dotenv/config";
import { PublicKey } from "@solana/web3.js";
import { TwitterApi } from "twitter-api-v2";
import { scanToken } from "../checks/scanService";
import { fetchTrendingSolanaTokens } from "./trending";
import { formatTweet } from "./formatTweet";
import { getRecentlyPostedMints, recordBotPost } from "../db/botPosts";
import { saveScan } from "../db/scanHistory";
import { logger } from "../utils/logger";

const DRY_RUN = process.env.BOT_DRY_RUN === "true";

async function pickCandidate(): Promise<{ address: string; symbol: string } | null> {
  const trending = await fetchTrendingSolanaTokens();
  const recentlyPosted = getRecentlyPostedMints(7);

  for (const token of trending) {
    if (recentlyPosted.has(token.address)) continue;
    try {
      new PublicKey(token.address);
    } catch {
      continue; // adresse pas une cle publique valide (skip silencieux)
    }
    return { address: token.address, symbol: token.symbol };
  }

  return null;
}

async function postTweet(text: string): Promise<string | null> {
  if (DRY_RUN) {
    logger.info({ text }, "[DRY RUN] Tweet non envoye");
    return null;
  }

  const client = new TwitterApi({
    appKey: process.env.X_APP_KEY!,
    appSecret: process.env.X_APP_SECRET!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessSecret: process.env.X_ACCESS_SECRET!,
  });

  const { data } = await client.v2.tweet(text);
  return data.id;
}

async function main() {
  const candidate = await pickCandidate();
  if (!candidate) {
    logger.info("Aucun token tendance non deja poste trouve - rien a faire cette heure-ci");
    return;
  }

  logger.info({ mint: candidate.address, symbol: candidate.symbol }, "Scan du token candidat");
  const report = await scanToken(candidate.address);

  try {
    saveScan(report);
  } catch (err) {
    logger.error({ err }, "Echec de la sauvegarde du scan du bot");
  }

  const text = formatTweet(report, candidate.symbol);
  const tweetId = await postTweet(text);

  recordBotPost(candidate.address, tweetId);
  logger.info({ mint: candidate.address, tweetId }, "Tweet publie");
}

main().catch((err) => {
  logger.error({ err }, "Echec du bot de post horaire");
  process.exit(1);
});
