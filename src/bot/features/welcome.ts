import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { findOrCreateUser } from "../../server/utils.js";
import { mainMenu } from "../keyboards/index.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async (ctx) => {
  const chatId = ctx.chat.id;
  await findOrCreateUser(chatId);
  await ctx.reply(`
Здравствуйте
Меня зовут Алла Чеканова.
Я - семейный и детский  нутрициолог, клинический психолог и эксперт в области превентивной медицины международного уровня.

🌿 8 лет я профессионально помогаю людям обрести здоровье.
🌿 Я успешно завершила более 200 обучений.
🌿 Создала 2 программы профессиональной подготовки
🌿 Подготовила более 3000 специалистов
🌿 Разработала собственную линейку витаминов
🌿 Произвожу лечебную магниевую воду с идеальным составом и ценой`);
  await ctx.replyWithMarkdownV2("*Выберите то, что вам нужно*", {
    reply_markup: mainMenu,
  });
});
export { composer as welcomeFeature };
