/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
/* eslint-disable unicorn/no-for-loop */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { InlineKeyboard, Keyboard } from "grammy";
import { type Conversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { IBriefQuestion } from "#root/typing.js";
import { cancel } from "../../keyboards/cancel.keyboard.js";

export const questions: IBriefQuestion[] = [
  {
    text: "Ваша дата рождения",
  },
  {
    text: "Пожалуйста, перечислите жалобы и проблемы со здоровьем, которые беспокоят на данный момент",
  },
  {
    text: `Укажите проблему, которая наиболее сильно ухудшает качество Вашей жизни`,
  },
  {
    text: `Расскажите о Ваших ожиданиях после окончания программы оздоровления `,
  },
  {
    text: `Напишите информацию о  заболеваниях Ваших близких "кровных родственников" - родители, братья, сестры, дети`,
  },
  {
    text: `Перечислите состояния, заболевания и травмы, которые отмечались у Вас когда-либо в прошлом`,
  },
  {
    text: `Есть ли у Вас аллергия на лекарства, вакцины?`,
  },
  {
    text: `Есть ли у Вас другие аллергии?`,
  },
  {
    text: `Укажите Ваш рост`,
  },
  {
    text: `Укажите Ваш вес на данный момент`,
  },
  {
    text: `Укажите Ваш вес, который был год назад`,
  },
  {
    text: `Какой вес Вы хотите иметь?`,
  },
  {
    text: `Укажите Ваш обхват талии`,
  },
  {
    text: `Во сколько Вы просыпаетесь?`,
  },
  {
    text: `Через сколько Вы завтракаете после пробуждения?`,
  },
  {
    text: `Напишите свой примерный рацион завтрака`,
  },
  {
    text: `Сколько раз в день Вы едите, включая перекусы?`,
  },
  {
    text: `Наибольшее количество пищи Вы съедаете во время`,
    keyboard: new Keyboard()
      .text("Завтрака")
      .row()
      .text("Обеда")
      .row()
      .text("Ужина")
      .oneTime(),
    type: "select",
  },
  {
    text: `Напишите свой примерный рацион обеда`,
  },
  {
    text: `Из чего состоят Ваши перекусы?`,
  },
  {
    text: `До какого времени могут достигать интервалы между приёмами пищи (включая перекусы)?`,
  },
  {
    text: `Сколько времени проходит между окончанием ужина и отходом ко сну?`,
  },
  {
    text: `Бывает ли такое, что Вы начинаете осознавать, что уже не можете контролировать съеденное, когда уже переели?`,
  },
  {
    text: `Бывает ли такое, что Вы испытываете чувство вины после еды?`,
  },
  {
    text: `Если да, то что было в том приёме пищи?`,
  },
  {
    text: `Есть ли у Вас знания или убеждения о том, какие блюда, продукты употреблять надо, а от каких лучше отказаться?`,
  },
  {
    text: `Вам известно, почему некоторую еду называют "вредной", а другую "полезной"?`,
  },
  {
    text: `Когда Вы выбираете продукты питания, на что Вы ориентируетесь?`,
  },
  {
    text: `Напишите Ваши любимые блюда (продукты), которые Вы употребляете чащё 3-х раз в неделю`,
  },
  {
    text: `Принимаете ли Вы какую-либо еду по причине того, что "это важно для здоровья"?`,
  },
  {
    text: `Возникает ли у вас желание употреблять пищу, когда вы расстроены, подавлены или когда Вам одиноко?`,
  },
  {
    text: `Сколько воды Вы пьёте и когда?`,
  },
  {
    text: `Пьёте ли Вы чай и кофе ежедневно? Сколько чашек?`,
  },
  {
    text: `Вы курите?`,
    type: "select",
    keyboard: new Keyboard()
      .text("Да")
      .row()
      .text("Бросил(а)")
      .row()
      .text("Никогда не курил(а)")
      .oneTime(),
  },
  {
    text: `Если Вы курите, то напишите как давно?`,
  },
  {
    text: `За сколько дней до менструации Ваша грудь становится чувствительной и отекает?`,
  },
  {
    text: `Перед менструацией у Вас`,
    type: "select",
    keyboard: new Keyboard()
      .text("Есть отёки")
      .row()
      .text("Раздувает нижнюю часть живота")
      .row()
      .text("Ничего не наблюдается")
      .oneTime(),
  },
  {
    text: `Перед или во время месячных Вы становитесь`,
    type: "select",
    keyboard: new Keyboard()
      .text("Раздражительной")
      .row()
      .text("Раздражительной")
      .row()
      .text("Никак не реагирую")
      .oneTime(),
  },
  {
    text: `Какие у Вас кровопотери во время менструации? Укажите цифру от 0 до 4, где 0 - скудные выделения, а 4 - обильные значительные выделения.`,
    type: "select",
    keyboard: new Keyboard()
      .text("0")
      .text("1")
      .text("2")
      .text("3")
      .text("4")
      .oneTime(),
  },
  {
    text: `Боль во время менструации`,
    type: "select",
    keyboard: new Keyboard()
      .text("Сильная")
      .row()
      .text("Умеренная")
      .row()
      .text("Сильная, спасают обезболивающие")
      .row()
      .text("Очень сильная, не спасают обезболивающие")
      .oneTime(),
  },
  {
    text: `Вас удовлетворяет ваш сон?`,
  },
  {
    text: `Какая продолжительность Вашего сна? Укажите со скольки до скольки?`,
  },
  {
    text: `Вы засыпаете`,
    type: "select",
    keyboard: new Keyboard().text("Легко").row().text("Трудно").oneTime(),
  },
  {
    text: `Ваш сон`,
    type: "select",
    keyboard: new Keyboard()
      .text("Непрерывный")
      .row()
      .text("Прерывистый")
      .oneTime(),
  },
  {
    text: `Проснувшись ночью, далее Вы засыпаете`,
    type: "select",
    keyboard: new Keyboard().text("Легко").row().text("С трудом").oneTime(),
  },
  {
    text: `Сколько раз Вы просыпаетесь ночью, чтобы сходить в туалет?`,
  },
  {
    text: `Какое ваше утреннее пробуждение?`,
    type: "select",
    keyboard: new Keyboard()
      .text("Лёгкое и бодрое")
      .row()
      .text("Тяжелое и долгое")
      .oneTime(),
  },
  {
    text: `Если времени для сна достаточно (выходные), Вы всё равно чувствуете, что не выспались?`,
  },
  {
    text: `Какие у Вас сновидения?`,
    type: "select",
    keyboard: new Keyboard()
      .text("Обычные")
      .row()
      .text("Кошмары")
      .row()
      .text("Отсутствуют")
      .oneTime(),
  },
  {
    text: `Вы используете снотворные? Если да, то какие и как часто?`,
  },
  {
    text: `Укажите, в какое время днём Вас тянет в сон?`,
  },
  //! баллы как то реализовать новый тип и клавиатуры
  {
    text: `Ваше самочувствие и энергия в течение дня. Поставьте 10 баллов в то время, когда Вы чувствуете бодрость и энергию и работоспособность. И 0, когда совершенно нет сил.`,
    type: "withMultiAnswer",
  },
  {
    text: `В последнее время Вы часто забываете не очень важные вещи, сложно вспомнить какие-то элементарные вещи?`,
  },
  {
    text: `Вам сложно сконцентрировать внимание на выполнении задач?`,
  },
  {
    text: `У Вас бывает туман в голове?`,
  },
  {
    text: `Осмотрите язык. На нём есть налёт?`,
  },
  {
    text: `Осмотрите язык. Есть ли отпечатки зубов по бокам?`,
  },
  {
    text: `Есть ли трещинки на языке?`,
  },
  {
    text: `Какого цвета язык?`,
  },
  {
    text: `Есть ли лунки на ногтях? Укажите, на каком количестве ногтей?`,
  },
  {
    text: `Есть ли белые пятна на ногтевой пластине?`,
  },
  {
    text: `Рифлёные ли ногти у Вас?`,
  },
  {
    text: `Вы сильно реагируете на запахи?`,
  },
  {
    text: `Вздувается ли у Вас живот после употребления пищи?`,
  },
  {
    text: `У Вас стул каждый день?`,
  },
  {
    text: `Сколько раз стул в день?`,
  },
  {
    text: `Оцените Ваш стул по бристольской шкале кала`,
    type: "withPhoto",
  },
  {
    text: `У Вас бывает отрыжка воздухом после еды?`,
  },
  {
    text: `У Вас бывает слизь по задней стенке носа, когда просыпаетесь или засыпаете?`,
  },
  {
    text: `Как давно Вы последний раз пили антибиотики?`,
  },
  {
    text: `У Вас бывает перхоть?`,
  },
  {
    text: `Ваша кожа склонна к появлению прыщей и угрей?`,
  },
  {
    text: `Если да, то опишите места их появления`,
  },
  {
    text: `Появляется ли у Вас пигментация?`,
  },
  {
    text: `Страдаете ли Вы от шелушений, высыпаний и аллергии неизвестной этиологии?`,
  },
  {
    text: `Бывают ли судороги в ногах или других частях тела, нервные тики на лице?`,
  },
  {
    text: `Отмечаете ли Вы появление морщин на лице?`,
  },
  {
    text: `Ваши волосы становятся сухими и тонкими?`,
  },
  {
    text: `Появилось ли у Вас много седых волос?`,
  },
  {
    text: `Ваша кожа стала сухой?`,
  },
  {
    text: `Бывают ли у Вас холодные конечности вне зависимости от времени года?`,
  },
  {
    text: `Бывает ли у Вас резкий запах пота?`,
  },
  {
    text: `Вы потеете в бане?`,
  },
  {
    text: `У Вас появляются красные родинки на теле?`,
  },
  {
    text: `Есть ли у Вас потемнения в подмышечных впадинах, локтях и шее?`,
  },
  {
    text: `У Вас сухие локти и пятки?`,
  },
  {
    text: `Вы замечали у себя признаки "гусиной кожи"?`,
  },
  {
    text: `Кожа на руках возле ногтей имеет свойство облазить?`,
  },
  {
    text: `У Вас бывают отёки? Если да, то в какой части тела?`,
  },
  {
    text: `Какого цвета склеры глаз?`,
    type: "select",
    keyboard: new Keyboard()
      .text("Чисто белый")
      .row()
      .text("Желтоватый")
      .oneTime(),
  },
  {
    text: `У Вас кровоточат дёсны?`,
  },
  {
    text: `Замечали ли образования синяков от любого контакта с поверхностями?`,
  },
  {
    text: `Часто ли вас мучает проблема врастания волос?`,
  },
  {
    text: `Вы испытываете постоянную усталость?`,
  },
  {
    text: `Ваше артериальное давление`,
    type: "select",
    keyboard: new Keyboard()
      .text("Нормальное")
      .row()
      .text("Повышено")
      .row()
      .text("Понижено")
      .row()
      .text("Меняется")
      .row()
      .text("Не знаю")
      .oneTime(),
  },
  {
    text: `Вы часто испытываете тревогу, раздражение, нервозность?`,
  },
  {
    text: `Сейчас Вы живете половой жизнью?`,
  },
  {
    text: `Принимаете ли Вы сейчас лекарства, добавки? Какие?`,
  },
  {
    text: `Укажите число рожденных детей`,
  },
  {
    text: `Сколько у Вас было  беременностей?`,
  },
  {
    text: `У Вас установлена внутриматочная спираль?`,
  },
  {
    text: `Вы принимаете какие-либо противозачаточные таблетки?`,
  },
  {
    text: `Напишите дату окончания последней менструации`,
  },
  {
    text: `Вы сейчас беременны?`,
  },
  {
    text: `Имеются ли у Вас миомы или кисты?`,
  },
  {
    text: `Если наступила менопауза, то в каком возрасте?`,
  },
  {
    text: `Имеется ли у Вас сухость влагалища?`,
  },
  {
    text: `Есть ли "женские заболевания"?`,
  },
];
export async function briefFemaleConversation(
  conversation: Conversation<Context>,
  ctx: Context
) {
  const answersCount = conversation.session.consultation.answers.length;
  await ctx.deleteMessage();
  // eslint-disable-next-line no-restricted-syntax
  for (let i = answersCount; i < questions.length; i++) {
    if (!questions[i].type) {
      await ctx.reply(questions[i].text);
      const answer = await conversation.waitFor("message:text");
      conversation.session.consultation.answers.push(answer.message.text);
      continue;
    } else if (questions[i].type === "select" && questions[i].keyboard) {
      await ctx.reply(questions[i].text, {
        reply_markup: questions[i].keyboard,
      });
      const answer = await conversation.waitFor("message:text");
      conversation.session.consultation.answers.push(answer.message.text);
      continue;
    } else if (questions[i].type === "withPhoto") {
      await ctx.reply(questions[i].text);
      await ctx.replyWithPhoto(
        "AgACAgIAAxkBAAIH5mUBo_wEF_qf8ueeUfSvBDPeybnBAAKRzTEbrDsRSBmhSt-tkbJiAQADAgADbQADMAQ"
      );
      const answer = await conversation.waitFor("message:text");
      conversation.session.consultation.answers.push(answer.message.text);
      continue;
    } else if (questions[i].type === "withMultiAnswer") {
      let answer: string;
      await ctx.reply(questions[i].text);
      await ctx.reply("Утром :");
      answer = `Утром : ${await conversation.form.text()}`;
      await ctx.reply("Днем :");
      answer += `\nДнем : ${await conversation.form.text()}`;
      await ctx.reply("Вечером :");
      answer += `\nВечером : ${await conversation.form.text()}`;
      await ctx.reply("Ночью :");
      answer += `\nНочью : ${await conversation.form.text()}`;
      conversation.session.consultation.answers.push(answer);
    }
    conversation.session.consultation.questionsAnswered += 1;
  }
}
