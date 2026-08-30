import { PublicKey } from "@solana/web3.js";
import {
  getMint,
  Mint,
  TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getTransferFeeConfig,
  getPermanentDelegate,
  getTransferHook,
  getDefaultAccountState,
  AccountState,
} from "@solana/spl-token";
import { withRpcFallback } from "./rpcPool";
import { MintAuthorityCheck, Token2022ExtensionsSummary } from "../types";

const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS) || 30_000;

interface CacheEntry {
  value: MintAuthorityCheck;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<MintAuthorityCheck>>();

/**
 * Les extensions Token-2022 dangereuses (permanent delegate, transfer hook,
 * default-frozen, transfer fee) sont lues directement depuis le TLV du mint
 * deja recupere par getMint - aucun appel RPC supplementaire.
 */
function extractExtensions(mintInfo: Mint): Token2022ExtensionsSummary {
  const transferFee = getTransferFeeConfig(mintInfo);
  const permanentDelegate = getPermanentDelegate(mintInfo);
  const transferHook = getTransferHook(mintInfo);
  const defaultAccountState = getDefaultAccountState(mintInfo);

  // Pubkey::default() (systeme, tout a zero) = extension presente dans le
  // TLV mais pas reellement configuree/active - convention Token-2022, pas
  // un risque. Vu en prod sur PYUSD (transfer hook "reserve" mais desactive).
  const isUnset = (pubkey: PublicKey) => pubkey.equals(PublicKey.default);

  return {
    hasTransferFee: transferFee !== null && transferFee.newerTransferFee.transferFeeBasisPoints > 0,
    transferFeeBasisPoints: transferFee?.newerTransferFee.transferFeeBasisPoints ?? null,
    hasPermanentDelegate: permanentDelegate !== null && !isUnset(permanentDelegate.delegate),
    permanentDelegateAddress: permanentDelegate?.delegate.toBase58() ?? null,
    hasTransferHook: transferHook !== null && !isUnset(transferHook.programId),
    transferHookProgramId: transferHook?.programId.toBase58() ?? null,
    defaultAccountStateFrozen: defaultAccountState?.state === AccountState.Frozen,
  };
}

/**
 * Un mint peut appartenir au Token Program classique ou a Token-2022.
 * getMint() a besoin du bon programId pour decoder le layout correctement -
 * sans ca, les mints Token-2022 (transfer fee, permanent delegate, hooks...)
 * echouent silencieusement ou sont mal interpretes.
 */
async function fetchMintInfo(mintAddress: string): Promise<MintAuthorityCheck> {
  const mintPubkey = new PublicKey(mintAddress);

  return withRpcFallback(async (connection) => {
    const accountInfo = await connection.getAccountInfo(mintPubkey);
    if (!accountInfo) {
      throw new Error("Compte mint introuvable sur la chaine");
    }

    let programId: PublicKey;
    if (accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID)) {
      programId = TOKEN_2022_PROGRAM_ID;
    } else if (accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
      programId = TOKEN_PROGRAM_ID;
    } else {
      throw new Error(`Ce compte n'est pas un mint SPL Token (owner: ${accountInfo.owner.toBase58()})`);
    }

    const mintInfo = await getMint(connection, mintPubkey, "confirmed", programId);
    const isToken2022 = programId.equals(TOKEN_2022_PROGRAM_ID);

    return {
      mintAuthorityRevoked: mintInfo.mintAuthority === null,
      mintAuthorityAddress: mintInfo.mintAuthority?.toBase58() ?? null,
      freezeAuthorityRevoked: mintInfo.freezeAuthority === null,
      freezeAuthorityAddress: mintInfo.freezeAuthority?.toBase58() ?? null,
      decimals: mintInfo.decimals,
      supply: mintInfo.supply.toString(),
      isInitialized: mintInfo.isInitialized,
      isToken2022,
      extensions: isToken2022 ? extractExtensions(mintInfo) : undefined,
    };
  });
}

/**
 * Cache TTL + deduplication des requetes concurrentes sur le meme mint,
 * pour que plusieurs checks (mint authority, freeze authority, futurs
 * checks) ne declenchent pas chacun leur propre appel RPC.
 */
export async function getMintInfoCached(mintAddress: string): Promise<MintAuthorityCheck> {
  const cached = cache.get(mintAddress);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const pending = inFlight.get(mintAddress);
  if (pending) {
    return pending;
  }

  const promise = fetchMintInfo(mintAddress)
    .then((value) => {
      cache.set(mintAddress, { value, expiresAt: Date.now() + CACHE_TTL_MS });
      return value;
    })
    .finally(() => {
      inFlight.delete(mintAddress);
    });

  inFlight.set(mintAddress, promise);
  return promise;
}
