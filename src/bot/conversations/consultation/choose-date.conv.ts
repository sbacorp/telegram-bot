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

const createConsultationTimeKeyboard = async (date: string) => {
  const consultation = await ConsultationModel.findOne({
    where: {
      date,
    },
  });
  const keyboard = new InlineKeyboard();
  if (consultation) {
    if (consultation.time10) {
      keyboard.text("10:00", "10:00");
      keyboard.row();
    }
    if (consultation.time11) {
      keyboard.text("11:00", "11:00");
      keyboard.row();
    }
    if (consultation.time12) {
      keyboard.text("12:00", "12:00");
      keyboard.row();
    }
    if (consultation.time13) {
      keyboard.text("13:00", "13:00");
      keyboard.row();
    }
    if (consultation.time14) {
      keyboard.text("14:00", "14:00");
      keyboard.row();
    }
    if (consultation.time15) {
      keyboard.text("15:00", "15:00");
      keyboard.row();
    }
    if (consultation.time16) {
      keyboard.text("16:00", "16:00");
      keyboard.row();
    }
    if (consultation.time17) {
      keyboard.text("17:00", "17:00");
      keyboard.row();
    }
    if (consultation.time18) {
      keyboard.text("18:00", "18:00");
      keyboard.row();
    }
    if (consultation.time19) {
      keyboard.text("19:00", "19:00");
      keyboard.row();
    }
    if (consultation.time20) {
      keyboard.text("20:00", "20:00");
      keyboard.row();
    }
    keyboard.text("⬅️Выбрать дату", "back");
  } else {
    return new InlineKeyboard().text("Нет свободного времени");
    keyboard.row().text("⬅️Выбрать дату", "back");
  }
  return keyboard;
};
export async function chooseDateConversation(
  conversation: Conversation<Context>,
  ctx: Context,
  consultationObject: IConsultationObject,
  message: any
) {
  consultationObject.calendar = await conversation.external(
    async () =>
      await createDatePicker(consultationObject.year, consultationObject.month)
  );
  message = await ctx.reply(`Выберите свободное время  *московское время`, {
    reply_markup: consultationObject.calendar,
  });
  do {
    ctx = await conversation.wait();
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
  consultationObject.consultationTimeKeyboard = await conversation.external(
    async () =>
      await createConsultationTimeKeyboard(consultationObject.dateString)
  );
  await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
    reply_markup: consultationObject.consultationTimeKeyboard,
  });
  ctx = await conversation.wait();
  while (!ctx.update.callback_query?.data?.match(/^\d+:\d+$/)) {
    if (ctx.update.callback_query?.data === "back") {
      consultationObject.year = new Date().getFullYear();
      consultationObject.month = new Date().getMonth();
      consultationObject.calendar = await conversation.external(
        async () =>
          await createDatePicker(
            consultationObject.year,
            consultationObject.month
          )
      );
      await ctx.editMessageText(`Выберите свободную дату  *московское время`);
      await ctx.api.editMessageReplyMarkup(
        message.chat.id,
        message.message_id,
        {
          reply_markup: consultationObject.calendar,
        }
      );
      do {
        ctx = await conversation.wait();
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
      continue;
    }
    consultationObject.day = ctx.update.callback_query?.data as string;
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
    consultationObject.consultationTimeKeyboard = await conversation.external(
      async () =>
        await createConsultationTimeKeyboard(consultationObject.dateString)
    );
    await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
      reply_markup: consultationObject.consultationTimeKeyboard,
    });
    ctx = await conversation.wait();
  }
  consultationObject.time = ctx.update.callback_query?.data;
  conversation.session.consultation.time = consultationObject.time;
  conversation.session.consultation.dateString = `${consultationObject.dateString.slice(
    0,
    4
  )}-${consultationObject.dateString.slice(
    4,
    6
  )}-${consultationObject.dateString.slice(6)}`;
  await ctx.reply(`Выбранная дата: ${consultationObject.date.toLocaleDateString(
    "ru-RU",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  )}
Время: ${consultationObject.time}`);
  return consultationObject;
}
