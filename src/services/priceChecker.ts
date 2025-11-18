import axios from "axios";
import * as cheerio from "cheerio";

type CheerioAPI = cheerio.CheerioAPI;

function normalizePrice(raw: string): number {
  const normalized = raw
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const price = parseFloat(normalized);

  if (isNaN(price)) {
    throw new Error(`Prix non parsable : ${raw}`);
  }

  return price;
}

/**
 * Fetch générique pour n'importe quel site.
 * Réutilisé par tous les scrapers (TopAchat, LDLC, Amazon, etc).
 */
async function fetchDocument(url: string): Promise<CheerioAPI> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  return cheerio.load(res.data);
}

/**
 * Définition d'un "handler" de site :
 * - comment savoir si ce handler s'applique
 * - comment récupérer le prix
 * - comment récupérer le nom
 */
interface SiteHandler {
  id: string;
  match: (host: string, url: string) => boolean;
  getPrice: ($: CheerioAPI) => number | null;
  getName: ($: CheerioAPI) => string | null;
}

/**
 * Handler TopAchat
 */
const topAchatHandler: SiteHandler = {
  id: "topachat",
  match: (host) => host.includes("topachat"),

  getPrice: ($) => {
    const candidates = [
      $(".offer-price__price").first().text().trim(),
      $(".offer-price").first().text().trim(),
      $(".price-anico").first().text().trim(),
      $('[class*="price"]').first().text().trim(),
    ];

    console.log("[TopAchat] Candidates prix :", candidates);

    const priceText =
      candidates.find((t) => t && t.length > 0) ||
      (() => {
        const bodyText = $("body").text();
        const match = bodyText.match(/\d+[.,]\d{2}\s*€/);
        console.log("[TopAchat] Fallback match global :", match?.[0]);
        return match?.[0] ?? null;
      })();

    if (!priceText) {
      return null;
    }

    return normalizePrice(priceText);
  },

  getName: ($) => {
    const candidates = [
      $("h1").first().text().trim(),
      $(".product-title").first().text().trim(),
      $('[class*="title"]').first().text().trim(),
    ];

    let name =
      candidates.find((t) => t && t.length > 0) ||
      (() => {
        const titleTag = $("title").first().text().trim();
        if (!titleTag) return null;
        return titleTag.replace(/\s+[\|\-].*$/, "").trim();
      })();

    if (!name) {
      return null;
    }

    return name.replace(/\s+/g, " ");
  },
};

/**
 * Registre des sites supportés
 */
const SITE_HANDLERS: SiteHandler[] = [topAchatHandler];

function getHandlerForUrl(urlStr: string): SiteHandler {
  let host: string;
  try {
    const u = new URL(urlStr);
    host = u.hostname;
  } catch {
    throw new Error("URL invalide");
  }

  const handler =
    SITE_HANDLERS.find((h) => h.match(host, urlStr)) ?? null;

  if (!handler) {
    throw new Error(`Site non supporté pour le moment (${host})`);
  }

  return handler;
}

// --- API publique utilisée dans tout le projet ---

export async function getPrice(url: string): Promise<number> {
  const handler = getHandlerForUrl(url);
  const $ = await fetchDocument(url);

  const price = handler.getPrice($);
  if (price == null) {
    throw new Error("Impossible de trouver le prix sur la page");
  }

  return price;
}

export async function getProductName(url: string): Promise<string> {
  const handler = getHandlerForUrl(url);
  const $ = await fetchDocument(url);

  const name = handler.getName($);
  if (!name) {
    throw new Error("Impossible de récupérer le nom du produit.");
  }

  return name;
}
