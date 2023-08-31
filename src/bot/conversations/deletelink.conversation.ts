import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { deleteLinkFromDB } from "#root/server/utils.js";

export const DELETE_LINK_CONVERSATION = "deleteLinkConversation";
export function deleteLinkConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Введи название ссылки для удаления</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("Удаляю...");
      return deleteLinkFromDB(text).then((response) => ctx.reply(response));
    },
    DELETE_LINK_CONVERSATION
  );
}
