import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { usePeriod } from "@/contexts/PeriodContext";
import OverviewHero from "@/components/overview/OverviewHero";
import KpiCard from "@/components/overview/KpiCard";
import { SectionCard } from "@/components/overview/SectionCard";
import MiniArea from "@/components/overview/MiniArea";
import { formatCurrency } from "@/lib/formatters";

export default function Dashboard() {
  const navigate = useNavigate();
  const { month, year } = usePeriod();
  void month;
  void year;

  // TODO: troque estes mocks pelos hooks reais do app (useTransactions/useInvestments/useGoals/useMiles)
  const finMes = { entradas: 12400, saidas: 4868, saldo: 7532 };
  const finSerie = [1, 3, 2, 4, 5, 6, 5, 8, 7, 9, 10, 12];
  const inv = { total: 36250, operacoesMes: 4 };
  const metas = { concluidas: 2, emAndamento: 3, progresso: 0.44 };
  const milhas = { saldo: 28000, aReceber: 3200, expirando30d: 0 };
  const desejos = { itens: 6, orcamento: 4200 };
  const compras = { itens: 3, orcamento: 950 };

  const saldoFmt = useMemo(
    () =>
      formatCurrency
        ? formatCurrency(finMes.saldo)
        : new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(finMes.saldo),
    [finMes.saldo]
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6">
      <OverviewHero onNavigate={(p) => navigate(p)} />

      {/* KPIs rápidos */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Saldo do mês"
          value={saldoFmt}
          trend="+8% vs mês anterior"
          onClick={() => navigate("/financas/mensal")}
        />
        <KpiCard
          label="Entradas"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(finMes.entradas)}
        />
        <KpiCard
          label="Saídas"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(finMes.saidas)}
        />
        <KpiCard
          label="Investido"
          value={new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(inv.total)}
          onClick={() => navigate("/investimentos")}
        />
      </div>

      {/* Seções com minicharts/listas */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <SectionCard
          title="Fluxo — últimos 12 meses"
          subtitle="Entradas - saídas"
        >
          <MiniArea points={finSerie} />
        </SectionCard>

        <SectionCard
          title="Investimentos"
          subtitle="Resumo rápido"
          right={
            <button
              onClick={() => navigate("/investimentos")}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Abrir
            </button>
          }
        >
          <ul className="text-sm text-muted-foreground">
            <li>
              Total investido: <span className="font-medium text-foreground">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(inv.total)}</span>
            </li>
            <li>
              Operações no mês: <span className="font-medium text-foreground">{inv.operacoesMes}</span>
            </li>
          </ul>
        </SectionCard>

        <SectionCard
          title="Metas & Projetos"
          subtitle="Progresso consolidado"
          right={
            <button
              onClick={() => navigate("/metas")}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Abrir
            </button>
          }
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-full rounded bg-black/10 dark:bg-white/10">
              <div
                className="h-2 rounded bg-emerald-500"
                style={{ width: `${metas.progresso * 100}%` }}
              />
            </div>
            <span className="text-xs">{Math.round(metas.progresso * 100)}%</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {metas.concluidas} concluídas • {metas.emAndamento} em andamento
          </p>
        </SectionCard>

        <SectionCard
          title="Milhas"
          subtitle="Saldo & a receber"
          right={
            <button
              onClick={() => navigate("/milhas")}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Abrir
            </button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Saldo atual: <span className="font-medium text-foreground">{milhas.saldo.toLocaleString("pt-BR")} pts</span>
          </p>
          <p className="text-sm text-muted-foreground">
            A receber: <span className="font-medium text-foreground">{milhas.aReceber.toLocaleString("pt-BR")} pts</span>
          </p>
        </SectionCard>

        <SectionCard
          title="Lista de desejos"
          subtitle="Itens e orçamento"
          right={
            <button
              onClick={() => navigate("/listas/desejos")}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Abrir
            </button>
          }
        >
          <p className="text-sm text-muted-foreground">
            {desejos.itens} itens • Orçamento {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(desejos.orcamento)}
          </p>
        </SectionCard>

        <SectionCard
          title="Lista de compras"
          subtitle="Itens e orçamento"
          right={
            <button
              onClick={() => navigate("/listas/compras")}
              className="text-xs underline opacity-75 hover:opacity-100"
            >
              Abrir
            </button>
          }
        >
          <p className="text-sm text-muted-foreground">
            {compras.itens} itens • Orçamento {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(compras.orcamento)}
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
