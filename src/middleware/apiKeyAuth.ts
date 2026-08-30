import { Request, Response, NextFunction } from "express";

function parseApiKeys(): Set<string> {
  const raw = process.env.API_KEYS || "";
  return new Set(
    raw
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean)
  );
}

const validKeys = parseApiKeys();

// Si API_KEYS n'est pas defini, l'API reste ouverte (comportement par
// defaut pour le dev local) - definir API_KEYS pour l'activer en prod.
export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  if (validKeys.size === 0) {
    next();
    return;
  }

  const key = req.header("x-api-key");
  if (!key || !validKeys.has(key)) {
    res.status(401).json({ error: "Cle API manquante ou invalide (header x-api-key)" });
    return;
  }

  next();
}
