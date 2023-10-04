import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { deleteLinkFromDB } from "#root/server/utils.js";
import { InlineKeyboard, Keyboard } from "grammy";
import { BotSiteLinkModel, NutrLinkModel } from "#root/server/models.js";
import { chunk } from "#root/bot/helpers/keyboard.js";

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
      const links = await (linkType.update.callback_query.data === "botSite"
        ? conversation.external(() => BotSiteLinkModel.findAll())
        : conversation.external(() => NutrLinkModel.findAll()));

      await ctx.reply("<b>Выберите ссылку</b>", {
        reply_markup: Keyboard.from(
          chunk(
            [...links.map((link) => link.dataValues.linkTitle), "Отмена"],
            1
          )
        ).resized(),
      });

      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      if (text === "Отмена") {
        return ctx.conversation.exit();
      }
      await ctx.reply("Удаляю...");
      const response = await conversation.external(async () =>
        deleteLinkFromDB(text, linkType.update.callback_query.data)
      );
      return ctx.reply(response);
    },
    DELETE_LINK_CONVERSATION
  );
}
