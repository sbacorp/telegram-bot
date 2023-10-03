import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { deleteLinkFromDB } from "#root/server/utils.js";
import { InlineKeyboard } from "grammy";

export const DELETE_LINK_CONVERSATION = "deleteLinkConversation";
export function deleteLinkConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("Для какого бота ссылка?", {
        reply_markup: new InlineKeyboard()
          .text("сайт", "botSite")
          .text("нутрициолог", "Nutr"),
      });
      const linkType = await conversation.waitForCallbackQuery([
        "botSite",
        "Nutr",
      ]);
      await ctx.reply("<b>Введи название ссылки для удаления</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("Удаляю...");
      const response = await conversation.external(async () =>
        deleteLinkFromDB(text, linkType.update.callback_query.data)
      );
      return ctx.reply(response);
    },
    DELETE_LINK_CONVERSATION
  );
}
