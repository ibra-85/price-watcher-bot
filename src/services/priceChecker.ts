import axios from "axios";
import * as cheerio from "cheerio";
import { SITE_CONFIGS } from "../config/sites";
import { appConfig } from "../config/app";


type CheerioAPI = cheerio.CheerioAPI;
type SiteConfig = (typeof SITE_CONFIGS)[number];

// Client HTTP configuré (timeout + User-Agent)
const http = axios.create({
  timeout: appConfig.http.timeoutMs,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 PriceWatcherBot/1.0",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
  },
});


/**
 * Normalise une chaîne de prix en nombre (en euros).
 * Gère des formats du type :
 *  - "699€95"
 *  - "699 € 95"
 *  - "699,95 €"
 *  - "699.95 €"
 *  - "€ 699,95"
 */
function normalizePrice(raw: string): number {
  const trimmed = raw.replace(/\s+/g, " ").trim();

  // Cas "699€95" ou "699 € 95"
  const euroCentsMatch = trimmed.match(/(\d+)\s*€\s*(\d{1,2})/);
  if (euroCentsMatch) {
    const euros = parseInt(euroCentsMatch[1], 10);
    const cents = parseInt(euroCentsMatch[2].padEnd(2, "0"), 10);
    return euros + cents / 100;
  }

  // Cas classiques : "699,95 €", "699.95 €", "€699,95"…
  // 1) on enlève tout ce qui n'est pas chiffre, virgule ou point
  const cleaned = trimmed.replace(/[^\d,\.]/g, "");

  // 2) on remplace la virgule par un point (format décimal JS)
  const normalized = cleaned.replace(",", ".");

  // 3) on parse
  const value = parseFloat(normalized);
  if (Number.isNaN(value)) {
    throw new Error(`Impossible de parser le prix : "${raw}"`);
  }

  return value;
}

/**
 * Récupère la config de site correspondant à une URL.
 * Utilise la fonction `match` définie dans SITE_CONFIGS.
 */
function getSiteConfig(url: string): SiteConfig {
  const cfg = SITE_CONFIGS.find((c) => c.match(url));
  if (!cfg) {
    throw new Error("Ce site n'est pas encore supporté par le bot.");
  }
  return cfg;
}

/**
 * Essaie une liste de sélecteurs CSS et retourne le premier texte non vide.
 */
function extractFirstValid(
  $: CheerioAPI,
  selectors: string[]
): string | null {
  for (const selector of selectors) {
    const el = $(selector).first();
    if (!el || el.length === 0) continue;

    const text = el.text().replace(/\s+/g, " ").trim();
    if (text) {
      return text;
    }
  }
  return null;
}

/**
 * Fallback pour le nom du produit si les sélecteurs spécifiques échouent.
 */
function fallbackName($: CheerioAPI): string | null {
  // og:title
  const ogTitle =
    $('meta[property="og:title"]').attr("content") ??
    $('meta[name="og:title"]').attr("content");
  if (ogTitle && ogTitle.trim()) {
    return ogTitle.trim();
  }

  // <title>
  const title = $("title").first().text().replace(/\s+/g, " ").trim();
  if (title) {
    return title;
  }

  // <h1>
  const h1 = $("h1").first().text().replace(/\s+/g, " ").trim();
  if (h1) {
    return h1;
  }

  return null;
}

/**
 * Télécharge la page et renvoie un objet Cheerio prêt à être interrogé.
 */
async function fetchDocument(url: string): Promise<CheerioAPI> {
  const response = await http.get<string>(url);
  return cheerio.load(response.data);
}

/**
 * Récupère le prix actuel d'un produit à partir de son URL.
 */
export async function getPrice(url: string): Promise<number> {
  const cfg = getSiteConfig(url);
  const $ = await fetchDocument(url);

  const priceText = extractFirstValid($, cfg.priceSelectors);
  if (!priceText) {
    throw new Error("Impossible de trouver le prix sur la page.");
  }

  const price = normalizePrice(priceText);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Le prix récupéré est invalide.");
  }

  return price;
}

/**
 * Récupère le nom du produit à partir de son URL.
 */
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