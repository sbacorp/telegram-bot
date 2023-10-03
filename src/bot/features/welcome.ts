import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { findOrCreateUser } from "../../server/utils.js";
import {
  consultationMenu,
  groupProject,
  mainMenu,
} from "../keyboards/index.js";
import { cancel } from "../keyboards/cancel.keyboard.js";
import { individualMenu } from "../keyboards/individual-menu.keyboard.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async (ctx) => {
  const chatId = ctx.chat.id;
  const name = ctx.chat.username!;
  const reference =
    ctx.message?.text?.split(" ")[1] === "consultation"
      ? ""
      : ctx.message?.text?.split(" ")[1];
  const isUser = await findOrCreateUser(chatId, name, reference);
  if (!isUser) {
    await ctx.reply(`
Здравствуйте
Меня зовут Алла Чеканова.
Я - семейный и детский  нутрициолог, клинический психолог и эксперт в области превентивной медицины международного уровня.

🌿 8 лет я профессионально помогаю людям обрести здоровье.
🌿 Я успешно завершила более 200 обучений.
🌿 Создала 2 программы профессиональной подготовки
🌿 Подготовила более 3000 специалистов
🌿 Разработала собственную линейку витаминов
🌿 Произвожу лечебную магниевую воду с идеальным составом и ценой
`);
  }
  if (ctx.message?.text?.split(" ")[1] === "consultation") {
    return ctx.reply(
      `Вам нужен проводник в мир здоровья и энергии? - приходите ко мне на консультацию!

Формат единоразовой консультации включает в себя:
 - полную оценку вашего организма со стороны эндокринной системы,
 - анализ комплексного состояния ЖКТ,
 - выявление дефицитов витаминов,
 - выявление дефицитов микронутриентов,
 - возможности корректировки всего состояния организма.`,
      {
        reply_markup: consultationMenu,
      }
    );
  }
  if (ctx.message?.text?.split(" ")[1] === "groupIntro") {
    await ctx.reply(
      `Запустите процесс устойчивой трансформации жизни, подтяните здоровье, разберете хронические заболевания и предотвратите риски других болезней всего за 3 недели!
Если вы хотите разобраться в своем организме, распутать клубочки, которые тянутся из далекого прошлого - вам ко мне!`,
      {
        reply_markup: cancel,
      }
    );
    return ctx.reply(
      `
В течение программы вы сможете:
➡️ Понять свой организм
➡️ Продлить молодость
➡️ Сохранить здоровье
➡️ Улучшить сон
➡️ Изменить качество тела
➡️ Избавиться от пищевых зависимостей
➡️ Победить стресс`,
      {
        reply_markup: groupProject,
      }
    );
  }
  if (ctx.message?.text?.split(" ")[1] === "  ") {
    return ctx.reply(
      `Хотите поработать над своим здоровьем целый месяц вместе со мной?
Формат месячного ведения включает в себя:
 - полную оценку вашего организма со стороны эндокринной системы,
 - анализ комплексного состояния ЖКТ,
 - выявление дефицитов витаминов,
 - выявление дефицитов микронутриентов,
 - возможности корректировки всего состояния организма.`,
      {
        reply_markup: individualMenu,
      }
    );
  }
  await ctx.conversation.exit();
  return ctx.replyWithMarkdownV2("*Выберите то, что вам нужно*", {
    reply_markup: mainMenu,
  });
});
export { composer as welcomeFeature };
