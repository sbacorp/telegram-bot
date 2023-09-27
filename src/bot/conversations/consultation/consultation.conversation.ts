/* eslint-disable no-shadow */
/* eslint-disable prefer-destructuring */
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
import { InlineKeyboard, InputFile, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { ConsultationAppointmentModel } from "#root/server/models.js";
import { IConsultationObject, IConsultationModel } from "#root/typing.js";
import { editUserAttribute, fetchUser } from "#root/server/utils.js";
import fs from "node:fs";
import { autoChatAction } from "@grammyjs/auto-chat-action";
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
import {
  BuyConsultationConversation,
  enableConsultationByDateTime,
} from "./buy-consult.conv.js";

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
  await conversation.run(autoChatAction());
  let user = await conversation.external(async () => await fetchUser(chatId));
  let consultationObject: IConsultationObject = {
    day: conversation.session.consultation.dateString.slice(6, 8) || "",
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
    const response = await chooseDateConversation(
      conversation,
      ctx,
      consultationObject,
      message
    );
    if (response === "back") {
      conversation.session.consultationStep = 1;
      return consultationConversation(conversation, ctx);
    }
    consultationObject = response;
    conversation.session.consultationStep = 3;
  }
  if (
    conversation.session.consultationStep < 4 &&
    user!.dataValues.consultationPaidStatus !== true
  ) {
    const paymentResult = await BuyConsultationConversation(
      conversation,
      ctx,
      message,
      consultationObject
    );
    if (paymentResult === "change date") {
      return consultationConversation(conversation, ctx);
    }
    if (paymentResult === "fail") {
      return consultationConversation(conversation, ctx);
    }
    if (paymentResult === "home") {
      return;
    }
  }
  if (conversation.session.sex === "") {
    conversation.session.consultationStep = 1;
    await ctx.reply("Вы не выбрали пол");
    return consultationConversation(conversation, ctx);
  }
  if (
    conversation.session.consultationStep < 5 &&
    ((conversation.session.sex === "male" &&
      conversation.session.consultation.answers.length !==
        maleQuestions.length) ||
      (conversation.session.sex === "female" &&
        conversation.session.consultation.answers.length !==
          femaleQuestions.length) ||
      (conversation.session.sex === "child" &&
        conversation.session.consultation.answers.length !==
          childQuestions.length))
  ) {
    if (conversation.session.consultation.answers.length === 0) {
      await ctx.reply(`
1️⃣ Первый этап консультации - вам необходимо ответить на перечень вопросов.
Обязательно вдумчиво прочтите их и дайте корректный развернутый ответ.
От этого этапа будет зависеть список назначенных анализов.
Обязательно ответьте на вопросы до 00:00 текущего дня.
В противном вам придется выбрать другую дату`);
    } else {
      await ctx.reply("Продолжаем тестирование");
    }
    const user1 = await conversation.external(
      async () => await fetchUser(chatId)
    );
    const buyDate = user1?.dataValues.buyDate;
    const consultationDate = user1?.dataValues.consultationDate;
    if (buyDate !== new Date().getDate() + new Date().getMonth().toString()) {
      await conversation.external(
        async () =>
          await enableConsultationByDateTime(
            consultationDate,
            conversation.session.consultation.time
          )
      );
      await ctx.reply("Вы не успели выполнить тестирование", {
        reply_markup: new Keyboard()
          .text("📅 выбрать дату")
          .row()
          .text("🏠 Главное меню")
          .resized(),
      });
      ctx = await conversation.wait();
      if (ctx.update.message?.text === "📅 выбрать дату") {
        await conversation.external(async () => {
          await editUserAttribute(
            chatId,
            "buyDate",
            new Date().getDate() + new Date().getMonth().toString()
          );
        });
        conversation.session.consultationStep = 2;
        return consultationConversation(conversation, ctx);
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
    const response = await conversation.waitForCallbackQuery(
      ["Telegram", "WhatsApp"],
      {
        otherwise: async (ctx) =>
          await ctx.reply("Используйте кнопки", {
            reply_markup: new InlineKeyboard()
              .text("Telegram", "Telegram")
              .row()
              .text("WhatsApp", "WhatsApp")
              .row(),
          }),
      }
    );
    if (response.match === "Telegram") {
      conversation.session.consultation.messanger = `https://t.me/${response.update.callback_query.from.username}`;
    }
    if (response.match === "WhatsApp") {
      consultationObject.massanger = "WhatsApp";
      await ctx.reply("📞 Напишите номер для связи");
      const messanger = await conversation.form.text();
      conversation.session.consultation.messanger = `WhatsApp ${messanger}`;
    }
    await ctx.reply("Пожалуйста подождите, идет запись на консультацию...");
    ctx.chatAction = "typing";
    let answerQuestions: string;
    switch (conversation.session.sex) {
      case "male": {
        answerQuestions = conversation.session.consultation.answers
          .map((answer, index: number) => {
            return `Вопрос :${maleQuestions[index].text}
Ответ: ${answer}
      `;
          })
          .join("\n");

        break;
      }
      case "female": {
        answerQuestions = conversation.session.consultation.answers
          .map((answer, index: number) => {
            return `
        
Вопрос :${femaleQuestions[index].text}
Ответ: ${answer}
      `;
          })
          .join("\n");

        break;
      }
      case "child": {
        answerQuestions = conversation.session.consultation.answers
          .map((answer, index: number) => {
            return `
        
Вопрос :${childQuestions[index].text}
Ответ: ${answer}
      `;
          })
          .join("\n");

        break;
      }
    }
    conversation.session.consultationStep = 6;
    const fileName = `${conversation.session.fio.split(" ")[0]}_${
      conversation.session.fio.split(" ")[1]
    }_${conversation.session.fio.split(" ")[2]}_${
      conversation.session.phoneNumber
    }_${conversation.session.consultation.dateString}.txt`;
    const filePath = `./${fileName}`;

    const fileContent = `
Новая запись на консультацию:
Имя: ${conversation.session.fio}
Телефон: ${conversation.session.phoneNumber}
Дата : ${new Date(
      Number(conversation.session.consultation.dateString.slice(0, 4)),
      Number(conversation.session.consultation.dateString.slice(4, 6)),
      Number(conversation.session.consultation.dateString.slice(6, 8))
    ).toLocaleDateString("ru-RU", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} в ${conversation.session.consultation.time}:00

Пол: ${
      conversation.session.sex === "child"
        ? "Ребенок"
        : conversation.session.sex === "male"
        ? "Мужчина"
        : "Женщина"
    }
Предпочтительная соцсеть: ${conversation.session.consultation.messanger}
Тестирование :
${answerQuestions}`;
    fs.writeFileSync(filePath, fileContent);
    await ctx.api.sendDocument("1856156198", new InputFile(filePath));
    const date = conversation.session.consultation.dateString;
    const time = conversation.session.consultation.time;
    await conversation.external(() => {
      ConsultationAppointmentModel.create({
        chatId,
        date,
        time,
      });
    });
    ctx.chatAction = null;
  }
  await ctx.reply(
    `Запись на консультацию прошла успешно!
Ожидайте моего сообщения ${new Date(
      Number(conversation.session.consultation.dateString.slice(0, 4)),
      Number(conversation.session.consultation.dateString.slice(4, 6)),
      Number(conversation.session.consultation.dateString.slice(6, 8))
    ).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })} в ${conversation.session.consultation.time}:00`,
    {
      reply_markup: new Keyboard().text("🏠 Главное меню").resized(),
    }
  );
  // eslint-disable-next-line no-useless-return
  return;
}
