import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { deletePromoCodeFromDB } from "#root/server/utils.js";
import { Keyboard } from "grammy";
import { chunk } from "#root/bot/helpers/keyboard.js";
import { PromocodeModel } from "#root/server/models.js";

export const DELETE_PROMO_CONVERSATION = "deletePromoConversation";
export function deletePromoConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      const promocodes = await conversation.external(() =>
        PromocodeModel.findAll()
      );
      await ctx.reply("<b>Выберите ссылку для удаления</b>", {
        reply_markup: Keyboard.from(
          chunk(
            [
              ...promocodes.map((promocode) => promocode.dataValues.promoTitle),
              "Отмена",
            ],
            1
          )
        ).resized(),
      });
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
