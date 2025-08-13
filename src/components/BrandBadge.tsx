
export type MilesBrand = 'livelo' | 'latam' | 'azul';

export const BRAND_STYLE: Record<MilesBrand, { bg: string; text: string; label: string }> = {
  livelo: { bg: 'from-fuchsia-600 to-pink-500', text: 'text-white', label: 'Livelo' },
  latam:  { bg: 'from-rose-600 to-purple-600',   text: 'text-white', label: 'LATAM Pass' },
  azul:   { bg: 'from-sky-600 to-blue-700',      text: 'text-white', label: 'Azul' },
};

export function BrandBadge({ brand, className='' }: { brand: MilesBrand; className?: string }) {
  const s = BRAND_STYLE[brand];
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gradient-to-br ${s.bg} ${s.text} ${className}`}>
      {/* Ícone simples genérico */}
      <svg width="18" height="18" viewBox="0 0 24 24" className="opacity-95">
        <path d="M3 12c3-2 6-2 9 0s6 2 9 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
      <span className="text-sm font-semibold">{s.label}</span>
    </div>
  );
}