import { Keyboard } from "grammy";

export const mainMenu = new Keyboard()
  .text("Диагностика")
  .text("Консультация")
  .row()
  .text("Обучение")
  .text("Сайт")
  .text("Тг-канал")
  .row()
  .text("Обо мне")
  .text("Карманный нутрициолог")
  .resized();
