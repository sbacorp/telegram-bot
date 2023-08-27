import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { cancel } from "../keyboards/cancel.keyboard.js";
import { DIAGNOSTIC_CONVERSATION } from "./index.js";
import { InlineKeyboard } from "grammy";

export const yesNoKeyboard = new InlineKeyboard()
	.text("Да", "yes")
	.text("Нет", "no");

export const CONSULTATION_CONVERSATION = "consultation";
export function consultationConversation() {
	return createConversation(
		async (conversation: Conversation<Context>, ctx: Context) => {
			await ctx.reply("Консультация", { reply_markup: cancel });
			await ctx.reply(
				"<b>Что входит в ĸонсультацию, решение проблем И таĸ далее, прошли ли вы диагностиĸу?</b>",
				{
					reply_markup: yesNoKeyboard,
				}
			);
			const response = await conversation.waitForCallbackQuery(["yes", "no"], {
				otherwise: async (ctx) =>
					await ctx.reply("Используйте кнопки", {
						reply_markup: yesNoKeyboard,
					}),
			});
			if (response.match === "yes") {
				ctx.reply("Консультация");
			} else if (response.match === "no") {
				return response.conversation.enter(DIAGNOSTIC_CONVERSATION);
			}
		},
		CONSULTATION_CONVERSATION
	);
}
