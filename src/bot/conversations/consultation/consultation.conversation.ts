/* eslint-disable prefer-const */
/* eslint-disable no-loop-func */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-await */
/* eslint-disable no-shadow */
/* eslint-disable import/no-cycle */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { ConsultationModel, IConsultationModel } from "#root/server/models.js";
import { updateUserPhone } from "#root/server/utils.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { createDatePicker } from "./calendar.js";

export const yesNoKeyboard = new InlineKeyboard()
  .text("Ознакомиться", "no")
  .text("Уже ознакомлен(а)", "yes");

const conditions = async (ctx: Context) => {
  await ctx.reply(`
Формат консультации не предполагает переписку в режиме «мне срочно», переписки в любое время и в любом количестве. Разбор состояния ваших родных и близких, без оплаты консультации для них.

Если вы не готовы оплатить в среднем анализы на 10-15 тысяч рублей, купить добавок в среднем на 25-30 тысяч рублей, а также принимать в день большое количество добавок, иногда их число достигает 15 штук в день, в зависимости от вашего состояния, то не отнимайте мое время и не тратьте ваши деньги.
  `);
  setTimeout(async () => {
    await ctx.reply(
      `
Если вы по каким-то причинам досдаете, пересдаете анализы и досылаете их после получения схемы, то они не будут разбираться, т.к. это предполагает полное погружение заново и будет рассматриваться как новая консультация.

Если вы получили схему сейчас, а смогли приобрести все добавки через пару месяцев, это уже не актуально, т.к. процессы в организме не стоят на месте и всё быстро меняется.
      `
    );
  }, 2000);
  setTimeout(async () => {
    await ctx.reply(
      `
Консультация для взрослых - 10.000₽

Консультация для детей - 5.000₽
`
    );
  }, 3000);
};

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

