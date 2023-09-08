import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { sequentialize } from "@grammyjs/runner";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { autoRetry } from "@grammyjs/auto-retry";
import {
  BotConfig,
  InlineKeyboard,
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
  tgChannelKeyboard,
  projectChildHealth,
  subscribeToChannel,
  projectZhkt,
  guideAptechka,
  diagnosticMenu,
  groupProject,
} from "./keyboards/index.js";
import {
  DIAGNOSTIC_CONVERSATION_ADULT,
  DIAGNOSTIC_CONVERSATION_CHILD,
  diagnosticConversationAdult,
  diagnosticConversationChild,
  diagnosticZhktConversationAdult,
  diagnosticDeficitConversationAdult,
  diagnosticThyroidConversationAdult,
  diagnosticInsulinConversationAdult,
  diagnosticZhktConversationChild,
  diagnosticDeficitConversationChild,
  diagnosticInsulinConversationChild,
  DIAGNOSTIC_ZHKT_CONVERSATION_ADULT,
  DIAGNOSTIC_DEFICIT_CONVERSATION_ADULT,
  DIAGNOSTIC_THYROID_CONVERSATION_ADULT,
  DIAGNOSTIC_INSULIN_CONVERSATION_ADULT,
  DIAGNOSTIC_DEFICIT_CONVERSATION_CHILD,
  DIAGNOSTIC_INSULIN_CONVERSATION_CHILD,
  DIAGNOSTIC_ZHKT_CONVERSATION_CHILD,
  consultationConversation,
  CONSULTATION_CONVERSATION,
  setPromoConversation,
  createlinkConversation,
  deletePromoConversation,
  activateSubscriptionConversation,
  deleteLinkConversation,
  diagnosticParazitConversationChild,
  DIAGNOSTIC_PARAZIT_CONVERSATION_CHILD,
  diagnosticAmmiakConversationChild,
  DIAGNOSTIC_AMMIAK_CONVERSATION_CHILD,
} from "./conversations/index.js";
import { cancel } from "./keyboards/cancel.keyboard.js";
import {
  BUY_CONVERSATION,
  buyConversation,
} from "./conversations/buy.conversation.js";

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
      maxRetryAttempts: 1,
      maxDelaySeconds: 5,
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
      initial: () => ({
        selectedProduct: "",
        subscribedToChannel: false,
      }),
      storage: sessionStorage,
    })
  );
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const constraint = (ctx: Context) => String(ctx.chat?.id);
  //* middlemares
  bot.use(sequentialize(constraint));
  //* connect plugin conversations
  bot.use(conversations());
  //* setting commands conversations
  bot.use(setPromoConversation());
  bot.use(createlinkConversation());
  bot.use(deletePromoConversation());
  bot.use(deleteLinkConversation());
  bot.use(activateSubscriptionConversation());
  //* Handlers welcome and admin
  bot.use(welcomeFeature);
  bot.use(botAdminFeature);
  //* main hears
  bot.hears("🏠 Главное меню", async (ctx: Context) => {
    ctx.conversation.exit();
    await ctx.reply("<b>Главное меню</b>", {
      reply_markup: mainMenu,
    });
    return ctx.deleteMessage();
  });
  //* buy conversation
  bot.use(createConversation(buyConversation, BUY_CONVERSATION));
  //* menus
  //* channel sub menu
  bot.use(subscribeToChannel);
  //* projects menus
  bot.use(projectChildHealth);
  bot.use(projectZhkt);
  bot.use(guideAptechka);
  bot.use(groupProject);
  bot.use(toProjectsMenu);
  toProjectsMenu.register(projectsMenu);
  bot.use(projectsMenu);
  projectsMenu.register(studyProjectsMenu);
  projectsMenu.register(freeProjectsMenu);
  projectsMenu.register(budsProjectsMenu);

  //* conversations diagnostics
  bot.use(
    createConversation(
      diagnosticDeficitConversationAdult,
      DIAGNOSTIC_DEFICIT_CONVERSATION_ADULT
    )
  );
  bot.use(
    createConversation(
      diagnosticThyroidConversationAdult,
      DIAGNOSTIC_THYROID_CONVERSATION_ADULT
    )
  );
  bot.use(
    createConversation(
      diagnosticInsulinConversationAdult,
      DIAGNOSTIC_INSULIN_CONVERSATION_ADULT
    )
  );
  bot.use(
    createConversation(
      diagnosticZhktConversationAdult,
      DIAGNOSTIC_ZHKT_CONVERSATION_ADULT
    )
  );
  bot.use(
    createConversation(
      diagnosticConversationAdult,
      DIAGNOSTIC_CONVERSATION_ADULT
    )
  );
  bot.use(
    createConversation(
      diagnosticDeficitConversationChild,
      DIAGNOSTIC_DEFICIT_CONVERSATION_CHILD
    )
  );
  bot.use(
    createConversation(
      diagnosticInsulinConversationChild,
      DIAGNOSTIC_INSULIN_CONVERSATION_CHILD
    )
  );
  bot.use(
    createConversation(
      diagnosticZhktConversationChild,
      DIAGNOSTIC_ZHKT_CONVERSATION_CHILD
    )
  );
  bot.use(
    createConversation(
      diagnosticParazitConversationChild,
      DIAGNOSTIC_PARAZIT_CONVERSATION_CHILD
    )
  );
  bot.use(
    createConversation(
      diagnosticAmmiakConversationChild,
      DIAGNOSTIC_AMMIAK_CONVERSATION_CHILD
    )
  );
  bot.use(
    createConversation(
      diagnosticConversationChild,
      DIAGNOSTIC_CONVERSATION_CHILD
    )
  );
  //* consultations conversation
  bot.use(consultationConversation());

  //* duagnostic menu
  bot.use(diagnosticMenu);
  //* hears handlers
  bot.hears("🌐 Сайт", async (ctx: Context) => {
    await ctx.reply("Перейдите по ссылке", {
      reply_markup: webSiteKeyboard,
      disable_web_page_preview: true,
    });
    return ctx.deleteMessage();
  });
  bot.hears("🗣 Тг-канал", async (ctx: Context) => {
    await ctx.deleteMessage();
    await ctx.reply("Перейдите по ссылке", {
      reply_markup: tgChannelKeyboard,
    });
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
              text: "Перейти в бота 🤖 ",
              url: "https://t.me/pocket_nutritionist_test_bot",
            },
          ],
        ],
      },
    });
    return ctx.deleteMessage();
  });

  bot.hears("👩‍⚕️ Консультация", async (ctx: Context) => {
    await ctx.deleteMessage();
    return ctx.reply(
      `Вам нужен проводник в мир здоровья и энергии? - приходите ко мне на консультацию!

Формат единоразовой консультации включает в себя:
 - полную оценку вашего организма со стороны эндокринной системы,
 - анализ комплексного состояния ЖКТ,
 - выявление дефицитов витаминов,
 - выявление дефицитов микронутриентов,
 - возможности корректировки всего состояния организма.`,
      {
        reply_markup: new InlineKeyboard().url(
          "Узнать подробности на сайте",
          "https://ya.ru"
        ),
      }
    );
  });
  bot.hears("📋 Диагностика", async (ctx: Context) => {
    await ctx.reply("📋 Диагностика", {
      reply_markup: diagnosticMenu,
    });
    return ctx.deleteMessage();
  });
  //* must be the last handler
  bot.use(unhandledFeature);
  //* error handler
  if (config.isDev) {
    bot.catch(errorHandler);
  }

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
