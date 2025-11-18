export interface SiteConfig {
  id: string;
  match: (url: string) => boolean;
  priceSelectors: string[];
  nameSelectors: string[];
}

export const SITE_CONFIGS: SiteConfig[] = [
  {
    id: "topachat",
    match: (url) => url.includes("topachat"),
    priceSelectors: [
      ".offer-price__price",
      ".offer-price",
      ".price-anico",
      '[class*="price"]',
    ],
    nameSelectors: [
      "h1",
      ".product-title",
      '[class*="title"]',
    ],
  },
  {
    id: "ldlc",
    match: (url) => url.includes("ldlc"),
    priceSelectors: [
      ".product-price .price > .price",
      ".product-price .price",
      ".price",
      '[class*="price"]',
    ],
    nameSelectors: [
      "h1.title-1",
      "h1",
      ".product-page-title",
      '[class*="title"]',
    ],
  },
];
