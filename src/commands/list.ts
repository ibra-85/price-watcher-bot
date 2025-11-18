import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { productsStore } from "../data/productsStore";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Liste des produits surveillés");

export async function execute(interaction: ChatInputCommandInteraction) {
  const produits = productsStore.list();

  if (produits.length === 0) {
    return interaction.reply({ content: "📭 Aucun produit surveillé.", ephemeral: true });
  }

  const text = produits
    .map(p => `**[${p.id}] ${p.name}** — seuil: ${p.targetPrice}€\n${p.url}`)
    .join("\n\n");

  await interaction.reply({
    content: `📋 **Produits surveillés :**\n\n${text}`,
    ephemeral: true
  });
}
