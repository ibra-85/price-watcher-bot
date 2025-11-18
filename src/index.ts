import { createClient } from "./bot/client";
import { config } from "./config/env";
import { handleMessage } from "./bot/commands";
import { setupScheduler } from "./services/scheduler";

async function main() {
  const client = createClient();

  client.once("ready", () => {
    console.log(`✅ Connecté en tant que ${client.user?.tag}`);
    setupScheduler(client);
  });

  client.on("messageCreate", async (message) => {
    try {
      await handleMessage(message);
    } catch (err) {
      console.error("Erreur dans handleMessage :", err);
    }
  });

  await client.login(config.discordToken);
}

main().catch((err) => {
  console.error("Erreur au démarrage :", err);
});
