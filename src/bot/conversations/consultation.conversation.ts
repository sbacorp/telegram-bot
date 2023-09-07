/* eslint-disable no-return-await */
/* eslint-disable no-shadow */
/* eslint-disable import/no-cycle */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { cancel } from "../keyboards/cancel.keyboard.js";
import { DIAGNOSTIC_CONVERSATION_ADULT } from "./diagnostics/diagnostic-adult.conversation.js";
import { DIAGNOSTIC_CONVERSATION_CHILD } from "./diagnostics/diagnostic-child.conversation.js";

export const yesNoKeyboard = new InlineKeyboard()
  .text("Да", "yes")
  .text("Нет", "no");

export const CONSULTATION_CONVERSATION = "consultation";
export function consultationConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("Консультация", { reply_markup: cancel });

      await ctx.reply(
        "Что входит в ĸонсультацию, решение проблем И таĸ далее, прошли ли вы диагностиĸу?",
        {
          reply_markup: yesNoKeyboard,
        }
      );
      const response = await conversation.waitForCallbackQuery(["yes", "no"], {
        otherwise: async (ctx) =>
          await ctx.reply("Используйте кнопки", {
            reply_markup: yesNoKeyboard,
          }),
      });
      if (response.match === "yes") {
        ctx.reply("Консультация");
      } else if (response.match === "no") {
        await ctx.reply("Для кого диагностика?", {
          reply_markup: new InlineKeyboard()
            .text("Взрослый", "adult")
            .text("Ребенок", "child"),
        });
        const response = await conversation.waitForCallbackQuery([
          "adult",
          "child",
        ]);
        if (response.match === "adult") {
          return response.conversation.enter(DIAGNOSTIC_CONVERSATION_ADULT);
          // eslint-disable-next-line no-else-return
        }
        if (response.match === "child") {
          return response.conversation.enter("diagnosticChild");
        }
      }
    },
    CONSULTATION_CONVERSATION
  );
}
