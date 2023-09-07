import { Menu } from "@grammyjs/menu";
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { cancel } from "./cancel.keyboard.js";
// eslint-disable-next-line import/no-cycle
import {
  BUY_CONVERSATION,
  buyConversation,
} from "../conversations/buy.conversation.js";

export const projectChildHealth = new Menu<Context>("project-child-health")
  .url("Узнать подробности на сайте", "https://ya.ru/")
  .row()
  .text("Купить - 7000р", async (ctx) => {
    ctx.session.selectedProduct = "Детское здоровье";
    await ctx.conversation.enter(BUY_CONVERSATION);
  });

export const projectZhkt = new Menu<Context>("project-zhkt")
  .url("Узнать подробности на сайте", "https://ya.ru/")
  .row()
  .text("Купить - 5000р", async (ctx) => {
    ctx.session.selectedProduct = "Методичка по работе с желчью";
    await ctx.conversation.enter(BUY_CONVERSATION);
  });

export const guideAptechka = new Menu<Context>("guide-aptechka")
  .url("Узнать подробности на сайте", "https://ya.ru/")
  .row()
  .text("Купить - 5000р", async (ctx) => {
    ctx.session.selectedProduct = "Гайд Аптечка для детей и взрослых";
    await ctx.conversation.enter(BUY_CONVERSATION);
  });

export const toProjectsMenu = new Menu<Context>("to-projects").submenu(
  "Подробнее о проектах ➡️",
  "projects-menu"
);

export const projectsMenu = new Menu<Context>("projects-menu")
  .submenu("Платные образовательные продукты", "study-projects-menu")
  .row()
  .submenu("Мои БАДы", "buds-projects-menu")
  .row()
  .submenu(`Бесплатные образовательные продукты`, "free-projects-menu");

export const studyProjectsMenu = new Menu<Context>("study-projects-menu")
  .text(`Проект  "Детское здоровье"`, async (ctx) => {
    await ctx.reply(
      `
  Этот проект - моя настоящая любовь и гордость. Он подходит для всех - родители, будущие родители, бабушки и дедушки, врачи, нутрициологи.
Всё доступно, понятно и простым языком.
Платформа, где провожу этот проект - закрытый тг канал и закрытый профиль в инстаграм`,
      { reply_markup: cancel }
    );

    setTimeout(async () => {
      await ctx.reply(
        `
  В рамках проекта вы научитесь:
 • самостоятельно различать достоверную информацию на сайтах про здоровье,
 • отличать компетентного врача от некомпетентного,
 • анализировать назначенное лечение

  Цель проекта - просвятить участников, дать все необходимые инструменты и знания для ориентировки в симтомах, которые помогут понимать врачей, как устроен детский
организм, какие фазы он проходит от зачатия до 18 лет, что характерно для каждой фазы и норма, а где отклонения и нужно принимать меры`,
        {
          reply_markup: projectChildHealth,
        }
      );
    }, 2000);
  })
  .row()
  .text(`Методичка по работе с желчью`, async (ctx) => {
    await ctx.reply(
      `
  Этот проект - моя настоящая любовь и гордость. Он подходит для всех - родители, будущие родители, бабушки и дедушки, врачи, нутрициологи.
Всё доступно, понятно и простым языком.
Платформа, где провожу этот проект - закрытый тг канал и закрытый профиль в инстаграм`,
      { reply_markup: cancel }
    );

    setTimeout(async () => {
      await ctx.reply(
        `
  В рамках проекта вы научитесь:
 • самостоятельно различать достоверную информацию на сайтах про здоровье,
 • отличать компетентного врача от некомпетентного,
 • анализировать назначенное лечение

  Цель проекта - просвятить участников, дать все необходимые инструменты и знания для ориентировки в симтомах, которые помогут понимать врачей, как устроен детский
организм, какие фазы он проходит от зачатия до 18 лет, что характерно для каждой фазы и норма, а где отклонения и нужно принимать меры`,
        {
          reply_markup: projectZhkt,
        }
      );
    }, 2000);
  })
  .row()
  .text(`Онлайн-курс "Детская нутрициология"`, async (ctx) => {
    await ctx.reply(
      "Детская нутрициология - это фундаментальные знания о здоровье и питании детей. В рамках проекта вы научитесь выявлять и корректировать дефициты, составлять рацион ребенка с учетом его индивидуальных потребностей. А также сможете распознавать и предупреждать у детей ранние признаки нездоровья и разбирать показатели анализов, говорить с врачом на одном языке.",
      {
        reply_markup: cancel,
      }
    );
    const keyboard = new InlineKeyboard().url(
      "Узнать подробности на сайте",
      "https://ya.ru/"
    );
    setTimeout(async () => {
      await ctx.reply(
        `
Программа рассчитана на
 - родителей - хотите вырастить здорового и умного ребёнка
 - если вы няня, повар, специалист детской физической культуры и хотите работать более комплексно
 - нутрициологов - стремитесь расширить практику и помогать детям`,
        {
          reply_markup: keyboard,
        }
      );
    }, 2000);
  })
  .row()
  .text(`Онлайн-курс "Семейная нутрициология"`, async (ctx) => {
    await ctx.reply(
      `Семейная нутрициология -залог здорового будущего!
На курсе рассматриваем все системы организма, как единое целое. Работаем комплексно с симптомами и первопричиной - это обеспечит искоренение болезни, а не просто уберёт симптомы..`,
      {
        reply_markup: cancel,
      }
    );
    const keyboard = new InlineKeyboard().url(
      "Узнать подробности на сайте",
      "https://ya.ru/"
    );
    setTimeout(async () => {
      await ctx.reply(
        `
Если вы:
 - мама, мечтаете освоить полезную для своей семьи и востребованную в будущем специальность уже сейчас,
 - врач, хотите расширить свой инструментарий
 - хотите заложить фундамент здоровья для всех поколений вашей семьи,
 - уже работаете с детьми и родителями, хотите перейти на новый уровень экспертизы и увеличить доход,
то вы пришли по адресу!`,
        {
          reply_markup: keyboard,
        }
      );
    }, 2000);
  })
  .row()
  .text(`Гайд "Аптечка для детей и взрослых"`, async (ctx) => {
    await ctx.reply(
      `
  Этот проект - моя настоящая любовь и гордость. Он подходит для всех - родители, будущие родители, бабушки и дедушки, врачи, нутрициологи.
Всё доступно, понятно и простым языком.
Платформа, где провожу этот проект - закрытый тг канал и закрытый профиль в инстаграм`,
      { reply_markup: cancel }
    );

    setTimeout(async () => {
      await ctx.reply(
        `
  В рамках проекта вы научитесь:
 • самостоятельно различать достоверную информацию на сайтах про здоровье,
 • отличать компетентного врача от некомпетентного,
 • анализировать назначенное лечение

  Цель проекта - просвятить участников, дать все необходимые инструменты и знания для ориентировки в симтомах, которые помогут понимать врачей, как устроен детский
организм, какие фазы он проходит от зачатия до 18 лет, что характерно для каждой фазы и норма, а где отклонения и нужно принимать меры`,
        {
          reply_markup: guideAptechka,
        }
      );
    }, 2000);
  })
  .row()
  .back("⬅️ Назад");

