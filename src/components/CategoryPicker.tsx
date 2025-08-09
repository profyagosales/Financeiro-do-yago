import React, { useMemo } from "react";
import { useCategories } from "@/hooks/useCategories";
import { ChevronDown } from "lucide-react";

export default function CategoryPicker({
  value,
  onChange,
  placeholder = "Selecione a categoria",
}: {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  placeholder?: string;
}) {
  const { categories, loading } = useCategories();

  const options = useMemo(() => {
    const map = new Map(flat.map((c) => [c.id, c]));
    function buildLabel(id: string | null): string {
      const node = id ? map.get(id) : undefined;
      if (!node) return "";
      const parent = node.parent_id ? buildLabel(node.parent_id) : "";
      return parent ? `${parent} / ${node.name}` : node.name;
    }
    return flat
      .map((c) => ({ ...c, label: buildLabel(c.id) }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [flat]);

  return (
    <div className="relative inline-flex w-full items-center rounded-xl border border-white/30 bg-white/70 px-3 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
      <select
        className="w-full appearance-none bg-transparent py-2 pr-6 text-sm outline-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
      >
        <option value="">{placeholder}</option>
        {categories.map((c) => (
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 opacity-60" />
    </div>
  );
}