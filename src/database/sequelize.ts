/** @format */

import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

dotenv.config();

const psql = async () => {
  const sequelize = new Sequelize(process.env.PG_CONNECTION_STRING as string, {
    logging: false,
    models: [
      __dirname + "/../**/**/*.model.ts", // TypeScript fayllar uchun
      __dirname + "/../**/**/*.model.js", // JavaScript fayllar uchun
    ],
  });

  const schemas: string[] = ["Auth", "Test"];

  for (const schema of schemas) {
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS "${schema}";`);
  }

  try {
    await sequelize.authenticate();
    console.log("PostgreSQL bilan muvaffaqiyatli ulanildi!");
  } catch (error) {
    console.log("PostgreSQL bilan bog'lanishda xatolik:", error);
  }

  await sequelize.sync({
    alter: true,
  });

  return sequelize;
};

export default psql;
