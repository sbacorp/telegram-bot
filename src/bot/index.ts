import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { sequentialize } from "@grammyjs/runner";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { BotConfig, StorageAdapter, Bot as TelegramBot, session } from "grammy";
import {
  Context,
  SessionData,
  createContextConstructor,
} from "#root/bot/context.js";
import {
  botAdminFeature,
  unhandledFeature,
  welcomeFeature,
} from "#root/bot/features/index.js";
import { errorHandler } from "#root/bot/handlers/index.js";
import { updateLogger } from "#root/bot/middlewares/index.js";
import { config } from "#root/config.js";
import { logger } from "#root/logger.js";
import { webSiteKeyboard,educationKeyboard, mainMenu } from "./keyboards/index.js";
import { conversations } from "@grammyjs/conversations";
import { DIAGNOSTIC_CONVERSATION, diagnosticConversation } from "./conversations/index.js";

type Options = {
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<Context>, "ContextConstructor">;
};
export function createBot(token: string, options: Options = {}) {
  const { sessionStorage } = options;
  const bot = new TelegramBot(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger }),
  });

  // Middlewares
  bot.api.config.use(parseMode("HTML"));

  if (config.isDev) {
    bot.use(updateLogger());
  }

  bot.use(autoChatAction(bot.api));
  bot.use(hydrateReply);
  bot.use(hydrate());
  bot.use(
    session({
      initial: () => ({}),
      storage: sessionStorage,
    }),
  );
// Install the conversations plugin.
  bot.use(conversations());
  bot.use(diagnosticConversation());

  // Handlers
  bot.use(welcomeFeature);
  bot.use(botAdminFeature);



bot.hears("Сайт", async (ctx: Context) => {
	await ctx.reply("Перейдите по ссылке", {
		reply_markup: webSiteKeyboard,
		disable_web_page_preview: true,
	});
});
bot.hears("Консультация", async (ctx: Context) => {
	await ctx.reply("Консультация");

});bot.hears("Обучение", async (ctx: Context) => {
	await ctx.reply("Обучение", {
		reply_markup: educationKeyboard});
});
bot.hears("гт ĸанал", async (ctx: Context) => {
	await ctx.reply("гт ĸанал");
});
bot.hears("Обо мне", async (ctx: Context) => {
	await ctx.reply("Обо мне");
});
bot.hears("Карманный нутрициолог", async (ctx: Context) => {
	await ctx.reply("Карманный нутрициолог");
});

bot.hears("Диагностика", async (ctx: Context) => {
	 return ctx.conversation.enter(DIAGNOSTIC_CONVERSATION);
});

bot.hears('cancel', async (ctx: Context) => {
  ctx.conversation.exit()
})


  // must be the last handler
  bot.use(unhandledFeature);

  if (config.isDev) {
    bot.catch(errorHandler);
  }

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
