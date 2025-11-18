import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import { productsStore } from "../data/productsStore";

export const data = new SlashCommandBuilder()
  .setName("remove")
  .setDescription("Supprime un produit surveillé")
  .addIntegerOption((opt) =>
    opt
      .setName("id")
      .setDescription("L'ID du produit (voir /list)")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getInteger("id", true);

  const existing = productsStore.getById(id);
  if (!existing) {
    return interaction.reply({
      content: `❌ Aucun produit avec l'ID **${id}**.`,
      ephemeral: true,
    });
  }

  productsStore.remove(id);

  return interaction.reply({
    content: `🗑️ Le produit **${existing.name}** (ID ${id}) a été retiré.`,
    ephemeral: true,
  });
}
