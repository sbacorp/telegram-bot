/* eslint-disable unicorn/no-null */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { Op } from "sequelize";
import { Context } from "#root/bot/context.js";
import { UserModel } from "#root/server/models.js";

export function newsletterConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("Для кого рассылка?", {
        reply_markup: new InlineKeyboard()
          .text("Всем", "all")
          .row()
          .text("С купленными товарами", "paid")
          .row()
          .text("С подпиской", "subscribed")
          .row()
          .text("Без покупок и подписок", "noPaid"),
      });
      const { callbackQuery } = await conversation.waitFor(
        "callback_query:data"
      );
      await ctx.reply("<b>Введи текст рассылки</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      await ctx.reply("Не пиши боту 10 минут чтобы не сбросилась рассылка");
      if (callbackQuery?.data === "all") {
        const users = await UserModel.findAll({
          where: {
            status: "active",
          },
        });
        for (const user of users) {
          setTimeout(async () => {
            await ctx.api.sendMessage(user.dataValues.chatId, text, {
              parse_mode: "HTML",
            });
          }, 33);
        }
      }
      if (callbackQuery?.data === "paid") {
        const users = await UserModel.findAll({
          where: {
            status: "active",
            boughtProducts: { [Op.notLike]: null },
          },
        });
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
      }
      if (callbackQuery?.data === "noPaid") {
        const users = await UserModel.findAll({
          where: {
            status: "active",
            boughtProducts: null,
          },
        });
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
      }
      if (callbackQuery?.data === "subscribed") {
        const users = await UserModel.findAll({
          where: {
            status: "active",
            subscribed: true,
          },
        });
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
      }
    },
    "newsletterConversation"
  );
}
