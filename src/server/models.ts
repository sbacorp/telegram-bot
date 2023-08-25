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
		userBalance: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
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