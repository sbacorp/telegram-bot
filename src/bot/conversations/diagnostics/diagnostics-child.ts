/* eslint-disable no-else-return */
/* eslint-disable import/no-cycle */
/* eslint-disable no-shadow */
/* eslint-disable no-await-in-loop */
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard, Keyboard } from "grammy";
import { Context } from "#root/bot/context.js";
import { yesNo, next, canceldiagnostic } from "../../keyboards/index.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";
import { diagnosticConversationChild } from "./diagnostic-child.conversation.js";

export const DIAGNOSTIC_DEFICIT_CONVERSATION_CHILD = "diagnosticDeficitChild";
export const DIAGNOSTIC_INSULIN_CONVERSATION_CHILD = "diagnosticInsulinChild";
export const DIAGNOSTIC_ZHKT_CONVERSATION_CHILD = "diagnosticZhktChild";
export const DIAGNOSTIC_PARAZIT_CONVERSATION_CHILD = "diagnosticParazitChild";
export const DIAGNOSTIC_AMMIAK_CONVERSATION_CHILD = "diagnosticAmmiakChild";
interface Question {
  question: string;
  answer: string;
  keyboard?: boolean;
}
const questionsZhkt: Question[] = [
  {
    question: "Кормила ли мама ребёнка грудью?",
    answer: "Возможны проблемы с микрофлорой",
    keyboard: true,
  },
  {
    question: "Ребёнок выпивает меньше 1 литра чистой воды за день",
    answer:
      "Проблемы с первой фазой детоксикации (когда токсины выходят с мочой)",
  },
  {
    question: "Есть ли у ребёнка аллергии на что-либо?",
    answer: "Причина может крыться в застое желчи",
    keyboard: false,
  },
  {
    question: "Есть ли белый налёт на языке ребёнка?",
    answer: "Есть вопросы к кандиде",
    keyboard: false,
  },
  {
    question: "Бывает ли жёлтый налёт на языке ребёнка по утрам?",
    answer: "Это проблемы с забросами желчи",
    keyboard: false,
  },
  {
    question: "Сильно ли ребенок реагирует на запахи (духи ,краска)?",
    answer:
      "Проблема во второй фазе детоксикации.  Необходимо работать с печенью",
    keyboard: false,
  },
  {
    question:
      "Есть ли вздутия после еды или к вечеру живот заметно надувается?",
    answer: "Есть дисбактериоз",
    keyboard: false,
  },
  {
    question: "Стул не каждый день",
    answer: "Есть застой желчи",
    keyboard: false,
  },
  {
    question: "Стул жирный, плохо смывается и пачкает стенки унитаза",
    answer: "Проблема в ферментативной функции поджелудочной железы",
    keyboard: false,
  },
  {
    question: "Стул, оформленный колбаской?",
    answer: "Проблема с застоем желчи и работой поджелудочной железы",
    keyboard: false,
  },
  {
    question: "Отрыжка воздухом после еды",
    answer: "Отсутствие кислотности",
    keyboard: false,
  },
  {
    question: "Бывает неприятный запах изо рта?",
    answer: "Застой желчи и нарушение кислотности",
    keyboard: false,
  },
  {
    question: "Мама набрала за период беременности больше 20 кг",
    answer: "Есть риски инсулинорезистентности",
    keyboard: false,
  },
  {
    question: "Бывает повышенное газообразование",
    answer: "Есть риски инсулинорезистентности",
    keyboard: false,
  },
  {
    question: "Бывает ли сильная тяга к сладкому?",
    answer: "Кандида",
    keyboard: false,
  },
  {
    question: "Сильная тяга к молочным продуктам",
    answer: "Кандида",
    keyboard: false,
  },
];
const questionsDeficit: Question[] = [
  {
    question: "При рождении ребёнка было обвитие и асфиксия",
    answer: "Есть риски гипоксии, в том числе мозга",
    keyboard: false,
  },
  {
    question: "Есть ли отпечатки зубов на щеках с внутренней стороны?",
    answer: "Это риски гипотиреоза",
    keyboard: false,
  },
  {
    question: "Есть ли лунки на ногтях?",
    answer: "Есть риски гипоксии",
    keyboard: true,
  },
  {
    question: "Есть ли белые пятна на ногтевой пластине?",
    answer: "Это признак дефицита цинка",
    keyboard: false,
  },
  {
    question: "У ребёнка рифленые ногти?",
    answer: "А это один из показателей анемии",
    keyboard: false,
  },
  {
    question: "Есть ли заусенцы ?",
    answer: "Признак явного дефицита белка",
    keyboard: false,
  },
  {
    question: "Сильная тяга к сладкому?",
    answer: "Риски анемии и гипоксии",
    keyboard: false,
  },
  {
    question: "Потливость ночью, особенно голова и область шеи и плечи",
    answer: "Дефицит витамина D и вирусная нагрузка",
    keyboard: false,
  },
  {
    question: "Выпадают волосы, становятся сухими и тонкими?",
    answer: "Дефицит белка и гипотиреоз",
    keyboard: false,
  },
  {
    question: "Кожа стала сухой, «гусиная кожа», сухие локти и пятки?",
    answer: "Дефицит жирорастворимых витамин",
    keyboard: false,
  },
  {
    question: "Голубоватые склеры глаз",
    answer: "Это признак анемии",
    keyboard: false,
  },
  {
    question: "Ребенок отказывается ходить по-большому сидя",
    answer: "Такое поведение говорит об оксалатных кристаллах",
    keyboard: false,
  },
  {
    question: "Ребёнок трет глаза, жалуется на «песок» в глазах",
    answer: "Кристаллы оксалатов",
    keyboard: false,
  },
  {
    question: "Ребёнок отказывается носить одежду",
    answer: "Кристаллы оксалатов на коже",
    keyboard: false,
  },
];
const questionsInsulin: Question[] = [
  {
    question: "Мама набрала за период беременности больше 20 кг",
    answer: `Есть риски инсулинорезистентности`,
  },
  {
    question: "Ребенок ест, включая перекусы, более 5 раз",
    answer: `Есть риски инсулинорезистентности`,
  },
  {
    question: "Бывает ли нервное возбуждение от голода",
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

const questionsParazit: Question[] = [
  {
    question: "Бывает ли боль возле пупка?",
    answer: "Риски паразитоза",
    keyboard: false,
  },
  {
    question: "Облазит кожа на пальцах возле ногтей",
    answer: "Риски паразитоза",
    keyboard: false,
  },
  {
    question: "Зуд в области заднего прохода ?",
    answer: "Риски паразитоза",
    keyboard: false,
  },
  {
    question: "У ребёнка плохой аппетит?",
    answer: "Риски паразитоза",
    keyboard: false,
  },
  {
    question: "Есть ли резкий запах от стула?",
    answer: "Риски паразитоза",
    keyboard: false,
  },
  {
    question: "Расстройства стула - запор и диарея",
    answer: "Риски паразитоза",
    keyboard: false,
  },
];
const questionsAmmiak: Question[] = [
  {
    question: "Ребенок малоежка?",
    answer: "Возможно накопление аммиака",
    keyboard: false,
  },
  {
    question: "Есть круги под глазами?",
    answer: "Возможно накопление аммиака",
    keyboard: false,
  },
  {
    question: "Происходит снижение скорости реакции",
    answer: "Возможно накопление аммиака",
    keyboard: false,
  },
  {
    question: "Бывают головные боли",
    answer: "Возможно накопление аммиака",
    keyboard: false,
  },
  {
    question: "Регулярные нарушения ночного сна",
    answer: "Есть риски повышенного аммиака",
    keyboard: false,
  },
];

export const noYes = new InlineKeyboard()
  .text("Да ✅", "Нет")
  .text("Нет ❌", "Да");

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
    await (questionsZhkt[index]?.keyboard
      ? ctx.reply(questionsZhkt[index].question, {
          reply_markup: noYes,
        })
      : ctx.reply(questionsZhkt[index].question, {
          reply_markup: yesNo,
        }));
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
  await ctx.reply(
    `Если у вас больше одного ответа "Да", нужно обследовать ребёнка и принимать меры. Забирайте гайд и действуйте!`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide", {
    otherwise: async (ctx) => {
      if (ctx.message?.text === "🔁 Начать сначала") {
        return diagnosticZhktConversationChild(conversation, ctx);
      } else if (ctx.message?.text === "📒 Другая диагностика") {
        // eslint-disable-next-line no-use-before-define
        return diagnosticConversationChild(conversation, ctx);
      }
      // eslint-disable-next-line no-return-await
    },
  });

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
    await (questionsDeficit[index]?.keyboard
      ? ctx.reply(questionsDeficit[index].question, {
          reply_markup: noYes,
        })
      : ctx.reply(questionsDeficit[index].question, {
          reply_markup: yesNo,
        }));
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
      await ctx.reply(questionsDeficit[index].answer, { reply_markup: next });
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
  await ctx.reply(
    `Если у вас больше одного ответа "Да", нужно обследовать ребёнка и принимать меры. Забирайте гайд и действуйте!`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide", {
    otherwise: async (ctx) => {
      if (ctx.message?.text === "🔁 Начать сначала") {
        return diagnosticDeficitConversationChild(conversation, ctx);
      } else if (ctx.message?.text === "📒 Другая диагностика") {
        // eslint-disable-next-line no-use-before-define
        return diagnosticConversationChild(conversation, ctx);
      }
      // eslint-disable-next-line no-return-await
    },
  });
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
    await (questionsInsulin[index]?.keyboard
      ? ctx.reply(questionsInsulin[index].question, {
          reply_markup: noYes,
        })
      : ctx.reply(questionsInsulin[index].question, {
          reply_markup: yesNo,
        }));
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
  await ctx.reply(
    `Если у вас больше одного ответа "Да", нужно обследовать ребёнка и принимать меры. Забирайте гайд и действуйте!`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide", {
    otherwise: async (ctx) => {
      if (ctx.message?.text === "🔁 Начать сначала") {
        return diagnosticInsulinConversationChild(conversation, ctx);
      } else if (ctx.message?.text === "📒 Другая диагностика") {
        // eslint-disable-next-line no-use-before-define
        return diagnosticConversationChild(conversation, ctx);
      }
      // eslint-disable-next-line no-return-await
    },
  });
  if (guideAnswer.match === "guide") {
    return ctx.reply("Гайд", {
      reply_markup: cancel,
    });
  }
}

