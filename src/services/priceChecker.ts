import axios from "axios";
import * as cheerio from "cheerio";

function normalizePrice(raw: string): number {
  const normalized = raw
    .replace(/\s/g, "")      // vire les espaces
    .replace(",", ".")       // virgule → point
    .replace(/[^\d.]/g, ""); // garde que chiffres + points

  const price = parseFloat(normalized);

  if (isNaN(price)) {
    throw new Error(`Prix non parsable : ${raw}`);
  }

  return price;
}

async function getPriceFromTopAchat(url: string): Promise<number> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(res.data);

  // On cible d'abord précisément ce que tu m'as montré
  const candidates = [
    $(".offer-price__price").first().text().trim(),
    $(".offer-price").first().text().trim(),
    $(".price-anico").first().text().trim(),
    $('[class*="price"]').first().text().trim(), // fallback large
  ];

  // Debug utile pendant le dev
  console.log("[TopAchat] Candidates brut :", candidates);

  const priceText = candidates.find((t) => t && t.length > 0);

  if (!priceText) {
    // dernier fallback : chercher un pattern XX.xx € dans tout le texte
    const bodyText = $("body").text();
    const match = bodyText.match(/\d+[.,]\d{2}\s*€/);
    console.log("[TopAchat] Fallback match global :", match?.[0]);

    if (!match) {
      throw new Error("Impossible de trouver le prix sur la page");
    }

    return normalizePrice(match[0]);
  }

  return normalizePrice(priceText);
}

export async function getPrice(url: string): Promise<number> {
  if (url.includes("topachat")) {
    return getPriceFromTopAchat(url);
  }

  throw new Error("Site non supporté pour le moment");
}
