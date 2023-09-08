import { Keyboard } from "grammy";

export const mainMenu = new Keyboard()
  .text("📋 Диагностика")
  .text("👩‍⚕️ Консультация")
  .row()
  .text("🗃 Мои проекты")
  .text("💁🏼‍♀️ Обо мне")
  .row()
  .text("🌐 Сайт")
  .text("🗣 Тг-канал")
  .row()
  .text("🤖 Карманный нутрициолог")
  .resized();
