// Ces deux imports doivent rester les tout premiers, dans cet ordre :
// TypeScript hisse tous les require() des imports au-dessus du reste du
// code (peu importe l'ordre des lignes dans le fichier), donc un
// dotenv.config() appele plus bas dans le fichier s'execute APRES que les
// modules importes plus haut (mintAccountCache, rateLimiter, logger...)
// aient deja lu process.env a leur chargement - leurs valeurs .env
// seraient alors silencieusement ignorees. quietDotenv doit passer avant
// dotenv/config pour que le flag qu'il pose soit deja present au moment ou
// dotenv lit son config.
import "./quietDotenv";
import "dotenv/config";

import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import scanRouter from "./routes/scan";
import { scanRateLimiter } from "./middleware/rateLimiter";
import { apiKeyAuth } from "./middleware/apiKeyAuth";
import { logger } from "./utils/logger";
import { openApiSpec } from "./openapi";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(pinoHttp({ logger }));
app.use(cors());
app.use(express.json());

// Enregistre avant le middleware /api (auth+rate-limit) : la doc doit rester
// lisible sans cle API.
app.get("/api/openapi.json", (_req, res) => {
  res.json(openApiSpec);
});

app.use("/api", apiKeyAuth, scanRateLimiter, scanRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  logger.info(`Token scanner API en ecoute sur le port ${PORT}`);
});
