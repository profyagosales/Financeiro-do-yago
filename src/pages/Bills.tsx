import { useMemo } from "react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { usePeriod } from "@/state/periodFilter";
import { useBills, getUpcoming } from "@/hooks/useBills";
import { buildSingleEvent } from "@/lib/ics";

export default function Bills() {
  const { month, year } = usePeriod();
  const { data, loading } = useBills(year, month);

  const exportIcs = async () => {
    const upcoming = await getUpcoming(month, year);
    const events = upcoming.map((b) =>
      buildSingleEvent({
        title: b.description,
        description: `Valor: R$ ${b.amount.toFixed(2)}`,
        start: b.due_date,
        end: b.due_date,
      })
    );
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//fy//bills//PT-BR",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bills.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  const list = useMemo(() => {
    if (loading) return <p>Carregando…</p>;
    if (!data.length) return <p>Nenhuma conta para este mês.</p>;
    return (
      <ul className="space-y-2">
        {data.map((b) => (
          <li key={b.id} className="flex justify-between rounded border p-2">
            <span>{b.description}</span>
            <span>{new Date(b.due_date).toLocaleDateString("pt-BR")}</span>
          </li>
        ))}
      </ul>
    );
  }, [data, loading]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas do mês"
        subtitle="Contas a pagar"
        actions={<Button onClick={exportIcs}>Exportar .ics</Button>}
      />
      {list}
    </div>
  );
}
