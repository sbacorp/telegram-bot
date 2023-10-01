/* eslint-disable no-use-before-define */
import { Menu } from "@grammyjs/menu";
import { Context } from "../context.js";

export const whatStateIndividual = async (ctx: Context) => {
  await ctx.reply(
    `➡️ Комплексное обследование и метаболическая коррекция нутрицевтиками, диетические рекомендации

➡️ Лечение синдрома поликистозных яичников (СПКЯ), нутрициологический подход

➡️ Подготовка к беременности

➡️ Подготовка к ЭКО в любом возрасте

➡️ Лечение сложных случаев рецидивирующих хронических инфекций после многочисленных неудачных попыток лечения (герпес, вирус Эпштейн-Барра , Цмв)- комплексный подход

➡️ Лечение метаболического синдрома, инсулинорезистентности и ожирения у женщин и мужчин

➡️Вопросы снижения веса даже при отсутствии видимого ожирения

➡️ Выявление и лечение синдрома «хронической усталости» у женщин и мужчин. Коррекция нутрицевтиками

➡️ Выяснение и устранение причин нарушений менструального цикла, аменореи, болезненных менструаций (дисменореи), обильных менструаций (меноррагий)

➡️ Коррекция дислипидемий, повышенного холестерина. Нутрициологический подход`,
    {
      reply_markup: individualStateMenu,
    }
  );
};

export const conditions = async (ctx: Context) => {
  await ctx.reply(`
Формат ведения  предполагает общение в режиме переписки в любое время и в любом количестве.

Если вы не готовы оплатить в среднем анализы на 10-15 тысяч рублей, купить добавок в среднем на 25-30 тысяч рублей, а также принимать в день большое количество добавок, иногда их число достигает 15 штук в день, в зависимости от вашего состояния, то не отнимайте мое время и не тратьте ваши деньги.
  `);
  setTimeout(async () => {
    await ctx.reply(
      `
Стоимость ведения - 50.000р (1 месяц)
`
    );
  }, 2000);

  setTimeout(async () => {
    await ctx.reply(
      `
Нажимая кнопку «записаться на консультацию» вы соглашаетесь с условиями.
`,
      {
        reply_markup: individualConditionsMenu,
      }
    );
  }, 2500);
};

export const individualStateMenu = new Menu<Context>("individual-state-menu")
  .text("Важно! Условия", async (ctx) => {
    await conditions(ctx);
  })
  .row()
  .text("Записаться на консультацию", async (ctx) => {
    return ctx.conversation.enter("individual");
  });
export const individualConditionsMenu = new Menu<Context>(
  "individual-conditions-menu"
)
  .row()
  .text("С какими состояниями я работаю", async (ctx) => {
    await whatStateIndividual(ctx);
  })
  .row()
  .text("Записаться на консультацию", async (ctx) => {
    return ctx.conversation.enter("individual");
  });

export const individualMenu = new Menu<Context>("individual-menu")
  .text("С какими состояниями я работаю", async (ctx) => {
    await whatStateIndividual(ctx);
  })
  .row()
  .text("Важно! Условия", async (ctx) => {
    await conditions(ctx);
  })
  .row()
  .text("Записаться на консультацию", async (ctx) => {
    return ctx.conversation.enter("individual");
  });
