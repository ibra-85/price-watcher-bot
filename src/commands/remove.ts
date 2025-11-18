import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { productsStore } from "../data/productsStore";

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

  const produit = productsStore.getById(id);

  if (!produit) {
    return interaction.reply({
      content: `❌ Aucun produit trouvé avec l'ID **${id}**.`,
      ephemeral: true,
    });
  }

  productsStore.remove(id);

  return interaction.reply({
    content: `🗑️ Le produit **${produit.name}** (ID ${id}) a été retiré.`,
    ephemeral: true,
  });
}
