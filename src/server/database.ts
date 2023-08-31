/* eslint-disable import/no-cycle */
import { Sequelize } from "sequelize";
import * as pg from "pg";

export const sequelize = new Sequelize("tgbotDB", "bogdan", "root", {
  host: "0.0.0.0",
  port: 5432,
  dialect: "postgres",
});
