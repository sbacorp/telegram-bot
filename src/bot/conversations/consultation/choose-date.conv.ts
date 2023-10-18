/* eslint-disable unicorn/no-array-for-each */
/* eslint-disable no-continue */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { ConsultationModel } from "#root/server/models.js";
import { updateUserPhone } from "#root/server/utils.js";
import { IConsultationObject } from "#root/typing.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { createDatePicker } from "./calendar.js";

export async function chooseDateConversation(
  conversation: Conversation<Context>,
  ctx: Context,
  consultationObject: IConsultationObject,
  message: any
) {
  consultationObject.calendar = await conversation.external(() =>
    createDatePicker(consultationObject.year, consultationObject.month)
  );
  message = await ctx.reply(`🕑 Выберите свободное дату  *московское время`, {
    reply_markup: consultationObject.calendar,
  });
  do {
    ctx = await conversation.wait();
    if (ctx.update.callback_query?.data === "back") {
      return "back";
    }
    if (ctx.update.callback_query?.data === "nextMonth") {
      consultationObject.month += 1;
      if (consultationObject.month === 12) {
        consultationObject.month = 0;
        consultationObject.year += 1;
      }
      consultationObject.calendar = await conversation.external(
        async () =>
          await createDatePicker(
            consultationObject.year,
            consultationObject.month
          )
      );
      await ctx.api.editMessageReplyMarkup(
        message.chat.id,
        message.message_id,
        {
          reply_markup: consultationObject.calendar,
        }
      );
    }
    if (ctx.update.callback_query?.data === "prevMonth") {
      if (consultationObject.month === 0) {
        consultationObject.month = 12;
        consultationObject.year -= 1;
      }
      if (
        consultationObject.month === new Date().getMonth() &&
        consultationObject.year === new Date().getFullYear()
      ) {
        await ctx.answerCallbackQuery("Нельзя выбрать прошедшую дату");
        continue;
      } else {
        consultationObject.month -= 1;
      }
      consultationObject.calendar = await conversation.external(
        async () =>
          await createDatePicker(
            consultationObject.year,
            consultationObject.month
          )
      );
      await ctx.api.editMessageReplyMarkup(
        message.chat.id,
        message.message_id,
        {
          reply_markup: consultationObject.calendar,
        }
      );
    }
  } while (!ctx.update.callback_query?.data?.match(/^\d+$/));
  consultationObject.day = ctx.update.callback_query?.data;
  consultationObject.date = new Date(
    consultationObject.year,
    consultationObject.month,
    Number(consultationObject.day)
  );
  consultationObject.dateString = `${consultationObject.year}${
    consultationObject.month < 9 ? "0" : ""
  }${consultationObject.month + 1}${
    Number(consultationObject.day) < 10 ? "0" : ""
  }${consultationObject.day}`;

  conversation.session.consultation.dateString = consultationObject.dateString;
  await ctx.reply(`Выбранная дата: ${consultationObject.date.toLocaleDateString(
    "ru-RU",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}
`);
  return consultationObject;
}
