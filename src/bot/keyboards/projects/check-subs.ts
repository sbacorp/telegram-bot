import { Menu } from "@grammyjs/menu";
import { Context } from "#root/bot/context.js";

export const subscribeToChannel = new Menu<Context>("subscribe-to-channel")
  .url("Ссылка на канал", "https://t.me/alla_dietolog")
  .row()
  .text(
    (ctx) =>
      `Проверить статус ${ctx.session.subscribedToChannel ? "✅" : "❌"} `,
    async (ctx) => {
      const inPublic = await ctx.api.getChatMember(
        "@alla_dietolog",
        ctx.chat!.id
      );
      if (
        inPublic.status === "member" ||
        inPublic.status === "creator" ||
        inPublic.status === "administrator"
      ) {
        ctx.session.subscribedToChannel = true;
        ctx.menu.update();
        await ctx.replyWithDocument(
          "BQACAgIAAxkBAAICXGT5721cDAy6N2hJoPHp3bSXCbJ3AALtNQACR9XRS4xIaNyMVGM4MAQ"
        );
      }
    }
  );
export const subscribeToChannelVitD = new Menu<Context>("subscribe-to-channel")
  .url("Ссылка на канал", "https://t.me/alla_dietolog")
  .row()
  .text(
    (ctx) =>
      `Проверить статус ${ctx.session.subscribedToChannel ? "✅" : "❌"} `,
    async (ctx) => {
      const inPublic = await ctx.api.getChatMember(
        "@alla_dietolog",
        ctx.chat!.id
      );
      if (
        inPublic.status === "member" ||
        inPublic.status === "creator" ||
        inPublic.status === "administrator"
      ) {
        ctx.session.subscribedToChannel = true;
        ctx.menu.update();
        await ctx.replyWithDocument(
          "BQACAgIAAxkBAAICYWT58D9zzzMDwLn_OhRdnZEnPXbKAALSOAACxEnRSwRy552S_2Z1MAQ"
        );
      }
    }
  );
export const subscribeToChannelNavigator = new Menu<Context>(
  "subscribe-to-channel"
)
  .url("Ссылка на канал", "https://t.me/alla_dietolog")
  .row()
  .text(
    (ctx) =>
      `Проверить статус ${ctx.session.subscribedToChannel ? "✅" : "❌"} `,
    async (ctx) => {
      const inPublic = await ctx.api.getChatMember(
        "@alla_dietolog",
        ctx.chat!.id
      );
      if (
        inPublic.status === "member" ||
        inPublic.status === "creator" ||
        inPublic.status === "administrator"
      ) {
        ctx.session.subscribedToChannel = true;
        ctx.menu.update();
        await ctx.replyWithDocument(
          "BQACAgIAAxkBAAIJmGUC3h97YahnxGMZD4Zx7uS6uhk6AAIBMAACS5AZSOvo6z_3triwMAQ"
        );
      }
    }
  );
export const subscribeToChannelRecommendations = new Menu<Context>(
  "subscribe-to-channel"
)
  .url("Ссылка на канал", "https://t.me/alla_dietolog")
  .row()
  .text(
    (ctx) =>
      `Проверить статус ${ctx.session.subscribedToChannel ? "✅" : "❌"} `,
    async (ctx) => {
      const inPublic = await ctx.api.getChatMember(
        "@alla_dietolog",
        ctx.chat!.id
      );
      if (
        inPublic.status === "member" ||
        inPublic.status === "creator" ||
        inPublic.status === "administrator"
      ) {
        ctx.session.subscribedToChannel = true;
        ctx.menu.update();
        await ctx.replyWithDocument(
          "BQACAgIAAxkBAAIJpGUC33ii6qCJQ42zzWCEkRZTqnNDAAIXMAACS5AZSGlXcGoDGme1MAQ"
        );
      }
    }
  );
