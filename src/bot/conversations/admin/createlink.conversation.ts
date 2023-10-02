import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { createNutrLink, createBotSiteLink } from "#root/server/utils.js";
import { InlineKeyboard } from "grammy";

export const CREATELINK_CONVERSATION = "createlinkConversation";
export function createlinkConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("Для какого бота ссылка?", {
        reply_markup: new InlineKeyboard()
          .text("Бот сайт", "site")
          .row()
          .text("Нутрициолог", "nutr"),
      });
      const linkFor = await conversation.waitForCallbackQuery(
        ["site", "nutr"],
        {
          otherwise: async () => {
            await ctx.reply("Выбери:", {
              reply_markup: new InlineKeyboard()
                .text("Бот сайт", "site")
                .row()
                .text("Нутрициолог", "nutr"),
            });
          },
        }
      );
      await ctx.reply("<b>Введи название ссылки</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("Введи текст ссылки:");
      const linkText = await conversation.wait();
      await ctx.reply("Создаю ссылку...");
      if (linkFor.update.callback_query.data === "site") {
        const response = await conversation.external(async () =>
          createBotSiteLink(text, linkText.message!.text!)
        );
        await ctx.reply(response);
      } else if (linkFor.update.callback_query.data === "nutr") {
        const response = await conversation.external(async () =>
          createNutrLink(text, linkText.message!.text!)
        );
        await ctx.reply(response);
      }
    },
    CREATELINK_CONVERSATION
  );
}
