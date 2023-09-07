import { Menu } from "@grammyjs/menu";
import { InlineKeyboard } from "grammy";
import { Context } from "../context.js";

export const diagnosticMenu = new Menu<Context>("diagMenu")
  .text("Для взрослого", async (ctx) => {
    await ctx.conversation.enter("diagnosticAdult");
  })
  .text("Для ребенка", async (ctx) => {
    await ctx.conversation.enter("diagnosticChild");
  });

export const diagnosticListKeyboard = new InlineKeyboard()
  .text("ЖКТ", "zhkt")
  .text("Дефициты", "deficit")
  .row()
  .text("Щитовидка и гормоны", "thyroid")
  .text("Инсулин", "insulin");
