/* eslint-disable import/no-cycle */
import { DataTypes, Model } from "sequelize";
import { sequelize } from "./database.js";

export const UserModel = sequelize.define("user", {
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
  joinedToNutr: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  subEndDateTime: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

interface Promocode {
  id: number;
  promoTitle: string;
  discount: number;
  timesUsed: number;
}

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
