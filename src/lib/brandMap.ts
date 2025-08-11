// src/lib/brandMap.ts
import type { LucideIcon } from "lucide-react";
import {
  Landmark,
  CreditCard,
  Coins,
  Apple,
  Globe,
  Package,
  Film,
  Car,
  Music,
} from "lucide-react";

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

export const BRAND_ICON: Record<BrandKey, LucideIcon> = {
  nubank: Landmark, // TODO: brand icon (Nubank)
  mastercard: CreditCard, // TODO: brand icon (Mastercard)
  visa: CreditCard, // TODO: brand icon (Visa)
  binance: Coins, // TODO: brand icon (Binance)
  apple: Apple,
  google: Globe, // TODO: brand icon (Google)
  amazon: Package, // TODO: brand icon (Amazon)
  netflix: Film, // TODO: brand icon (Netflix)
  uber: Car, // TODO: brand icon (Uber)
  spotify: Music, // TODO: brand icon (Spotify)
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
  if (/itau|ita u/.test(t)) return "visa";      // fallback: cartão (sem ícone específico)
  if (/bradesco/.test(t)) return "visa";
  if (/banco do brasil|bb\b/.test(t)) return "visa";
  if (/caixa econ|cef|caixa\b/.test(t)) return "visa";

  return null;
}