import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Liste les produits surveillés (pour toi)");

export async function execute(interaction: ChatInputCommandInteraction) {
  const produits = await productsRepository.listByUser(interaction.user.id);

  if (produits.length === 0) {
    return interaction.reply({
      content: "📭 Tu ne surveilles encore aucun produit.",
      flags: MessageFlags.Ephemeral,
    });
  }

  const text = produits
    .map(
      (p) =>
        `**[${p.id}] ${p.name}** — seuil: ${p.targetPrice}€\n${p.url}`
    )
    .join("\n\n");

  await interaction.reply({
    content: `📋 **Tes produits surveillés :**\n\n${text}`,
    flags: MessageFlags.Ephemeral,
  });
}
