import React from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreditCards } from "@/hooks/useCreditCards";
import { Wallet, CreditCard } from "lucide-react";

type Source =
  | { kind: "account"; id: string | null }
  | { kind: "card"; id: string | null };

export default function SourcePicker({
  value,
  onChange,
}: {
  value: Source;
  onChange: (s: Source) => void;
}) {
  const { data: accounts } = useAccounts();
  const { data: cards } = useCreditCards();

  return (
    <div className="grid gap-2">
      <div className="inline-flex overflow-hidden rounded-xl border border-white/30 bg-white/70 backdrop-blur dark:border-white/10 dark:bg-zinc-900/50">
        <button
          className={`px-3 py-2 text-sm ${value.kind === "account" ? "bg-emerald-600 text-white" : "text-zinc-700 dark:text-zinc-200"}`}
          onClick={() => onChange({ kind: "account", id: null })}
        >
          <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4" /> Conta</span>
        </button>
        <button
          className={`px-3 py-2 text-sm ${value.kind === "card" ? "bg-emerald-600 text-white" : "text-zinc-700 dark:text-zinc-200"}`}
          onClick={() => onChange({ kind: "card", id: null })}
        >
          <span className="inline-flex items-center gap-1"><CreditCard className="h-4 w-4" /> Cartão</span>
        </button>
      </div>

      {value.kind === "account" ? (
        <select
          className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
          value={value.id || ""}
          onChange={(e) => onChange({ kind: "account", id: e.target.value || null })}
        >
          <option value="">Selecione a conta</option>
          {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      ) : (
        <select
          className="w-full rounded-xl border border-white/30 bg-white/70 px-3 py-2 text-sm outline-none backdrop-blur dark:border-white/10 dark:bg-zinc-900/50"
          value={value.id || ""}
          onChange={(e) => onChange({ kind: "card", id: e.target.value || null })}
        >
          <option value="">Selecione o cartão</option>
          {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      )}
    </div>
  );
}