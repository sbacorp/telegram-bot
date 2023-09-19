/* eslint-disable unicorn/no-null */
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
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  fio: {
    type: DataTypes.STRING,
    defaultValue: "",
  },
  sex: {
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
  boughtProducts: {
    type: DataTypes.STRING,
    defaultValue: null,
  },
  consultationPaidStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
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
  product: {
    type: DataTypes.STRING,
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
export interface IConsultationAppointment extends Model {
  id: number;
  date: string;
  time: string;
}
export const ConsultationAppointmentModel =
  sequelize.define<IConsultationAppointment>("consultationAppointment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    date: {
      type: DataTypes.STRING,
    },
    time: {
      type: DataTypes.STRING,
    },
  });

ConsultationAppointmentModel.belongsTo(UserModel, { foreignKey: "chatId" });
