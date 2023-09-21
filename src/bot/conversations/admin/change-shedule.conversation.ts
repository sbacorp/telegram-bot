/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable unicorn/no-null */
/* eslint-disable no-restricted-syntax */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Op } from "sequelize";
import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { createLink } from "#root/server/utils.js";
import { ConsultationModel, UserModel } from "#root/server/models.js";

export type timeAttributeType =
  | `time10`
  | "time11"
  | "time12"
  | "time13"
  | "time14"
  | "time15"
  | "time16"
  | "time17"
  | "time18"
  | "time19"
  | "time20";

export function changeSheduleConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Выберите действие</b>", {
        reply_markup: new InlineKeyboard()
          .text("Удалить дату", "deleteDate")
          .row()
          .text("Добавить дату и время", "addDate")
          .row(),
      });
      const { callbackQuery } = await conversation.waitFor(
        "callback_query:data"
      );
      await ctx.reply("<b>Введите дату в формате ГГГГММДД</b>");
      const {
        msg: { text },
      } = await conversation.waitFor("message:text");
      if (callbackQuery?.data === "deleteDate") {
        try {
          await conversation.external(async () => {
            await ConsultationModel.destroy({
              where: {
                date: text,
              },
            });
          });
        } catch {
          return ctx.reply("Ошибка при удалении даты. Запустите команду снова");
        }
      }
      if (callbackQuery?.data === "addDate") {
        try {
          await conversation.external(async () => {
            await ConsultationModel.create({
              date: text,
            });
          });
        } catch {
          return ctx.reply("Произошла ошибка");
        }
        await ctx.reply(
          "Введите время в формате ЧЧ без минут. Более 1 вводите через запятую"
        );
        const times = await conversation.wait();
        await conversation.external(async () => {
          try {
            const consult = await ConsultationModel.findOne({
              where: {
                date: text,
              },
            });
            if (times.message?.text && consult) {
              const hours = times.message.text.split(",");
              for (const hour of hours) {
                const attr = `time${hour}`;
                //  @ts-ignore
                consult.attr = true;
              }
              consult.save();
            }
          } catch {
            return ctx.reply("Ошибка");
          }
        });
      }
    },
    "changeShedule"
  );
}
