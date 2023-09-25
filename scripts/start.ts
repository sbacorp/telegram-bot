// #!/usr/bin/env tsx
import { onShutdown } from "node-graceful-shutdown";
import { RunnerHandle, run } from "@grammyjs/runner";
import { createBot } from "#root/bot/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import { createServer } from "#root/server/index.js";
import { initDB } from "#root/server/utils.js";
import { sequelize } from "#root/server/database.js";

try {
  const bot = createBot(config.BOT_TOKEN);
  const server = await createServer(bot);
  let runner: undefined | RunnerHandle;
  // Graceful shutdown
  onShutdown(async () => {
    logger.info("shutdown");

    await server.close();
    await bot.stop();
  });
  if (config.isProd) {
    // to prevent receiving updates before the bot is ready
    await bot.init();
    await initDB(sequelize);
    await server.listen({
      host: config.BOT_SERVER_HOST,
      port: config.BOT_SERVER_PORT,
    });

    await bot.api.setWebhook(config.BOT_WEBHOOK, {
      allowed_updates: config.BOT_ALLOWED_UPDATES,
    });
  } else if (config.isDev) {
    await initDB(sequelize);
    runner = run(bot, {
      runner: {
        fetch: {
          allowed_updates: config.BOT_ALLOWED_UPDATES,
        },
      },
    });
    // await bot.start({
    //   allowed_updates: config.BOT_ALLOWED_UPDATES,
    //   onStart: ({ username }) =>
    //     logger.info({
    //       msg: "bot running...",
    //       username,
    //     }),
    // });
  }
} catch (error) {
  logger.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
