/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { diagnosticListKeyboard } from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
// eslint-disable-next-line import/no-cycle
import {
  diagnosticDeficitConversationChild,
  diagnosticInsulinConversationChild,
  diagnosticThyroidConversationChild,
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
    return diagnosticZhktConversationChild(conversation, ctx);
  }
  if (response.match === "deficit") {
    return diagnosticDeficitConversationChild(conversation, ctx);
  }
  if (response.match === "thyroid") {
    return diagnosticThyroidConversationChild(conversation, ctx);
  }
  if (response.match === "insulin") {
    return diagnosticInsulinConversationChild(conversation, ctx);
  }
}
