/* eslint-disable unicorn/no-null */
/* eslint-disable default-case */
/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable no-loop-func */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-await */
/* eslint-disable import/no-cycle */
import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import {
  ConsultationAppointmentModel,
  UserModel,
} from "#root/server/models.js";
import { IConsultationObject, IConsultationModel } from "#root/typing.js";
import { editUserAttribute } from "#root/server/utils.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import {
  briefMaleConversation,
  questions as maleQuestions,
} from "./brief-male.conv.js";
import {
  briefFemaleConversation,
  questions as femaleQuestions,
} from "./brief-female.conv.js";
import {
  briefChildConversation,
  questions as childQuestions,
} from "./brief-child.conv.js";
import { chooseDateConversation } from "./choose-date.conv.js";
import { BuyConsultationConversation } from "./buy-consult.conv.js";

export const yesNoKeyboard = new InlineKeyboard()
  .text("Ознакомиться", "no")
  .row()
  .text("Уже ознакомлен(а)", "yes");

const conditions = async (
  conversation: Conversation<Context>,
  ctx: Context
) => {
  let message = await ctx.reply(`
Формат консультации не предполагает переписку в режиме «мне срочно», переписки в любое время и в любом количестве. Разбор состояния ваших родных и близких, без оплаты консультации для них.

Если вы не готовы оплатить в среднем анализы на 10-15 тысяч рублей, купить добавок в среднем на 25-30 тысяч рублей, а также принимать в день большое количество добавок, иногда их число достигает 15 штук в день, в зависимости от вашего состояния, то не отнимайте мое время и не тратьте ваши деньги.
  `);
  await conversation.sleep(1000);
  await ctx.reply(
    `
Если вы по каким-то причинам досдаете, пересдаете анализы и досылаете их после получения схемы, то они не будут разбираться, т.к. это предполагает полное погружение заново и будет рассматриваться как новая консультация.

Если вы получили схему сейчас, а смогли приобрести все добавки через пару месяцев, это уже не актуально, т.к. процессы в организме не стоят на месте и всё быстро меняется.
      `
  );
  await conversation.sleep(1000);
  message = await ctx.reply(
    `
Консультация для взрослых - 10.000₽
Консультация для детей - 5.000₽
`,
    {
      reply_markup: yesNoKeyboard,
    }
  );
  return message;
};

