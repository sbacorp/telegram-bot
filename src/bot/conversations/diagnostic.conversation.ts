/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import {
  diagnosticListKeyboard,
  mainMenu,
  yesNo,
  next,
  canceldiagnostic,
} from "../keyboards/index.js";
import { cancel } from "../keyboards/cancel.keyboard.js";
// eslint-disable-next-line import/no-cycle
import {
  diagnosticDeficitConversation,
  diagnosticInsulinConversation,
  diagnosticThyroidConversation,
  diagnosticZhktConversation,
} from "./diagnostics.js";

export const DIAGNOSTIC_CONVERSATION = "diagnostic";
export async function diagnosticConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  await ctx.reply(
    "<b>Ответьте на вопросы и узнайте, какие области здоровья нуждаются в вашем внимании!</b>",
    { reply_markup: cancel }
  );
  await ctx.reply(
    `<b>Какую из сфер здоровья будем проверять?
При необходимости вы сможете вернуться к этому вопросу и выбрать другую сферу</b>`,
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
    return diagnosticZhktConversation(conversation, ctx);
  }
  if (response.match === "deficit") {
    return diagnosticDeficitConversation(conversation, ctx);
  }
  if (response.match === "thyroid") {
    return diagnosticThyroidConversation(conversation, ctx);
  }
  if (response.match === "insulin") {
    return diagnosticInsulinConversation(conversation, ctx);
  }
}
