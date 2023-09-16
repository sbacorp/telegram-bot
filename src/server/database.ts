/* eslint-disable import/no-cycle */
import { Sequelize } from "sequelize";
import * as pg from "pg";

export const sequelize = new Sequelize("tgbotDB", "bogdan", "root", {
  host: "172.17.0.1",
  port: 5432,
  dialect: "postgres",
});
