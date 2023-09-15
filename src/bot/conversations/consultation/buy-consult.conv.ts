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
import { ConsultationModel, UserModel } from "#root/server/models.js";
import { IConsultationObject } from "#root/typing.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";

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
    await ctx.reply("Введите ФИО", {
      reply_markup: new Keyboard()
        .text("⬅️ К выбору даты")
        .text("🏠 Главное меню")
        .resized(),
    });
    ctx = await conversation.waitFor("message:text");
    while (!ctx.message?.text?.match(/^(?:[ЁА-Я][а-яё]+ ){2}[ЁА-Я][а-яё]+$/)) {
      if (ctx.message?.text === "⬅️ К выбору даты") {
        conversation.session.consultationStep -= 1;
        return ctx.conversation.reenter("consultation");
      }
      if (ctx.message?.text === "🏠 Главное меню") {
        return ctx.conversation.exit();
      }

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
      reply_markup: new Keyboard()
        .webApp("Оплатить", "https://payform.ru/992L3rc/")
        .add("⬅️ К выбору даты")
        .resized(),
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
    if (ctx.message?.text === "⬅️ К выбору даты") {
      conversation.session.consultationStep -= 1;
      return ctx.conversation.reenter("consultation");
    }
  } while (!(ctx.update.callback_query?.data === "paid"));

  //! check payment loop
  //! if paid
  await conversation.external(async () => {
    await disableConsultationByDateTime(
      consultationObject.dateString,
      consultationObject.time
    );
  });
  await conversation.external(async () => {
    const user = await UserModel.findOne({
      where: {
        chatId: ctx.chat!.id,
      },
    });
    user!.consultationPaidStatus = true;
    user!.save();
  });
  conversation.session.consultationStep = 3;
  await ctx.reply("<b>Оплата прошла успешно</b>", {
    reply_markup: cancel,
  });
  return ctx;
}
