import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { productsRepository } from "../data/productsRepository";
import { priceHistoryRepository } from "../data/priceHistoryRepository";

export const data = new SlashCommandBuilder()
  .setName("history")
  .setDescription("Affiche l'historique des prix d'un produit")
  .addIntegerOption((opt) =>
    opt
      .setName("id")
      .setDescription("ID du produit (voir /list)")
      .setRequired(true)
  )
  .addIntegerOption((opt) =>
    opt
      .setName("limit")
      .setDescription("Nombre de points d'historique (défaut: 10)")
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getInteger("id", true);
  const limit = interaction.options.getInteger("limit") ?? 10;

  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const product = await productsRepository.getById(id);

  if (!product) {
    return interaction.editReply(`❌ Aucun produit trouvé avec l'ID **${id}**.`);
  }

  if (product.userId !== interaction.user.id) {
    return interaction.editReply(
      "⛔ Tu ne peux voir l'historique que de tes propres produits."
    );
  }

  const history = await priceHistoryRepository.listForProduct(id, limit);

  if (history.length === 0) {
    return interaction.editReply(
      `📭 Aucun historique de prix trouvé pour **${product.name}**.`
    );
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
