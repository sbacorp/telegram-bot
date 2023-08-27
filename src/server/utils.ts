/* eslint-disable no-restricted-syntax */
import { Sequelize } from "sequelize";
import { LinkModel, PromocodeModel, UserModel } from "./models.js";

export async function initDB(sequelize: Sequelize) {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connection to DB established");
  } catch {
    console.error("Unable to connect to DB");
  }
}

export async function findOrCreateUser(chatId: number) {
  try {
    const user = await UserModel.findOne({
      where: { chatId: chatId.toString() },
    });
    if (!user) {
      console.log("created");

      await UserModel.create({ chatId });
    }
  } catch (error) {
    console.error(error);
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

export async function createPromoCode(
  code: string,
  discount: number,
): Promise<void> {
  try {
    await PromocodeModel.create({
      promoTitle: code,
      discount,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getPromocodesMessage() {
  const promocodes = await PromocodeModel.findAll();

  let message = "Список промокодов:\n";

  for (const code of promocodes) {
    message += `${code.promoTitle} - Использовано: ${code.timesUsed}\n`;
  }

  return message;
}

const botLink = "https://t.me/pocket_nutritionist_test_bot?start=";
export const createLink = async (title: string) => {
  let link = botLink + title;

  try {
    await LinkModel.create({
      linkTitle: title,
    });
  } catch {
    link = "не удалось создать ссылку";
    console.log("не удалось создать ссылку");
  }
  return link;
};

export async function getLinksMessage() {
  const links = await LinkModel.findAll();

  let message = "Список ссылок:\n";

  // eslint-disable-next-line no-restricted-syntax
  for (const link of links) {
    message += `${link.linkTitle} - Использовано: ${link.timesUsed}\n`;
  }

  return message;
}
