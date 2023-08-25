import { Composer } from "grammy";
import type { Context } from "#root/bot/context.js";
import { logHandle } from "#root/bot/helpers/logging.js";
import { UserModel } from "../../server/models.js";
import { sequelize } from "../../server/database.js";
import {mainMenu} from '../keyboards/index.js'
const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async(ctx) => {
  const chatId = ctx.chat.id;
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		const user = await UserModel.findOne( {where: {chatId:chatId.toString()}});
		if (!user) {
            await UserModel.create({ chatId });
        }
		console.log(user);
		
	}
	catch (err) {
        console.error(err);
    }
    await ctx.reply('Здравствуйте');
	await ctx.reply("*Выберите действие*", {
		reply_markup: mainMenu,
		
	});
});

export { composer as welcomeFeature };
