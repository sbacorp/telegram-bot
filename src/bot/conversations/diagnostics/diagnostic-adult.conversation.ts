/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import {
  diagnosticListKeyboard,
  mainMenu,
  yesNo,
  next,
  canceldiagnostic,
} from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
// eslint-disable-next-line import/no-cycle
import {
  diagnosticDeficitConversationAdult,
  diagnosticInsulinConversationAdult,
  diagnosticThyroidConversationAdult,
  diagnosticZhktConversationAdult,
} from "./diagnostics-adult.js";

export const DIAGNOSTIC_CONVERSATION_ADULT = "diagnosticAdult";

export async function diagnosticConversationAdult(
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
      reply_markup: diagnosticListKeyboard,
    }
  );
  const response = await conversation.waitForCallbackQuery(
    ["zhkt", "deficit", "thyroid", "insulin"],
    {
      otherwise: async (ctx) =>
        await ctx.reply("Используйте кнопки", {
          reply_markup: diagnosticListKeyboard,
        }),
    }
  );
  if (response.match === "zhkt") {
    await diagnosticZhktConversationAdult(conversation, ctx);
  }
  if (response.match === "deficit") {
    await diagnosticDeficitConversationAdult(conversation, ctx);
  }
  if (response.match === "thyroid") {
    await diagnosticThyroidConversationAdult(conversation, ctx);
  }
  if (response.match === "insulin") {
    await diagnosticInsulinConversationAdult(conversation, ctx);
  }
  return ctx.reply("Вам так же будет полезно :", {
    reply_markup: new Keyboard()
      .text("👩‍⚕️ Записаться на консультацию")
      .row()
      .text("🏠 Главное меню")
      .row()
      .text("🎯 Хочу комплексно решить проблему")
      .resized()
      .oneTime(),
  });
}
