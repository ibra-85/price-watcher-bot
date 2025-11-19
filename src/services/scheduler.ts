import cron from "node-cron";
import { Client, TextChannel } from "discord.js";
import {
  productsRepository,
  TrackedProduct,
} from "../data/productsRepository";
import { priceHistoryRepository } from "../data/priceHistoryRepository";
import { getPrice } from "./priceChecker";
import { appConfig } from "../config/app";

export interface CheckResult {
  product: TrackedProduct;
  price?: number;
  error?: string;
  triggered: boolean;
}

interface CheckOptions {
  notify: boolean;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function notifyIfNeeded(
  client: Client,
  product: TrackedProduct,
  price: number
): Promise<void> {
  const channel = await client.channels.fetch(product.channelId);
  if (!channel || !channel.isTextBased()) {
    return;
  }

  const textChannel = channel as TextChannel;

  await textChannel.send(
    `📉 **${product.name}** est passé à **${price}€** (seuil : ${product.targetPrice}€)\n${product.url}`
  );
}

async function checkSingleProduct(
  client: Client,
  product: TrackedProduct,
  options: CheckOptions
): Promise<CheckResult> {
  try {
    const price = await getPrice(product.url);
    await priceHistoryRepository.add(product.id, price);

    const triggered = price <= product.targetPrice;

    if (options.notify && triggered) {
      try {
        await notifyIfNeeded(client, product, price);
      } catch (err) {
        console.error(
          `Erreur lors de la notification pour le produit ${product.id}:`,
          err
        );
      }
    }

    return { product, price, triggered };
  } catch (err: any) {
    console.error(
      `Erreur pendant la vérification du produit ${product.id} (${product.url}) :`,
      err
    );
    return {
      product,
      error: err?.message ?? String(err),
      triggered: false,
    };
  }
}

export async function checkAllProductsOnce(
  client: Client,
  options: CheckOptions
): Promise<CheckResult[]> {
  // ⚠️ Utilise la méthode existante productsRepository.getAll()
  const products = await productsRepository.getAll();
  const results: CheckResult[] = [];

  if (!products.length) {
    console.log("ℹ️ Aucun produit à vérifier.");
    return results;
  }

  console.log(
    `🔎 Vérification de ${products.length} produit(s) (notify=${options.notify})`
  );

    for (let i = 0; i < products.length; i += appConfig.scheduler.batchSize) {
    const batch = products.slice(i, i + appConfig.scheduler.batchSize);

    const batchResults = await Promise.all(
      batch.map((p) => checkSingleProduct(client, p, options))
    );
    results.push(...batchResults);

    if (i + appConfig.scheduler.batchSize < products.length) {
      await sleep(appConfig.scheduler.delayBetweenBatchesMs);
    }
  }

  console.log("✅ Vérification terminée.");
  return results;
}

export function setupScheduler(client: Client): void {
  cron.schedule(appConfig.scheduler.cron, () => {
    void checkAllProductsOnce(client, { notify: true });
  });
}

