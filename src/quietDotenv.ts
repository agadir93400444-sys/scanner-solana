// Doit etre importe AVANT "dotenv/config" (voir le commentaire d'ordre des
// imports dans index.ts). Supprime le message aleatoire que dotenv affiche a
// chaque demarrage - l'un des tips pointe vers un domaine tiers non verifie
// (vestauth.com) glisse dans le code publie de dotenv, sans rapport avec ce
// projet mais qu'on prefere ne pas relayer dans nos logs.
process.env.DOTENV_CONFIG_QUIET = "true";