export const budsProjectsMenu = new Menu<Context>("buds-projects-menu")
  .text("Лецитин", async (ctx) => {
    await ctx.reply(
      `Показаний к употреблению лецитина целая куча, в то время, как противопоказаний практически нет!
Из лецитина состоит половина нашей печени, треть головного мозга и его оболочки, около 17% всех наших нервных тканей.
Без лецитина человек быстро стареет, тяжело болеет, при том ему невозможно помочь лекарствами и витаминами, пока недостаток лецитина не будет восполнен.
У беременных потребность в лецитине возрастает. Потому что организму плода нужно развивать все свои системы, а лецитин поможет клеткам нервной системы, мозга и ЖКТ. Лецитин показан деткам с гипоксическими и имшемическими поражениями ЦНС: прибавка в весе, увеличение объема движений, появление рефлексов.`,
      {
        reply_markup: cancel,
      }
    );
    const keyboard = new InlineKeyboard()
      .url("Заказать на ОЗОН", "https://www.ozon.ru/")
      .row()
      .url("Заказать на ВБ", "https://www.wildberries.ru/");
    setTimeout(async () => {
      await ctx.reply(
        `
▪️ Ещё лецитин крайне необходим для нормальной работы митохондрий - клеточные энергостанции
▪️ Уменьшает количество плохого холестерина в крови
▪️ Лецитин регулирует процесс липидного метаболизма, способствуя сжиганию ненужного жира
▪️ Лецитин стимулирует выработку желчных кислот из холестерина
▪️ Помогает в борьбе с артрозом и артритом суставов
▪️ Избавляет от хронических головных болей, нормализует работу сердечно-сосудистой системы
▪️ Стимулирует выработку важных для человека гормонов
▪️ Лецитин повышает иммунитет
▪️ Способствует правильному усвоению поступающих с пищей витаминов
▪️ Оказывает положительное влияние на мужскую и женскую репродуктивные системы
▪️Улучшает работу печени нормализует работу ЖКТ
Мы с командой создали суперформулу с хорошими дозировками и приятным вкусом, которая закроет потребность вашего организма в лецитине.`,
        {
          reply_markup: keyboard,
        }
      );
    }, 2000);
  })
  .row()
  .text("Магниевая вода", async (ctx) => {
    await ctx.reply(
      `Моя магниевая вода - это полный аналог «Donat Mg», который ни капельки не уступает по составу и дозировкам! НО в цене в три раза выгоднее!
Магниевая вода поможет при проблемах ЖКТ (особенно при изжоге, запорах), для работы сердечно-сосудистой и нервной системы (тревожность, апатия, истерики), для костей (боли роста), мышц (спазм, тики), ногтей и волос.
Еще магний регулирует уровень сахара, стимулирует клеточную регенерацию и улучшает сон.`,
      {
        reply_markup: cancel,
      }
    );
    const keyboard = new InlineKeyboard().url(
      "Заказать на ОЗОН",
      "https://www.ozon.ru/"
    );
    setTimeout(async () => {
      await ctx.reply(
        `
  Суточная дозировка магния содержится в 180 мл воды.
  Магниевая вода - лекарство, из-за высокой концентрации магния её нельзя много пить - будет слабительный эффект.
Если пить магниевую воду согласно рекомендации, после первого же курса (3-4 месяца) жизнь заиграет новыми красками - гарантирую  энергию, правильную работу всего ЖКТ, сердечной и нервных систем!`,
        {
          reply_markup: keyboard,
        }
      );
    }, 2000);
  })
  .row()
  .back("⬅️ Назад");

