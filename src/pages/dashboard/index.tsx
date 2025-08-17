import { Logo } from '@/components/Logo';
import {
    FinSummaryCard,
    GoalsProgressCard,
    InvestWatchCard,
    MarketTickerCard,
    MilesAlertCard,
    WishesDealCard,
} from '@/components/dashboard';

export default function Dashboard() {
  return (
    <>
      {/* 1️⃣ CARD HERO */}
      <header className="rounded-xl overflow-hidden ring-1 ring-[--border] bg-gradient-to-b from-sky-400 to-sky-200 p-8 mt-2">
        <Logo className="mx-auto w-10 h-10 text-white" monochrome />
        <h1 className="mt-4 text-center text-white text-xl font-semibold">
          Resumo Geral
        </h1>
      </header>

      {/* 2️⃣ GRID DE WIDGETS */}
      <section className="grid lg:grid-cols-3 gap-6 mt-6">
        <FinSummaryCard />
        <InvestWatchCard />
        <MilesAlertCard />
        <GoalsProgressCard />
        <WishesDealCard />
        <MarketTickerCard />
      </section>
    </>
  );
}
