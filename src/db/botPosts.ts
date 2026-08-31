import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "scan_history.db");

const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS bot_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mint TEXT NOT NULL,
    tweet_id TEXT,
    posted_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_bot_posts_mint ON bot_posts(mint);
`);

const insertStmt = db.prepare("INSERT INTO bot_posts (mint, tweet_id, posted_at) VALUES (?, ?, ?)");
const recentStmt = db.prepare("SELECT mint FROM bot_posts WHERE posted_at > ?");

export function recordBotPost(mint: string, tweetId: string | null): void {
  insertStmt.run(mint, tweetId, new Date().toISOString());
}

// Evite de re-poster le meme token dans la fenetre donnee (en jours).
export function getRecentlyPostedMints(withinDays = 7): Set<string> {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000).toISOString();
  const rows = recentStmt.all(since) as { mint: string }[];
  return new Set(rows.map((r) => r.mint));
}
