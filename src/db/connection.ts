import { createPool, Pool } from "mysql2/promise";
import { config } from "../config/env";

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = createPool({
      host: config.dbHost,
      port: config.dbPort,
      user: config.dbUser,
      password: config.dbPassword,
      database: config.dbName,
      connectionLimit: 10,
    });

    console.log("[DB] Pool MySQL initialisé");
  }

  return pool;
}
