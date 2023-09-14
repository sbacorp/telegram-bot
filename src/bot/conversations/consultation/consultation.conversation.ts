/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {
  briefMaleConversation,
  questions as maleQuestions,
} from "./brief-male.conv.js";
import {
  briefFemaleConversation,
  questions as femaleQuestions,
} from "./brief-female.conv.js";
import {
  chooseDateConversation,
  IConsultationObject,
} from "./choose-date.conv.js";
import { BuyConsultationConversation } from "./buy-consult.conv.js";

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
export const CONSULTATION_CONVERSATION = "consultation";
export async function consultationConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let consultationObject: IConsultationObject = {
    day: conversation.session.consultation.dateString.split("-")[2] || "",
    dateString: conversation.session.consultation.dateString,
    time: conversation.session.consultation.time,
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    phoneNumber: conversation.session.phoneNumber,
    fio: conversation.session.fio,
    sex: conversation.session.sex,
    answers: conversation.session.consultation.answers,
    massanger: conversation.session.consultation.messanger,
  };
  let message = await ctx.reply("Запись на консультацию", {
    reply_markup: cancel,
  });

  if (conversation.session.consultationStep < 1) {
    message = await ctx.reply(
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
    conversation.session.consultationStep = 1;
  }
  if (conversation.session.consultationStep < 2) {
    consultationObject = await chooseDateConversation(
      conversation,
      ctx,
      consultationObject,
      message
    );
    conversation.session.consultationStep = 2;
  }
  if (conversation.session.consultationStep < 3) {
    ctx = await BuyConsultationConversation(
      conversation,
      ctx,
      message,
      consultationObject
    );
  }
  if (conversation.session.consultationStep < 4) {
    await ctx.editMessageText(`Первый этап консультации - вам необходимо ответить на перечень вопросов. Обязательно вдумчиво прочтите их и дайте корректный развернутый ответ.
От этого этапа будет зависеть список назначенных анализов.
Обязательно ответьте на вопросы в течение суток.`);
    await ctx.reply("Пожалуйста, укажите ваш пол", {
      reply_markup: new InlineKeyboard()
        .text("Мужской", "male")
        .text("Женский", "female"),
    });
    ctx = await conversation.wait();
    while (!ctx.update.callback_query?.data?.match(/^(male|female)$/)) {
      await ctx.answerCallbackQuery("Используйте кнопки");
      ctx = await conversation.wait();
    }
    if (ctx.update.callback_query?.data === "male") {
      conversation.session.sex = "male";
    }
    if (ctx.update.callback_query?.data === "female") {
      conversation.session.sex = "female";
    }
    await ctx.reply("Отлично, теперь перейдем к опроснику", {
      reply_markup: new Keyboard().text("🏠 Главное меню").resized(),
    });
    if (conversation.session.sex === "male") {
      consultationObject.answers = await briefMaleConversation(
        conversation,
        ctx
      );
    } else if (conversation.session.sex === "female") {
      consultationObject.answers = await briefFemaleConversation(
        conversation,
        ctx
      );
    }
  }
  if (conversation.session.consultationStep < 5) {
    await ctx.reply(
      `Благодарю вас за проделанную работу. В выбранную вами дату я свяжусь с вами.
 Подскажите, в какой социальной сети вам удобно продолжить общение?`,
      {
        reply_markup: new Keyboard()
          .text("Telegram")
          .row()
          .text("WhatsApp")
          .row()
          .oneTime(),
      }
    );
    const messanger = await conversation.waitFor("message:text");
    if (messanger.message.text === "Telegram") {
      consultationObject.massanger = "Telegram";
    }
    if (messanger.message.text === "WhatsApp") {
      consultationObject.massanger = "WhatsApp";
    }
    await ctx.reply("Напишите контакт для связи в этом мессенджере");
    ctx = await conversation.wait();
    if (ctx.message?.text)
      conversation.session.consultation.messanger = `${consultationObject.massanger} ${ctx.message.text}`;

    await ctx.reply("Пожалуйста подождите, идет запись на консультацию...");
    ctx.chatAction = "typing";
    let answerQuestions: string;
    if (conversation.session.sex === "male") {
      answerQuestions = consultationObject.answers
        .map((answer) => {
          return `Вопрос :${
            maleQuestions[consultationObject.answers.indexOf(answer)].text
          }
      Ответ: ${answer}
      `;
        })
        .join("\n");
    } else {
      answerQuestions = consultationObject.answers
        .map((answer) => {
          return `
        
Вопрос :${femaleQuestions[consultationObject.answers.indexOf(answer)].text}
Ответ: ${answer}
      `;
        })
        .join("\n");
    }
    await ctx.api.sendMessage(
      "1856156198",
      `
Новая запись на консультацию:
Имя: ${conversation.session.fio}
Телефон: ${conversation.session.phoneNumber}
Дата : ${conversation.session.consultation.dateString}
Время: ${conversation.session.consultation.time}
Пол: ${conversation.session.sex}
Предпочтительная соцсеть: ${consultationObject.massanger}
Тестирование :
${answerQuestions}`
    );
    ctx.chatAction = null;
  }
  return ctx.reply(
    `Запись на консультацию прошла успешно!
    Ожидайте моего сообщения ${new Date(
      consultationObject.year,
      consultationObject.month,
      Number(consultationObject.dateString.split("-")[2])
    ).toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} в ${consultationObject.time}`,
    {
      reply_markup: new Keyboard().text("🏠 Главное меню"),
    }
  );
}
