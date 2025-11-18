import { Message } from "discord.js";
import { productsStore } from "../../data/productsStore";

export async function handleListCommand(message: Message): Promise<void> {
  const products = productsStore.list();

  if (products.length === 0) {
    await message.reply("Tu ne surveilles encore aucun produit.");
    return;
  }

  const lines = products.map(
    (p) =>
      `• **[${p.id}] ${p.name}** → seuil: ${p.targetPrice}€\n` +
      `${p.url} (salon: <#${p.channelId}>)`
  );

  await message.reply("📋 Produits surveillés :\n\n" + lines.join("\n\n"));
}
