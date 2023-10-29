// #!/usr/bin/env tsx
import { onShutdown } from "node-graceful-shutdown";
import { RunnerHandle, run } from "@grammyjs/runner";
import { createBot } from "#root/bot/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import { createServer } from "#root/server/index.js";
import { sequelize } from "#root/server/database.js";
import { initDB } from "#root/server/utils.js";

try {
  const bot = createBot(config.BOT_TOKEN);
  const server = await createServer(bot);
  let runner: undefined | RunnerHandle;
  // Graceful shutdown
  onShutdown(async () => {
    logger.info("shutdown");
    await server.close();
    await runner?.stop();
    await bot.stop();
  });

  if (config.isProd) {
    await bot.api.deleteWebhook();
    await initDB(sequelize);
    await bot.init();
    await server.listen({
      host: config.BOT_SERVER_HOST,
      port: config.BOT_SERVER_PORT,
    });
    logger.info({
      msg: "bot running...",
      username: bot.botInfo.username,
    });
    runner = run(bot, {
      runner: {
        fetch: {
          allowed_updates: config.BOT_ALLOWED_UPDATES,
        },
      },
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
  }
} catch (error) {
  logger.error(error);
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1);
}
