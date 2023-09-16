import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { createLink } from "#root/server/utils.js";

export const CREATELINK_CONVERSATION = "createlinkConversation";
export function createlinkConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Введи название ссылки</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("Создаю ссылку...");
      const response = await conversation.external(async () =>
        createLink(text)
      );
      return response
        ? ctx.reply(`Ссылка создана: <code>${response}</code>`)
        : ctx.reply("Ссылка не создана");
    },
    CREATELINK_CONVERSATION
  );
}
