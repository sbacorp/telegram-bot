/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable prettier/prettier */
import { chatAction } from "@grammyjs/auto-chat-action";
import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { isBotAdmin } from "#root/bot/filters/index.js";
import { setCommandsHandler } from "#root/bot/handlers/index.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import {
  getLinksMessage,
  getPromocodesMessage,
  getSubscribedUsersCount,
  getTotalUsersCount,
  getUsersJoinedNutrCount,
} from "#root/server/utils.js";
import {
  SETPROMO_CONVERSATION,
  CREATELINK_CONVERSATION,
  DELETE_PROMO_CONVERSATION,
  ACTIVATE_SUBSCRIPTION_CONVERSATION,
  DELETE_LINK_CONVERSATION,
} from "../conversations/index.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isBotAdmin);

feature.command(
  "setcommands",
  logHandle("command-setcommands"),
  chatAction("typing"),
  setCommandsHandler
);

feature.command(
  "setpromo",
  logHandle("command-setpromo"),
  chatAction("typing"),
  async (ctx) => {
    return ctx.conversation.enter(SETPROMO_CONVERSATION);
  }
);
feature.command(
  "createlink",
  logHandle("command-createLink"),
  chatAction("typing"),
  async (ctx) => {
    return ctx.conversation.enter(CREATELINK_CONVERSATION);
  }
);
feature.command(
  "deletepromo",
  logHandle("command-deletepromo"),
  chatAction("typing"),
  async (ctx) => {
    return ctx.conversation.enter(DELETE_PROMO_CONVERSATION);
  }
);
feature.command(
  "deletelink",
  logHandle("command-deletelink"),
  chatAction("typing"),
  async (ctx) => {
    return ctx.conversation.enter(DELETE_LINK_CONVERSATION);
  }
);
feature.command(
  "activatesubscription",
  logHandle("command-activeSubscription"),
  chatAction("typing"),
  async (ctx) => {
    return ctx.conversation.enter(ACTIVATE_SUBSCRIPTION_CONVERSATION);
  }
);
feature.command("newsletter", logHandle("command-newsletter"), async (ctx) => {
  return ctx.conversation.enter("newsletterConversation");
});
feature.command(
  "changeshedule",
  logHandle("command-change-shedule"),
  async (ctx) => {
    return ctx.conversation.enter("changeShedule");
  }
);
feature.command(
  "statistics",
  logHandle("command-statistics"),
  chatAction("typing"),
  async (ctx) => {
    await ctx.deleteMessage();
    await ctx.replyWithMarkdownV2(
      `*Всего пользователей:* ${await getTotalUsersCount()}\n*Зашли в нутрицолога:* ${await getUsersJoinedNutrCount()}\n*Оформили подписку:* ${await getSubscribedUsersCount()}`
    );
    await getPromocodesMessage().then((message) => {
      ctx.reply(message);
    });
    await getLinksMessage().then((message) => {
      ctx.reply(message, {
        disable_web_page_preview: true,
      });
    });
  }
);

export { composer as botAdminFeature };
