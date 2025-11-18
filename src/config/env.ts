import dotenv from "dotenv";
dotenv.config();

export const config = {
  discordToken: process.env.DISCORD_TOKEN ?? "",
  clientId: process.env.CLIENT_ID ?? "",
  guildId: process.env.GUILD_ID ?? "",
};

if (!config.discordToken) {
  throw new Error("DISCORD_TOKEN manquant dans .env");
}

if (!config.clientId) {
  throw new Error("CLIENT_ID manquant dans .env");
}

if (!config.guildId) {
  throw new Error("GUILD_ID manquant dans .env");
}
