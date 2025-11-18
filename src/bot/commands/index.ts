import { Message } from "discord.js";
import { handleAddCommand } from "./add";
import { handleListCommand } from "./list";

const PREFIX = "!";

export async function handleMessage(message: Message): Promise<void> {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const withoutPrefix = message.content.slice(PREFIX.length).trim();
  const [command, ...args] = withoutPrefix.split(/\s+/);

  switch (command.toLowerCase()) {
    case "add":
      await handleAddCommand(message, args);
      break;
    case "list":
      await handleListCommand(message);
      break;
    default:
      await message.reply(
        "Commande inconnue. Commandes dispo : `!add`, `!list`."
      );
      break;
  }
}
