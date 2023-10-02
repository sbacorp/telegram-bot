import { type Conversation, createConversation } from "@grammyjs/conversations";
import { Context } from "#root/bot/context.js";
import { activateSubscription } from "#root/server/utils.js";

export const ACTIVATE_SUBSCRIPTION_CONVERSATION =
  "activateSubscriptionConversation";
export function activateSubscriptionConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      await ctx.reply("<b>Введи ID пользователя</b>");
      const id = await conversation.form.number();
      const message = await ctx.reply("Обновляю подписку...");
      const response = await conversation.external(async () =>
        activateSubscription(id)
      );
      await ctx.api.deleteMessage(ctx.chat!.id, message.message_id);
      return ctx.reply(response);
    },
    ACTIVATE_SUBSCRIPTION_CONVERSATION
  );
}