export const subscribeToChannel = new Menu<Context>("subscribe-to-channel")
  .url("Ссылка на канал", "https://t.me/alla_dietolog")
  .row()
  .text(
    (ctx) =>
      `Проверить статус ${ctx.session.subscribedToChannel ? "✅" : "❌"} `,
    async (ctx) => {
      const inPublic = await ctx.api.getChatMember(
        "@alla_dietolog",
        ctx.chat!.id
      );
      if (
        inPublic.status === "member" ||
        inPublic.status === "creator" ||
        inPublic.status === "administrator"
      ) {
        ctx.session.subscribedToChannel = true;
        ctx.menu.update();
        await ctx.replyWithDocument(
          "BQACAgIAAxkBAAILA2T4PJtJsmIBPpENrt-AdLphGoRGAAL5LQAC2aLASxaC-5y6TMvnMAQ"
        );
      }
    }
  );
export const subscribeToChannelVitD = new Menu<Context>("subscribe-to-channel")
  .url("Ссылка на канал", "https://t.me/alla_dietolog")
  .row()
  .text(
    (ctx) =>
      `Проверить статус ${ctx.session.subscribedToChannel ? "✅" : "❌"} `,
    async (ctx) => {
      const inPublic = await ctx.api.getChatMember(
        "@alla_dietolog",
        ctx.chat!.id
      );
      if (
        inPublic.status === "member" ||
        inPublic.status === "creator" ||
        inPublic.status === "administrator"
      ) {
        ctx.session.subscribedToChannel = true;
        ctx.menu.update();
        await ctx.replyWithDocument(
          "BQACAgIAAxkBAAILAWT4OoiCOZlbUBPhTqzIE7zJH5SwAAIHLgAC2aLASy0SMInCDlYuMAQ"
        );
      }
    }
  );

export const freeProjectsMenu = new Menu<Context>("free-projects-menu")
  .text("Гайд по витамину Д", async (ctx) => {
    if (ctx.session.subscribedToChannel) {
      await ctx.reply("Заберите гайд");
      await ctx.replyWithDocument(
        "BQACAgIAAxkBAAILAWT4OoiCOZlbUBPhTqzIE7zJH5SwAAIHLgAC2aLASy0SMInCDlYuMAQ"
      );
    } else {
      await ctx.reply("Подпишитель на канал", {
        reply_markup: subscribeToChannelVitD,
      });
    }
  })
  .row()
  .text("Гайд по расшифровке анализов", async (ctx) => {
    if (ctx.session.subscribedToChannel) {
      await ctx.reply("Заберите гайд");
      await ctx.replyWithDocument(
        "BQACAgIAAxkBAAILA2T4PJtJsmIBPpENrt-AdLphGoRGAAL5LQAC2aLASxaC-5y6TMvnMAQ"
      );
    } else {
      await ctx.reply("Подпишитель на канал", {
        reply_markup: subscribeToChannel,
      });
    }
  })
  .row()
  .back("⬅️ Назад");
