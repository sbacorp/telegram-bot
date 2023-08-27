import { Sequelize } from "sequelize";
import { LinkModel, PromocodeModel, UserModel } from "./models.js";


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


export async function getTotalUsersCount(): Promise<number> {
	return UserModel.count();
}

export async function getSubscribedUsersCount(): Promise<number> {
	return UserModel.count({
		where: {
			sub: true,
		},
	});
}

export async function getUsersJoinedNutrCount(): Promise<number> {
	return UserModel.count({
		where: {
			joinedToNutr: true,
		},
	});
}


export async function createPromoCode(code: string, discount: number): Promise<void> {
	try {
		await PromocodeModel.create({
			promoTitle: code,
			discount: discount,
		});
	} catch (error) {
		console.log(error);
		
	}
}


export async function getPromocodesMessage() {
	const promocodes = await PromocodeModel.findAll();

	let message = "Список промокодов:\n";

	promocodes.forEach((code) => {
		message += `${code.promoTitle} - Использовано: ${code.timesUsed}\n`;
	});

	return message;
}

export async function updatePromoCodeTimesUsed(code: string) {
	const promo = await PromocodeModel.findOne({
		where: {
			promoTitle: code,
		},
	});

	if (promo) {
		promo.timesUsed++;
		await promo.save();
	}
}

const botLink = 'https://t.me/devTest31123bot?start=';
export const createLink = async(title:string) =>{
	let link = botLink + title;
	
	try {
		await LinkModel.create({
			linkTitle: title,
		});
	} catch (error) {
		link = "не удалось создать ссылку"
		console.log('не удалось создать ссылку');
		
	}
	return link;
}

export async function getLinksMessage() {
	const links = await LinkModel.findAll();

	let message = "Список ссылок:\n";

	links.forEach((link) => {
		message += `${link.linkTitle} - Использовано: ${link.timesUsed}\n`;
	});

	return message;
}
export async function updateLinkTimesUsed(title: string) {
	const link = await LinkModel.findOne({
		where: {
			linkTitle: title,
		},
	});
	if (link) {
		link.timesUsed++;
		await link.save();
	}
}