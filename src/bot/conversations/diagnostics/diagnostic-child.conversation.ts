/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { diagnosticListChildKeyboard } from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
// eslint-disable-next-line import/no-cycle
import {
  diagnosticAmmiakConversationChild,
  diagnosticDeficitConversationChild,
  diagnosticInsulinConversationChild,
  diagnosticZhktConversationChild,
} from "./diagnostics-child.js";

export const DIAGNOSTIC_CONVERSATION_CHILD = "diagnosticChild";

export async function diagnosticConversationChild(
  conversation: Conversation<Context>,
  ctx: Context
) {
  await ctx.reply(
    "Ответьте на вопросы и узнайте, какие области здоровья нуждаются в вашем внимании!",
    { reply_markup: cancel }
  );
  await ctx.reply(
    `Какую из сфер здоровья будем проверять?
При необходимости вы сможете вернуться к этому вопросу и выбрать другую сферу`,
    {
      reply_markup: diagnosticListChildKeyboard,
    }
  );
  const response = await conversation.waitForCallbackQuery(
    ["zhkt", "deficit", "insulin", "ammiak"],
    {
      otherwise: async (ctx) =>
        await ctx.reply("Используйте кнопки", {
          reply_markup: diagnosticListChildKeyboard,
        }),
    }
  );
  if (response.match === "zhkt") {
    await diagnosticZhktConversationChild(conversation, ctx);
  }
  if (response.match === "deficit") {
    await diagnosticDeficitConversationChild(conversation, ctx);
  }
  if (response.match === "insulin") {
    await diagnosticInsulinConversationChild(conversation, ctx);
  }
  if (response.match === "ammiak") {
    await diagnosticAmmiakConversationChild(conversation, ctx);
  }
  return ctx.reply("Вам так же будет полезно :", {
    reply_markup: new Keyboard()
      .text("👩‍⚕️ Записаться на консультацию")
      .row()
      .text("🏠 Главное меню")
      .row()
      .text("Хочу комплексно решить проблему")
      .resized()
      .oneTime(),
  });
}
