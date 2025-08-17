import { Logo } from '@/components/Logo';
import {
    FinSummaryCard,
    GoalsProgressCard,
    InvestWatchCard,
    MarketTickerCard,
    MilesAlertCard,
    WishesDealCard,
} from '@/components/dashboard';

// Wrapper util para grid responsiva
const gridClass = 'grid grid-cols-[repeat(auto-fit,minmax(18rem,1fr))] gap-6';

export default function Dashboard() {
  return (
    <div className="pb-12">
      {/* 1️⃣ HERO */}
      <header className="rounded-xl overflow-hidden ring-1 ring-[--border] bg-gradient-to-b from-sky-500 via-sky-400 to-sky-300 p-8 mt-2">
        <Logo className="mx-auto h-8 w-8 text-white/90" monochrome />
        <h1 className="mt-4 text-center text-white/95 text-xl font-semibold">Resumo Geral</h1>
      </header>

      {/* 2️⃣ GRID DE WIDGETS */}
      <section className={`${gridClass} mt-6`}>
        <FinSummaryCard />
        <InvestWatchCard />
        <MilesAlertCard />
        <GoalsProgressCard />
        <WishesDealCard />
        <MarketTickerCard />
      </section>
    </div>
  );
}
