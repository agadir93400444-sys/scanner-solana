import rateLimit from "express-rate-limit";

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || 30;

// Chaque scan peut declencher plusieurs appels RPC en amont (mint, holders,
// LP...) - limiter ici protege le RPC configure autant que notre propre API.
export const scanRateLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requetes - reessaie dans une minute." },
});
