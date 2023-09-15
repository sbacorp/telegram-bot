/* eslint-disable import/no-cycle */
import { DataTypes, Model } from "sequelize";
import {
  IConsultationModelModel,
  ILinkModel,
  IPromocodeModel,
  IUserModel,
} from "#root/typing.js";
import { sequelize } from "./database.js";

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
  phoneNumber: {
    type: DataTypes.STRING,
    defaultValue: "",
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

export const ConsultationModel = sequelize.define<IConsultationModelModel>(
  "consultation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.STRING,
    },
    time10: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time11: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time12: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time13: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time14: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time15: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time16: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time17: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time18: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time19: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    time20: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }
);
