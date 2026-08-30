import { Router, Request, Response } from "express";
import { PublicKey } from "@solana/web3.js";
import { scanToken } from "../checks/scanService";
import { saveScan, getScanHistory } from "../db/scanHistory";
import { logger } from "../utils/logger";

const router = Router();

function parseMintParam(req: Request): string {
  return Array.isArray(req.params.mint) ? req.params.mint[0] : req.params.mint;
}

router.get("/scan/:mint", async (req: Request, res: Response) => {
  const mint = parseMintParam(req);

  // Validation basique : est-ce meme une adresse Solana valide (base58, 32 bytes) ?
  try {
    new PublicKey(mint);
  } catch {
    return res.status(400).json({ error: "Adresse mint invalide (pas une cle publique Solana valide)" });
  }

  try {
    const report = await scanToken(mint);

    try {
      saveScan(report);
    } catch (err) {
      // La persistance ne doit jamais faire echouer une reponse de scan valide.
      logger.error({ mint, err }, "Echec de la sauvegarde en base");
    }

    return res.status(200).json(report);
  } catch (err) {
    logger.error({ mint, err }, "Echec du scan");
    return res.status(500).json({ error: `Erreur serveur: ${(err as Error).message}` });
  }
});

router.get("/history/:mint", (req: Request, res: Response) => {
  const mint = parseMintParam(req);

  try {
    new PublicKey(mint);
  } catch {
    return res.status(400).json({ error: "Adresse mint invalide (pas une cle publique Solana valide)" });
  }

  const history = getScanHistory(mint);
  return res.status(200).json({ mint, count: history.length, history });
});

export default router;
