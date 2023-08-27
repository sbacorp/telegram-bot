/* eslint-disable import/no-extraneous-dependencies */
import { Sequelize } from "sequelize";
import * as pg from "pg";
import { UserModel } from "./models.js";

export const sequelize = new Sequelize("tgdb", "bogdan", "root", {
	host: "0.0.0.0",
	port: 32768,
	dialect: "postgres",
});
