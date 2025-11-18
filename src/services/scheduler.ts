import cron from "node-cron";
import { Client, TextChannel } from "discord.js";
import {
  productsRepository,
  TrackedProduct,
} from "../data/productsRepository";
import { priceHistoryRepository } from "../data/priceHistoryRepository";
import { getPrice } from "./priceChecker";

export interface CheckResult {
  product: TrackedProduct;
  price?: number;
  error?: string;
  triggered: boolean;
}

export async function checkAllProductsOnce(
  client: Client,
  options?: { notify?: boolean }
): Promise<CheckResult[]> {
  const notify = options?.notify ?? true;

  console.log("[CHECK] Vérification des prix...");

  const products = await productsRepository.getAll();
  const results: CheckResult[] = [];

  for (const p of products) {
    try {
      const currentPrice = await getPrice(p.url);
      const triggered = currentPrice <= p.targetPrice;

      // historique des prix
      await priceHistoryRepository.add(p.id, currentPrice);

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

export function setupScheduler(client: Client): void {
  // Prod: "*/30 * * * *", Dev: "*/1 * * * *"
  cron.schedule("*/30 * * * *", () => {
    void checkAllProductsOnce(client, { notify: true });
  });
}
