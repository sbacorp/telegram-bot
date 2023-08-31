import { InlineKeyboard } from "grammy";

export const diagnosticListKeyboard = new InlineKeyboard()
  .text("ЖКТ", "zhkt")
  .text("Дефициты", "deficit")
  .row()
  .text("Щитовидка и гормоны", "thyroid")
  .text("Инсулин", "insulin");
