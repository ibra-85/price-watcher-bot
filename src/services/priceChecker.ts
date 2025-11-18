import axios from "axios";
import * as cheerio from "cheerio";
import { SITE_CONFIGS } from "../config/sites";

type CheerioAPI = cheerio.CheerioAPI;

function normalizePrice(raw: string): number {
  const trimmed = raw.replace(/\s+/g, " ").trim();

  // Cas "699€95" ou "699 € 95"
  const euroCentsMatch = trimmed.match(/(\d+)\s*€\s*(\d{1,2})/);
  if (euroCentsMatch) {
    const euros = parseInt(euroCentsMatch[1], 10);
    const cents = parseInt(euroCentsMatch[2].padEnd(2, "0"), 10);
    return euros + cents / 100;
  }

  // Cas classiques "399.99 €", "399,99 €", etc.
  const cleaned = trimmed
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const price = parseFloat(cleaned);
  if (isNaN(price)) {
    throw new Error(`Prix non parsable : ${raw}`);
  }

  return price;
}

async function fetchDocument(url: string): Promise<CheerioAPI> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  return cheerio.load(res.data);
}

function getSiteConfig(url: string) {
  const cfg = SITE_CONFIGS.find((s) => s.match(url));
  if (!cfg) {
    throw new Error("Site non supporté pour le moment.");
  }
  return cfg;
}

function extractFirstValid($: CheerioAPI, selectors: string[]): string | null {
  for (const sel of selectors) {
    const text = $(sel).first().text().trim();
    if (text) return text;
  }
  return null;
}

function fallbackPrice($: CheerioAPI): string | null {
  const body = $("body").text();
  const match = body.match(/\d+[.,]\d{2}\s*€/);
  return match?.[0] ?? null;
}

function fallbackName($: CheerioAPI): string | null {
  const title = $("title").text().trim();
  if (!title) return null;
  return title.replace(/\s*[\|\-].*$/, "").trim();
}

export async function getPrice(url: string): Promise<number> {
  const cfg = getSiteConfig(url);
  const $ = await fetchDocument(url);

  let raw = extractFirstValid($, cfg.priceSelectors);
  if (!raw) raw = fallbackPrice($);

  if (!raw) {
    throw new Error("Impossible de trouver le prix sur la page.");
  }

  return normalizePrice(raw);
}

export async function getProductName(url: string): Promise<string> {
  const cfg = getSiteConfig(url);
  const $ = await fetchDocument(url);

  let name = extractFirstValid($, cfg.nameSelectors);
  if (!name) name = fallbackName($);

  if (!name) {
    throw new Error("Impossible de récupérer le nom du produit.");
  }

  return name.replace(/\s+/g, " ");
}
