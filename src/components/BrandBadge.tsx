import { BRANDS, type MilesProgram } from '@/components/miles/brandConfig';

export type MilesBrand = MilesProgram;

export function BrandBadge({ brand, className = '' }: { brand: MilesBrand; className?: string }) {
  const cfg = BRANDS[brand];
  const Logo = cfg.Logo;
  return (
    <div className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 bg-gradient-to-br ${cfg.gradient} text-white ${className}`}>
      <Logo className="h-4 w-4 opacity-95" />
      <span className="text-sm font-semibold">{cfg.label}</span>
    </div>
  );
}
