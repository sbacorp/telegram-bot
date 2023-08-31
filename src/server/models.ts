/* eslint-disable import/no-cycle */
import { DataTypes, Model } from "sequelize";
import { sequelize } from "./database.js";

interface IUserModel extends Model {
  id: number;
  chatId: string;
  sub: boolean;
  referenceFrom: string;
  joinedToNutr: boolean;
  subEndDateTime: number;
  promoCode: string;
}
export const UserModel = sequelize.define<IUserModel>("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  chatId: {
    type: DataTypes.STRING,
    unique: true,
  },
  sub: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  referenceFrom: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  joinedToNutr: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  promoCode: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  subEndDateTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

interface IPromocodeModel extends Model {
  id: number;
  promoTitle: string;
  discount: number;
  timesUsed: number;
}
export const PromocodeModel = sequelize.define<IPromocodeModel>("promocode", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  promoTitle: {
    type: DataTypes.STRING,
    unique: true,
  },
  discount: {
    type: DataTypes.INTEGER,
  },
  timesUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

interface ILinkModel extends Model {
  id: number;
  linkTitle: string;
  timesUsed: number;
}

export const LinkModel = sequelize.define<ILinkModel>("link", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  linkTitle: {
    type: DataTypes.STRING,
    unique: true,
  },
  timesUsed: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});
