import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { checkAllProductsOnce } from "../services/scheduler";

export const data = new SlashCommandBuilder()
  .setName("check")
  .setDescription("Force une vérification immédiate de tous les produits surveillés");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  // Faire la vérification (on désactive les notifications)
  const results = await checkAllProductsOnce(interaction.client, {
    notify: false,
  });

  if (results.length === 0) {
    return interaction.editReply("📭 Aucun produit surveillé pour le moment.");
  }

  const lignes = results.map((r) => {
    if (r.error) {
      return `❌ **[${r.product.id}] ${r.product.name}**\nErreur : \`${r.error}\``;
    }

    const status = r.triggered
      ? "🔔 **Seuil atteint**"
      : "✅ Prix au-dessus du seuil";

    return (
      `${status}\n` +
      `**[${r.product.id}] ${r.product.name}** — **${r.price}€** (seuil : ${r.product.targetPrice}€)\n` +
      `${r.product.url}`
    );
  });

  await interaction.editReply(
    "📊 **Résultats de la vérification :**\n\n" + lignes.join("\n\n")
  );
}
