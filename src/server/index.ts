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
      password1: "M6WBUjhP5e3LX5cdU3SC",
      password2: "BJV9PqbP4l07w9GDxPdG",
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
      // await bot.api.sendMessage(payment.chatId, "Подтвердите оплату!", {
      //   reply_markup: {
      //     inline_keyboard: [
      //       [
      //         {
      //           text: "Оплатил",
      //           callback_data: "paid",
      //         },
      //       ],
      //     ],
      //   },
      // });

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

  // server.get("/bot/successfully", async function handler(request, reply) {
  //   reply.type("text/html").send(`
  // <html lang="ru">
  //   <head>
  //     <meta charset="utf-8" />
  //     <meta
  //       name="viewport"
  //       content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
  //     />
  //     <meta name="format-detection" content="telephone=no" />
  //     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  //     <meta name="MobileOptimized" content="176" />
  //     <meta name="HandheldFriendly" content="True" />
  //     <meta name="robots" content="noindex,nofollow" />
  //     <title></title>
  //     <script src="https://telegram.org/js/telegram-web-app.js"></script>
  //   </head>

  //   <body class="">
  //     <div id="title">Платеж успешно выполнен!</div>
  //     <script type="application/javascript">
  //       const DemoApp = {
  //         initData: Telegram.WebApp.initData || "",
  //         initDataUnsafe: Telegram.WebApp.initDataUnsafe || {},
  //         MainButton: Telegram.WebApp.MainButton,

  //         init(options) {
  //           document.body.style.visibility = "";
  //           Telegram.WebApp.ready();
  //           Telegram.WebApp.MainButton.setParams({
  //             text: "Вернуться в бота",
  //             is_visible: true,
  //           }).onClick(DemoApp.close);
  //         },
  //         close() {
  //           Telegram.WebApp.close();
  //         },
  //       };
  //       DemoApp.init();
  //     </script>
  //   </body>
  // </html>

  //   `);
  // });
  server.get("/bot/fail", async (request, reply) => {
    const data = request.query as PaymentData;
    return reply.type("text/html").send(`
  <html lang="ru">
    <head>
      <meta charset="utf-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
      />
      <meta name="format-detection" content="telephone=no" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="MobileOptimized" content="176" />
      <meta name="HandheldFriendly" content="True" />
      <meta name="robots" content="noindex,nofollow" />
      <title></title>
      <script src="https://telegram.org/js/telegram-web-app.js"></script>
      <script>
        function setThemeClass() {
          document.documentElement.className = Telegram.WebApp.colorScheme;
        }
        Telegram.WebApp.onEvent("themeChanged", setThemeClass);
        setThemeClass();
      </script>
      <style>
        body {
          --bg-color: var(--tg-theme-bg-color, #222);
          font-family: sans-serif;
          background-color: var(--bg-color);
          color: var(--tg-theme-text-color, #fff);
          font-size: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0;
          padding: 0;
          color-scheme: var(--tg-color-scheme);
        }
        .btn {
          font-size: 14px;
          padding: 10px 17px;
        }
      </style>
    </head>
    <body class="">
      <div id="title">Платеж завершился неудачей</div>
      <script type="application/javascript">
        const DemoApp = {
          initData: Telegram.WebApp.initData || "",
          initDataUnsafe: Telegram.WebApp.initDataUnsafe || {},
          MainButton: Telegram.WebApp.MainButton,

          init(options) {
            document.body.style.visibility = "";
            Telegram.WebApp.ready();
            Telegram.WebApp.MainButton.setParams({
              text: "Вернуться в бота",
              is_visible: true,
            }).onClick(DemoApp.close);
          },
          close() {
            Telegram.WebApp.close();
          },
          checkInitData() {
            const webViewStatus = document.querySelector("#webview_data_status");
            if (
              DemoApp.initDataUnsafe.query_id &&
              DemoApp.initData &&
              webViewStatus.classList.contains("status_need")
            ) {
              webViewStatus.classList.remove("status_need");
              DemoApp.apiRequest("checkInitData", {}, function (result) {
                if (result.ok) {
                  webViewStatus.textContent = "Hash is correct (async)";
                  webViewStatus.className = "ok";
                } else {
                  webViewStatus.textContent = result.error + " (async)";
                  webViewStatus.className = "err";
                }
              });
            }
          },
          paid() {
            Telegram.WebApp.sendData("paid");
          },
        };

        const DemoAppInitData = {
          init() {
            DemoApp.init();
            Telegram.WebApp.onEvent("themeChanged", function () {
              document.getElementById("theme_data").innerHTML = JSON.stringify(
                Telegram.WebApp.themeParams,
                null,
                2
              );
            });
            document.getElementById("webview_data").innerHTML = JSON.stringify(
              DemoApp.initDataUnsafe,
              null,
              2
            );
            document.getElementById("theme_data").innerHTML = JSON.stringify(
              Telegram.WebApp.themeParams,
              null,
              2
            );
            DemoApp.checkInitData();
          },
        };
        DemoApp.init();
        DemoApp.paid();
      </script>
    </body>
  </html>

    `);
  });

  server.post(`/bot/${bot.token}`, webhookCallback(bot, "fastify"));

  return server;
};
