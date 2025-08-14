import { Link } from "react-router-dom";
import { TrendingUp, Wallet, Target, Plane, Heart, ShoppingCart } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";

export default function HomeOverview() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral"
        subtitle="Resumo rápido de finanças, investimentos, metas e mais."
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <Link to="/financas/resumo" className="block">
          <Card className="p-6 flex items-center gap-4">
            <TrendingUp className="h-6 w-6" />
            <div>
              <div className="font-semibold">Finanças</div>
              <div className="text-sm text-muted-foreground">Resumo mensal e anual</div>
            </div>
          </Card>
        </Link>
        <Link to="/investimentos" className="block">
          <Card className="p-6 flex items-center gap-4">
            <Wallet className="h-6 w-6" />
            <div>
              <div className="font-semibold">Investimentos</div>
              <div className="text-sm text-muted-foreground">Resumo e carteira</div>
            </div>
          </Card>
        </Link>
        <Link to="/metas" className="block">
          <Card className="p-6 flex items-center gap-4">
            <Target className="h-6 w-6" />
            <div>
              <div className="font-semibold">Metas & Projetos</div>
              <div className="text-sm text-muted-foreground">Progresso e aportes</div>
            </div>
          </Card>
        </Link>
        <Link to="/milhas" className="block">
          <Card className="p-6 flex items-center gap-4">
            <Plane className="h-6 w-6" />
            <div>
              <div className="font-semibold">Milhas</div>
              <div className="text-sm text-muted-foreground">Saldo, a receber e expiração</div>
            </div>
          </Card>
        </Link>
        <Link to="/lista-desejos" className="block">
          <Card className="p-6 flex items-center gap-4">
            <Heart className="h-6 w-6" />
            <div>
              <div className="font-semibold">Lista de desejos</div>
              <div className="text-sm text-muted-foreground">Planejamento de compras</div>
            </div>
          </Card>
        </Link>
        <Link to="/lista-compras" className="block">
          <Card className="p-6 flex items-center gap-4">
            <ShoppingCart className="h-6 w-6" />
            <div>
              <div className="font-semibold">Lista de compras</div>
              <div className="text-sm text-muted-foreground">Itens e orçamentos</div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
