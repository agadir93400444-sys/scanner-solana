import { Connection } from "@solana/web3.js";

function parseRpcUrls(): string[] {
  const raw = process.env.SOLANA_RPC_URLS || "https://api.mainnet-beta.solana.com";
  const urls = raw
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  return urls.length > 0 ? urls : ["https://api.mainnet-beta.solana.com"];
}

let connections: Connection[] | null = null;

function getConnections(): Connection[] {
  if (!connections) {
    connections = parseRpcUrls().map((url) => new Connection(url, "confirmed"));
  }
  return connections;
}

/**
 * Essaie chaque endpoint RPC dans l'ordre jusqu'a ce qu'un appel reussisse.
 * Le RPC public Solana est rate-limite/instable : sans ca, une requete de
 * scan echoue completement des qu'un seul endpoint a un hoquet.
 */
export async function withRpcFallback<T>(fn: (connection: Connection) => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (const connection of getConnections()) {
    try {
      return await fn(connection);
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Tous les endpoints RPC ont echoue");
}
