import { Keyboard } from "grammy";

export const mainMenu = new Keyboard()
  .text("👩‍⚕️ Консультация")
  .text("📝 Индивидуальное введение")
  .row()
  .text("📋 Диагностика")
  .text("🗃 Мои проекты")
  .row()
  .text("🗣 Тг-канал")
  .text("💁🏼‍♀️ Обо мне")
  .row()
  .text("🌐 Сайт")
  .text("🤖 Карманный нутрициолог")
  .resized();
