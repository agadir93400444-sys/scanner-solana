import { PublicKey } from "@solana/web3.js";
import { Metadata, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { withRpcFallback } from "../utils/rpcPool";
import { Check } from "./types";

function deriveMetadataPda(mint: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    TOKEN_METADATA_PROGRAM_ID
  );
  return pda;
}

export const metadataAuthorityCheck: Check = {
  id: "metadataAuthority",
  weight: 15,
  async run(mintAddress) {
    const mintPubkey = new PublicKey(mintAddress);
    const metadataPda = deriveMetadataPda(mintPubkey);

    let metadata: Metadata;
    try {
      metadata = await withRpcFallback((connection) => Metadata.fromAccountAddress(connection, metadataPda));
    } catch {
      // Pas de compte metadata Metaplex (certains mints Token-2022 utilisent
      // l'extension de metadata native a la place) - non evaluable, pas
      // forcement suspect en soi.
      return {
        passed: false,
        score: 0,
        maxScore: this.weight,
        details: "Aucune metadata Metaplex trouvee pour ce mint - impossible de verifier la mutabilite du nom/logo.",
      };
    }

    const passed = !metadata.isMutable;
    return {
      passed,
      score: passed ? this.weight : 0,
      maxScore: this.weight,
      details: passed
        ? "Metadata immuable - le nom, le symbole et le logo ne peuvent plus etre changes."
        : `Metadata MUTABLE (update authority: ${metadata.updateAuthority.toBase58()}) - le createur peut renommer le token ou changer son logo a tout moment (rebranding trompeur possible).`,
      raw: { isMutable: metadata.isMutable, updateAuthority: metadata.updateAuthority.toBase58() },
    };
  },
};
