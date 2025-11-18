import cron from "node-cron";
import { Client, TextChannel } from "discord.js";
import { productsStore, TrackedProduct } from "../data/productsStore";
import { getPrice } from "./priceChecker";

export interface CheckResult {
  product: TrackedProduct;
  price?: number;
  error?: string;
  triggered: boolean; // true si le seuil a été atteint ou dépassé
}

/**
 * Vérifie tous les produits une fois.
 * - Si options.notify === true (par défaut), envoie des notifications Discord quand le seuil est atteint.
 * - Retourne toujours la liste des résultats pour utilisation (ex: /check).
 */
export async function checkAllProductsOnce(
  client: Client,
  options?: { notify?: boolean }
): Promise<CheckResult[]> {
  const notify = options?.notify ?? true;

  console.log("[CHECK] Vérification des prix...");

  const products = productsStore.getAll();
  const results: CheckResult[] = [];

  for (const p of products) {
    try {
      const currentPrice = await getPrice(p.url);
      const triggered = currentPrice <= p.targetPrice;

      console.log(
        `[CHECK] ${p.name} → ${currentPrice}€ (seuil: ${p.targetPrice}€) | triggered=${triggered}`
      );

      if (notify && triggered) {
        const channel = await client.channels.fetch(p.channelId);
        if (channel && channel.isTextBased()) {
          await (channel as TextChannel).send(
            `🔥 **Bon plan détecté !**\n` +
              `**${p.name}** est à **${currentPrice}€** (seuil: ${p.targetPrice}€)\n` +
              `${p.url}`
          );
        }
      }

      results.push({
        product: p,
        price: currentPrice,
        triggered,
      });
    } catch (err: any) {
      console.error(`[CHECK] Erreur pour ${p.url}:`, err.message);

      results.push({
        product: p,
        error: err?.message ?? String(err),
        triggered: false,
      });
    }
  }

  return results;
}

/**
 * Planifie une vérification régulière via cron.
 */
export function setupScheduler(client: Client): void {
  // toutes les 30 minutes (pour dev tu peux mettre "*/1 * * * *")
  cron.schedule("*/30 * * * *", () => {
    void checkAllProductsOnce(client, { notify: true });
  });
}
