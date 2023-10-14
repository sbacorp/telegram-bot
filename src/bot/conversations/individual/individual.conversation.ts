/* eslint-disable unicorn/no-null */
/* eslint-disable default-case */
/* eslint-disable no-return-await */
/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard, InputFile } from "grammy";
import { Context } from "#root/bot/context.js";
import { autoChatAction } from "@grammyjs/auto-chat-action";
import { fetchUser } from "#root/server/utils.js";
import fs from "node:fs";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { BuyIndividualConversation } from "./buy-individual.conv.js";
import {
  briefChildConversation,
  questions as childQuestions,
} from "./brief-child.conv.js";
import {
  briefMaleConversation,
  questions as maleQuestions,
} from "./brief-male.conv.js";
import {
  briefFemaleConversation,
  questions as femaleQuestions,
} from "./brief-female.conv.js";

const acceptMenu = new InlineKeyboard()
  .url(
    "Политика конфеденциальности",
    "https://telegra.ph/Politika-konfidencialnost-10-06"
  )
  .row()
  .url("Публичная оферта", "https://telegra.ph/PUBLICHNAYA-OFERTA-10-06-2")
  .row()
  .text("Ознакомиться", "conditions")
  .row()
  .text("Уже ознакомлен(а)", "accepted");

const conditions = async (
  conversation: Conversation<Context>,
  ctx: Context
) => {
  let message = await ctx.reply(`
Формат ведения  предполагает общение в режиме переписки в любое время и в любом количестве.

Если вы не готовы оплатить в среднем анализы на 10-15 тысяч рублей, купить добавок в среднем на 25-30 тысяч рублей, а также принимать в день большое количество добавок, иногда их число достигает 15 штук в день, в зависимости от вашего состояния, то не отнимайте мое время и не тратьте ваши деньги.
  `);

  await conversation.sleep(1000);
  message = await ctx.reply(
    `
Стоимость ведения - 50.000р (1 месяц)
`,
    {
      reply_markup: acceptMenu,
    }
  );
  return message;
};

