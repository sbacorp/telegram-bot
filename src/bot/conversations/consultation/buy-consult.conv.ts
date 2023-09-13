/* eslint-disable no-console */
/* eslint-disable unicorn/prefer-optional-catch-binding */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-param-reassign */
/* eslint-disable no-continue */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable no-await-in-loop */
import { InlineKeyboard, Keyboard } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { updateUserPhone } from "#root/server/utils.js";
import { ConsultationModel } from "#root/server/models.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { IConsultationObject } from "./choose-date.conv.js";

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
const disableConsultationByDateTime = async (date: string, time: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const timeAttribute: timeAttributeType = `time${time.split(":")[0]}`;
    const consultation = await ConsultationModel.findOne({
      where: {
        date,
      },
    });
    if (consultation) {
      consultation[timeAttribute] = false;
      await consultation.save();
    }
  } catch (error) {
    console.log(error);
  }
};

export async function BuyConsultationConversation(
  conversation: Conversation<Context>,
  ctx: Context,
  message: any,
  consultationObject: IConsultationObject
) {
  await ctx.deleteMessage();
  if (conversation.session.fio === "") {
    await ctx.reply("Введите ФИО");
    ctx = await conversation.waitFor("message:text");
    while (!ctx.message?.text?.match(/^(?:[ЁА-Я][а-яё]+ ){2}[ЁА-Я][а-яё]+$/)) {
      await ctx.reply("Введите ФИО");
      ctx = await conversation.waitFor("message:text");
    }
    conversation.session.fio = ctx.message?.text;
  }
  if (conversation.session.phoneNumber === "") {
    await ctx.reply(
      "Поделитесь контактом по кнопке ниже, чтобы продолжить ⬇️",
      {
        reply_markup: new Keyboard()
          .requestContact("Отправить контакт")
          .resized(),
      }
    );
    ctx = await conversation.waitFor(":contact");
    await conversation.external(async () => {
      await updateUserPhone(ctx.chat!.id, ctx.message!.contact!.phone_number);
    });
    conversation.session.phoneNumber = ctx.message!.contact!.phone_number;
  }
  await ctx.reply(
    `Место забронировано на 15 минут. В течение этого времени необходимо оплатить выставленный счет, иначе бронь будет снята.`
  );
  message = await ctx.reply(
    `<b>Можете приступать к оплате.</b>
В течение 10 минут с момента оплаты вы получите ссылку на бриф - опросник по состоянию здоровья прямо в этот чат.`,
    {
      reply_markup: new Keyboard().webApp(
        "Оплатить",
        "https://payform.ru/992L3rc/"
      ),
    }
  );

  await ctx.reply("Подтвердите оплату", {
    reply_markup: new InlineKeyboard().text("Оплатил", "paid"),
  });
  do {
    ctx = await conversation.wait();
    if (ctx.update.callback_query?.data === "paid") {
      break;
    }
  } while (!(ctx.update.callback_query?.data === "paid"));

  //! check payment loop
  await ctx.editMessageText("<b>Оплата прошла успешно</b>");
  await conversation.external(async () => {
    await disableConsultationByDateTime(
      consultationObject.dateString,
      consultationObject.time
    );
  });
  return ctx;
}
