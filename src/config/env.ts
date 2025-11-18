import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export interface AppConfig {
  token: string;
  clientId: string;
  guildId: string;
  dbHost: string;
  dbPort: number;
  dbUser: string;
  dbPassword: string;
  dbName: string;
}

export const config: AppConfig = {
  token: requireEnv("DISCORD_TOKEN"),
  clientId: requireEnv("CLIENT_ID"),
  guildId: requireEnv("GUILD_ID"),
  dbHost: requireEnv("DB_HOST"),
  dbPort: Number(requireEnv("DB_PORT")),
  dbUser: requireEnv("DB_USER"),
  dbPassword: process.env.DB_PASSWORD ?? "",
  dbName: requireEnv("DB_NAME"),
};
