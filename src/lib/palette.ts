// src/lib/palette.ts
// Cores fixas por categoria + helpers

export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação':   '#34d399', // emerald-400
  'Transporte':    '#fb923c', // orange-400
  'Moradia':       '#38bdf8', // sky-400
  'Educação':      '#818cf8', // indigo-400
  'Saúde':         '#f87171', // red-400
  'Lazer':         '#facc15', // yellow-400
  'Salário':       '#4ade80', // green-400
  'Freelance':     '#34d399', // emerald-400
  'Investimentos': '#c084fc', // purple-400
  'Outros':      '#94a3b8',   // slate-400
};

export const SERIES_COLORS = {
  income:  '#60a5fa', // blue-400
  expense: '#f87171', // red-400
};

export function colorForCategory(name: string): string {
  if (!name) return '#94a3b8';
  const fixed = CATEGORY_COLORS[name];
  return fixed ?? hashToColor(name);
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