export async function individualConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const chatId = ctx.chat!.id.toString();
  await conversation.run(autoChatAction());
  const user = await conversation.external(() => fetchUser(chatId));
  let message;
  message = await (conversation.session.individual.individualStep === 0
    ? ctx.reply("Запись на индивидуальное введение", {
        reply_markup: cancel,
      })
    : ctx.reply("Продолжаем запись", {
        reply_markup: cancel,
      }));

  if (conversation.session.individual.individualStep < 1) {
    message = await ctx.reply(
      "Перед тем, как записаться ко мне необходимо ознакомиться с условиями",
      {
        reply_markup: acceptMenu,
      }
    );
    do {
      ctx = await conversation.wait();
      if (ctx.update.callback_query?.data === "conditions") {
        message = await conditions(conversation, ctx);
      }
    } while (!(ctx.update.callback_query?.data === "accepted"));
    await ctx.editMessageText(
      `Нажимая кнопку «записаться на консультацию» вы соглашаетесь с условиями.`
    );
    await ctx.api.editMessageReplyMarkup(message.chat.id, message.message_id, {
      reply_markup: new InlineKeyboard().text("Начать запись", "start"),
    });
    do {
      ctx = await conversation.wait();
    } while (!(ctx.update.callback_query?.data === "start"));
    conversation.session.individual.individualStep = 1;
  }
  if (
    conversation.session.individual.individualStep < 2 &&
    !user!.dataValues.boughtProducts?.includes("Индивидуальное введение")
  ) {
    const paymentResult = await BuyIndividualConversation(conversation, ctx);
    if (paymentResult === "fail") {
      conversation.session.individual.individualStep = 1;
      await ctx.reply("Попробуйте еще раз!");
      return individualConversation(conversation, ctx);
    }
    if (paymentResult === "home") {
      return;
    }
  }
  if (conversation.session.individual.individualStep < 3) {
    await ctx.reply(`Для кого индивидуальное введение?`, {
      reply_markup: new InlineKeyboard()
        .text("Мужчина", "male")
        .row()
        .text("Женщина", "female")
        .row()
        .text("Ребенку", "child"),
    });
    const sex = await conversation.waitFor("callback_query:data", {
      otherwise: () => {
        ctx.reply("Используйте кнопки", {
          reply_markup: new InlineKeyboard()
            .text("Мужской", "male")
            .text("Женский", "female"),
        });
      },
    });
    switch (sex.update.callback_query.data) {
      case "male": {
        conversation.session.individual.individualSex = "Мужчина";

        break;
      }
      case "female": {
        conversation.session.individual.individualSex = "Женщина";

        break;
      }
      case "child": {
        conversation.session.individual.individualSex = "Ребенок";

        break;
      }
    }
    conversation.session.individual.individualStep = 3;
  }
  if (
    conversation.session.individual.individualStep < 4 &&
    ((conversation.session.individual.individualSex === "Мужчина" &&
      conversation.session.individual.answers.length !==
        maleQuestions.length) ||
      (conversation.session.individual.individualSex === "Женщина" &&
        conversation.session.individual.answers.length !==
          femaleQuestions.length) ||
      (conversation.session.individual.individualSex === "Ребенок" &&
        conversation.session.individual.answers.length !==
          childQuestions.length))
  ) {
    if (conversation.session.individual.answers.length === 0) {
      await ctx.reply(`
1️⃣ Первый этап - вам необходимо ответить на перечень вопросов.
Обязательно вдумчиво прочтите их и дайте корректный развернутый ответ.
`);
    } else {
      await ctx.reply("Продолжаем тестирование");
    }
    switch (conversation.session.individual.individualSex) {
      case "Женщина": {
        await briefMaleConversation(conversation, ctx);
        break;
      }
      case "Мужчина": {
        await briefFemaleConversation(conversation, ctx);
        break;
      }
      case "Ребенок": {
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
    conversation.session.individual.individualStep = 4;
  }
  if (conversation.session.individual.individualStep < 5) {
    await ctx.reply("Пожалуйста подождите, идет запись на ведение...");
    ctx.chatAction = "typing";
    let answerQuestions;
    switch (conversation.session.individual.individualSex) {
      case "Мужчина": {
        answerQuestions = conversation.session.individual.answers
          .map((answer, index: number) => {
            return `Вопрос :${maleQuestions[index].text}
Ответ: ${answer}
      `;
          })
          .join("\n");

        break;
      }
      case "Женщина": {
        answerQuestions = conversation.session.individual.answers
          .map((answer, index: number) => {
            return `
        
Вопрос :${femaleQuestions[index].text}
Ответ: ${answer}
      `;
          })
          .join("\n");

        break;
      }
      case "Ребенок": {
        answerQuestions = conversation.session.individual.answers
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
    conversation.session.individual.individualStep = 5;
    const fileName = `${conversation.session.fio.split(" ")[0]}_${
      conversation.session.fio.split(" ")[1]
    }_${conversation.session.fio.split(" ")[2]}_${
      conversation.session.phoneNumber
    }.txt`;
    const filePath = `./${fileName}`;
    const fileContent = `
Индивидуальное введение:
Имя: ${conversation.session.fio}
Телефон: ${conversation.session.phoneNumber}
Ссылка на тг : ${ctx.chat?.id}
Для: ${
      conversation.session.individual.individualSex === "Ребенок"
        ? "Ребенка"
        : conversation.session.individual.individualSex === "Мужчина"
        ? "Мужчины"
        : "Женщины"
    }
Предпочтительная соцсеть: ${conversation.session.individual.messanger}
Тестирование :
${answerQuestions}`;
    fs.writeFileSync(filePath, fileContent);
    await ctx.api.sendDocument("-1001833847819", new InputFile(filePath));
    ctx.chatAction = null;
  }
}
