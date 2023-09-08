/* eslint-disable no-useless-return */
/* eslint-disable no-shadow */
/* eslint-disable no-return-await */
/* eslint-disable no-param-reassign */
/* eslint-disable no-await-in-loop */
import { type Conversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { updateUserPhone } from "#root/server/utils.js";
import { cancel } from "../keyboards/cancel.keyboard.js";

export interface IProduct {
  id: number;
  name: string;
  price: number;
}
export const products: IProduct[] = [
  {
    id: 1,
    name: "Детское здоровье",
    price: 7000,
  },
  {
    id: 2,
    name: "Методичка по работе с желчью",
    price: 5000,
  },
  {
    id: 3,
    name: "Гайд Аптечка для детей и взрослых",
    price: 5000,
  },
  {
    id: 4,
    name: "Групповое ведение",
    price: 5000,
  },
];

export const userSuggestions = new InlineKeyboard()
  .url("Пользовательское соглашение", "https://telegra.ph")
  .row()
  .url("Политика конфеденциальности", "https://telegra.ph")
  .row()
  .text(" ☑️ Соглашаюсь с условиями", "accept");

export const BUY_CONVERSATION = "buy";
export async function buyConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const selectedProduct = ctx.session?.selectedProduct;
  let product: IProduct | undefined;
  if (selectedProduct) {
    product = products.find((p) => p.name === selectedProduct);
    await ctx.reply(
      `Продукт : <b>${product?.name}</b> \nЦена : <b>${product?.price}</b> рублей`
    );
    await ctx.reply("Оплачиваете один раз, доступ сохраняется навсегда");
    const sugMessage = await ctx.reply("Подтвердите ознакомление с офертой", {
      reply_markup: userSuggestions,
    });
    const response = await conversation.waitForCallbackQuery("accept");
    if (response) {
      await ctx.api.editMessageReplyMarkup(
        sugMessage.chat.id,
        sugMessage.message_id,
        {
          reply_markup: new InlineKeyboard()
            .url("Пользовательское соглашение", "https://telegra.ph")
            .row()
            .url("Политика конфеденциальности", "https://telegra.ph")
            .row()
            .text(" ✅ Ознакомлен"),
        }
      );
      await ctx.reply(
        "Поделитесь контактом по кнопке ниже, чтобы продолжить ⬇️",
        {
          reply_markup: new Keyboard()
            .requestContact("Отправить контакт")
            .resized(),
        }
      );
      const contact = await conversation.waitFor(":contact");
      await conversation.external(async () => {
        await updateUserPhone(
          ctx.chat!.id,
          contact.message!.contact.phone_number
        );
      });
      await ctx.reply("Соглашение принято", {
        reply_markup: cancel,
      });
    }
  } else return;
  return;
  // const response = await conversation.waitForCallbackQuery(
  //   ["zhkt", "deficit", "thyroid", "insulin"],
  //   {
  //     otherwise: async (ctx) =>
  //       await ctx.reply("Используйте кнопки", {
  //         reply_markup: diagnosticListKeyboard,
  //       }),
  //   }
  // );
}
