import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { UserModel } from "../../server/models.js";
import { findOrCreateUser, updateLinkTimesUsed } from "../../server/utils.js";
import { mainMenu } from "../keyboards/index.js";
const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async (ctx) => {
	const chatId = ctx.chat.id;
	const refLink = ctx.message.text.split(" ")[1];
	if (refLink) {
		await updateLinkTimesUsed(refLink);
	}
	await findOrCreateUser(chatId);
	await ctx.reply("Здравствуйте");
	await ctx.reply("*Выберите действие*", {
		reply_markup: mainMenu,
	});
});

export { composer as welcomeFeature };
