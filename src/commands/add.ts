import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";

export const data = new SlashCommandBuilder()
  .setName("add")
  .setDescription("Ajouter un produit à surveiller")
  .addStringOption((opt) =>
    opt
      .setName("url")
      .setDescription("URL du produit")
      .setRequired(true)
  )
  .addNumberOption((opt) =>
    opt
      .setName("seuil")
      .setDescription("Prix seuil")
      .setRequired(true)
  )
  .addStringOption((opt) =>
    opt
      .setName("nom")
      .setDescription("Nom du produit (optionnel)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const url = interaction.options.getString("url", true);
  const seuil = interaction.options.getNumber("seuil", true);
  const nom = interaction.options.getString("nom");

  if (seuil <= 0) {
    return interaction.reply({
      content: "❌ Le seuil doit être supérieur à 0.",
      ephemeral: true,
    });
  }

  const existing = await productsRepository.list();
  const name = nom || `Produit ${existing.length + 1}`;

  const produit = await productsRepository.add({
    name,
    url,
    targetPrice: seuil,
    channelId: interaction.channelId,
    userId: interaction.user.id,
  });

  await interaction.reply({
    content:
      `✅ Je surveille **${produit.name}** (ID: ${produit.id})\n` +
      `URL : ${produit.url}\n` +
      `Seuil : **${produit.targetPrice}€**`,
    ephemeral: true,
  });
}
