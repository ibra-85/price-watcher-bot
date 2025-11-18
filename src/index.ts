import { createClient } from "./bot/client";
import { setupScheduler } from "./services/scheduler";
import { config } from "./config/env";
import * as fs from "fs";
import * as path from "path";
import {
  ChatInputCommandInteraction,
  Interaction,
} from "discord.js";

type LoadedCommand = {
  data: { name: string };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

async function main() {
  const client = createClient();

  const commands = new Map<string, LoadedCommand>();
  const commandsPath = path.join(__dirname, "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  console.log("📂 Commandes détectées :", commandFiles);

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);

    const cmdModule: {
      data?: { name: string };
      execute?: (interaction: ChatInputCommandInteraction) => Promise<void>;
    } = require(filePath);

    if (!cmdModule.data || !cmdModule.execute) {
      console.warn(
        `[WARNING] La commande '${file}' est ignorée (data ou execute manquant).`
      );
      continue;
    }

    commands.set(cmdModule.data.name, {
      data: cmdModule.data,
      execute: cmdModule.execute,
    });
  }

  client.once("clientReady", () => {
    console.log(`🤖 Connecté en tant que ${client.user?.tag}`);
    setupScheduler(client);
  });

  client.on("interactionCreate", async (interaction: Interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (err) {
      console.error("❌ Erreur dans la commande :", err);
      if (interaction.deferred || interaction.replied) {
        await interaction.followUp({
          content: "❌ Erreur pendant l'exécution de la commande.",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "❌ Erreur pendant l'exécution de la commande.",
          ephemeral: true,
        });
      }
    }
  });

  await client.login(config.token);
}

main().catch((err) => {
  console.error("❌ Erreur au démarrage :", err);
});
