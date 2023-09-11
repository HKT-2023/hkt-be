module.exports = {
  apps: [
    //  Mint NFT when house sold
    {
      name: "BACKEND: provider mint NFT when house sold",
      script: "node ./dist/console.js provider-sold-house-for-mint",
      autorestart: false,
      cron_restart: "1 0 * * *",
    },
    // Update NFT point
    {
      name: "BACKEND: provider update NFT point",
      script: "node ./dist/console.js provider-update-NFT-point",
      cron_restart: "1 * * * *",
      autorestart: false,
    },
    {
      name: "BACKEND: consumer update NFT point",
      script: "node ./dist/console.js consumer-update-NFT-point",
      max_restarts: 5,
      restart_delay: 15000,
      cron_restart: "1 0 * * *",
    },
    // Finish auction
    {
      name: "BACKEND: provider finish auction",
      script: "node ./dist/console.js provider-finish-auction",
      cron_restart: "*/5 * * * *",
      autorestart: false,
    },
    {
      name: "BACKEND: consumer finish auction",
      script: "node ./dist/console.js consumer-finish-auction",
      max_restarts: 5,
      restart_delay: 15000,
      cron_restart: "1 0 * * *",
    },
    // calculate gas fee on blockchain
    {
      name: "BACKEND: provider un estimate transaction fee",
      script: "node ./dist/console.js provider-un-estimate-transaction-fee",
      cron_restart: "1 0 * * *",
      autorestart: false,
    },
    {
      name: "BACKEND: consumer un estimate transaction fee",
      script: "node ./dist/console.js consumer-un-estimate-transaction-fee",
      max_restarts: 5,
      restart_delay: 15000,
      cron_restart: "1 0 * * *",
    },
    // calculate accuracy of user estimations
    {
      name: "BACKEND: provider calculate accuracy estimation",
      script: "node ./dist/console.js provider-calculate-accuracy-estimation",
      cron_restart: "*/5 * * * *",
      autorestart: false,
    },
    {
      name: "BACKEND: consumer calculate accuracy estimation",
      script: "node ./dist/console.js consumer-calculate-accuracy-estimation",
      max_restarts: 5,
      restart_delay: 15000,
      cron_restart: "1 0 * * *",
    },
    // calculate and send reward for user estimations
    {
      name: "BACKEND: provider calculate reward estimation",
      script: "node ./dist/console.js provider-calculate-reward-estimation",
      cron_restart: "1 * * * *",
      // cron_restart: "1 0 1 * *",
      autorestart: false,
    },
    // calculate and send reward for user point having
    {
      name: "BACKEND: provider calculate reward token",
      script: "node ./dist/console.js provider-calculate-reward-token",
      cron_restart: "1 * * * *",
      // cron_restart: "1 0 1 * *",
      autorestart: false,
    },
  ],
};
