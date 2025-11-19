import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";
import { replyWithError } from "../utils/replyWithError";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Supprime un produit surveillé")
  .addIntegerOption((opt) =>
    opt
      .setName("id")
      .setDescription("ID du produit (voir /list)")
      .setRequired(true)
      .setMinValue(1)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getInteger("id", true);

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let produit;
  try {
    produit = await productsRepository.getById(id);
  } catch (err) {
    console.error(
      "[/remove] Erreur lors de la récupération du produit :",
      err
    );
    await replyWithError(
      interaction,
      "Impossible de récupérer les informations du produit pour le moment."
    );
    return;
  }

  if (!produit) {
    await interaction.editReply(
      `❌ Aucun produit trouvé avec l'ID **${id}**.`
    );
    return;
  }

  if (produit.userId !== interaction.user.id) {
    await interaction.editReply(
      "⛔ Tu ne peux pas supprimer un produit qui ne t'appartient pas."
    );
    return;
  }

  let removed: boolean;
  try {
    removed = await productsRepository.remove(id);
  } catch (err) {
    console.error(
      "[/remove] Erreur lors de la suppression du produit :",
      err
    );
    await replyWithError(
      interaction,
      "Impossible de supprimer ce produit pour le moment."
    );
    return;
  }

  if (!removed) {
    await interaction.editReply(
      `⚠️ Le produit **${produit.name}** (ID ${id}) semble déjà avoir été supprimé.`
    );
    return;
  }

  await interaction.editReply({
    content: `🗑️ Le produit **${produit.name}** (ID ${id}) a été retiré.`,
  });
}
