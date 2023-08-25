import {
  type Conversation,
  createConversation,
} from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { adultChildKeyboard, mainMenu } from "../keyboards/index.js";
import { cancel } from "../keyboards/cancel.keyboard.js";

export const DIAGNOSTIC_CONVERSATION = "diagnostic";

export function diagnosticConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("diagnostic", {reply_markup:cancel})
		  await ctx.reply("choose", {
      reply_markup: adultChildKeyboard});
    const response = await conversation.waitForCallbackQuery(["adult", "child"], {
    otherwise: async(ctx) => await ctx.reply("use buttons!", { reply_markup: adultChildKeyboard })
    });
    if (response.match === "adult") {
      await ctx.reply("You picked adult!");
      await response.answerCallbackQuery("Left conversation");
    } else if (response.match === "child") {
      await  ctx.reply("You picked child!");
  }
},
    DIAGNOSTIC_CONVERSATION,
  );
}