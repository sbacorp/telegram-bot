import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { createPromoCode } from "#root/server/utils.js";

export const SETPROMO_CONVERSATION = "setPromoConversation";
export function setPromoConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Выберите товар :</b>", {
        reply_markup: new Keyboard()
          .text("Подписка на нутрициолога")
          .row()
          .text("Консультация")
          .row()
          .text("Детское здоровье")
          .row()
          .text("Методичка по работе с желчью")
          .row()
          .text("Гайд Аптечка для детей и взрослых")
          .row()
          .text("Групповое ведение"),
      });
      const data = await conversation.waitFor("message:text");
      await ctx.reply("<b>Введи название промо</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("<b>Введи скидку в процентах</b>");
      const discount = await conversation.form.number();
      const response = await conversation.external(async () =>
        createPromoCode(text, discount, data.message.text)
      );
      return ctx.reply(response);
    },
    SETPROMO_CONVERSATION
  );
}
