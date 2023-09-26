/* eslint-disable no-shadow */
/* eslint-disable no-param-reassign */
/* eslint-disable unicorn/prevent-abbreviations */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-plusplus */
import { InlineKeyboard } from "grammy";
import { InlineKeyboardButton } from "grammy/types";
import { ConsultationModel } from "#root/server/models.js";

export const createCalendar = (
  year: number,
  month: number,
  dates: string[]
) => {
  enum Months {
    январь = 0,
    февраль = 1,
    март = 2,
    апрель = 3,
    май = 4,
    июнь = 5,
    июль = 6,
    август = 7,
    сентябрь = 8,
    октябрь = 9,
    ноябрь = 10,
    декабрь = 11,
  }
  function getKeyByValue(value: number): keyof typeof Months {
    return Months[value] as keyof typeof Months;
  }
  const days = [
    {
      text: "ВС",
      callback_data: "sunday",
    },
    {
      text: "ПН",
      callback_data: "monday",
    },
    {
      text: "ВТ",
      callback_data: "tuesday",
    },
    {
      text: "СР",
      callback_data: "wednesday",
    },
    {
      text: "ЧТ",
      callback_data: "thursday",
    },
    {
      text: "ПТ",
      callback_data: "friday",
    },
    {
      text: "СБ",
      callback_data: "saturday",
    },
  ];
  const datesSet = new Set(dates);
  const calendar = [
    [
      { text: " ⬅️ ", callback_data: "prevMonth" },
      {
        text: `${getKeyByValue(month)} ${year.toString().slice(2, 4)}`,
        callback_data: "empty",
      },
      { text: " ➡️ ", callback_data: "nextMonth" },
    ],
  ];
  // eslint-disable-next-line no-param-reassign
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const weeks = Math.ceil(lastDate / 7);
  for (let i = 0; i < weeks; i++) {
    calendar[i + 1] = [];
    for (let j = 0; j < 7; j++) {
      const date = i * 7 + j - firstDay + 1;
      const dateString = `${year}${month < 9 ? "0" : ""}${month + 1}${
        date < 10 ? "0" : ""
      }${date}`;

      let day: InlineKeyboardButton = {
        text: " ",
        callback_data: "empty",
      };
      if (date > 0 && date <= lastDate) {
        // проверяем доступность
        // eslint-disable-next-line unicorn/prefer-ternary
        if (datesSet.has(dateString)) {
          day =
            date < new Date().getDate() + 3 &&
            month === new Date().getMonth() &&
            year === new Date().getFullYear()
              ? { text: " ✖️ ", callback_data: "empty" }
              : { text: date.toString(), callback_data: date.toString() };
        } else {
          day = { text: " ✖️ ", callback_data: "empty" };
        }
      } else {
        day = { text: " ✖️ ", callback_data: "empty" };
      }

      calendar[i + 1][j] = day;
    }
  }
  calendar.splice(1, 0, days);
  return calendar;
};

export async function createDatePicker(year: number, month: number) {
  const availableDays = await ConsultationModel.findAll({
    attributes: ["date"],
  });
  const dates = availableDays.map((day) => day.date);
  const calendar = createCalendar(year, month, dates);
  const keyboard = InlineKeyboard.from(calendar).row().text("⬅️ Назад", "back");
  return keyboard;
}
