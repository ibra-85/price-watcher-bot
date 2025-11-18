import { Client, GatewayIntentBits } from "discord.js";

export function createClient(): Client {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
    ],
  });

  return client;
}
