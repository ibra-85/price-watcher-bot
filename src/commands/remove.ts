import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Supprime un produit surveillé")
  .addIntegerOption((opt) =>
    opt
      .setName("id")
      .setDescription("ID du produit (voir /list)")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getInteger("id", true);

  const produit = await productsRepository.getById(id);

  if (!produit) {
    return interaction.reply({
      content: `❌ Aucun produit trouvé avec l'ID **${id}**.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (produit.userId !== interaction.user.id) {
    return interaction.reply({
      content: "⛔ Tu ne peux pas supprimer un produit qui ne t'appartient pas.",
      flags: MessageFlags.Ephemeral,
    });
  }

  await productsRepository.remove(id);

  return interaction.reply({
    content: `🗑️ Le produit **${produit.name}** (ID ${id}) a été retiré.`,
    flags: MessageFlags.Ephemeral,
  });
}
