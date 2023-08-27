import { Sequelize } from "sequelize";
import { UserModel } from "./models.js";


export async function initDB(sequelize: Sequelize) {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		console.log("Connection to DB established");
	} catch (err) {
		console.error("Unable to connect to DB");
		process.exit(1);
	}
}

export async function findOrCreateUser(chatId: number) {
	try {
		const user = await UserModel.findOne({
			where: { chatId: chatId.toString() },
		});
		if (!user) {
			console.log('created');
			
			await UserModel.create({ chatId });
		}
	} catch (err) {
		console.error(err);
	}
}
