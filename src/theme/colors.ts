// Nova tabela padronizada (chaves curtas) alinhada ao tailwind.config.js (APP)
export const APP_COLORS = {
  home:  '#22c3ff',
  fin:   '#6eca00',
  invest:'#6366f1',
  milhas:'#ec4899',
  desejos:'#f97316',
  mercado:'#facc15',
  metas:'#0ea5e9',
} as const;

// Alias de compatibilidade temporária para código legado que ainda referencia 'financas'
export const LEGACY_COLOR_MAP: Record<string,string> = {
  financas: APP_COLORS.fin
};

// Tons mais escuros derivados (para ícones sobre superfícies claras) – recalculados se necessário
export const APP_COLORS_DARK = {
  home:    '#1b9dd6',
  fin:     '#4d8f00',
  invest:  '#3847b3',
  milhas:  '#bc1e71',
  desejos: '#c04502',
  mercado: '#b06d01',
  metas:   '#047a8a',
} as const;

export type AppColorKey = keyof typeof APP_COLORS;

export function colorFor(key: AppColorKey | keyof typeof LEGACY_COLOR_MAP): string {
  if (key in APP_COLORS) return APP_COLORS[key as AppColorKey];
  if (key in LEGACY_COLOR_MAP) return LEGACY_COLOR_MAP[key];
  return '#999999';
}

// Helpers de tipografia (classes Tailwind)
export const TXT = {
  base: 'text-text',
  dark: 'dark:text-text-dark'
} as const;

