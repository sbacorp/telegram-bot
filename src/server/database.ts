/* eslint-disable import/no-extraneous-dependencies */
import { Sequelize } from "sequelize";
import * as pg from "pg";

export const sequelize = new Sequelize("tgUsers", "bogdan","rootPass",  {
  host: "45.130.8.237",
  port: 5432,
  dialect: "postgres",
});