export const CONSULTATION_CONVERSATION = "consultation";
export async function consultationConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let day: string;
  let date: Date;
  let dateString: string;
  let time: string;
  let consultationTimeKeyboard: InlineKeyboard;
  let year: number = new Date().getFullYear();
  let month: number = new Date().getMonth();
  let calendar: InlineKeyboard;
  let phoneNumber: string;
  let fio: string;
  await ctx.reply("Запись на консультацию", { reply_markup: cancel });
  const message = await ctx.reply(
    "Перед тем, как записаться ко мне на консультацию, необходимо ознакомиться с условиями",
    {
      reply_markup: yesNoKeyboard,
    }
  );
  do {
    ctx = await conversation.wait();
    if (ctx.update.callback_query?.data === "no") {
      await conditions(ctx);
      ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
        reply_markup: yesNoKeyboard,
      });
      continue;
    }
  } while (!(ctx.update.callback_query?.data === "yes"));
  await ctx.editMessageText(
    `Нажимая кнопку «записаться на консультацию» вы соглашаетесь с условиями.`
  );
  await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
    reply_markup: new InlineKeyboard().text("Начать запись", "start"),
  });
  do {
    ctx = await conversation.wait();
    if (!(ctx.update.callback_query?.data === "start")) {
      await ctx.answerCallbackQuery("Используйте кнопку 'Начать запись'");
      continue;
    }
  } while (!(ctx.update.callback_query?.data === "start"));
  calendar = await conversation.external(
    async () => await createDatePicker(year, month)
  );
  await ctx.editMessageText(`Выберите свободную дату  *московское время`);
  await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
    reply_markup: calendar,
  });

  do {
    ctx = await conversation.wait();
    if (ctx.update.callback_query?.data === "nextMonth") {
      month += 1;
      if (month === 12) {
        month = 0;
        year += 1;
      }
      calendar = await conversation.external(
        async () => await createDatePicker(year, month)
      );
      await ctx.api.editMessageReplyMarkup(
        message.chat.id,
        message.message_id,
        {
          reply_markup: calendar,
        }
      );
    }
    if (ctx.update.callback_query?.data === "prevMonth") {
      if (month === 0) {
        month = 12;
        year -= 1;
      }
      if (
        month === new Date().getMonth() &&
        year === new Date().getFullYear()
      ) {
        await ctx.answerCallbackQuery("Нельзя выбрать прошедшую дату");
        continue;
      } else {
        month -= 1;
      }
      calendar = await conversation.external(
        async () => await createDatePicker(year, month)
      );
      await ctx.api.editMessageReplyMarkup(
        message.chat.id,
        message.message_id,
        {
          reply_markup: calendar,
        }
      );
    }
  } while (!ctx.update.callback_query?.data?.match(/^\d+$/));
  day = ctx.update.callback_query?.data;
  date = new Date(year, month, Number(day));
  dateString = `${year}${month < 9 ? "0" : ""}${month + 1}${
    Number(day) < 10 ? "0" : ""
  }${day}`;
  consultationTimeKeyboard = await conversation.external(
    async () => await createConsultationTimeKeyboard(dateString)
  );
  await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
    reply_markup: consultationTimeKeyboard,
  });
  ctx = await conversation.wait();
  while (!ctx.update.callback_query?.data?.match(/^\d+:\d+$/)) {
    if (ctx.update.callback_query?.data === "back") {
      year = new Date().getFullYear();
      month = new Date().getMonth();
      calendar = await conversation.external(
        async () => await createDatePicker(year, month)
      );
      await ctx.editMessageText(`Выберите свободную дату  *московское время`);
      await ctx.api.editMessageReplyMarkup(
        message.chat.id,
        message.message_id,
        {
          reply_markup: calendar,
        }
      );
      do {
        ctx = await conversation.wait();
        if (ctx.update.callback_query?.data === "nextMonth") {
          month += 1;
          if (month === 12) {
            month = 0;
            year += 1;
          }
          calendar = await conversation.external(
            async () => await createDatePicker(year, month)
          );
          await ctx.api.editMessageReplyMarkup(
            message.chat.id,
            message.message_id,
            {
              reply_markup: calendar,
            }
          );
        }
        if (ctx.update.callback_query?.data === "prevMonth") {
          if (month === 0) {
            month = 12;
            year -= 1;
          }
          if (
            month === new Date().getMonth() &&
            year === new Date().getFullYear()
          ) {
            await ctx.answerCallbackQuery("Нельзя выбрать прошедшую дату");
            continue;
          } else {
            month -= 1;
          }
          calendar = await conversation.external(
            async () => await createDatePicker(year, month)
          );
          await ctx.api.editMessageReplyMarkup(
            message.chat.id,
            message.message_id,
            {
              reply_markup: calendar,
            }
          );
        }
      } while (!ctx.update.callback_query?.data?.match(/^\d+$/));
      continue;
    }
    day = ctx.update.callback_query?.data as string;
    date = new Date(year, month, Number(day));
    dateString = `${year}${month < 9 ? "0" : ""}${month + 1}${
      Number(day) < 10 ? "0" : ""
    }${day}`;
    consultationTimeKeyboard = await conversation.external(
      async () => await createConsultationTimeKeyboard(dateString)
    );
    await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
      reply_markup: consultationTimeKeyboard,
    });
    ctx = await conversation.wait();
  }
  time = ctx.update.callback_query?.data;

  await ctx.reply(
    `Выбранная дата: ${date.toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })}
    Время: ${time}
    `
  );
  await ctx.reply("Введите ФИО");
  fio = await conversation.form.text();
  await ctx.reply("Поделитесь контактом по кнопке ниже, чтобы продолжить ⬇️", {
    reply_markup: new Keyboard().requestContact("Отправить контакт").resized(),
  });
  const contact = await conversation.waitFor(":contact");
  await conversation.external(async () => {
    await updateUserPhone(ctx.chat!.id, contact.message!.contact.phone_number);
  });
  phoneNumber = contact.message!.contact.phone_number;
  await ctx.reply(
    `Место забронировано на 15 минут. В течение этого времени необходимо оплатить выставленный счет, иначе бронь будет снята.`
  );
  await ctx.reply(
    `<b>Можете приступать к оплате.</b>
В течение 10 минут с момента оплаты вы получите ссылку на бриф - опросник по состоянию здоровья прямо в этот чат.`,
    {
      reply_markup: new InlineKeyboard().text("Оплатить", "pay"),
    }
  );
  await conversation.waitFor("callback_query:data");
  await ctx.reply("Оплата прошла успешно");
  await ctx.reply(
    `Первый этап консультации - вам необходимо ответить на перечень вопросов. Обязательно вдумчиво прочтите их и дайте корректный развернутый ответ. От этого этапа будет зависеть список назначенных анализов.

Обязательно ответьте на вопросы в течение суток.`,
    {
      reply_markup: new InlineKeyboard().webApp(
        "Перейти к брифу",
        "https://docs.google.com/forms/d/e/1FAIpQLSdqhT84cJVApcgyDLLC-kLfRr4shGS7_S_OwsR7OTqH5C5MSg/viewform?usp=sf_link"
      ),
    }
  );
}
