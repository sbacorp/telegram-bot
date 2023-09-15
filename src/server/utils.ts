/* eslint-disable no-console */
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
    if (user) {
      if (user.status === "left") {
        user.status = "active";
        await user.save();
      }
      return true;
    }
    if (!user) {
      await UserModel.create({ chatId });
      return false;
    }
  } catch (error) {
    console.error(error);
  }
}

export async function updateUserPhone(chatId: number, phone: string) {
  try {
    const user = await UserModel.findOne({
      where: { chatId: chatId.toString() },
    });
    if (user) {
      user.phoneNumber = phone;
      await user.save();
      return true;
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
  discount: number
): Promise<string> {
  try {
    await PromocodeModel.create({
      promoTitle: code,
      discount,
    });
    return `Промокод <code> ${code} </code> на ${discount} % успешно создан`;
  } catch (error) {
    console.log(error);
    return `Промокод <code> ${code} </code> на ${discount} % не удалось создать`;
  }
}

export async function getPromocodesMessage() {
  const promocodes = await PromocodeModel.findAll();

  let message = "<b>Список промокодов -></b>\n";
  if (promocodes.length === 0) {
    message = "<b>Список промокодов пуст</b>\n";
  }
  for (const code of promocodes) {
    message += `<code>${code.promoTitle}</code> - Использовано: ${code.timesUsed}\n`;
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
    return link;
  } catch {
    link = "не удалось создать ссылку";
    console.log("не удалось создать ссылку");
  }
};

export async function getLinksMessage() {
  const links = await LinkModel.findAll();
  if (links.length === 0) {
    return "<b>Список ссылок пуст</b>";
  }
  let message = "<b>Список ссылок:</b>\n";
  // eslint-disable-next-line no-restricted-syntax
  for (const link of links) {
    message += `${link.linkTitle} - Использовано: ${link.timesUsed}\n`;
  }
  return message;
}
export async function deletePromoCodeFromDB(code: string): Promise<string> {
  try {
    const promo = await PromocodeModel.findOne({
      where: {
        promoTitle: code,
      },
    });
    if (promo) {
      await promo.destroy();
      return `Промокод <code> ${code} </code> удален`;
    }
    return `Не удалось удалить промокод ${code}. Возможно такого промокода не существует`;
  } catch (error) {
    console.log(error);
    return `Не удалось удалить промокод ${code}. Возможно такого промокода не существует`;
  }
}

export async function deleteLinkFromDB(title: string): Promise<string> {
  try {
    const link = await LinkModel.findOne({
      where: {
        linkTitle: title,
      },
    });
    if (link) {
      await link.destroy();
      return `Ссылка <code> ${title} </code> удалена`;
    }
    return `Не удалось удалить ссылку ${title}. Возможно такой ссылки не существует`;
  } catch (error) {
    console.log(error);
    return `Не удалось удалить ссылку ${title}. Возможно такой ссылки не существует`;
  }
}
export async function activateSubscription(userId: number) {
  try {
    const user = await UserModel.findOne({
      where: {
        chatId: userId.toString(),
      },
    });
    if (user) {
      user.sub = true;
      await user.save();
      return `Подписка для ${userId} обновлена`;
    }
    return "Не удалось обновить подписку, возможно такого пользователя не существует";
  } catch (error) {
    console.log(error);
    return "Не удалось обновить подписку, возможно такого пользователя не существует";
  }
}
