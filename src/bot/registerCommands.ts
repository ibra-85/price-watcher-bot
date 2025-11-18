import { REST, Routes } from "discord.js";
import { config } from "../config/env";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const commands: any[] = [];

  const commandsPath = path.join(__dirname, "..", "commands");
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  console.log("📂 Fichiers de commandes trouvés :", commandFiles);

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] La commande à ${filePath} n'a pas de propriété "data" ou "execute".`
      );
    }
  }

  const rest = new REST({ version: "10" }).setToken(config.token);

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
}

main();
