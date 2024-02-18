import type {Conversation} from "@grammyjs/conversations";
import {Context} from "#root/bot/context.js";
import {InlineKeyboard, InputFile, Keyboard} from "grammy";
import {
    briefMaleConversation,
    questions as maleQuestions
} from "#root/bot/conversations/consultation/brief-male.conv.js";
import {
    briefFemaleConversation,
    questions as femaleQuestions
} from "#root/bot/conversations/consultation/brief-female.conv.js";
import {
    briefChildConversation,
    questions as childQuestions
} from "#root/bot/conversations/consultation/brief-child.conv.js";
import {WebsitePaymentModel} from "#root/server/models.js";
import fs from "node:fs";


export async function CheckGroupPayment(
    conversation: Conversation<Context>,
    ctx: Context
) {
    const chatId = ctx.chat!.id.toString();
    await conversation.wait()
    do {
        await ctx.reply(
            `Для того, чтобы поддтвердить покупку, поделитесь <i>контактом</i> кнопкой ниже ⬇️`,
            {
                reply_markup: new Keyboard()
                    .requestContact("Отправить контакт")
                    .resized()
                    .oneTime(),
            }
        );
        ctx = await conversation.wait();
    } while (!ctx.message?.contact?.phone_number);

    const payment = await conversation.external(() => WebsitePaymentModel.findOne({
        where: {
            phoneNumber: ctx.message?.contact?.phone_number
        }
    }))
    if (!payment) return ctx.reply("Оплата по этому номеру не найдена")
    return ctx.conversation.enter("groupEnter");
}

export async function GroupEnterConv(
    conversation: Conversation<Context>,
    ctx: Context
) {
    await ctx.reply("Пожалуйста, укажите кто проходит ведение?", {
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
    conversation.session.group = {
        sex: ""
    }

    switch (ctx.update.callback_query?.data) {
        case "male": {
            conversation.session.group.sex = "male";
            conversation.session.group.name = `${
                ctx.update.callback_query.from.username
                    ? `https://t.me/${ctx.update.callback_query.from.username}`
                    : "Пользователь предпочел скрыть никнейм"
            }}`;
            break;
        }
        case "female": {
            conversation.session.group.sex = "female";
            conversation.session.group.name = `${
                ctx.update.callback_query.from.username
                    ? `https://t.me/${ctx.update.callback_query.from.username}`
                    : "Пользователь предпочел скрыть никнейм"
            }}`;
            break;
        }
        case "child": {
            conversation.session.group.sex = "child";
            conversation.session.group.name = `${
                ctx.update.callback_query.from.username
                    ? `https://t.me/${ctx.update.callback_query.from.username}`
                    : "Пользователь предпочел скрыть никнейм"
            }}`;
            break;
        }
    }
    conversation.session.consultation.answers = []
    conversation.session.consultation.questionsAnswered = 0
    switch (conversation.session.group.sex) {
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

    await ctx.reply(
        `Благодарю вас за проделанную работу.`
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
    await ctx.reply("Пожалуйста подождите, идет запись на ведение...");
    let answerQuestions: string = "";
    ctx.chatAction = "typing";

    switch (conversation.session.group.sex) {
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
    const fileName = `${conversation.session.fio.split(" ")[0]}_${
        conversation.session.fio.split(" ")[1]
    }_${conversation.session.fio.split(" ")[2]}_${
        conversation.session.phoneNumber
    }_${conversation.session.consultation.dateString}.txt`;
    const filePath = `./${fileName}`;

    let fileContent: string;
    fileContent = `
Новая запись на Групповое ведение:
Имя: ${conversation.session.fio || ""}
Телефон: ${conversation.session.group.number}
Хочет скидку : ${address ? `Да, адресс ${address}` : "Нет"}

Для кого: ${
        conversation.session.group.sex === "child"
            ? "Ребенок"
            : conversation.session.group.sex === "male"
                ? "Мужчина"
                : "Женщина"
    }
Тестирование :

${answerQuestions}`;
    fs.writeFileSync(filePath, fileContent);
    await ctx.api.sendDocument("-1001833847819", new InputFile(filePath));
    await ctx.api.sendMessage(
        "-1001833847819",
        `Групповое ведение
        Контакт пользователя: ${
            conversation.session.consultation.messanger === "Пользователь предпочел скрыть никнейм"
                ? conversation.session.phoneNumber
                : conversation.session.consultation.messanger
        }
    `
    );
    ctx.chatAction = null;
}