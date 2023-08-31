import { InlineKeyboard, Keyboard } from "grammy";

export const yesNo = new InlineKeyboard()
  .text("Да ✅", "Да")
  .text("Нет ❌", "Нет");

export const next = new InlineKeyboard().text("Следующий вопрос ➡️", "next");

export const canceldiagnostic = new Keyboard()
  .text("📒 Другая диагностика")
  .text("🔁 Начать сначала")
  .row()
  .text("🏠 Главное меню")
  .resized()
  .persistent();
