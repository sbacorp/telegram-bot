import { chatAction } from "@grammyjs/auto-chat-action";
import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { isBotAdmin } from "#root/bot/filters/index.js";
import { setCommandsHandler } from "#root/bot/handlers/index.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import {
	getLinksMessage,
	getPromocodesMessage,
	getSubscribedUsersCount,
	getTotalUsersCount,
	getUsersJoinedNutrCount,
} from "#root/server/utils.js";
import {
	SETPROMO_CONVERSATION,
	CREATELINK_CONVERSATION,
} from "../conversations/index.js";
const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isBotAdmin);

feature.command(
	"setcommands",
	logHandle("command-setcommands"),
	chatAction("typing"),
	setCommandsHandler
);
feature.command(
	"setpromo",
	logHandle("command-setpromo"),
	chatAction("typing"),
	async (ctx) => {
		return ctx.conversation.enter(SETPROMO_CONVERSATION);
	}
);
feature.command(
	"createlink",
	logHandle("command-createLink"),
	chatAction("typing"),
	async (ctx) => {
		return ctx.conversation.enter(CREATELINK_CONVERSATION);
	}
);
feature.command(
	"statistics",
	logHandle("command-statistics"),
	chatAction("typing"),
	async (ctx) => {
		await ctx.deleteMessage();
		await ctx.reply(
			"Всего пользователей: " +
				(await getTotalUsersCount()) +
				"\nВ нутрицологе: " +
				(await getUsersJoinedNutrCount()) +
				"\nС подпиской: " +
				(await getSubscribedUsersCount())
		);
		await getPromocodesMessage().then((message) => {
			ctx.reply(message);
		});
		await getLinksMessage().then((message) => {
			ctx.reply(message);
		});
	}
);

export { composer as botAdminFeature };
