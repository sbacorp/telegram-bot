/* eslint-disable no-loop-func */
/* eslint-disable prefer-const */
/* eslint-disable no-useless-return */
/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import {
  createPaymentLink,
  editUserAttribute,
  findPromoCodeByTitleAndProduct,
  updateUserPhone,
} from "#root/server/utils.js";
import { IProduct } from "#root/typing.js";
import { cancel } from "../keyboards/cancel.keyboard.js";

export const products: IProduct[] = [
  {
    id: 1,
    name: "Детское здоровье",
    price: 7000,
    type: "link",
    answer:
      "<a href='https://t.me/+y34BKRWT_R0wM2I6'>Ссылка на закрытый телеграм канал</a>",
  },
  {
    id: 2,
    name: "Методичка по работе с желчью",
    price: 5000,
    type: "doc",
    docId:
      "BQACAgIAAxkBAAIKDWUC8jktsNfxpSEiNv-uL8ynPL0lAAIkMQACS5AZSK4WXfoa1B_oMAQ",
  },
  {
    id: 3,
    name: "Гайд Аптечка для детей и взрослых",
    price: 5000,
    type: "doc",
    docId:
      "BQACAgIAAxkBAAIKC2UC8f8ZEsvBZSaSqspiHMhcUOlWAAIfMQACS5AZSKRoICkE24x8MAQ",
  },
  {
    id: 4,
    name: "Групповое ведение",
    price: 5000,
    type: "link",
    answer:
      "<a href='https://t.me/+798aDavPym8yODgy'>Закрытый телеграм чат</a>",
  },
  {
    id: 5,
    name: "Консультация",
    price: 10_000,
    type: "link",
    answer: "Оплата успешно произведена",
  },
];

export const userSuggestions = new InlineKeyboard()
  .url(
    "Политика конфеденциальности",
    "https://telegra.ph/Politika-konfidencialnost-09-19"
  )
  .row()
  .url("Публичная оферта", "https://telegra.ph/PUBLICHNAYA-OFERTA-09-19-3")
  .row()
  .text(" ☑️ Соглашаюсь с условиями", "accept");

export const BUY_CONVERSATION = "buy";
export async function buyConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const selectedProduct = conversation.session?.selectedProduct;
  let product: IProduct | undefined;
  let promoTitle: string | undefined;
  if (!selectedProduct) {
    return ctx.reply("Выберите продукт");
  }
  product = products.find((p) => p.name === selectedProduct);
  await ctx.reply(
    `Продукт : <b>${product?.name}</b> \nЦена : <b>${product?.price}</b> рублей`
  );
  await ctx.reply("Оплачиваете один раз, доступ сохраняется навсегда");
  let sugMessage = await ctx.reply("Подтвердите ознакомление с офертой", {
    reply_markup: userSuggestions,
  });
  ctx = await conversation.wait();
  while (ctx.update.callback_query?.data !== "accept") {
    sugMessage = await ctx.reply("Подтвердите ознакомление с офертой", {
      reply_markup: userSuggestions,
    });
    ctx = await conversation.wait();
  }
  await ctx.api.editMessageReplyMarkup(
    sugMessage.chat.id,
    sugMessage.message_id,
    {
      reply_markup: new InlineKeyboard()
        .url(
          "Пользовательское соглашение",
          "https://telegra.ph/Politika-konfidencialnost-09-19"
        )
        .row()
        .url(
          "Политика конфеденциальности",
          "https://telegra.ph/PUBLICHNAYA-OFERTA-09-19-3"
        )
        .row()
        .text(" ✅ Ознакомлен"),
    }
  );
  if (conversation.session.phoneNumber === "") {
    await ctx.reply(
      "Поделитесь контактом по кнопке ниже, чтобы продолжить ⬇️",
      {
        reply_markup: new Keyboard()
          .requestContact("Отправить контакт")
          .resized(),
      }
    );
    const contact = await conversation.waitFor(":contact");
    conversation.session.phoneNumber = contact.message!.contact.phone_number;
    await conversation.external(async () => {
      await updateUserPhone(
        ctx.chat!.id,
        contact.message!.contact.phone_number
      );
    });
  }
  await ctx.reply("Соглашение принято", {
    reply_markup: cancel,
  });
  if (conversation.session.fio === "") {
    await ctx.reply("Введите ФИО");
    ctx = await conversation.waitFor("message:text");
    while (!ctx.message?.text?.match(/^(?:[ЁА-Я][а-яё]+ ){2}[ЁА-Я][а-яё]+$/)) {
      await ctx.reply("Введите ФИО");
      ctx = await conversation.waitFor("message:text");
    }
    conversation.session.fio = ctx.message?.text;
    await conversation.external(async () => {
      await editUserAttribute(
        ctx.chat!.id.toString(),
        "fio",
        ctx.message!.text!
      );
    });
  } else {
    await ctx.reply(
      `Ваше ФИО: ${conversation.session.fio}
    Верно?`,
      {
        reply_markup: new InlineKeyboard().text("Да", "yes").text("Нет", "no"),
      }
    );
    ctx = await conversation.wait();
    if (ctx.update.callback_query?.data === "no") {
      await ctx.answerCallbackQuery("Смена ФИО");
      await ctx.reply("Введите ФИО");
      ctx = await conversation.waitFor("message:text");
      while (
        !ctx.message?.text?.match(/^(?:[ЁА-Я][а-яё]+ ){2}[ЁА-Я][а-яё]+$/)
      ) {
        await ctx.reply("Введите ФИО правильно");
        ctx = await conversation.waitFor("message:text");
      }
      conversation.session.fio = ctx.message?.text;
      await conversation.external(async () => {
        await editUserAttribute(
          ctx.chat!.id.toString(),
          "fio",
          ctx.message!.text!
        );
      });
    } else if (ctx.update.callback_query?.data === "yes") {
      await ctx.answerCallbackQuery("Переходим к оплате");
    }
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
      promo = await conversation.external(async () => {
        return findPromoCodeByTitleAndProduct(
          "Консультация",
          promoTitle!,
          ctx.chat!.id.toString()
        );
      });
      if (!promo)
        await ctx.reply("Промокод не найден, попробуйте снова!", {
          reply_markup: new InlineKeyboard().text("Пропустить", "skip"),
        });
    }
  }
  if (promo) {
    await ctx.reply("Промокод принят");
    await ctx.reply(`Скидка составляет ${promo.discount}%
Итоговая цена: ${product!.price! - product!.price! * (promo.discount! / 100)}`);
    product!.price =
      product!.price! - product!.price! * (promo.discount! / 100);
  }
  //! create link to perchase
  const { link, paymentId } = await conversation.external(() =>
    createPaymentLink(product!, ctx.chat!.id.toString())
  );
  const message = await ctx.reply(
    `<b>Можете приступать к оплате. Номер заказа: #${paymentId}</b>`,
    {
      reply_markup: new InlineKeyboard().webApp("💰 Оплатить", link).row(),
    }
  );
  //! check payment loop
  await ctx.editMessageText("<b>Оплата прошла успешно</b>");
  return product?.type === "doc"
    ? ctx.replyWithDocument(product.docId!, {
        reply_markup: cancel,
      })
    : ctx.reply(product!.answer!);
}
