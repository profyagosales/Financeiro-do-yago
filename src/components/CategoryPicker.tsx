import React from "react";
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
  const { flat, loading } = useCategories();

  return (
    <div className="relative inline-flex w-full items-center rounded-xl border border-white/30 bg-white/70 px-3 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
      <select
        className="w-full appearance-none bg-transparent py-2 pr-6 text-sm outline-none"
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        disabled={loading}
      >
        <option value="">{placeholder}</option>
        {flat.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 opacity-60" />
    </div>
  );
}