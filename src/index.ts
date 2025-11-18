import { createClient } from "./bot/client";
import { setupScheduler } from "./services/scheduler";
import { config } from "./config/env";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const client = createClient();

  // Charger toutes les commandes en mémoire
  const commands = new Map();
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const cmd = require(path.join(commandsPath, file));
    commands.set(cmd.data.name, cmd);
  }

  client.once("clientReady", () => {
    console.log(`🤖 Connecté en tant que ${client.user?.tag}`);
    setupScheduler(client);
  });

  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: "❌ Erreur pendant l'exécution", ephemeral: true });
    }
  });

  await client.login(config.discordToken);
}

main();
