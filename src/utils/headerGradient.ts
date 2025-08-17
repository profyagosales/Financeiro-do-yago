import { APP_COLORS } from '@/theme/colors';

// Retorna objeto style e classes estáveis para evitar necessidade de safelist de arbitrary values
export function headerGradient(key: keyof typeof APP_COLORS) {
  const c = APP_COLORS[key];
  return {
    className: 'bg-gradient-to-r',
    style: {
      '--tw-gradient-from': c,
      '--tw-gradient-to': c + 'B3', // ~70% alpha in hex fallback (B3)
    } as React.CSSProperties,
  };
}

export default headerGradient;
