import { Message } from "discord.js";
import { productsStore } from "../../data/productsStore";

export async function handleAddCommand(message: Message, args: string[]): Promise<void> {
  if (args.length < 2) {
    await message.reply("Usage : `!add <url> <prix_seuil> [nom]`");
    return;
  }

  const [url, seuilStr, ...nameParts] = args;
  const targetPrice = parseFloat(seuilStr.replace(",", "."));
  const name = nameParts.join(" ") || `Produit ${productsStore.list().length + 1}`;

  if (isNaN(targetPrice)) {
    await message.reply("Le prix seuil n’est pas valide.");
    return;
  }

  const product = productsStore.add({
    name,
    url,
    targetPrice,
    channelId: message.channel.id,
  });

  await message.reply(
    `✅ Je surveille **${product.name}** (id: ${product.id})\n` +
      `URL: ${product.url}\n` +
      `Seuil: **${product.targetPrice}€**`
  );
}
