import { chatAction } from "@grammyjs/auto-chat-action";
import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { isBotAdmin } from "#root/bot/filters/index.js";
import { setCommandsHandler } from "#root/bot/handlers/index.js";
import { logHandle } from "#root/bot/helpers/logging.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isBotAdmin);

feature.command(
  "setcommands",
  logHandle("command-setcommands"),
  chatAction("typing"),
  setCommandsHandler,
);
feature.command(
	"setpromo",
	logHandle("command-setpromo"),
	chatAction("typing"),
	async(ctx)=>{
    await ctx.reply("Введите промокод");
  }
);
feature.command(
	"statistics",
	logHandle("command-statistics"),
	chatAction("typing"),
	async (ctx) => {
		await ctx.reply("Статистика тут");
	}
);

export { composer as botAdminFeature };
