/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable func-names */
import fastify from "fastify";
import { BotError, GrammyError, webhookCallback } from "grammy";
import CryptoJS from "crypto-js";
import type { Bot } from "#root/bot/index.js";
import { errorHandler } from "#root/bot/handlers/index.js";
import { logger } from "#root/logger.js";
import { PaymentModel, UserModel } from "./models.js";
import { initDB } from "./utils.js";
import { sequelize } from "./database.js";

interface PaymentData {
  OutSum: string;
  InvId: string;
  Shp_chatId: string;
  SignatureValue: string;
}

export const createServer = async (bot: Bot) => {
  const server = fastify({
    logger,
  });

  server.setErrorHandler(async (error, request, response) => {
    if (error instanceof BotError) {
      errorHandler(error);
      await response.code(200).send({});
    }
    if (error instanceof GrammyError) {
      console.error("Error in request:", error.description);
      await response.code(200).send({});
    } else {
      logger.error(error);
      await response.status(500).send({ error: "Oops! Something went wrong." });
    }
  });

  server.get("/bot/payment", async function handler(request, reply) {
    const data = request.query as PaymentData;
    const paymentParameters = {
      MerchantLogin: "BOT.RU",
      OutSum: data.OutSum,
      InvId: data.InvId,
      Shp_chatId: data.Shp_chatId,
      password1: "m8mPZVNLj33pybLAZ0b6",
      password2: "CWdNAdpGx2mC3Rk0W2N5",
    };
    const signitureString = `${paymentParameters.OutSum}:${paymentParameters.InvId}:${paymentParameters.password2}:Shp_chatId=${paymentParameters.Shp_chatId}`;
    const SignatureValue = CryptoJS.MD5(signitureString);
    if (SignatureValue.toString().toUpperCase() !== data.SignatureValue) {
      reply.code(400).send("Invalid signature");
    }
    await initDB(sequelize);
    const payment = await PaymentModel.findOne({
      where: {
        invoiceId: data.InvId,
        chatId: data.Shp_chatId,
        amount: Number(data.OutSum),
      },
    });
    if (payment) {
      payment.status = "paid";
      await payment.save();
      await bot.api.sendMessage(payment.chatId, "Подтвердите оплату!", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Оплатил",
                callback_data: "paid",
              },
            ],
          ],
        },
      });
      if (payment.productName === "Консультация") {
        const user = await UserModel.findOne({
          where: {
            chatId: payment.chatId,
          },
        });
        if (user) {
          user.consultationPaidStatus = true;
          await user.save();
        }
      } else {
        const user = await UserModel.findOne({
          where: {
            chatId: payment.chatId,
          },
        });
        if (user) {
          user.boughtProducts += `${payment.productName},`;
          await user.save();
        }
      }
    }
    reply.code(200).send(`OK${paymentParameters.InvId}`);
  });

  server.post(`/bot/${bot.token}`, webhookCallback(bot, "fastify"));

  return server;
};
