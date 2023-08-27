/* eslint-disable import/no-cycle */
import { Sequelize } from "sequelize";
import * as pg from "pg";

export const sequelize = new Sequelize("tgdb", "bogdan", "root", {
  host: "0.0.0.0",
  port: 32_768,
  dialect: "postgres",
});
