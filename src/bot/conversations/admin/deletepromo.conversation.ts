import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { deletePromoCodeFromDB } from "#root/server/utils.js";

export const DELETE_PROMO_CONVERSATION = "deletePromoConversation";
export function deletePromoConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Введи название промо для удаления</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("Удаляю...");
      const response = await conversation.external(async () =>
        deletePromoCodeFromDB(text)
      );
      return ctx.reply(response);
    },
    DELETE_PROMO_CONVERSATION
  );
}
