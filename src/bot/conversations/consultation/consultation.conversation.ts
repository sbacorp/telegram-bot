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
import {type Conversation} from "@grammyjs/conversations";
import {InlineKeyboard, InputFile, Keyboard} from "grammy";
import {Context} from "#root/bot/context.js";
import {ConsultationAppointmentModel} from "#root/server/models.js";
import {IConsultationObject} from "#root/typing.js";
import {editUserAttribute, fetchUser} from "#root/server/utils.js";
import fs from "node:fs";
import {autoChatAction} from "@grammyjs/auto-chat-action";
import {cancel} from "../../keyboards/cancel.keyboard.js";
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
import {chooseDateConversation} from "./choose-date.conv.js";
import {
    BuyConsultationConversation,
} from "./buy-consult.conv.js";

export const yesNoKeyboard = new InlineKeyboard()
    .url(
        "Политика конфеденциальности",
        "https://telegra.ph/Politika-konfidencialnost-10-06"
    )
    .row()
    .url("Публичная оферта", "https://telegra.ph/PUBLICHNAYA-OFERTA-10-06-2")
    .row()
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
Стоимость консультации - 10.000₽
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
                conversation.session.consultation.messanger = `${
                    ctx.update.callback_query.from.username
                        ? `https://t.me/${ctx.update.callback_query.from.username}`
                        : ""
                }}`;
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
            `Благодарю вас за проделанную работу. В выбранную вами дату я свяжусь с вами.`
        );
        let address: string = "";
        await ctx.reply("Хотели бы сдать анализы с 20% скидкой?", {
            reply_markup: new InlineKeyboard().text("Да", "yes").text("Нет", "no"),
        });
        ctx = await conversation.waitForCallbackQuery(["yes", "no"], {
            otherwise: async () => {
                await ctx.reply("Используйте кнопки", {
                    reply_markup: new InlineKeyboard()
                        .text("Да", "yes")
                        .text("Нет", "no"),
                });
            },
        });
        if (ctx.update.callback_query?.data === "yes") {
            await ctx.reply("Введите адрес ближайшей к вам лаборатории Invitro");
            address = await conversation.form.text();
            if (address) {
                await ctx.reply("Спасибо, в день консультации алла вышлет вам скидку!");
            }
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
Хочет скидку : ${address ? `Да, адресс ${address}` : "Нет"}
Дата : ${new Date(
            Number(conversation.session.consultation.dateString.slice(0, 4)),
            Number(conversation.session.consultation.dateString.slice(4, 6)) - 1,
            Number(conversation.session.consultation.dateString.slice(6, 8))
        ).toLocaleDateString("ru-RU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })}

Пол: ${
            conversation.session.sex === "child"
                ? "Ребенок"
                : conversation.session.sex === "male"
                    ? "Мужчина"
                    : "Женщина"
        }
Тестирование :
${answerQuestions}`;
        fs.writeFileSync(filePath, fileContent);
        await ctx.api.sendDocument("-1001833847819", new InputFile(filePath));
        await ctx.api.sendMessage(
            "-1001833847819",
            `Контакт пользователя: ${
                conversation.session.consultation.messanger === ""
                    ? conversation.session.phoneNumber
                    : conversation.session.consultation.messanger
            }
    `
        );
        const date = conversation.session.consultation.dateString;
        await conversation.external(() => {
            ConsultationAppointmentModel.create({
                chatId,
                date,
            });
        });
        ctx.chatAction = null;
    }
    await ctx.reply(
        `Запись на консультацию прошла успешно!
Ожидайте моего сообщения ${new Date(
            Number(conversation.session.consultation.dateString.slice(0, 4)),
            Number(conversation.session.consultation.dateString.slice(4, 6)) - 1,
            Number(conversation.session.consultation.dateString.slice(6, 8))
        ).toLocaleDateString("ru-RU", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        })}`,
        {
            reply_markup: new Keyboard().text("🏠 Главное меню").resized(),
        }
    );
    // eslint-disable-next-line no-useless-return
    return;
}
