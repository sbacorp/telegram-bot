import { BotCommand } from "@grammyjs/types";
import { CommandContext } from "grammy";
import { config } from "#root/config.js";
import type { Context } from "#root/bot/context.js";

function getPrivateChatCommands(): BotCommand[] {
  return [
    {
      command: "start",
      description: "начать использование",
    },
  ];
}

function getPrivateChatAdminCommands(): BotCommand[] {
  return [
    {
      command: "setcommands",
      description: "setcommands_command.description",
    },
  ];
}

export async function setCommandsHandler(ctx: CommandContext<Context>) {
  // set private chat commands
  await ctx.api.setMyCommands([...getPrivateChatCommands()], {
    scope: {
      type: "all_private_chats",
    },
  });
  // set private chat commands for owner
  await ctx.api.setMyCommands(
    [...getPrivateChatCommands(), ...getPrivateChatAdminCommands()],
    {
      scope: {
        type: "chat",
        chat_id: Number(config.BOT_ADMIN_USER_ID),
      },
    },
  );

  return ctx.reply("admin.commands-updated");
}
