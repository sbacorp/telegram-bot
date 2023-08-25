import { Keyboard } from "grammy";

export const mainMenu = new Keyboard()
  .text("Диагностика")
  .text("Консультация")
  .row()
  .text("Обучение")
  .text("Сайт")
  .text("гт ĸанал")
  .row()
  .text("Обо мне")
  .text("Карманный нутрициолог")
  .resized();
