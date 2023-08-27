import { DataTypes } from "sequelize";
import { sequelize } from "./database.js";

export const UserModel = sequelize.define(
	"user",
	{
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
		subEndDateTime: {
			type: DataTypes.INTEGER,
			defaultValue:0,
		},
	}
);
export const PromocodeModel = sequelize.define(
	"promocode",
	{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		promo: {
			type: DataTypes.STRING,
			unique: true,
		},
		timesUsed: {
			type: DataTypes.INTEGER
		},
	});