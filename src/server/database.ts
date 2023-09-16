/* eslint-disable import/no-cycle */
import { Sequelize } from "sequelize";
import * as pg from "pg";
import { config } from "#root/config.js";

export const sequelize = new Sequelize("tgbotDB", "bogdan", "root", {
  host: config.DATABASE_IP,
  port: 5432,
  dialect: "postgres",
});
