// src/lib/palette.ts
// Cores fixas por categoria + helpers

export type PaletteCategory =
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'error';

export const PALETTE: Record<PaletteCategory, string> = {
  primary: 'var(--color-primary)',
  secondary: 'var(--color-secondary)',
  neutral: 'var(--color-neutral)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  error: 'var(--color-error)',
};

export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': '#22c55e',   // emerald-500
  'Transporte':  '#f97316',   // orange-500
  'Moradia':     '#0ea5e9',   // sky-500
  'Educação':    '#6366f1',   // indigo-500
  'Saúde':       '#ef4444',   // red-500
  'Lazer':       '#eab308',   // yellow-500
  'Salário':     '#16a34a',   // green-600
  'Freelance':   '#10b981',   // emerald-500
  'Investimentos': '#a855f7', // purple-500
  'Outros':      '#94a3b8',   // slate-400
};

export const SERIES_COLORS = {
  income:  '#3b82f6', // blue-500
  expense: '#ef4444', // red-500
};

// Map category name or id to a deterministic color
export function mapCategoryColor(input: string | number): string {
  const key = String(input);
  if (!key) return '#94a3b8';
  const fixed = CATEGORY_COLORS[key];
  return fixed ?? hashToColor(key);
}

function hashToColor(input: string) {
  // fallback estável baseado no texto (HSL → hex)
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  const s = 65;
  const l = 52;
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
