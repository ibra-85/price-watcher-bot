import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";
import { priceHistoryRepository } from "../data/priceHistoryRepository";
import { replyWithError } from "../utils/replyWithError";

export const data = new SlashCommandBuilder()
  .setName("history")
  .setDescription("Affiche l'historique des prix d'un produit")
  .addIntegerOption((opt) =>
    opt
      .setName("id")
      .setDescription("ID du produit (voir /list)")
      .setRequired(true)
      .setMinValue(1)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("limit")
      .setDescription("Nombre de points d'historique (défaut: 10)")
      .setRequired(false)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getInteger("id", true);
  const limit = interaction.options.getInteger("limit") ?? 10;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let product;
  try {
    product = await productsRepository.getById(id);
  } catch (err) {
    console.error("[/history] Erreur lors de la récupération du produit :", err);
    await replyWithError(
      interaction,
      "Impossible de récupérer les informations du produit pour le moment."
    );
    return;
  }

  if (!product) {
    await interaction.editReply(`❌ Aucun produit trouvé avec l'ID **${id}**.`);
    return;
  }

  if (product.userId !== interaction.user.id) {
    await interaction.editReply(
      "⛔ Tu ne peux voir l'historique que de tes propres produits."
    );
    return;
  }

  let history;
  try {
    history = await priceHistoryRepository.listForProduct(id, limit);
  } catch (err) {
    console.error(
      "[/history] Erreur lors de la récupération de l'historique de prix :",
      err
    );
    await replyWithError(
      interaction,
      "Impossible de récupérer l'historique des prix pour le moment."
    );
    return;
  }

  if (history.length === 0) {
    await interaction.editReply(
      `📭 Aucun historique de prix trouvé pour **${product.name}**.`
    );
    return;
  }

  const lignes = history
    .map((h) => {
      const date = new Date(h.checkedAt).toLocaleString("fr-FR");
      return `• ${date} — **${h.price}€**`;
    })
    .join("\n");

  await interaction.editReply(
    `📈 **Historique des prix pour ${product.name}** (dernier(s) ${history.length} point(s)) :\n\n${lignes}`
  );
}
