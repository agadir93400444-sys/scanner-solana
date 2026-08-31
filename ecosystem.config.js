// Config PM2 pour le VPS - gere les 2 process (API + frontend) avec
// redemarrage auto et logs centralises. Usage : pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "token-scanner-api",
      cwd: __dirname,
      script: "dist/index.js",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
    {
      name: "token-scanner-web",
      cwd: __dirname + "/web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: "300M",
    },
    // Stream RTMP en boucle vers pump.fun (voir deploy/stream.sh). Pas
    // demarre automatiquement par "pm2 start ecosystem.config.js" tant que
    // RTMP_URL n'est pas dans .env - lancer explicitement avec
    // "pm2 start ecosystem.config.js --only token-scanner-stream" une fois
    // la cle de stream disponible.
    {
      name: "token-scanner-stream",
      cwd: __dirname,
      script: "deploy/stream.sh",
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 50,
    },
  ],
};
