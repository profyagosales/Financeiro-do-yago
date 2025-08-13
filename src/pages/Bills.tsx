import { useMemo, useRef, useState } from "react";

import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { usePeriod } from "@/state/periodFilter";
import { useBills, type Bill } from "@/hooks/useBills";

export default function Bills() {
  const { month, year } = usePeriod();
  const [status, setStatus] = useState<Bill["status"] | "all">("all");
  const { data, loading, markPaid, toIcs } = useBills({
    month,
    year,
    status: status === "all" ? undefined : status,
  });

  const list = useMemo(() => {
    if (loading)
      return (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      );
    if (!data.length)
      return (
        <EmptyState title="Nenhum boleto" message="Nada encontrado para o período." />
      );
    return (
      <ul className="space-y-2">
        {data.map((b) => (
          <BillItem key={b.id} bill={b} markPaid={markPaid} toIcs={toIcs} />
        ))}
      </ul>
    );
  }, [data, loading, markPaid, toIcs]);

  return (
    <div className="space-y-6">
      <PageHeader title="Boletos" subtitle="Contas e boletos" />
      <FilterBar />
      <div className="mx-auto flex w-full max-w-xl justify-end">
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as Bill["status"] | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="open">A vencer</SelectItem>
            <SelectItem value="overdue">Vencidas</SelectItem>
            <SelectItem value="paid">Pagas</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {list}
    </div>
  );
}

function BillItem({
  bill,
  markPaid,
  toIcs,
}: {
  bill: Bill;
  markPaid: (id: string) => Promise<void>;
  toIcs: (bill: Bill) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onUpload = () => {
    const file = inputRef.current?.files?.[0];
    if (file) {
      alert("Upload de PDF não implementado");
      inputRef.current.value = "";
    }
  };

  return (
    <li className="flex items-center justify-between rounded border p-3">
      <div className="flex-1">
        <p className="font-medium">{bill.description}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(bill.due_date).toLocaleDateString("pt-BR")} — R$
          {" "}
          {bill.amount.toFixed(2)}
        </p>
      </div>
      <div className="ml-2 flex gap-2">
        {bill.status !== "paid" && (
          <Button size="sm" variant="outline" onClick={() => markPaid(bill.id)}>
            Pagar
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => toIcs(bill)}>
          .ics
        </Button>
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onUpload}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            PDF
          </Button>
        </div>
      </div>
    </li>
  );
}
