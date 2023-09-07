import { Keyboard } from "grammy";

export const mainMenu = new Keyboard()
  .text("📋 Диагностика")
  .text("👩‍⚕️ Консультация")
  .row()
  .text("🗃 Мои проекты")
  .row()
  .text("🌐 Сайт")
  .text("🗣 Тг-канал")
  .text("💁🏼‍♀️ Обо мне")
  .row()
  .text("🤖 Карманный нутрициолог")
  .resized();
