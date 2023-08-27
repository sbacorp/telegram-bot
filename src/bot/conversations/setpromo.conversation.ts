import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { createPromoCode } from "#root/server/utils.js";

export const SETPROMO_CONVERSATION = "setPromoConversation";
export function setPromoConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Введи название промо</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("<b>Введи скидку в процентах</b>");
      const discount = await conversation.form.number();
      try {
        await createPromoCode(text, discount);
      } catch (error) {
        console.log(error);
      }

      return ctx.reply("Промокод создан");
    },
    SETPROMO_CONVERSATION,
  );
}
