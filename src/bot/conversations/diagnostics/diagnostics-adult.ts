/* eslint-disable import/order */
/* eslint-disable no-else-return */
/* eslint-disable import/no-cycle */
/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import {
  mainMenu,
  yesNo,
  next,
  canceldiagnostic,
} from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { diagnosticConversationAdult } from "./diagnostic-adult.conversation.js";
import { Question } from "#root/typing.js";

export const DIAGNOSTIC_DEFICIT_CONVERSATION_ADULT = "diagnosticDeficitAdult";
export const DIAGNOSTIC_THYROID_CONVERSATION_ADULT = "diagnosticThyroidAdult";
export const DIAGNOSTIC_INSULIN_CONVERSATION_ADULT = "diagnosticInsulinAdult";
export const DIAGNOSTIC_ZHKT_CONVERSATION_ADULT = "diagnosticZhktAdult";

const questionsZhkt: Question[] = [
  {
    question: "Страдаете от повышенной потливости?",
    answer:
      "Ваш организм испытывает окислительный стресс, также органы детоксикации (печень, почки, кишечник, кожа и др.) не справляются с процессом детоксикации.",
  },
  {
    question: "В уголках рта часто образуются трещины (“заеды”)?",
    answer:
      "У вас подозрение на дисбиоз кишечника и дефицит витамина B2. Дисбиоз может значительно снижать качество жизни. А витамин B2 важен для липидного и углеводного обмена, функционирования нервной системы, зрения, кожи, слизистых оболочек, ногтей и волос.",
  },
  {
    question: "Вы значительно хуже видите в сумерках?",
    answer:
      "Удивительно, но речь о не связанных со зрением состояниях. Это признак застоя желчи и дефицита жирорастворимых витаминов.",
  },
  {
    question: "Внезапно появились аллергические реакции?",
    answer:
      "Здесь точно есть проблема с процессом желчеоттока. Также можно подозревать наличие паразитов",
  },
  {
    question: "Часто страдаете от головных болей?",
    answer:
      "Ваше тело сообщает вам о нарушениях в работе системы детоксикации, проблеме с углеводным обменом. Также, возможно, организм перегружен аммиаком или ацетоном.",
  },
  {
    question: "Диарея или запоры стали привычными для вас?",
    answer:
      "К ним приводят нарушение работы желчного пузыря, а также непереносимость некоторых продуктов в вашем рационе.",
  },
  {
    question: "Метеоризм снижает качество вашей жизни?",
    answer:
      "Следствие непереносимости продуктов в рационе, возможного синдрома избыточного бактериального роста (СИБР) или/и синдрома избыточного грибкового роста (СИГР).",
  },
  {
    question: "Часто испытываете отрыжку или изжогу?",
    answer:
      "Такой эффект дает сниженная кислотность в желудке, большое количество углеводов в рационе, недостаточное пережевывание пищи (еда на ходу). Может также свидетельствовать о рефлюксе!",
  },
  {
    question: "Непрекращающийся дерматит или экзема “украшают” вашу кожу?",
    answer:
      "Важно восстановить работу ЖКТ, проанализировать рацион на присутствие непереносимых продуктов. Также, возможно, это симптом паразитоза.",
  },
  {
    question: "Вы немного едите, но лишний вес - всегда с вами?",
    answer:
      "Признак глобальной проблемы с ЖКТ: нарушении углеводного обмена, застое желчи, нездоровом микробиоме кишечника.",
  },
  {
    question: "Вы ходите в туалет по-большому реже одного раза в день?",
    answer: "Яркое следствие проблем с желчным пузырем.",
  },
  {
    question: "В вашей истории есть аутоиммунные заболевания?",
    answer:
      "Важно искать причину в проницаемости кишечной стенки. Подозрение на  непереносимость глютена.",
  },
  {
    question:
      "Часто страдаете от болей в животе, спровоцированных спазмами и газами?",
    answer:
      "Проверьте здоровье желчного пузыря, а также ЖКТ на СИБР и СИГР. Кроме того, это может быть признак паразитоза.",
  },
  {
    question: "На языке присутствует белый налет?",
    answer:
      "Распространенный признак кандидоза.Свидетельство нарушений в работе пищеварительной системы, в частности указывает на проблему с кислотностью и нездоровье желчного пузыря",
  },
  {
    question: "Желтый налет на языке вызывает тревогу?",
    answer:
      "Один из признаков патологии желчного пузыря, приводящей к забросу желчи.",
  },
  {
    question: "Желтые склеры глаз?",
    answer:
      "Признак генетического заболевания - синдрома Жильбера, который может привести к желчнокаменной болезни, холециститу и дуодениту.",
  },
  {
    question: "Вы уже знаете, что у вас кандидоз?",
    answer:
      "Его вызывают застой желчи, критичное снижение кислотности, синдромы избыточного грибкового и бактериального роста. Пора серьезно заняться здоровьем ЖКТ!",
  },
  {
    question:
      "Вы принимали антибиотики не менее одного раза за последние 6 месяцев?",
    answer:
      "Возникают риски синдрома избыточного грибкового и бактериального роста.",
  },
  {
    question: "Есть нарушения пигментации кожи?",
    answer:
      "К такому эффекту приводят нарушения в работе желчного пузыря, в частности застой желчи, а также дефицит витамина D. Он играет ключевую роль в поддержании здоровья костей и иммунной системы",
  },
  {
    question: "Кал часто не тонет и пачкает стенки унитаза?",
    answer:
      "Наглядное свидетельство ферментативной недостаточности, застоях желчи, СИГР или СИБР.",
  },
  {
    question: "Кожа на пятках очень сухая, часто образовываются натоптыши?",
    answer:
      "Скорее всего, проблема скрыта в состоянии желчного пузыря, а также присутствует дефицит жирорастворимых витаминов.",
  },
  {
    question: "В вашем рационе мало овощей?",
    answer: "У вас наверняка дисбиоз кишечника!",
  },
  {
    question: "Вы часто пьете после еды?",
    answer: "Такая привычка - прямой путь к проблемам с ЖКТ",
  },
  {
    question: "В вашем рационе много сладких продуктов?",
    answer:
      "Нарушения углеводного обмена, инсулинорезистентность и дисбиоз кишечника - результат пристрастия к фруктам и десертам.",
  },
  {
    question: "Вы едите более 4 раз в день, включая перекусы?",
    answer:
      "Частое питание приводит к сбоям в гормональной системе, нарушениям углеводного обмена (Привет, инсулинорезистентность!), а также дисбиозу кишечника!",
  },
];
const questionsDeficit: Question[] = [
  {
    question: "На ваших ногтях есть лунки?",
    answer: `Возможно, присутствует риск гипоксии.
Также сдайте кровь, чтобы проверить гемоглобин.
Скорее всего, он понижен.`,
  },
  {
    question: "На ногтях - белые точки?",
    answer: `Это признак дефицита цинка - минерала, отвечающего за правильное пищеварение, заживление ран, поддерживающего иммунитет в борьбе с бактериями и вирусами, регулирующего выработку гормонов.`,
  },
  {
    question: "В уголках рта часто образуются трещины (“заеды”)?",
    answer: `У вас подозрение на дисбиоз кишечника и дефицит витамина B2.
Дисбиоз может значительно снижать качество жизни.
А витамин B2 важен для липидного и углеводного обмена, функционирования нервной системы, зрения, кожи, слизистых оболочек, ногтей и волос.`,
  },
  {
    question: "Если “сыпятся” волосы?",
    answer: `Обильное выпадение волос указывает на проблемы с гормонами щитовидной железы, дефицит белка или проблемой с ферментом 5-альфа-редуктаза.`,
  },
  {
    question: "Беспокоит кровоточивость десен?",
    answer: `Яркий признак дефицита витамина С. Он способствует поддержанию иммунной системы, улучшает абсорбцию железа и дополняет антиоксидантную защиту организма.`,
  },
  {
    question: "У вас рано появилась седина?",
    answer: `Подозрение на окислительный стресс и дефицит меди. Медь играет ключевую роль в образовании красных кровяных клеток и поддержании здоровья нервной системы, костей и суставов.`,
  },
  {
    question: "Часто отмечаете у себя судороги, тики, мышечную слабость?",
    answer: `Дефицит магния налицо! Магний необходим для поддержания здоровья мышц, нервной системы и функционирования сердечно-сосудистой системы, участвует в множестве биохимических процессов в организме.`,
  },
  {
    question: "Ваш язык напоминает географическую карту?",
    answer: `Неоднородная поверхность языка свидетельствует о дефицитах витаминов группы B! Витамины группы B играют важную роль в метаболизме, функционировании нервной системы и образовании новых клеток организма`,
  },
  {
    question:
      "Температура тела длительное время находится в диапазоне 37,1—38,0 °C?",
    answer: `Речь о субфебрильной температуре. Это не индивидуальная особенность. Речь о хроническом вирусной нагрузке.`,
  },
  {
    question: "Часто и легко подхватываете простуды?",
    answer: `Очевидное следствие сниженного иммунитета и дефицита нескольких витаминов!`,
  },
  {
    question: "Беспокоит кровоточивость десен?",
    answer: `Яркий признак дефицита витамина С. Он способствует поддержанию иммунной системы, улучшает абсорбцию железа и дополняет антиоксидантную защиту организма.`,
  },
  {
    question: "Проблемы с артериальным давлением?",
    answer: `Речь о глобальном дефиците витаминов и комплекса аминокислот.`,
  },
  {
    question: "Вы значительно хуже видите в сумерках?",
    answer: `Удивительно, но речь о не связанных со зрением состояниях. Это признак застоя желчи и дефицита жирорастворимых витаминов.`,
  },
  {
    question:
      "Ломкие, сухие, непослушные, секущиеся волосы, а также ломкие ногти?",
    answer: `Яркое свидетельство дефицита белка и серы. Сера важна для образования белков и аминокислот, участвует в детоксикации, поддерживая здоровье печени.`,
  },
  {
    question:
      "У вас рано появились морщины, хотя вы всегда ухаживали за кожей?",
    answer: `Это свидетельство процессов гликации в организме. Плюс признак дефицита коллагена - важного белка соединительных тканей, поддерживающего упругость кожи, здоровье суставов и структуру волос, ногтей.`,
  },
  {
    question: "Кожа на теле часто гусиная или шелушится?",
    answer: `Налицо нарушение усвоения жирорастворимых витаминов.`,
  },
  {
    question: "Вы склонны к депрессии и тревоге?",
    answer: `Обязательно обратитесь к психиатру и психотерапевту. А также обратите внимание на необходимость коррекции нарушений в работе нейромедиаторов и возможный дефицит витаминов группы B.`,
  },
  {
    question: "Язык покрыт множественными трещинами?",
    answer: `Организм сообщает о дефиците кофакторов железа, которые участвуют  в транспорте кислорода к клеткам и тканям, обеспечивая нормальное функционирование клеточного дыхания и энергетического обмена`,
  },
  {
    question: "Постоянно испытываете слабость?",
    answer: `Так могут проявляться анемия и нарушения в работе щитовидной железы.`,
  },

  {
    question: "Вы привыкли к регулярным болям во время менструации?",
    answer: `Нет, это не норма. Пора заняться здоровьем желчного пузыря. Сдать кровь, чтобы исключить анемию и дефициты. Удостовериться, что процессы детоксикации в теле работают эффективно.`,
  },

  {
    question: "Поняли, что секса хочется меньше (и дело не в партнере)?",
    answer: `Так тело сообщает о гормональном дисбалансе. Сниженное либидо также говорит о наличии дефицитов.`,
  },

  {
    question: "Испытываете сонливость в любое время суток?",
    answer: `Сонливость может являться проявлением анемии, проблем с щитовидной железой и надпочечниками. Также указывает на наличие дефицитов.`,
  },
  {
    question: "Вы исключили из рациона животные продукты?",
    answer: `Это может привести к дефициту половых гормонов, дефициту белка, дефицитам витаминов.`,
  },
];
const questionsThyroid: Question[] = [
  {
    question: "Если “сыпятся” волосы?",
    answer: `Обильное выпадение волос указывает на проблемы с гормонами щитовидной железы, дефицит белка или проблемой с ферментом 5-альфа-редуктаза.`,
  },
  {
    question: "У вас редкое мочеиспускание?",
    answer: `Не повод для гордости. Скорее всего, у вас нарушения в работе почек - они не обеспечивают эффективную детоксикацию.`,
  },
  {
    question: "Страдаете от повышенной потливости?",
    answer: `Ваш организм испытывает окислительный стресс, также органы детоксикации (печень, почки, кишечник, кожа и др.) не справляются с процессом детоксикации.`,
  },
  {
    question: "На языке часто остаются отпечатки зубов?",
    answer: `Пора посетить эндокринолога -  щитовидная железа сообщает так о нарушениях в своей работе.`,
  },
  {
    question: "Не получается зачать ребенка длительное время?",
    answer: `Важно обратить внимание и проверить работу гормональной системы, щитовидную железу, дефициты минералов и витаминов.`,
  },
  {
    question: "Постоянно испытываете слабость?",
    answer: `Так могут проявляться анемия и нарушения в работе щитовидной железы.`,
  },
  {
    question: "На спине и лице часто образуются угри, а вы уже не подросток?",
    answer: `Во-первых, нарушен процесс детоксикации. Во-вторых, есть проблема с пищеварительной системой, возможно, непереносимость молочных продуктов и глютена.`,
  },
  {
    question:
      "Часто отекают ноги, а следы от резинок носков держатся несколько часов?",
    answer: `Это прямой сигнал о проблемах с щитовидной железой.`,
  },
  {
    question: "Вы привыкли к регулярным болям во время менструации?",
    answer: `Нет, это не норма. Пора заняться здоровьем желчного пузыря. Сдать кровь, чтобы исключить анемию и дефициты. Удостовериться, что процессы детоксикации в теле работают эффективно`,
  },
  {
    question: "Заметили за собой снижение когнитивных функций?",
    answer: `Таков печальный симптом нескольких состояний - проблем с щитовидной железой, кандидоза, некоторых дефицитов и инсулинорезистентности.`,
  },
  {
    question: "Поняли, что секса хочется меньше (и дело не в партнере)?",
    answer: `Так тело сообщает о гормональном дисбалансе. Сниженное либидо также говорит о наличии дефицитов.`,
  },
  {
    question: "Не переносите холод?",
    answer: `Сигнал о неполадках в работе щитовидной железы.`,
  },
  {
    question: "Испытываете сонливость в любое время суток?",
    answer: `Сонливость может являться проявлением анемии, проблем с щитовидной железой и надпочечниками. Также указывает на наличие дефицитов.`,
  },
  {
    question: "Всегда просыпаетесь среди ночи, чтобы сходить в туалет?",
    answer: `Так проявляют себя проблемы с надпочечниками.`,
  },
  {
    question: "Не высыпаетесь, даже если долго спите!",
    answer: `Важный сигнал о сбое в работе надпочечников!`,
  },
  {
    question: "Вы пьете более 2 чашек кофе в день?",
    answer: `Присмотритесь, может быть, у  вас уже есть другие признаки обезвоживания и симптомы проблем с надпочечниками?`,
  },
  {
    question: "Вы едите более 4 раз в день, включая перекусы?",
    answer: `Частое питание приводит к сбоям в гормональной системе, нарушениям углеводного обмена (Привет, инсулинорезистентность!), а также дисбиозу кишечника!`,
  },
];
const questionsInsulin: Question[] = [
  {
    question:
      "Кожа на сгибах локтей и в промежностях имеет более темный оттенок?",
    answer: `Акантоз - точный признак гарантированной проблемы нарушения углеводного обмена (причины метаболического синдрома и инсулинорезистентности).`,
  },
  {
    question: "Испытываете неудержимую тягу к сладкому?",
    answer: `Нужно проверить свой организм на инсулинорезистентность. Кандида также питается сладким и “заказывает” его нашему мозгу.`,
  },
  {
    question:
      "У вас рано появились морщины, хотя вы всегда ухаживали за кожей?",
    answer: `Это свидетельство процессов гликации в организме. Плюс признак дефицита коллагена - важного белка соединительных тканей, поддерживающего упругость кожи, здоровье суставов и структуру волос, ногтей.`,
  },
  {
    question: "Диагностирован сахарный диабет II типа и есть лишний вес?",
    answer: `К сожалению, это прямое следствие нарушения углеводного обмена.`,
  },
  {
    question: "Заметили за собой снижение когнитивных функций?",
    answer: `Таков печальный симптом нескольких состояний - проблем с щитовидной железой, кандидоза, некоторых дефицитов и инсулинорезистентности.`,
  },
];

