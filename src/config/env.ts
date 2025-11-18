import dotenv from "dotenv";
dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN ?? "",
};

if (!config.discordToken) {
  throw new Error("DISCORD_TOKEN manquant dans le fichier .env");
}
