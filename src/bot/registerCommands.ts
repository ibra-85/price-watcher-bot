// src/bot/registerCommands.ts
import { REST, Routes } from "discord.js";
import { config } from "../config/env";
import * as fs from "fs";
import * as path from "path";

const commands: any[] = [];

// Dossier des commandes
const commandsPath = path.join(__dirname, "..", "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[WARNING] La commande à ${filePath} n'a pas "data" ou "execute".`
    );
  }
}

// REST client
const rest = new REST({ version: "10" }).setToken(config.discordToken);

// Déploiement
(async () => {
  try {
    console.log(
      `🔄 Déploiement de ${commands.length} commande(s) sur la guilde ${config.guildId}...`
    );

    const data: any = await rest.put(
      Routes.applicationGuildCommands(config.clientId, config.guildId),
      { body: commands }
    );

    console.log(
      `✅ ${data.length} commande(s) slash rechargée(s) avec succès.`
    );
  } catch (error) {
    console.error("❌ Erreur lors du déploiement des commandes :", error);
  }
})();
