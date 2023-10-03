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
import { PaymentModel } from "#root/server/models.js";
import { createPaymentLink } from "#root/server/creat-pay-link.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";

export async function BuyIndividualConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const user = await conversation.external(() =>
    fetchUser(ctx.chat!.id.toString())
  );

  const product = {
    id: 6,
    name: "Индивидуальное введение",
    price: 50_000,
  };

  if (!conversation.session.fio) {
    await ctx.reply("Введите ФИО", {
      reply_markup: new Keyboard().text("🏠 Главное меню").resized(),
    });
    ctx = await conversation.waitFor("message:text");
    while (!ctx.message?.text?.match(/^(?:[ЁА-Я][а-яё]+ ){2}[ЁА-Я][а-яё]+$/)) {
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

  await ctx.reply("Поделитесь контактом по кнопке ниже, чтобы продолжить ⬇️", {
    reply_markup: new Keyboard()
      .requestContact("Отправить контакт")
      .resized()
      .oneTime(),
  });
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

  await ctx.reply(
    `Место забронировано на 15 минут. В течение этого времени необходимо оплатить выставленный счет, иначе бронь будет снята.`
  );
  await ctx.reply("Выберите способ оплаты", {
    reply_markup: new InlineKeyboard()
      .text("Картой", "card")
      .text("СБП/MirPay", "sbp"),
  });
  const paymentMethod = await conversation.waitForCallbackQuery(
    ["card", "sbp"],
    {
      otherwise: () =>
        ctx.reply("Выберите способ оплаты", {
          reply_markup: new InlineKeyboard()
            .text("Картой", "card")
            .text("СБП/MirPay", "sbp"),
        }),
    }
  );
  const { link, invoiceId } = await conversation.external(() =>
    createPaymentLink(product, ctx.chat!.id.toString())
  );
  if (paymentMethod.update.callback_query?.data === "card") {
    const message = await ctx.reply(
      `<b>Можете приступать к оплате. Номер заказа: #${invoiceId}</b>`,
      {
        reply_markup: new InlineKeyboard().webApp("💰 Оплатить", link).row(),
      }
    );
  } else {
    const message = await ctx.reply(
      `<b>Можете приступать к оплате. Номер заказа: #${invoiceId}</b>`,
      {
        reply_markup: new InlineKeyboard().url("💰 Оплатить", link).row(),
      }
    );
  }
  await ctx.reply(
    `<b>Можете приступать к оплате.</b>
    После оплаты я отправлю вопросы по состоянию здоровья прямо в этот чат. На них необходимо ответить.
      `,
    {
      reply_markup: new InlineKeyboard().webApp("💰 Оплатить", link),
    }
  );
  ctx = await conversation.waitFor("callback_query:data");
  if (ctx.update.callback_query?.data === "paid") {
    const payment = await conversation.external(() =>
      PaymentModel.findOne({
        where: { invoiceId },
      })
    );
    if (payment?.dataValues?.status !== "paid") {
      await ctx.reply("Оплата не прошла, попробуйте еще раз");
      return "fail";
    }
    conversation.session.individual.individualStep = 2;
    conversation.session.individual.answers = [];
    await ctx.reply("<b>Оплата прошла успешно</b>", {
      reply_markup: cancel,
    });
    await conversation.external(async () => {
      user!.boughtProducts = user?.boughtProducts?.concat(
        "Индивидуальное введение"
      );
      await user!.save();
    });
    return "success";
  }
  conversation.session.consultationStep = 1;
  return "fail";
}
