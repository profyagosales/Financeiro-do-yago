import { SkeletonLine } from './SkeletonLine';

// Fallback de carregamento para gráficos lazy (Suspense)
export function ChartFallback({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border bg-white/60 dark:bg-slate-900/60 backdrop-blur p-4 flex items-center justify-center ${className}`}>
      <SkeletonLine className="h-full w-full" />
    </div>
  );
}

export default ChartFallback;
