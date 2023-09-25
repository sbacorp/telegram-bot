/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
import { InlineKeyboard, Keyboard } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import {
  editUserAttribute,
  fetchUser,
  findPromoCodeByTitleAndProduct,
  updateUserPhone,
} from "#root/server/utils.js";
import {
  ConsultationModel,
  PaymentModel,
  UserModel,
} from "#root/server/models.js";
import { IConsultationObject } from "#root/typing.js";
import { createPaymentLink } from "#root/server/creat-pay-link.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { consultationConversation } from "./consultation.conversation.js";

type TimeAttributeType =
  | "time10"
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
  const timeAttribute: TimeAttributeType = `time${
    time.split(":")[0]
  }` as TimeAttributeType;
  const consultation = await ConsultationModel.findOne({ where: { date } });
  if (consultation) {
    consultation[timeAttribute] = false;
    await consultation.save();
  }
};
export const enableConsultationByDateTime = async (
  date: string,
  time: string
) => {
  const timeAttribute: TimeAttributeType = `time${
    time.split(":")[0]
  }` as TimeAttributeType;
  const consultation = await ConsultationModel.findOne({ where: { date } });
  if (consultation) {
    consultation[timeAttribute] = true;
    await consultation.save();
  }
};

export async function BuyConsultationConversation(
  conversation: Conversation<Context>,
  ctx: Context,
  message: any,
  consultationObject: IConsultationObject
) {
  const product = {
    id: 5,
    name: "Консультация",
    price: conversation.session.sex === "child" ? 5000 : 10_000,
  };

  if (!conversation.session.fio) {
    await ctx.reply("Введите ФИО", {
      reply_markup: new Keyboard()
        .text("⬅️ К выбору даты")
        .text("🏠 Главное меню")
        .resized(),
    });
    ctx = await conversation.waitFor("message:text");
    while (!ctx.message?.text?.match(/^(?:[ЁА-Я][а-яё]+ ){2}[ЁА-Я][а-яё]+$/)) {
      if (ctx.message?.text === "⬅️ К выбору даты") {
        conversation.session.consultationStep = 2;
        return "change date";
      }
      if (ctx.message?.text === "🏠 Главное меню") {
        return "home";
      }
      await ctx.reply("Введите ФИО");
      ctx = await conversation.waitFor("message:text");
    }
    conversation.session.fio = ctx.message?.text;
    await conversation.external(async () =>
      editUserAttribute(ctx.chat!.id.toString(), "fio", ctx.message!.text!)
    );
  }

  if (!conversation.session.phoneNumber) {
    await ctx.reply(
      "Поделитесь контактом по кнопке ниже, чтобы продолжить ⬇️",
      {
        reply_markup: new Keyboard()
          .requestContact("Отправить контакт")
          .resized()
          .oneTime(),
      }
    );
    ctx = await conversation.waitFor(":contact");
    await conversation.external(async () =>
      updateUserPhone(ctx.chat!.id, ctx.message!.contact!.phone_number)
    );
    conversation.session.phoneNumber = ctx.message!.contact!.phone_number;
    await conversation.external(async () =>
      editUserAttribute(
        ctx.chat!.id.toString(),
        "phoneNumber",
        ctx.message!.text!
      )
    );
  }

  let promo;
  await ctx.reply("Введите промокод", {
    reply_markup: new InlineKeyboard().text("Пропустить", "skip"),
  });

  while (!promo) {
    ctx = await conversation.wait();
    if (ctx.update.callback_query?.data === "skip") {
      break;
    }
    if (ctx.message?.text) {
      promo = await conversation.external(async () =>
        findPromoCodeByTitleAndProduct(
          "Консультация",
          ctx.message!.text!,
          ctx.chat!.id.toString()
        )
      );
      if (!promo)
        await ctx.reply("Промокод не найден, попробуйте снова!", {
          reply_markup: new InlineKeyboard().text("Пропустить", "skip"),
        });
    }
  }

  if (promo) {
    product.price -= product.price * (promo.discount / 100);
    await ctx.reply(`
        Промокод на скидку ${promo.discount}% применен!
        Новая цена: ${product.price}₽
        `);
  }
  await ctx.reply(
    `Место забронировано на 15 минут. В течение этого времени необходимо оплатить выставленный счет, иначе бронь будет снята.`
  );

  const { link, invoiceId } = await conversation.external(() =>
    createPaymentLink(product, ctx.chat!.id.toString())
  );
  message = await ctx.reply(
    `<b>Можете приступать к оплате.</b>
    После оплаты вы получите ссылку на бриф, который необходимо заполнить не позднее<b> полночи</b> текущего дня.
    Если не уверены, что успеете заполнить бриф, то лучше отложить оплату до завтра.
  `,
    {
      reply_markup: new InlineKeyboard()
        .webApp("💰 Оплатить", link)
        .row()
        .text("⬅️ К выбору даты"),
    }
  );
  ctx = await conversation.wait();
  if (ctx.message?.text === "⬅️ К выбору даты") {
    conversation.session.consultationStep = 2;
    return "change date";
  }
  if (ctx.update.callback_query?.data === "paid") {
    const payment = await conversation.external(() =>
      PaymentModel.findOne({
        where: { invoiceId },
      })
    );

    if (payment?.status !== "paid") {
      conversation.session.consultation.dateString = "";
      conversation.session.consultationStep = 2;
      await ctx.reply("Оплата не прошла, попробуйте еще раз");
      return "fail";
    }
    conversation.session.consultationStep = 4;
    conversation.session.consultation.answers = [];
    conversation.session.consultation.buyDate =
      new Date().getDate() + new Date().getMonth().toString();

    await conversation.external(async () =>
      editUserAttribute(
        ctx.chat!.id.toString(),
        "buyDate",
        conversation.session.consultation.buyDate
      )
    );
    await conversation.external(async () =>
      editUserAttribute(
        ctx.chat!.id.toString(),
        "consultationDate",
        conversation.session.consultation.dateString
      )
    );
    await conversation.external(async () =>
      disableConsultationByDateTime(
        conversation.session.consultation.dateString,
        conversation.session.consultation.time
      )
    );
    await ctx.reply("<b>Оплата прошла успешно</b>", {
      reply_markup: cancel,
    });
    return "success";
  }
  conversation.session.consultationStep = 2;
  return "fail";
}
