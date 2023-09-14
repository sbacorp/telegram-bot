import { Menu } from "@grammyjs/menu";
import { Context } from "#root/bot/context.js";
import {
  subscribeToChannelVitD,
  subscribeToChannel,
  subscribeToChannelNavigator,
  subscribeToChannelRecommendations,
} from "./check-subs.js";

export const freeProjectsMenu = new Menu<Context>("free-projects-menu")
  .text("Гайд по витамину Д", async (ctx) => {
    if (ctx.session.subscribedToChannel) {
      await ctx.reply("Заберите гайд");
      await ctx.replyWithDocument(
        "BQACAgIAAxkBAAICYWT58D9zzzMDwLn_OhRdnZEnPXbKAALSOAACxEnRSwRy552S_2Z1MAQ"
      );
    } else {
      await ctx.reply("Подпишитель на канал", {
        reply_markup: subscribeToChannelVitD,
      });
    }
  })
  .row()
  .text("Гайд по расшифровке анализов", async (ctx) => {
    if (ctx.session.subscribedToChannel) {
      await ctx.reply("Заберите гайд");
      await ctx.replyWithDocument(
        "BQACAgIAAxkBAAICXGT5721cDAy6N2hJoPHp3bSXCbJ3AALtNQACR9XRS4xIaNyMVGM4MAQ"
      );
    } else {
      await ctx.reply("Подпишитель на канал", {
        reply_markup: subscribeToChannel,
      });
    }
  })
  .row()
  .text("Навигатор по здоровому рациону ребенка", async (ctx) => {
    if (ctx.session.subscribedToChannel) {
      await ctx.reply("Заберите гайд");
      await ctx.replyWithDocument(
        "BQACAgIAAxkBAAIJmGUC3h97YahnxGMZD4Zx7uS6uhk6AAIBMAACS5AZSOvo6z_3triwMAQ"
      );
    } else {
      await ctx.reply("Подпишитель на канал", {
        reply_markup: subscribeToChannelNavigator,
      });
    }
  })
  .row()
  .text("Советы здорового питания для взрослых", async (ctx) => {
    if (ctx.session.subscribedToChannel) {
      await ctx.reply("Заберите гайд");
      await ctx.replyWithDocument(
        "BQACAgIAAxkBAAIJpGUC33ii6qCJQ42zzWCEkRZTqnNDAAIXMAACS5AZSGlXcGoDGme1MAQ"
      );
    } else {
      await ctx.reply("Подпишитель на канал", {
        reply_markup: subscribeToChannelRecommendations,
      });
    }
  })
  .row()
  .back("⬅️ Назад");
