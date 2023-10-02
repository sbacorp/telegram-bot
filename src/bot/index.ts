/* eslint-disable no-console */
/* eslint-disable unicorn/consistent-function-scoping */
import { autoChatAction } from "@grammyjs/auto-chat-action";
import { hydrate } from "@grammyjs/hydrate";
import { sequentialize } from "@grammyjs/runner";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { autoRetry } from "@grammyjs/auto-retry";
import {
  BotConfig,
  GrammyError,
  HttpError,
  InlineKeyboard,
  Keyboard,
  StorageAdapter,
  Bot as TelegramBot,
  session,
} from "grammy";
import { conversations, createConversation } from "@grammyjs/conversations";
import {
  Context,
  createContextConstructor,
  sessionDataDefaults,
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
import { fillConsultations } from "#root/server/fill-consultations.js";
import { SessionData } from "#root/typing.js";
import SessionService from "#root/server/session-adapter.js";
import {
  webSiteKeyboard,
  mainMenu,
  toProjectsMenu,
  projectsMenu,
  studyProjectsMenu,
  budsProjectsMenu,
  freeProjectsMenu,
  subscribeToChannel,
  subscribeToChannelRecommendations,
  subscribeToChannelVitD,
  subscribeToChannelNavigator,
  tgChannelKeyboard,
  projectChildHealth,
  projectZhkt,
  guideAptechka,
  diagnosticMenu,
  groupProject,
  consultationAboutMenu,
  consultationAbout2Menu,
  consultationConditionsMenu,
  consultationMenu,
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
  diagnosticAmmiakConversationChild,
  DIAGNOSTIC_AMMIAK_CONVERSATION_CHILD,
  newsletterConversation,
  diagnosticParazitConversationChild,
  DIAGNOSTIC_PARAZIT_CONVERSATION_CHILD,
  individualConversation,
} from "./conversations/index.js";
import { cancel } from "./keyboards/cancel.keyboard.js";
import {
  BUY_CONVERSATION,
  buyConversation,
} from "./conversations/buy.conversation.js";
// eslint-disable-next-line import/order
import { UserModel } from "#root/server/models.js";
import { changeSheduleConversation } from "./conversations/admin/change-shedule.conversation.js";
import {
  individualConditionsMenu,
  individualMenu,
  individualStateMenu,
} from "./keyboards/individual-menu.keyboard.js";

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
      storage: SessionService,
      initial: () => ({ ...sessionDataDefaults }),
    })
  );
  const constraint = (ctx: Context) => String(ctx.chat?.id);
  //* middlemares
  bot.use(sequentialize(constraint));
  bot.command("help", async (ctx: Context) => {
    await ctx.reply("Возникли проблемы с работой бота?", {
      reply_markup: new InlineKeyboard()
        .url("Техническая поддержка", "https://t.me/frontsDev")
        .row()
        .url("Сотрудничество", "https://t.me/osmanovpr"),
    });
  });
  //* connect plugin conversations
  bot.use(conversations());
  //* setting commands conversations
  bot.use(setPromoConversation());
  bot.use(newsletterConversation());
  bot.use(createlinkConversation());
  bot.use(deletePromoConversation());
  bot.use(deleteLinkConversation());
  bot.use(activateSubscriptionConversation());
  bot.use(changeSheduleConversation());
  //* Handlers welcome and admin
  bot.use(welcomeFeature);
  bot.use(botAdminFeature);
  //* main hears
  bot.hears("🏠 Главное меню", async (ctx: Context) => {
    await ctx.conversation.exit();
    await ctx.reply("<b>Главное меню</b>", {
      reply_markup: mainMenu,
    });
    return ctx.deleteMessage();
  });
  bot.filter(
    (ctx) => ctx.update.callback_query?.data === "home",
    async (ctx) => {
      await ctx.deleteMessage();
      await ctx.conversation.exit();
      return ctx.reply("<b>Главное меню</b>", {
        reply_markup: mainMenu,
      });
    }
  );
  //* buy conversation
  bot.use(createConversation(buyConversation, BUY_CONVERSATION));
  bot.hears("Начать запись заново", async (ctx: Context) => {
    await ctx.conversation.exit();
    ctx.session.consultationStep = 1;
    await ctx.conversation.enter(CONSULTATION_CONVERSATION);
  });
  //* menus
  //* channel sub menu
  bot.use(subscribeToChannel);
  bot.use(subscribeToChannelRecommendations);
  bot.use(subscribeToChannelVitD);
  bot.use(subscribeToChannelNavigator);
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

  //* consultations menus
  bot.use(
    createConversation(consultationConversation, CONSULTATION_CONVERSATION)
  );
  bot.use(consultationConditionsMenu);
  bot.use(consultationAboutMenu);
  bot.use(consultationAbout2Menu);
  bot.use(consultationMenu);
  consultationConditionsMenu.register(consultationAboutMenu);
  consultationAboutMenu.register(consultationAbout2Menu);

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
      diagnosticParazitConversationChild,
      DIAGNOSTIC_PARAZIT_CONVERSATION_CHILD
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

  //* duagnostic menu
  bot.use(diagnosticMenu);

  //* individual
  bot.use(createConversation(individualConversation, "individual"));
  bot.use(individualStateMenu);
  bot.use(individualConditionsMenu);
  bot.use(individualMenu);
  individualStateMenu.register(individualConditionsMenu);
  //* hears handlers
  bot.hears("🌐 Сайт", async (ctx: Context) => {
    await ctx.deleteMessage();
    return ctx.reply("Перейдите по ссылке", {
      reply_markup: webSiteKeyboard,
    });
  });
  bot.hears("🗃 Мои проекты", async (ctx: Context) => {
    await ctx.deleteMessage();
    await ctx.reply("🗃 Мои проекты", {
      reply_markup: projectsMenu,
    });
  });
  bot.hears("🎯 Хочу комплексно решить проблему", async (ctx: Context) => {
    await ctx.deleteMessage();
    await ctx.reply("🗃 Мои проекты", {
      reply_markup: projectsMenu,
    });
  });
  bot.hears("📋 Диагностика", async (ctx: Context) => {
    await ctx.reply("📋 Диагностика", {
      reply_markup: diagnosticMenu,
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
        reply_markup: consultationMenu,
      }
    );
  });
  bot.hears("👩‍⚕️ Записаться на консультацию", async (ctx: Context) => {
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
        reply_markup: consultationMenu,
      }
    );
  });
  bot.hears("📝 Индивидуальное введение", async (ctx: Context) => {
    await ctx.deleteMessage();
    return ctx.reply(
      `Хотите поработать над своим здоровьем целый месяц вместе со мной?
Формат месячного ведения включает в себя:
 - полную оценку вашего организма со стороны эндокринной системы,
 - анализ комплексного состояния ЖКТ,
 - выявление дефицитов витаминов,
 - выявление дефицитов микронутриентов,
 - возможности корректировки всего состояния организма.`,
      {
        reply_markup: individualMenu,
      }
    );
  });
  bot.hears("🤖 Карманный нутрициолог", async (ctx: Context) => {
    // await ctx.reply("Карманный нутрициолог", {
    //   reply_markup: {
    //     inline_keyboard: [
    //       [
    //         {
    //           text: "Перейти в бота 🤖 ",
    //           url: "https://t.me/Tvoi_Nutriciolog_bot",
    //         },
    //       ],
    //     ],
    //   },
    // });
    await ctx.deleteMessage();
    return ctx.reply("⏳ Скоро будет доступен");
  });
  bot.hears("🗣 Тг-канал", async (ctx: Context) => {
    await ctx.deleteMessage();
    await ctx.reply(
      `Здесь вы найдете кладезь ценной бесплатной информации о том, как улучшить свое здоровье, повысить энергию и достичь гармонии с собой через правильное питание и биохаки
Подборка моих лучших постов:

<a href="https://t.me/alla_dietolog/709">1️⃣ Главный женский гормон</a>

<a href="https://t.me/alla_dietolog/693">2️⃣ Что может сказать кал о нашем ЖКТ</a>

<a href="https://t.me/alla_dietolog/599">3️⃣ Как пережить анестезию и наркоз</a>

<a href="https://t.me/alla_dietolog/552">4️⃣ Риски прогестероновой беременности</a>

<a href="https://t.me/alla_dietolog/465">5️⃣ Рекомендации родителям деток с АтД</a>

<a href="https://t.me/alla_dietolog/384">6️⃣ Почему нельзя ждать, если в 2 года у ребенка нет речи </a>

<a href="https://t.me/alla_dietolog/373">7️⃣ Поддержка иммунитета в межсезонье</a>

<a href="https://t.me/alla_dietolog/381">8️⃣ Почему желчь так важна в организме</a>

<a href="https://t.me/alla_dietolog/401">9️⃣ Отравление у ребенка: что делать</a>

<b>Надеюсь, мы подружимся!</b>
    `,
      {
        reply_markup: tgChannelKeyboard,
        disable_web_page_preview: true,
      }
    );
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
  });
  //* must be the last handler
  bot.hears("fillConsultations", async () => {
    await fillConsultations();
  });
  bot.hears("sendMessageToChannel", async () => {
    await bot.api.sendMessage("-1001833847819", "проверка");
  });
  bot.on("callback_query", async (ctx: Context) => {
    const data = ctx.callbackQuery?.data;
    if (data === "child") {
      await ctx.answerCallbackQuery("Вы выбрали консультацию для ребенка");
      ctx.session.sex = "child";
    }
    if (data === "male") {
      await ctx.answerCallbackQuery("Вы выбрали консультацию для мужчины");
      ctx.session.sex = "male";
    }
    if (data === "female") {
      await ctx.answerCallbackQuery("Вы выбрали консультацию для женщины");
      ctx.session.sex = "female";
    }
  });
  bot.on("my_chat_member", async (ctx: Context) => {
    if (ctx.update.my_chat_member?.new_chat_member?.status === "kicked") {
      const chatId = ctx.update.my_chat_member?.chat.id.toString();
      const user = await UserModel.findOne({
        where: {
          chatId,
        },
      });
      if (!user) return;
      user.status = "left";
      await user.save();
    }
  });
  bot.use(unhandledFeature);
  //* error handler
  if (config.isDev) {
    bot.catch(errorHandler);
  }
  return bot;
}

export type Bot = ReturnType<typeof createBot>;
