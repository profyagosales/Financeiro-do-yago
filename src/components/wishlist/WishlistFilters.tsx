import { ChangeEvent } from "react";

export interface WishlistFilterValues {
  period: string;
  status: string;
  category: string;
}

export default function WishlistFilters({
  value,
  onChange,
}: {
  value: WishlistFilterValues;
  onChange: (v: WishlistFilterValues) => void;
}) {
  const handle = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, [e.target.name]: e.target.value });
  };
  return (
    <div className="flex flex-wrap gap-2">
      <select
        name="period"
        className="rounded border px-2 py-1 text-sm"
        value={value.period}
        onChange={handle}
      >
        <option value="">Período</option>
        <option value="30">30 dias</option>
        <option value="90">90 dias</option>
        <option value="365">1 ano</option>
      </select>
      <select
        name="status"
        className="rounded border px-2 py-1 text-sm"
        value={value.status}
        onChange={handle}
      >
        <option value="">Status</option>
        <option value="pending">Pendente</option>
        <option value="purchased">Comprado</option>
      </select>
      <select
        name="category"
        className="rounded border px-2 py-1 text-sm"
        value={value.category}
        onChange={handle}
      >
        <option value="">Categoria</option>
        <option value="eletronicos">Eletrônicos</option>
        <option value="casa">Casa</option>
        <option value="viagem">Viagem</option>
      </select>
    </div>
  );
}

