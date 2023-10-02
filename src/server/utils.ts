/* eslint-disable unicorn/prefer-ternary */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
import { Op, Sequelize } from "sequelize";
import {
  BotSiteLinkModel,
  NutrLinkModel,
  PromocodeModel,
  UserModel,
} from "./models.js";

export async function initDB(sequelize: Sequelize) {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Connection to DB established");
  } catch {
    console.error("Unable to connect to DB");
  }
}

export async function findOrCreateUser(
  chatId: number,
  name: string,
  reference?: string
) {
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
    await UserModel.create({ chatId, name });
    if (reference) {
      const reflink = `https://t.me/Alla_nutriciolog_bot?start=${reference}`;
      const link = await BotSiteLinkModel.findOne({
        where: {
          linkTitle: reflink,
        },
      });
      if (link) {
        link.timesUsed += 1;
        await link.save();
      }
    }
    return false;
  } catch (error) {
    console.error(error);
  }
}
export async function fetchUser(chatId: string) {
  try {
    const user = await UserModel.findOne({
      where: { chatId },
    });
    return user;
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
  discount: number,
  product: string
): Promise<string> {
  try {
    await PromocodeModel.create({
      promoTitle: code,
      discount,
      product,
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

const botLink = "https://t.me/Alla_nutriciolog_bot?start=";
export const createBotSiteLink = async (title: string, link: string) => {
  try {
    await BotSiteLinkModel.create({
      linkTitle: title,
      link: botLink + link,
    });
    return botLink + link;
  } catch {
    console.log("не удалось создать ссылку");
    return "не удалось создать ссылку";
  }
};
const nutrBotLink = "https://t.me/Tvoi_Nutriciolog_bot?start=";
export const createNutrLink = async (title: string, link: string) => {
  try {
    await NutrLinkModel.create({
      linkTitle: title,
      link: nutrBotLink + link,
    });
    return nutrBotLink + link;
  } catch {
    console.log("не удалось создать ссылку");
    return "не удалось создать ссылку";
  }
};

export async function getLinksMessage() {
  let message: string = "";
  const links = await BotSiteLinkModel.findAll();
  if (links.length === 0) {
    message += "<b>Список ссылок для первого бота пуст</b>\n";
  } else {
    message += "<b>Список ссылок для первого бота:</b>\n-------------------\n";
    for (const link of links) {
      message += `${link.link} \n Использовано: ${link.timesUsed}\n-------------------\n`;
    }
  }
  const nutrLinks = await NutrLinkModel.findAll();
  if (nutrLinks.length === 0) {
    message += "<b>Список ссылок для второго бота пуст</b>\n";
  } else {
    message += "<b>Список ссылок для второго бота:</b>\n";
    for (const link of nutrLinks) {
      message += `${link.link} \n Использовано: ${link.timesUsed}\n Купили подписку: ${link?.usersBoughtSub}\n-------------------\n`;
    }
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

export async function deleteLinkFromDB(
  title: string,
  linkType: string
): Promise<string> {
  if (linkType === "botSite") {
    try {
      const link = await BotSiteLinkModel.findOne({
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
  } else {
    try {
      const link = await NutrLinkModel.findOne({
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

export const findPromoCodeByTitleAndProduct = async (
  product: string,
  promoTitle: string,
  chatId: string
) => {
  try {
    const user = await UserModel.findOne({
      where: {
        chatId,
      },
    });
    const userCurrentPromo = user?.promoCode;
    const promo = await PromocodeModel.findOne({
      where: {
        promoTitle,
        product: {
          [Op.or]: [product, "all"],
        },
      },
    });
    if (user && promo && !userCurrentPromo?.includes(promoTitle)) {
      promo.timesUsed += 1;
      await promo.save();
      user.promoCode = userCurrentPromo
        ? `${userCurrentPromo},${promoTitle}`
        : promoTitle;
      await user.save();
      return promo;
    }
  } catch (error) {
    console.log(error);
  }
};
type UserAttributes =
  | "sub"
  | "joinedToNutr"
  | "status"
  | "promoCode"
  | "phoneNumber"
  | "fio"
  | "boughtProducts"
  | "consultationPaidStatus"
  | "sex"
  | "buyDate"
  | "consultationDate";

export const editUserAttribute = async (
  chatId: string,
  attribute: UserAttributes,
  payload: string | number | boolean
) => {
  try {
    const user = await UserModel.findOne({
      where: {
        chatId,
      },
    });
    if (user) {
      // @ts-ignore
      user[attribute] = payload;
      await user.save();
    }
  } catch (error) {
    console.log(error);
  }
};
