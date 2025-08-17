import { Logo } from '@/components/Logo';

export default function BrandBlock() {
  return (
    <div className="flex items-center gap-3 py-1 pl-1 pr-3 rounded-xl bg-white/60 dark:bg-white/5 backdrop-blur-md border border-white/30 dark:border-white/10 shadow-sm">
      <Logo size="2xl" />
  <span className="font-display text-2xl font-bold tracking-tight text-text dark:text-text-dark select-none">FY</span>
    </div>
  );
}
