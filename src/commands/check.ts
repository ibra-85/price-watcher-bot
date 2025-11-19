import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";
import { checkAllProductsOnce } from "../services/scheduler";
import { replyWithError } from "../utils/replyWithError";

export const data = new SlashCommandBuilder()
  .setName("check")
  .setDescription("Force une vérification immédiate de tes produits surveillés");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  let allResults;
  try {
    allResults = await checkAllProductsOnce(interaction.client, {
      notify: false,
    });
  } catch (err) {
    console.error("[/check] Erreur pendant checkAllProductsOnce :", err);
    await replyWithError(
      interaction,
      "Une erreur est survenue pendant la vérification des produits. Réessaie un peu plus tard."
    );
    return;
  }

  const userId = interaction.user.id;

  const results = allResults.filter(
    (r) => r.product.userId === userId
  );

  if (results.length === 0) {
    await interaction.editReply(
      "📭 Tu ne surveilles encore aucun produit. Utilise `/add` pour en ajouter."
    );
    return;
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
