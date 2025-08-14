import { Link } from "react-router-dom";
import { TrendingUp, Wallet, Target, Plane, Heart, ShoppingCart } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import ListsSummaryCard from "@/components/ListsSummaryCard";
const hubCard = "group flex items-center gap-4 p-6 border-0 bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-[0_2px_12px_-3px_rgba(16,185,129,0.3)] transition hover:scale-[1.01]";

export default function HomeOverview() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        subtitle="Resumo rápido de finanças, investimentos, metas e mais."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link to="/financas/resumo" className="block">
          <Card className={hubCard}>
            <TrendingUp className="h-6 w-6" />
            <div>
              <div className="font-semibold">Finanças</div>
              <div className="text-sm text-white/80">Resumo mensal e anual</div>
            </div>
          </Card>
        </Link>
        <Link to="/investimentos" className="block">
          <Card className={hubCard}>
            <Wallet className="h-6 w-6" />
            <div>
              <div className="font-semibold">Investimentos</div>
              <div className="text-sm text-white/80">Resumo e carteira</div>
            </div>
          </Card>
        </Link>
        <Link to="/metas" className="block">
          <Card className={hubCard}>
            <Target className="h-6 w-6" />
            <div>
              <div className="font-semibold">Metas & Projetos</div>
              <div className="text-sm text-white/80">Progresso e aportes</div>
            </div>
          </Card>
        </Link>
        <Link to="/milhas" className="block">
          <Card className={hubCard}>
            <Plane className="h-6 w-6" />
            <div>
              <div className="font-semibold">Milhas</div>
              <div className="text-sm text-white/80">Saldo, a receber e expiração</div>
            </div>
          </Card>
        </Link>
        <Link to="/lista-desejos" className="block">
          <Card className={hubCard}>
            <Heart className="h-6 w-6" />
            <div>
              <div className="font-semibold">Lista de desejos</div>
              <div className="text-sm text-white/80">Planejamento de compras</div>
            </div>
          </Card>
        </Link>
        <Link to="/lista-compras" className="block">
          <Card className={hubCard}>
            <ShoppingCart className="h-6 w-6" />
            <div>
              <div className="font-semibold">Lista de compras</div>
              <div className="text-sm text-white/80">Itens e orçamentos</div>
            </div>
          </Card>
        </Link>
      </div>
      <ListsSummaryCard />
    </div>
  );
}
