import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { productsStore } from "../data/productsStore";

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
  const nom =
    interaction.options.getString("nom") ||
    `Produit ${productsStore.list().length + 1}`;

  if (seuil <= 0) {
    return interaction.reply({
      content: "❌ Le seuil doit être supérieur à 0.",
      ephemeral: true,
    });
  }

  const produit = productsStore.add({
    name: nom,
    url,
    targetPrice: seuil,
    channelId: interaction.channelId,
  });

  await interaction.reply({
    content:
      `✅ Je surveille **${produit.name}** (ID: ${produit.id})\n` +
      `URL : ${produit.url}\n` +
      `Seuil : **${produit.targetPrice}€**`,
    ephemeral: true,
  });
}