export async function diagnosticParazitConversationChild(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику на Паразитов</b>", {
    reply_markup: canceldiagnostic,
  });
  // eslint-disable-next-line unicorn/no-for-loop, no-plusplus
  for (let index = 0; index < questionsParazit.length; index++) {
    await (questionsParazit[index]?.keyboard
      ? ctx.reply(questionsParazit[index].question, {
          reply_markup: noYes,
        })
      : ctx.reply(questionsParazit[index].question, {
          reply_markup: yesNo,
        }));
    answer = await conversation.waitForCallbackQuery(["Да", "Нет"], {
      otherwise: async (ctx) => {
        if (ctx.message?.text === "🔁 Начать сначала") {
          return diagnosticParazitConversationChild(conversation, ctx);
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
      await ctx.reply(questionsParazit[index].answer, { reply_markup: next });
      const nextAnswer = await conversation.waitForCallbackQuery("next", {
        otherwise: async (ctx) => {
          if (ctx.message?.text === "🔁 Начать сначала") {
            return diagnosticParazitConversationChild(conversation, ctx);
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
  await ctx.reply(
    `Если у вас больше одного ответа "Да", нужно обследовать ребёнка и принимать меры. Забирайте гайд и действуйте!`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide", {
    otherwise: async (ctx) => {
      if (ctx.message?.text === "🔁 Начать сначала") {
        return diagnosticParazitConversationChild(conversation, ctx);
      } else if (ctx.message?.text === "📒 Другая диагностика") {
        // eslint-disable-next-line no-use-before-define
        return diagnosticConversationChild(conversation, ctx);
      }
      // eslint-disable-next-line no-return-await
    },
  });

  if (guideAnswer.match === "guide") {
    return ctx.reply("Гайд", {
      reply_markup: cancel,
    });
  }
}

export async function diagnosticAmmiakConversationChild(
  conversation: Conversation<Context>,
  ctx: Context
) {
  let answer;
  await ctx.reply("<b>Вы выбрали диагностику на Паразитов</b>", {
    reply_markup: canceldiagnostic,
  });
  // eslint-disable-next-line unicorn/no-for-loop, no-plusplus
  for (let index = 0; index < questionsAmmiak.length; index++) {
    await (questionsAmmiak[index]?.keyboard
      ? ctx.reply(questionsAmmiak[index].question, {
          reply_markup: noYes,
        })
      : ctx.reply(questionsAmmiak[index].question, {
          reply_markup: yesNo,
        }));
    answer = await conversation.waitForCallbackQuery(["Да", "Нет"], {
      otherwise: async (ctx) => {
        if (ctx.message?.text === "🔁 Начать сначала") {
          return diagnosticAmmiakConversationChild(conversation, ctx);
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
      await ctx.reply(questionsAmmiak[index].answer, { reply_markup: next });
      const nextAnswer = await conversation.waitForCallbackQuery("next", {
        otherwise: async (ctx) => {
          if (ctx.message?.text === "🔁 Начать сначала") {
            return diagnosticAmmiakConversationChild(conversation, ctx);
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
  await ctx.reply(
    `Если у вас больше одного ответа "Да", нужно обследовать ребёнка и принимать меры. Забирайте гайд и действуйте!`,
    {
      reply_markup: InlineKeyboard.from([
        [{ text: "Забрать гайд", callback_data: "guide" }],
      ]),
    }
  );
  const guideAnswer = await conversation.waitForCallbackQuery("guide", {
    otherwise: async (ctx) => {
      if (ctx.message?.text === "🔁 Начать сначала") {
        return diagnosticAmmiakConversationChild(conversation, ctx);
      } else if (ctx.message?.text === "📒 Другая диагностика") {
        // eslint-disable-next-line no-use-before-define
        return diagnosticConversationChild(conversation, ctx);
      }
      // eslint-disable-next-line no-return-await
    },
  });

  if (guideAnswer.match === "guide") {
    return ctx.reply("Гайд");
  }
}
