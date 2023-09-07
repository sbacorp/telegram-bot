/* eslint-disable no-else-return */
/* eslint-disable import/no-cycle */
/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { yesNo, next, canceldiagnostic } from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { diagnosticConversationChild } from "./diagnostic-child.conversation.js";

export const DIAGNOSTIC_DEFICIT_CONVERSATION_CHILD = "diagnosticDeficitChild";
export const DIAGNOSTIC_THYROID_CONVERSATION_CHILD = "diagnosticThyroidChild";
export const DIAGNOSTIC_INSULIN_CONVERSATION_CHILD = "diagnosticInsulinChild";
export const DIAGNOSTIC_ZHKT_CONVERSATION_CHILD = "diagnosticZhktChild";

interface Question {
  question: string;
  answer: string;
  keyboard?: typeof InlineKeyboard;
}
const questionsZhkt: Question[] = [
  {
    question: "Первый вопрос",
    answer: "Ответ",
  },
];
const questionsDeficit: Question[] = [
  {
    question: "Есть ли отпечатки зубов на щеках с внутренней стороны?",
    answer: `Это риски гипотиреоза`,
  },
  {
    question: "Есть ли лунки на ногтях?",
    answer: `Есть риски гипоксии`,
  },
  {
    question: "Есть ли белые пятна на ногтевой пластине?",
    answer: `Это признак дефицита цинка`,
  },
  {
    question: "У ребёнка рифленые ногти?",
    answer: `А это один из показателей анемии`,
  },
  {
    question: "Есть ли заусенцы ?",
    answer: `Признак явного дефицита белка`,
  },
  {
    question: "Сильная тяга к сладкому?",
    answer: `Риски анемии и гипоксии`,
  },
  {
    question: "Потливость ночью, особенно голова и область шеи и плечи",
    answer: `Дефицит витамина D и вирусная нагрузка`,
  },
  {
    question: "Выпадают волосы, становятся сухими и тонкими?",
    answer: `Дефицит белка и гипотиреоз`,
  },
  {
    question: "Кожа стала сухой, «гусиная кожа», сухие локти и пятки?",
    answer: `Дефицит жирорастворимых витамин`,
  },
  {
    question: "Голубоватые склеры глаз",
    answer: `Это признак анемии`,
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
    question: "Бывает ли нервное возбуждение от голода",
    answer: `Есть риски гипогликемии`,
  },
  {
    question: "Сильная тяга к сладкому?",
    answer: `Есть риски гипогликемии`,
  },
  {
    question:
      "Присмотритесь, есть ли у ребенка потемнения в подмышечных впадинах, на локтях и на шее?",
    answer: `Есть риски инсулинорезистентности`,
  },
];
export async function diagnosticZhktConversationChild(
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
          return diagnosticZhktConversationChild(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationChild(conversation, ctx);
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
            return diagnosticZhktConversationChild(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationChild(conversation, ctx);
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
  return ctx.reply(
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
    return ctx.reply("Гайд", {
      reply_markup: cancel,
    });
  }
}
export async function diagnosticDeficitConversationChild(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику Дефицитов</b>", {
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
          return diagnosticDeficitConversationChild(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationChild(conversation, ctx);
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
            return diagnosticDeficitConversationChild(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationChild(conversation, ctx);
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
  return ctx.reply(
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
    return ctx.reply("Гайд", {
      reply_markup: cancel,
    });
  }
}
export async function diagnosticThyroidConversationChild(
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
          return diagnosticThyroidConversationChild(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationChild(conversation, ctx);
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
            return diagnosticThyroidConversationChild(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationChild(conversation, ctx);
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
  return ctx.reply(
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
    return ctx.reply("Гайд", {
      reply_markup: cancel,
    });
  }
}
export async function diagnosticInsulinConversationChild(
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
          return diagnosticInsulinConversationChild(conversation, ctx);
        } else if (ctx.message?.text === "📒 Другая диагностика") {
          // eslint-disable-next-line no-use-before-define
          return diagnosticConversationChild(conversation, ctx);
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
            return diagnosticInsulinConversationChild(conversation, ctx);
          } else if (ctx.message?.text === "📒 Другая диагностика") {
            // eslint-disable-next-line no-use-before-define
            return diagnosticConversationChild(conversation, ctx);
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
  return ctx.reply(
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
    return ctx.reply("Гайд", {
      reply_markup: cancel,
    });
  }
}
