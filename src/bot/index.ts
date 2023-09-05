import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { sequentialize } from "@grammyjs/runner";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { autoRetry } from "@grammyjs/auto-retry";
import {
  BotConfig,
  Keyboard,
  StorageAdapter,
  Bot as TelegramBot,
  session,
} from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
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
import {
  webSiteKeyboard,
  mainMenu,
  toProjectsMenu,
  projectsMenu,
  studyProjectsMenu,
  budsProjectsMenu,
  freeProjectsMenu,
} from "./keyboards/index.js";
import {
  DIAGNOSTIC_CONVERSATION,
  diagnosticConversation,
  diagnosticZhktConversation,
  diagnosticDeficitConversation,
  diagnosticThyroidConversation,
  diagnosticInsulinConversation,
  consultationConversation,
  CONSULTATION_CONVERSATION,
  setPromoConversation,
  createlinkConversation,
  deletePromoConversation,
  activateSubscriptionConversation,
  deleteLinkConversation,
  DIAGNOSTIC_ZHKT_CONVERSATION,
  DIAGNOSTIC_DEFICIT_CONVERSATION,
  DIAGNOSTIC_THYROID_CONVERSATION,
  DIAGNOSTIC_INSULIN_CONVERSATION,
} from "./conversations/index.js";
import { cancel } from "./keyboards/cancel.keyboard.js";

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
  bot.api.config.use(
    autoRetry({
      maxRetryAttempts: 1, // only repeat requests once
      maxDelaySeconds: 5, // fail immediately if we have to wait >5 seconds
    })
  );
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
    })
  );
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const constraint = (ctx: Context) => String(ctx.chat?.id);

  bot.use(sequentialize(constraint));
  bot.use(conversations());
  bot.use(setPromoConversation());
  bot.use(createlinkConversation());
  bot.use(deletePromoConversation());
  bot.use(deleteLinkConversation());
  bot.use(activateSubscriptionConversation());
  // Handlers
  bot.use(welcomeFeature);
  bot.use(botAdminFeature);
  // Install the conversations plugin.

  //! menus
  // bot.use(studyProjectsMenu);
  // bot.use(budsProjectsMenu);
  // bot.use(freeProjectsMenu);
  bot.use(toProjectsMenu);
  toProjectsMenu.register(projectsMenu);
  bot.use(projectsMenu);
  projectsMenu.register(studyProjectsMenu);
  projectsMenu.register(freeProjectsMenu);
  projectsMenu.register(budsProjectsMenu);
  bot.hears("🏠 Главное меню", async (ctx: Context) => {
    ctx.conversation.exit();
    await ctx.reply("<b>Главное меню</b>", {
      reply_markup: mainMenu,
    });
    return ctx.deleteMessage();
  });

  bot.hears("🌐 Сайт", async (ctx: Context) => {
    await ctx.reply("Перейдите по ссылке", {
      reply_markup: webSiteKeyboard,
      disable_web_page_preview: true,
    });
    return ctx.deleteMessage();
  });
  bot.hears("🗣 Тг-канал", async (ctx: Context) => {
    await ctx.reply("Тг-канал");
    await ctx.deleteMessage();
  });
  bot.hears("💁🏼‍♀️ Обо мне", async (ctx: Context) => {
    await ctx.deleteMessage();
    await ctx.reply("💁🏼‍♀️ Обо мне", {
      reply_markup: cancel,
    });
    await ctx.reply(
      `Я клинический психолог, магистр психологических наук,  дипломированный нутрициолог с целым ящиком дипломов, постоянный спикер на конференциях и эксперт радио и тв.

И самое главное мое достижение: я автор курса «Детская нутрициология" и «Семейная нутрициология» - это ДПО с невероятной ценностью и эксклюзивной программой.

Моя главная цель - чтобы больше людей были здоровыми. И поэтому я всегда даю вам столько информации бесплатно, потому что я за то, чтобы здоровье было доступно всем!`,
      {
        reply_markup: toProjectsMenu,
      }
    );
    return ctx.deleteMessage();
  });
  bot.hears("🗃 Мои проекты", async (ctx: Context) => {
    await ctx.deleteMessage();
    await ctx.reply("🗃 Мои проекты", {
      reply_markup: projectsMenu,
    });
  });
  bot.hears("🤖 Карманный нутрициолог", async (ctx: Context) => {
    await ctx.reply("Карманный нутрициолог", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Перейти в бота",
              url: "https://t.me/pocket_nutritionist_test_bot",
            },
          ],
        ],
      },
    });
    return ctx.deleteMessage();
  });
  bot.use(
    createConversation(
      diagnosticDeficitConversation,
      DIAGNOSTIC_DEFICIT_CONVERSATION
    )
  );
  bot.use(
    createConversation(
      diagnosticThyroidConversation,
      DIAGNOSTIC_THYROID_CONVERSATION
    )
  );
  bot.use(
    createConversation(
      diagnosticInsulinConversation,
      DIAGNOSTIC_INSULIN_CONVERSATION
    )
  );
  bot.use(
    createConversation(diagnosticZhktConversation, DIAGNOSTIC_ZHKT_CONVERSATION)
  );
  bot.use(createConversation(diagnosticConversation, DIAGNOSTIC_CONVERSATION));
  bot.use(consultationConversation());
  bot.hears("👩‍⚕️ Консультация", async (ctx: Context) => {
    await ctx.conversation.enter(CONSULTATION_CONVERSATION);
    return ctx.deleteMessage();
  });
  bot.hears("📋 Диагностика", async (ctx: Context) => {
    await ctx.conversation.enter(DIAGNOSTIC_CONVERSATION);
    return ctx.deleteMessage();
  });
  // must be the last handler
  bot.use(unhandledFeature);

  if (config.isDev) {
    bot.catch(errorHandler);
  }

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
