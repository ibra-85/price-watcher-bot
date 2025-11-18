import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";
import { getProductName } from "../services/priceChecker";

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
      .setDescription("Nom du produit (si vide, sera récupéré automatiquement)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const url = interaction.options.getString("url", true);
  const seuil = interaction.options.getNumber("seuil", true);
  const nomSaisi = interaction.options.getString("nom");

  if (seuil <= 0) {
    return interaction.reply({
      content: "❌ Le seuil doit être supérieur à 0.",
      flags: MessageFlags.Ephemeral,
    });
  }

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const userId = interaction.user.id;

  // Pour le fallback "Produit X"
  const existing = await productsRepository.listByUser(userId);

  let finalName: string;

  if (nomSaisi) {
    finalName = nomSaisi;
  } else {
    try {
      finalName = await getProductName(url);
    } catch (err) {
      console.error("[/add] Impossible de récupérer le nom du produit :", err);
      finalName = `Produit ${existing.length + 1}`;
    }
  }

  const produit = await productsRepository.add({
    name: finalName,
    url,
    targetPrice: seuil,
    channelId: interaction.channelId,
    userId,
  });

  await interaction.editReply({
    content:
      `✅ Je surveille **${produit.name}** (ID: ${produit.id})\n` +
      `URL : ${produit.url}\n` +
      `Seuil : **${produit.targetPrice}€**`,
  });
}
