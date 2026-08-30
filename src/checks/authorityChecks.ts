import { getMintInfoCached } from "../utils/mintAccountCache";
import { getAuthorityControlKind, AuthorityControlKind } from "../utils/authorityOwner";
import { Check } from "./types";

function controlNote(kind: AuthorityControlKind): string {
  switch (kind) {
    case "wallet":
      return " Cette adresse est un wallet simple (une seule cle privee) - aucune gouvernance multi-signataire.";
    case "program":
      return " Cette adresse est controlee par un programme (multisig/DAO/timelock potentiel) - risque different d'un wallet a cle unique.";
    case "uninitialized":
      return " Cette adresse n'a jamais ete utilisee on-chain - probablement un wallet jamais funde, non confirmable.";
    case "unknown":
      return "";
  }
}

export const mintAuthorityCheck: Check = {
  id: "mintAuthority",
  weight: 25,
  async run(mintAddress) {
    const info = await getMintInfoCached(mintAddress);
    const passed = info.mintAuthorityRevoked;

    if (passed) {
      return {
        passed,
        score: this.weight,
        maxScore: this.weight,
        details: "Mint authority revoquee - le supply total est fige, personne ne peut diluer les holders.",
      };
    }

    const controlKind = await getAuthorityControlKind(info.mintAuthorityAddress as string);
    return {
      passed,
      score: 0,
      maxScore: this.weight,
      details: `Mint authority ACTIVE (${info.mintAuthorityAddress}) - le createur peut minter des tokens a volonte et diluer le supply a tout moment.${controlNote(controlKind)}`,
      raw: { mintAuthorityAddress: info.mintAuthorityAddress, isToken2022: info.isToken2022, controlKind },
    };
  },
};

export const freezeAuthorityCheck: Check = {
  id: "freezeAuthority",
  weight: 25,
  async run(mintAddress) {
    const info = await getMintInfoCached(mintAddress);
    const passed = info.freezeAuthorityRevoked;

    if (passed) {
      return {
        passed,
        score: this.weight,
        maxScore: this.weight,
        details: "Freeze authority revoquee - personne ne peut bloquer tes tokens ou t'empecher de vendre.",
      };
    }

    const controlKind = await getAuthorityControlKind(info.freezeAuthorityAddress as string);
    return {
      passed,
      score: 0,
      maxScore: this.weight,
      details: `Freeze authority ACTIVE (${info.freezeAuthorityAddress}) - le createur peut geler ton compte de tokens et t'empecher de vendre. Signal honeypot fort.${controlNote(controlKind)}`,
      raw: { freezeAuthorityAddress: info.freezeAuthorityAddress, isToken2022: info.isToken2022, controlKind },
    };
  },
};
