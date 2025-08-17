export const APP_COLORS = {
  home:     '#38BDF8',
  financas: '#84CC16',
  invest:   '#6366F1',
  milhas:   '#EC4899',
  desejos:  '#F97316',
  mercado:  '#FACC15',
  metas:    '#0EA5E9',
} as const;

// Tons mais escuros (contraste sobre fundo translúcido / ícones)
export const APP_COLORS_DARK = {
  home:    '#1e9bdf',
  financas:'#4c8a0e',
  invest:  '#3847b3',
  milhas:  '#bc1e71',
  desejos: '#c04502',
  mercado: '#b06d01',
  metas:   '#047a8a',
} as const;

export type AppColorKey = keyof typeof APP_COLORS;

export function colorFor(key: AppColorKey): string {
  return APP_COLORS[key];
}

// Helpers de tipografia (classes Tailwind)
export const TXT = {
  base: 'text-text',
  dark: 'dark:text-text-dark'
} as const;

