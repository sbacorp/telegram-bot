/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type } from "node:os";
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { adultChildKeyboard, mainMenu } from "../keyboards/index.js";
import { cancel } from "../keyboards/cancel.keyboard.js";

export const DIAGNOSTIC_CONVERSATION = "diagnostic";
export const DIAGNOSTIC_ADULT_CONVERSATION = "diagnosticForAdult";
export function diagnosticForAdultConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Вы выбрали диагностику для себя!</b>", {
        reply_markup: cancel,
      });
      let count = 0;
      let flag = true;
      while (flag) {
        await ctx.reply("Введите ваш возраст: ");
        ctx = await conversation.wait();
        count = await Number(ctx.message?.text);
        if (count > 18 && count < 100 && typeof count === "number") {
          flag = false;
        }
      }
      await ctx.reply(count.toString());
      await ctx.reply("<b>Второй вопрос</b>");
    },
    DIAGNOSTIC_ADULT_CONVERSATION,
  );
}

export const DIAGNOSTIC_CHILD_CONVERSATION = "diagnosticForChild";
export function diagnosticForChildConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Вы выбрали диагностику для ребенка!</b>", {
        reply_markup: cancel,
      });
      let count = 0;
      let flag = true;
      while (flag) {
        if (count > 18 && count < 100 && typeof count === "number") {
          flag = false;
        }
        await ctx.reply("Введите возраст ребенка: ");
        ctx = await conversation.wait();
        count = Number(ctx.message?.text);
      }
      await ctx.reply(count.toString());
      await ctx.reply("<b>Второй вопрос</b>");
    },
    DIAGNOSTIC_CHILD_CONVERSATION,
  );
}

export function diagnosticConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("Диагностика", { reply_markup: cancel });
      await ctx.reply("<b>Для кого диагностика?</b>", {
        reply_markup: adultChildKeyboard,
      });
      const response = await conversation.waitForCallbackQuery(
        ["adult", "child"],
        {
          otherwise: async (ctx) =>
            await ctx.reply("Используйте кнопки", {
              reply_markup: adultChildKeyboard,
            }),
        },
      );
      if (response.match === "adult") {
        return response.conversation.enter(DIAGNOSTIC_ADULT_CONVERSATION);
      }
      if (response.match === "child") {
        return response.conversation.enter(DIAGNOSTIC_CHILD_CONVERSATION);
      }
    },
    DIAGNOSTIC_CONVERSATION,
  );
}
