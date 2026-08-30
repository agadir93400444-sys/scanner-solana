import { PublicKey, SystemProgram } from "@solana/web3.js";
import { withRpcFallback } from "./rpcPool";

export type AuthorityControlKind = "wallet" | "program" | "uninitialized" | "unknown";

const cache = new Map<string, AuthorityControlKind>();

/**
 * Un wallet simple (owner = System Program) est controle par UNE cle privee.
 * Un compte controle par un programme (multisig, DAO, timelock...) demande
 * generalement plusieurs signataires ou un delai de gouvernance - risque
 * different meme si l'authority n'est pas revoquee. On ne devine pas quel
 * programme precis (Squads etc.) sans hardcoder des IDs non verifies ici.
 */
export async function getAuthorityControlKind(address: string): Promise<AuthorityControlKind> {
  const cached = cache.get(address);
  if (cached) return cached;

  let kind: AuthorityControlKind;
  try {
    const pubkey = new PublicKey(address);
    const owner = await withRpcFallback(async (connection) => {
      const info = await connection.getAccountInfo(pubkey);
      return info?.owner ?? null;
    });

    if (owner === null) {
      // Aucun compte on-chain (jamais funde) - probablement un wallet jamais
      // utilise directement, mais on ne peut pas l'affirmer avec certitude.
      kind = "uninitialized";
    } else {
      kind = owner.equals(SystemProgram.programId) ? "wallet" : "program";
    }
  } catch {
    kind = "unknown";
  }

  cache.set(address, kind);
  return kind;
}
