import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
} from "discord.js";
import { checkAllProductsOnce } from "../services/scheduler";

export const data = new SlashCommandBuilder()
  .setName("check")
  .setDescription("Force une vérification immédiate de tes produits surveillés");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const allResults = await checkAllProductsOnce(interaction.client, {
    notify: false,
  });

  const results = allResults.filter(
    (r) => r.product.userId === interaction.user.id
  );

  if (results.length === 0) {
    return interaction.editReply(
      "📭 Tu ne surveilles encore aucun produit. Utilise `/add` d'abord."
    );
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
