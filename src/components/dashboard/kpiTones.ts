export const KPI_TONE_STYLES: Record<string, string> = {
  emerald: 'bg-emerald-600 text-white',
  blue: 'bg-blue-600 text-white',
  rose: 'bg-rose-500 text-white',
  amber: 'bg-amber-500 text-white',
  violet: 'bg-violet-500 text-white',
  slate: 'bg-slate-500 text-white',
};

export type KpiTone = keyof typeof KPI_TONE_STYLES;
