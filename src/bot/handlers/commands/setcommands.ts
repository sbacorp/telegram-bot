/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { BotCommand } from "@grammyjs/types";
import { CommandContext } from "grammy";
import { config } from "#root/config.js";
import type { Context } from "#root/bot/context.js";

function getPrivateChatCommands(): BotCommand[] {
  return [
    {
      command: "start",
      description: "Перезагрузка",
    },
    {
      command: "help",
      description: "Помощь",
    },
  ];
}

function getPrivateChatAdminCommands(): BotCommand[] {
  return [
    {
      command: "statistics",
      description: "статистика",
    },
    {
      command: "setpromo",
      description: "добавить промокод",
    },
    {
      command: "createlink",
      description: "создать ссылку на бота",
    },
    {
      command: "deletepromo",
      description: "удалить промокод",
    },
    {
      command: "deletelink",
      description: "удалить ссылку",
    },
    {
      command: "activatesubscription",
      description: "активировать подписку по id",
    },
    {
      command: "setcommands",
      description: "setcommands_command.description",
    },
    {
      command: "newsletter",
      description: "рассылка",
    },
    {
      command: "changeshedule",
      description: "изменить расписание",
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
  await ctx.api.setMyCommands(
    [...getPrivateChatCommands(), ...getPrivateChatAdminCommands()],
    {
      scope: {
        type: "chat",
        chat_id: config.BOT_ADMIN_USER_ID[0],
      },
    }
  );
  await ctx.api.setMyCommands(
    [...getPrivateChatCommands(), ...getPrivateChatAdminCommands()],
    {
      scope: {
        type: "chat",
        chat_id: config.BOT_ADMIN_USER_ID[1],
      },
    }
  );

  return ctx.reply("команды обновлены");
}
