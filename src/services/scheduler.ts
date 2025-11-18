import cron from "node-cron";
import { Client, TextChannel } from "discord.js";
import { productsStore } from "../data/productsStore";
import { getPrice } from "./priceChecker";

export async function checkAllProductsOnce(client: Client): Promise<void> {
  console.log("[CRON] Vérification des prix...");

  const products = productsStore.getAll();

  for (const p of products) {
    try {
      const currentPrice = await getPrice(p.url);
      console.log(
        `[CRON] ${p.name} → ${currentPrice}€ (seuil: ${p.targetPrice}€)`
      );

      if (currentPrice <= p.targetPrice) {
        const channel = await client.channels.fetch(p.channelId);
        if (channel && channel.isTextBased()) {
          await (channel as TextChannel).send(
            `🔥 **Bon plan détecté !**\n` +
              `**${p.name}** est à **${currentPrice}€** (seuil: ${p.targetPrice}€)\n` +
              `${p.url}`
          );
        }
      }
    } catch (err: any) {
      console.error(`[CRON] Erreur pour ${p.url}:`, err.message);
    }
  }
}

export function setupScheduler(client: Client): void {
  // toutes les 30 minutes
  cron.schedule("*/30 * * * *", () => {
    void checkAllProductsOnce(client);
  });
}
