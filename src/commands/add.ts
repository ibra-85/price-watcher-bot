import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";
import { getProductName } from "../services/priceChecker";
import { validateTrackedUrl } from "../utils/urlValidation";
import { replyWithError } from "../utils/replyWithError";

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
      .setMinValue(0.01) // Limite côté Discord (UX)
  )
  .addStringOption((opt) =>
    opt
      .setName("nom")
      .setDescription("Nom du produit (si vide, sera récupéré automatiquement)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const rawUrl = interaction.options.getString("url", true);
  const seuil = interaction.options.getNumber("seuil", true);
  const nomSaisi = interaction.options.getString("nom");

  // Validation de l'URL
  let url: string;
  try {
    url = validateTrackedUrl(rawUrl);
  } catch (err) {
    await replyWithError(
      interaction,
      err instanceof Error
        ? err.message
        : "L'URL fournie n'est pas valide ou pas supportée."
    );
    return;
  }

  // Validation du seuil côté serveur (en plus du setMinValue)
  if (seuil <= 0) {
    await replyWithError(
      interaction,
      "Le seuil doit être supérieur à 0."
    );
    return;
  }

  await interaction.deferReply({ flags: 1 << 6 }); // MessageFlags.Ephemeral

  const userId = interaction.user.id;

  let finalName: string;

  // Si l'utilisateur a fourni un nom, on le garde (nettoyé)
  if (nomSaisi && nomSaisi.trim()) {
    finalName = nomSaisi.trim();
  } else {
    // Sinon, on essaie de récupérer le nom automatiquement
    try {
      finalName = await getProductName(url);
    } catch (err) {
      console.error("[/add] Impossible de récupérer le nom du produit :", err);

      // Fallback "Produit X" seulement si nécessaire
      const existing = await productsRepository.listByUser(userId);
      finalName = `Produit ${existing.length + 1}`;
    }
  }

  // Création du produit en base
  let produit;
  try {
    produit = await productsRepository.add({
      name: finalName,
      url,
      targetPrice: seuil,
      channelId: interaction.channelId,
      userId,
    });
  } catch (err) {
    console.error("[/add] Erreur lors de l'enregistrement du produit :", err);
    await replyWithError(
      interaction,
      "Impossible d'enregistrer le produit pour le moment. Réessaie plus tard."
    );
    return;
  }

  await interaction.editReply({
    content:
      `✅ Je surveille **${produit.name}** (ID: ${produit.id})\n` +
      `URL : ${produit.url}\n` +
      `Seuil : **${produit.targetPrice}€**`,
  });
}
