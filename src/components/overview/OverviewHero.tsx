import React from "react";

import { cn } from "@/lib/utils";
import { LiveloLogo } from "@/components/miles/BrandLogos";
import Logo from "@/components/Logo";
import { exportOverviewToPdf } from "@/utils/exportPdf";

type Props = {
  onNavigate: (path: string) => void;
};

export default function OverviewHero({ onNavigate }: Props) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border",
        "bg-gradient-to-br from-emerald-600/15 via-emerald-500/10 to-emerald-400/0",
        "border-black/10 dark:border-white/10"
      )}
    >
      {/* Glow */}
      <div className="pointer-events-none absolute -top-28 -left-24 h-80 w-[36rem] rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-[36rem] rounded-full bg-teal-500/25 blur-3xl" />

      <div className="relative flex flex-col gap-6 p-8 md:p-10">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-emerald-600/15 p-3 ring-1 ring-emerald-400/20">
            <Logo className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">Financeiro do Yago</h1>
            <p className="text-sm text-muted-foreground">
              Sua central: finanças, investimentos, metas, milhas e compras — tudo em um lugar.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-xs text-muted-foreground">Parceiros:</span>
              <span className="rounded-lg bg-white/70 p-1.5 dark:bg-white/10">
                <LiveloLogo className="h-6 w-6" />
              </span>
            </div>
            <button
              onClick={() => exportOverviewToPdf(document.body)}
              className="rounded-lg border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-medium backdrop-blur transition hover:border-emerald-400/40 hover:bg-white/90 dark:border-white/10 dark:bg-white/10"
            >
              Gerar PDF
            </button>
          </div>
        </div>

        {/* Atalhos rápidos */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            { title: "Finanças", desc: "Resumo mensal e anual", path: "/financas/resumo" },
            { title: "Mensal", desc: "Entradas, saídas e lançamentos", path: "/financas/mensal" },
            { title: "Investimentos", desc: "Resumo e carteira", path: "/investimentos" },
            { title: "Metas & Projetos", desc: "Progresso e aportes", path: "/metas" },
            { title: "Milhas", desc: "Saldo, a receber e expiração", path: "/milhas" },
            { title: "Listas", desc: "Desejos e compras", path: "/listas" },
          ].map((c) => (
            <button
              key={c.title}
              onClick={() => onNavigate(c.path)}
              className={cn(
                "group rounded-2xl border bg-background/60 p-4 text-left backdrop-blur",
                "transition hover:-translate-y-0.5 hover:border-emerald-400/40 hover:shadow-lg",
                "border-black/10 dark:border-white/10"
              )}
            >
              <div className="text-base font-medium">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.desc}</div>
              <div className="mt-3 h-1 w-0 rounded bg-emerald-500 transition-all group-hover:w-16" />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
