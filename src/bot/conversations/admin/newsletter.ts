/* eslint-disable unicorn/no-null */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import {type Conversation, createConversation} from "@grammyjs/conversations";
import {InlineKeyboard} from "grammy";
import {Op} from "sequelize";
import {Context} from "#root/bot/context.js";
import {PaymentModel, UserModel} from "#root/server/models.js";
import moment from "moment";

export function newsletterConversation() {
    return createConversation(
        async (conversation: Conversation<Context>, ctx: Context) => {
            await ctx.reply("Для кого рассылка?", {
                reply_markup: new InlineKeyboard()
                    .text("Всем", "all")
                    .row()
                    .text("C купленными товарами", "paid")
                    .row()
                    .text("C подпиской", "subscribed")
                    .row()
                    .text("Без покупок и подписок", "noPaid")
                    .row()
                    .text("Групповое ведение(new)", "group"),
            });
            const {callbackQuery} = await conversation.waitFor(
                "callback_query:data"
            );
            await ctx.reply("<b>Введи текст рассылки</b>");
            const {
                msg: {text},
            } = await conversation.waitFor("message:text");
            await ctx.reply("He пиши боту 10 минут чтобы не сбросилась рассылка");

            if (callbackQuery?.data === "all") {
                const users = await conversation
                    .external(() => UserModel.findAll({
                            where: {
                                status: "active",
                            },
                        }
                    ))
                for (const user of users) {
                    setTimeout(async () => {
                        try {
                            await ctx.api.sendMessage(user.dataValues.chatId, text, {
                                parse_mode: "HTML",
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }, 33);
                }
            } else if (callbackQuery?.data === "paid") {
                const users = await conversation
                    .external(() =>
                        UserModel.findAll({
                            where: {
                                status: "active",
                                boughtProducts: {
                                    [Op.iLike]: "%Групповое ведение%",
                                },
                            },
                        })
                    )
                    .then((users) => users.map((u) => u.dataValues));
                for (const user of users) {
                    setTimeout(async () => {
                        await ctx.api.sendMessage(user.chatId, text, {
                            parse_mode: "HTML",
                        });
                    }, 33);
                }
            } else if (callbackQuery?.data === "noPaid") {
                const users = await conversation
                    .external(() => UserModel.findAll({
                        where: {
                            status: "active",
                            boughtProducts: null,
                        },
                    }))
                for (const user of users) {
                    setTimeout(async () => {
                        try {
                            await ctx.api.sendMessage(user.dataValues.chatId, text, {
                                parse_mode: "HTML",
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }, 40);
                }
            } else if (callbackQuery?.data === "subscribed") {
                const users = await conversation
                    .external(() => UserModel.findAll({
                        where: {
                            status: "active",
                            subscribed: true,
                        },
                    }))
                for (const user of users) {
                    setTimeout(async () => {
                        try {
                            await ctx.api.sendMessage(user.dataValues.chatId, text, {
                                parse_mode: "HTML",
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }, 250);
                }
            } else if (callbackQuery?.data === "group") {
                const currentDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss z")
                const startDay = moment(new Date()).add(-1, "month").format("YYYY-MM-DD HH:mm:ss z")
                const payments = await conversation.external(() => PaymentModel.findAll({
                        where:

                            {
                                status: "paid",
                                productName: "Групповое ведение",
                                updatedAt: {
                                    [Op.between]: [startDay, currentDate],
                                }


                            }
                    }
                ))
                for (const payment of payments) {
                    setTimeout(async () => {
                        try {
                            await ctx.api.sendMessage(payment.dataValues.chatId, text, {
                                parse_mode: "HTML",
                            });
                        } catch (error) {
                            console.log(error);
                        }
                    }, 33);
                }
            }
        }

        ,
        "newsletterConversation"
    )
        ;
}
