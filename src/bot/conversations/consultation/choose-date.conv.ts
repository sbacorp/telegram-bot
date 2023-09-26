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

const createConsultationTimeKeyboard = async (date: string) => {
  const consultation = await ConsultationModel.findOne({
    where: {
      date,
    },
  });
  const keyboard = new InlineKeyboard();

  const times = [
    { time: "10:00", value: "time10" },
    { time: "11:00", value: "time11" },
    { time: "12:00", value: "time12" },
    { time: "13:00", value: "time13" },
    { time: "14:00", value: "time14" },
    { time: "15:00", value: "time15" },
    { time: "16:00", value: "time16" },
    { time: "17:00", value: "time17" },
    { time: "18:00", value: "time18" },
    { time: "19:00", value: "time19" },
    { time: "20:00", value: "time20" },
  ];

  let hasAvailableTime = false;

  times.forEach(({ time, value }) => {
    if (consultation && consultation[value as keyof typeof consultation]) {
      keyboard.text(time, time).row();
      hasAvailableTime = true;
    }
  });

  if (!hasAvailableTime) {
    return new InlineKeyboard()
      .text("Нет свободного времени")
      .row()
      .text("📅 выбрать дату", "back");
  }

  keyboard.text("📅 выбрать дату", "back");

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
  message = await ctx.reply(`🕑 Выберите свободное время  *московское время`, {
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
Время: ${consultationObject.time}`);
  return consultationObject;
}
