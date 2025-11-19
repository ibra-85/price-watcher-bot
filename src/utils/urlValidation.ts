import { SITE_CONFIGS } from "../config/sites";

const PRIVATE_IP_PATTERNS = [
  /^10\./,
  /^192\.168\./,
  /^127\./,
  /^169\.254\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
];

function isPrivateHost(hostname: string): boolean {
  if (hostname === "localhost") return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    // IP v4
    return PRIVATE_IP_PATTERNS.some((re) => re.test(hostname));
  }
  return false;
}

/**
 * Valide une URL fournie par l'utilisateur pour être suivie par le bot.
 * - Doit être une URL http(s)
 * - Ne doit pas pointer vers des IP privées / localhost
 * - Doit correspondre à un site supporté par SITE_CONFIGS
 *
 * Retourne une version normalisée de l'URL (string)
 * ou throw une erreur avec un message prêt à être affiché.
 */
export function validateTrackedUrl(rawUrl: string): string {
  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("L'URL fournie n'est pas valide.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Seules les URLs HTTP/HTTPS sont supportées.");
  }

  if (isPrivateHost(url.hostname)) {
    throw new Error("Cette URL n'est pas autorisée.");
  }

  const normalized = url.toString();

  const isSupported = SITE_CONFIGS.some((cfg) => cfg.match(normalized));
  if (!isSupported) {
    throw new Error("Ce site n'est pas encore supporté par le bot.");
  }

  return normalized;
}
