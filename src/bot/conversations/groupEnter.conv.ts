import type {Conversation} from "@grammyjs/conversations";
import {Context} from "#root/bot/context.js";
import {InlineKeyboard, Keyboard} from "grammy";
import {editUserAttribute} from "#root/server/utils.js";
import {briefMaleConversation} from "#root/bot/conversations/consultation/brief-male.conv.js";
import {briefFemaleConversation} from "#root/bot/conversations/consultation/brief-female.conv.js";
import {briefChildConversation} from "#root/bot/conversations/consultation/brief-child.conv.js";
import {WebsitePaymentModel} from "#root/server/models.js";

export async function GroupEnterConv(
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
    if(!payment) return ctx.reply("Оплата по этому номеру не найдена")


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


}