import { useMemo } from "react";

// Provides placeholder data for the dashboard while real
// integrations are not available. This hook centralises the
// mocked data so components can consume it consistently.
export function useOverviewData() {
  // KPIs mocked
  const kpis = { saldoMes: 7532, entradasMes: 12400, saidasMes: 4868, investidoTotal: 36250 };

  const base = [
    { m: "Jan", in: 3600, out: 1900 },
    { m: "Fev", in: 4100, out: 2100 },
    { m: "Mar", in: 3800, out: 1800 },
    { m: "Abr", in: 4600, out: 2400 },
    { m: "Mai", in: 4200, out: 2000 },
    { m: "Jun", in: 3900, out: 2200 },
    { m: "Jul", in: 4300, out: 2100 },
    { m: "Ago", in: 4700, out: 2300 },
    { m: "Set", in: 5200, out: 2600 },
    { m: "Out", in: 5400, out: 2500 },
    { m: "Nov", in: 5600, out: 2700 },
    { m: "Dez", in: 6000, out: 2900 },
  ];

  const fluxo = useMemo(() => {
    let acc = 0;
    return base.map((d) => {
      acc += d.in - d.out;
      return { ...d, saldo: acc };
    });
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps -- base is static
  []);

  const sparkIn = base.slice(-8).map((d) => d.in);
  const sparkOut = base.slice(-8).map((d) => d.out);
  const sparkSaldo = fluxo.slice(-8).map((d) => d.saldo);
  const sparkInv = useMemo(() => {
    let inv = 30000;
    return base.slice(-8).map((d) => {
      inv += Math.max(0, d.in - d.out) * 0.35;
      return inv;
    });
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps -- base is static
  []);

  const carteira = [
    { name: "Renda fixa", value: 14800 },
    { name: "FIIs", value: 8200 },
    { name: "Ações", value: 9800 },
    { name: "Cripto", value: 1450 },
  ];
  const cores = [
    "hsl(var(--chart-emerald))",
    "hsl(var(--chart-violet))",
    "hsl(var(--chart-blue))",
    "hsl(var(--chart-amber))",
  ];

  const contasAVencer = [
    { nome: "Internet", vencimento: "2025-08-12", valor: 129.9 },
    { nome: "Luz", vencimento: "2025-08-14", valor: 220.5 },
    { nome: "Cartão Nubank", vencimento: "2025-08-16", valor: 830.0 },
  ];

  const aportesRecentes = [
    { data: "2025-08-03", tipo: "Renda fixa", ativo: "Tesouro Selic 2029", qtd: 1, preco: 550 },
    { data: "2025-08-02", tipo: "FIIs", ativo: "MXRF11", qtd: 100, preco: 10.15 },
    { data: "2025-08-01", tipo: "Ações", ativo: "PETR4", qtd: 20, preco: 38.4 },
    { data: "2025-07-28", tipo: "Cripto", ativo: "BTC", qtd: 0.005, preco: 355000 },
  ];

  return {
    kpis,
    fluxo,
    sparkIn,
    sparkOut,
    sparkSaldo,
    sparkInv,
    carteira,
    cores,
    contasAVencer,
    aportesRecentes,
  };
}

export type OverviewData = ReturnType<typeof useOverviewData>;
