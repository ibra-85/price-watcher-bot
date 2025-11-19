import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";
import { replyWithError } from "../utils/replyWithError";

export const data = new SlashCommandBuilder()
  .setName("list")
  .setDescription("Liste les produits surveillés (pour toi)");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let produits;
  try {
    produits = await productsRepository.listByUser(interaction.user.id);
  } catch (err) {
    console.error("[/list] Erreur lors de la récupération des produits :", err);
    await replyWithError(
      interaction,
      "Impossible de récupérer ta liste de produits pour le moment."
    );
    return;
  }

  if (produits.length === 0) {
    await interaction.editReply("📭 Tu ne surveilles encore aucun produit.");
    return;
  }

  const text = produits
    .map(
      (p) =>
        `**[${p.id}] ${p.name}** — seuil: ${p.targetPrice}€\n${p.url}`
    )
    .join("\n\n");

  await interaction.editReply(
    `📋 **Tes produits surveillés :**\n\n${text}`
  );
}
