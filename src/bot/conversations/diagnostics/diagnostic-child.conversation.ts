/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { diagnosticListChildKeyboard } from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
// eslint-disable-next-line import/no-cycle
import {
  diagnosticAmmiakConversationChild,
  diagnosticDeficitConversationChild,
  diagnosticInsulinConversationChild,
  diagnosticParazitConversationChild,
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
    ["zhkt", "deficit", "parazit", "insulin", "ammiak"],
    {
      otherwise: async (ctx) =>
        await ctx.reply("Используйте кнопки", {
          reply_markup: diagnosticListChildKeyboard,
        }),
    }
  );
  if (response.match === "zhkt") {
    return diagnosticZhktConversationChild(conversation, ctx);
  }
  if (response.match === "deficit") {
    return diagnosticDeficitConversationChild(conversation, ctx);
  }
  if (response.match === "insulin") {
    return diagnosticInsulinConversationChild(conversation, ctx);
  }
  if (response.match === "ammiak") {
    return diagnosticAmmiakConversationChild(conversation, ctx);
  }
  if (response.match === "parazit") {
    return diagnosticParazitConversationChild(conversation, ctx);
  }
}
