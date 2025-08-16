import { CreditCard } from "lucide-react";

import BrandIcon from "@/components/BrandIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export type AlertItem = {
  nome: string;
  vencimento: string;
  valor: number;
};

// Renders a list of upcoming payments/alerts.
export default function AlertList({ items }: { items: AlertItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon={<CreditCard className="h-6 w-6" />} title="Nenhuma conta a vencer" />;
  }
  return (
    <div className="overflow-x-auto">
      <ul className="flex gap-4">
        {items.map((c) => (
          <li
            key={c.nome + c.vencimento}
            className="flex min-w-[16rem] items-center gap-3"
          >
            <BrandIcon name={c.nome} />
            <div className="min-w-0">
              <div className="truncate font-medium text-[var(--foreground)]">{c.nome}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                vence em {new Date(c.vencimento).toLocaleDateString("pt-BR")}
              </div>
            </div>
            <div className="ml-auto font-medium text-[var(--foreground)]">{formatCurrency(c.valor)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
