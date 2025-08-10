// src/lib/brandMap.ts
import {
  SiNubank,
  SiMastercard,
  SiVisa,
  SiBinance,
  SiApple,
  SiGoogle,
  SiAmazon,
  SiNetflix,
  SiUber,
  SiSpotify,
} from "react-icons/si";

export type BrandKey =
  | "nubank"
  | "mastercard"
  | "visa"
  | "binance"
  | "apple"
  | "google"
  | "amazon"
  | "netflix"
  | "uber"
  | "spotify";

export const BRAND_ICON: Record<BrandKey, any> = {
  nubank: SiNubank,
  mastercard: SiMastercard,
  visa: SiVisa,
  binance: SiBinance,
  apple: SiApple,
  google: SiGoogle,
  amazon: SiAmazon,
  netflix: SiNetflix,
  uber: SiUber,
  spotify: SiSpotify,
};

// Paleta sugerida por marca (opcional)
export const BRAND_COLOR: Partial<Record<BrandKey, string>> = {
  nubank: "#820AD1",
  mastercard: "#EB001B",
  visa: "#1A1F71",
  binance: "#F3BA2F",
  apple: "#111111",
  google: "#4285F4",
  amazon: "#FF9900",
  netflix: "#E50914",
  uber: "#000000",
  spotify: "#1DB954",
};

// Normaliza string: minúsculo, sem acentos e pontuação
export function normalizeBrand(raw?: string) {
  return (raw || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Heurísticas: tenta bater por palavras-chave
export function guessBrandKey(input?: string): BrandKey | null {
  const t = normalizeBrand(input);

  const tests: Array<[BrandKey, RegExp]> = [
    ["nubank", /\bnu\b|\bnubank\b/],
    ["visa", /\bvisa\b/],
    ["mastercard", /\bmaster\b|\bmastercard\b/],
    ["binance", /\bbinance\b/],
    ["uber", /\buber\b/],
    ["netflix", /\bnetflix\b/],
    ["spotify", /\bspotify\b/],
    ["apple", /\bapple\b|\biphone\b|\bmac\b/],
    ["google", /\bgoogle\b|\byoutube\b|\bplay store\b/],
    ["amazon", /\bamazon\b|\bprime\b/],
  ];

  for (const [key, rx] of tests) {
    if (rx.test(t)) return key;
  }

  // bancos brasileiros comuns via palavras (ajuda p/ cartão/descrição)
  if (/itau|ita u/.test(t)) return "visa";      // fallback: cartão (não há SiItau no react-icons)
  if (/bradesco/.test(t)) return "visa";
  if (/banco do brasil|bb\b/.test(t)) return "visa";
  if (/caixa econ|cef|caixa\b/.test(t)) return "visa";

  return null;
}