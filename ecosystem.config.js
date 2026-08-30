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
  ],
};