export const CONSULTATION_CONVERSATION = "consultation";
export async function consultationConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const chatId = ctx.chat!.id.toString();
  const user = await conversation
    .external(() =>
      UserModel.findOne({
        where: {
          chatId,
        },
      })
    )
    .then((u) => u?.dataValues);

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
        message = await conditions(conversation, ctx);
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
    await ctx.reply("Пожалуйста, укажите для кого консультация.", {
      reply_markup: new InlineKeyboard()
        .text("Мужчины", "male")
        .text("Женщины", "female")
        .text("Ребенка", "child"),
    });
    ctx = await conversation.wait();
    while (!ctx.update.callback_query?.data?.match(/^(male|female|child)$/)) {
      await ctx.answerCallbackQuery("Используйте кнопки");
      ctx = await conversation.wait();
    }
    switch (ctx.update.callback_query?.data) {
      case "male": {
        conversation.session.sex = "male";
        await conversation.external(
          async () => await editUserAttribute(chatId, "sex", "male")
        );
        break;
      }
      case "female": {
        conversation.session.sex = "female";
        await conversation.external(
          async () => await editUserAttribute(chatId, "sex", "female")
        );
        break;
      }
      case "child": {
        conversation.session.sex = "child";
        await conversation.external(
          async () => await editUserAttribute(chatId, "sex", "child")
        );
        break;
      }
    }
    conversation.session.consultationStep = 2;
  }

  if (conversation.session.consultationStep < 3) {
    consultationObject = await chooseDateConversation(
      conversation,
      ctx,
      consultationObject,
      message
    );
    conversation.session.consultationStep = 3;
  }
  if (
    conversation.session.consultationStep < 4 &&
    user!.consultationPaidStatus !== true
  ) {
    ctx = (await BuyConsultationConversation(
      conversation,
      ctx,
      message,
      consultationObject
    )) as Context;
  }
  if (conversation.session.sex === "") {
    conversation.session.consultationStep = 1;
    await ctx.reply("Вы не выбрали пол");
    return ctx.conversation.reenter("consultation");
  }
  if (
    conversation.session.consultationStep < 5 &&
    ((conversation.session.sex === "male" &&
      conversation.session.consultation.questionsAnswered !==
        maleQuestions.length) ||
      (conversation.session.sex === "female" &&
        conversation.session.consultation.questionsAnswered !==
          femaleQuestions.length) ||
      (conversation.session.sex === "child" &&
        conversation.session.consultation.questionsAnswered !==
          childQuestions.length))
  ) {
    await ctx.reply(`Первый этап консультации - вам необходимо ответить на перечень вопросов. Обязательно вдумчиво прочтите их и дайте корректный развернутый ответ.
От этого этапа будет зависеть список назначенных анализов.
Обязательно ответьте на вопросы до 00:00 текущего дня.
В противном вам придется выбрать другую дату`);
    const buyDate = await conversation
      .external(
        async () =>
          await UserModel.findOne({
            where: {
              chatId,
            },
          })
      )
      .then((u) => u?.dataValues?.buyDate);
    console.log(buyDate);

    if (buyDate !== new Date().getDate() + new Date().getMonth().toString()) {
      await ctx.reply("Вы не успели выполнить тестирование", {
        reply_markup: new Keyboard()
          .text("Перейти к выбору даты")
          .row()
          .text("🏠 Главное меню")
          .resized(),
      });
      ctx = await conversation.wait();
      if (ctx.message?.text === "Перейти к выбору даты") {
        conversation.session.consultationStep = 2;
        return ctx.conversation.enter("consultation");
      }
    }
    switch (conversation.session.sex) {
      case "male": {
        await briefMaleConversation(conversation, ctx);
        break;
      }
      case "female": {
        await briefFemaleConversation(conversation, ctx);

        break;
      }
      case "child": {
        await briefChildConversation(conversation, ctx);

        break;
      }
      default: {
        await ctx.reply(
          "Произошла непредвиденная ошибка, пожалуйста заполните форму записи заново!"
        );
        break;
      }
      // No default
    }
    conversation.session.consultationStep = 5;
  }
  if (conversation.session.consultationStep < 6) {
    await ctx.reply(
      `Благодарю вас за проделанную работу. В выбранную вами дату я свяжусь с вами.
 Подскажите, в какой социальной сети вам удобно продолжить общение?`,
      {
        reply_markup: new InlineKeyboard()
          .text("Telegram", "Telegram")
          .row()
          .text("WhatsApp", "WhatsApp")
          .row(),
      }
    );
    ctx = await conversation.waitFor("callback_query:data");
    if (ctx.update.callback_query?.data === "Telegram") {
      consultationObject.massanger = "Telegram";
    }
    if (ctx.update.callback_query?.data === "WhatsApp") {
      consultationObject.massanger = "WhatsApp";
    }
    await ctx.reply("Напишите контакт для связи в этом мессенджере");
    const messanger = await conversation.form.text();
    conversation.session.consultation.messanger = `${consultationObject.massanger} ${messanger}`;
    await ctx.reply("Пожалуйста подождите, идет запись на консультацию...");
    ctx.chatAction = "typing";
    let answerQuestions: string;
    if (conversation.session.sex === "male") {
      answerQuestions = conversation.session.consultation.answers
        .map((answer) => {
          return `Вопрос :${
            maleQuestions[
              conversation.session.consultation.answers.indexOf(answer)
            ].text
          }
      Ответ: ${answer}
      `;
        })
        .join("\n");
    } else if (conversation.session.sex === "female") {
      answerQuestions = conversation.session.consultation.answers
        .map((answer) => {
          return `
        
Вопрос :${
            femaleQuestions[
              conversation.session.consultation.answers.indexOf(answer)
            ].text
          }
Ответ: ${answer}
      `;
        })
        .join("\n");
    } else {
      answerQuestions = conversation.session.consultation.answers
        .map((answer) => {
          return `
        
Вопрос :${
            childQuestions[
              conversation.session.consultation.answers.indexOf(answer)
            ].text
          }
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
    await ConsultationAppointmentModel.create({
      chatId,
      date: conversation.session.consultation.dateString,
      time: conversation.session.consultation.time,
    });
    conversation.session.consultationStep = 6;
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
      reply_markup: new Keyboard().text("🏠 Главное меню").resized(),
    }
  );
}