export async function diagnosticZhktConversationAdult(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику ЖКТ</b>", {
    reply_markup: canceldiagnostic,
  });
  // eslint-disable-next-line unicorn/no-for-loop, no-plusplus
  for (let index = 0; index < questionsZhkt.length; index++) {
    await ctx.reply(questionsZhkt[index].question, {
      reply_markup: yesNo,
    });
    answer = await conversation.waitForCallbackQuery(["Да", "Нет"], {
      otherwise: async (ctx) => {
        if (ctx.message?.text === "🔁 Начать сначала") {
          return diagnosticZhktConversationAdult(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationAdult(conversation, ctx);
        } else
          await ctx.reply("Используйте кнопки", {
            reply_markup: yesNo,
          });
      },
    });
    if (answer.match === "Да") {
      await ctx.reply(questionsZhkt[index].answer, { reply_markup: next });
      const nextAnswer = await conversation.waitForCallbackQuery("next", {
        otherwise: async (ctx) => {
          if (ctx.message?.text === "🔁 Начать сначала") {
            return diagnosticZhktConversationAdult(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationAdult(conversation, ctx);
          }
          // eslint-disable-next-line no-return-await
          else
            await ctx.reply("Используйте кнопки", {
              reply_markup: next,
            });
        },
      });
      if (nextAnswer.match === "next") {
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (answer.match === "Нет") {
      // eslint-disable-next-line no-continue
      continue;
    }
  }

  await ctx.reply(
    `Бот проанализировал ваши ответы.
Есть риски образования, развития и усугубления заболеваний, связанных с ЖКТ. Чтобы помочь себе и своему организму решить проблемы с ЖКТ, забирайте мой гайд по кнопке ниже и внедряйте рекомендации в свою жизнь.`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide");

  if (guideAnswer.match === "guide") {
    return ctx.replyWithDocument(
      "BQACAgIAAxkBAAIUuGUNhV3gtfQ5OtDzWXY_SDJ6w3iKAAKfNAACPlFoSPPFJtCefiq8MAQ",
      {
        reply_markup: cancel,
      }
    );
  }
}
export async function diagnosticDeficitConversationAdult(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику Дифицитов</b>", {
    reply_markup: canceldiagnostic,
  });
  // eslint-disable-next-line unicorn/no-for-loop, no-plusplus
  for (let index = 0; index < questionsDeficit.length; index++) {
    await ctx.reply(questionsDeficit[index].question, {
      reply_markup: yesNo,
    });
    answer = await conversation.waitForCallbackQuery(["Да", "Нет"], {
      otherwise: async (ctx) => {
        if (ctx.message?.text === "🔁 Начать сначала") {
          return diagnosticDeficitConversationAdult(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationAdult(conversation, ctx);
        } else
          await ctx.reply("Используйте кнопки", {
            reply_markup: yesNo,
          });
      },
    });
    if (answer.match === "Да") {
      await ctx.reply(questionsThyroid[index].answer, { reply_markup: next });
      const nextAnswer = await conversation.waitForCallbackQuery("next", {
        otherwise: async (ctx) => {
          if (ctx.message?.text === "🔁 Начать сначала") {
            return diagnosticDeficitConversationAdult(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationAdult(conversation, ctx);
          }
          // eslint-disable-next-line no-return-await
          else
            await ctx.reply("Используйте кнопки", {
              reply_markup: next,
            });
        },
      });
      if (nextAnswer.match === "next") {
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (answer.match === "Нет") {
      // eslint-disable-next-line no-continue
      continue;
    }
  }
  await ctx.reply(
    `Бот проанализировал ваши ответы.
Есть риски появления и усугубления болезней на фоне дефицитов разных групп витамин. Чтобы помочь себе и своему организму решить проблемы с дефицитами, забирайте мой гайд по кнопке ниже и внедряйте рекомендации в свою жизнь.`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide");

  if (guideAnswer.match === "guide") {
    return ctx.replyWithDocument(
      "BQACAgIAAxkBAAIYCmURP-_IJt7yjRxi3wd2ID7jlFbTAAICOQACenmISGL2KzWSB45ZMAQ",
      {
        reply_markup: cancel,
      }
    );
  }
}
export async function diagnosticThyroidConversationAdult(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику Щитовидки и гормонов</b>", {
    reply_markup: canceldiagnostic,
  });
  // eslint-disable-next-line unicorn/no-for-loop, no-plusplus
  for (let index = 0; index < questionsThyroid.length; index++) {
    await ctx.reply(questionsThyroid[index].question, {
      reply_markup: yesNo,
    });
    answer = await conversation.waitForCallbackQuery(["Да", "Нет"], {
      otherwise: async (ctx) => {
        if (ctx.message?.text === "🔁 Начать сначала") {
          return diagnosticThyroidConversationAdult(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationAdult(conversation, ctx);
        } else
          await ctx.reply("Используйте кнопки", {
            reply_markup: yesNo,
          });
      },
    });
    if (answer.match === "Да") {
      await ctx.reply(questionsThyroid[index].answer, { reply_markup: next });
      const nextAnswer = await conversation.waitForCallbackQuery("next", {
        otherwise: async (ctx) => {
          if (ctx.message?.text === "🔁 Начать сначала") {
            return diagnosticThyroidConversationAdult(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationAdult(conversation, ctx);
          }
          // eslint-disable-next-line no-return-await
          else
            await ctx.reply("Используйте кнопки", {
              reply_markup: next,
            });
        },
      });
      if (nextAnswer.match === "next") {
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (answer.match === "Нет") {
      // eslint-disable-next-line no-continue
      continue;
    }
  }
  await ctx.reply(
    `Бот проанализировал ваши ответы.
Есть риски образования, развития и усугубления заболеваний, связанных с гормонами и щитовидной железой. Чтобы помочь себе и своему организму решить эти проблемы, забирайте мой гайд по кнопке ниже и внедряйте рекомендации в свою жизнь.`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide");

  if (guideAnswer.match === "guide") {
    return ctx.replyWithDocument(
      "BQACAgIAAxkBAAIUvGUNhtkde0NBu5suUK1bMk2daHSKAAKuNAACPlFoSNvUtSTsKNmgMAQ",
      {
        reply_markup: cancel,
      }
    );
  }
}
export async function diagnosticInsulinConversationAdult(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику Инсулина</b>", {
    reply_markup: canceldiagnostic,
  });
  // eslint-disable-next-line unicorn/no-for-loop, no-plusplus
  for (let index = 0; index < questionsInsulin.length; index++) {
    await ctx.reply(questionsInsulin[index].question, {
      reply_markup: yesNo,
    });
    answer = await conversation.waitForCallbackQuery(["Да", "Нет"], {
      otherwise: async (ctx) => {
        if (ctx.message?.text === "🔁 Начать сначала") {
          return diagnosticInsulinConversationAdult(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationAdult(conversation, ctx);
        } else
          await ctx.reply("Используйте кнопки", {
            reply_markup: yesNo,
          });
      },
    });
    if (answer.match === "Да") {
      await ctx.reply(questionsInsulin[index].answer, { reply_markup: next });
      const nextAnswer = await conversation.waitForCallbackQuery("next", {
        otherwise: async (ctx) => {
          if (ctx.message?.text === "🔁 Начать сначала") {
            return diagnosticInsulinConversationAdult(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationAdult(conversation, ctx);
          }
          // eslint-disable-next-line no-return-await
          else
            await ctx.reply("Используйте кнопки", {
              reply_markup: next,
            });
        },
      });
      if (nextAnswer.match === "next") {
        // eslint-disable-next-line no-continue
        continue;
      }
    }
    if (answer.match === "Нет") {
      // eslint-disable-next-line no-continue
      continue;
    }
  }
  await ctx.reply(
    `Бот проанализировал ваши ответы.
Есть риски образования, развития и усугубления заболеваний на фоне инсулинорезистентности. Чтобы помочь себе и своему организму решить эту проблему, забирайте мой гайд по кнопке ниже и внедряйте рекомендации в свою жизнь.`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide");

  if (guideAnswer.match === "guide") {
    await ctx.replyWithDocument(
      "BQACAgIAAxkBAAIUumUNhgV7Ill3cun6MidKcQVBASwWAAKnNAACPlFoSHxhxX_CPYGmMAQ",
      {
        reply_markup: cancel,
      }
    );
  }
}
