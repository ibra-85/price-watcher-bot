import axios from "axios";
import * as cheerio from "cheerio";

async function getPriceFromTopAchat(url: string): Promise<number> {
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });

  const $ = cheerio.load(res.data);

  const priceText =
    $(".fpPrice").first().text().trim() ||
    $(".price").first().text().trim() ||
    $(".price__amount").first().text().trim();

  if (!priceText) {
    throw new Error("Impossible de trouver le prix sur la page");
  }

  const normalized = priceText
    .replace(/\s/g, "")
    .replace(",", ".")
    .replace(/[^\d.]/g, "");

  const price = parseFloat(normalized);

  if (isNaN(price)) {
    throw new Error(`Prix non parsable : ${priceText}`);
  }

  return price;
}

export async function getPrice(url: string): Promise<number> {
  if (url.includes("topachat")) {
    return getPriceFromTopAchat(url);
  }

  throw new Error("Site non supporté pour le moment");
}