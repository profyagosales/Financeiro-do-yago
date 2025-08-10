import React, { useMemo } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreditCards, cycleFor as cardCycleFor } from "@/hooks/useCreditCards";
import { Wallet, CreditCard, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Source =
  | { kind: "account"; id: string | null }
  | { kind: "card"; id: string | null };

export default function SourcePicker({
  value,
  onChange,
  placeholder = "Selecione a fonte",
  allowCreate = false,
  onRequestNewAccount,
  onRequestNewCard,
  showCardHints = true,
  className = "",
}: {
  value: Source;
  onChange: (s: Source) => void;
  placeholder?: string;
  allowCreate?: boolean; // mostra itens "+ Nova conta…"/"+ Novo cartão…"
  onRequestNewAccount?: () => void;
  onRequestNewCard?: () => void;
  showCardHints?: boolean; // exibe dica de fechamento/vencimento quando cartão selecionado
  className?: string;
}) {
  const { data: accounts } = useAccounts();
  const { data: cards, byId: cardsById } = useCreditCards();

  const kind = value?.kind ?? "account";
  const selectedId = value?.id ?? null;

  const brl = (n?: number | null) =>
    typeof n === "number" ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";

  const selectedLabel = useMemo(() => {
    if (!selectedId) return "";
    if (kind === "account") {
      const acc = accounts.find((a) => a.id === selectedId);
      return acc ? acc.name : "";
    } else {
      const cc = cards.find((c) => c.id === selectedId);
      return cc ? cc.name : "";
    }
  }, [selectedId, kind, accounts, cards]);

  const cardHint = useMemo(() => {
    if (!showCardHints || kind !== "card" || !selectedId) return null;
    const cc = cardsById.get(selectedId);
    if (!cc) return null;
    const cyc = cardCycleFor(cc);
    if (!cyc) return null;
    const fmt = (iso: string | null) => (iso ? iso.split("-").reverse().join("/") : "");
    return `Fechamento: ${fmt(cyc.endISO)} • Vencimento: ${fmt(cyc.dueISO)}`;
  }, [showCardHints, kind, selectedId, cardsById]);

  return (
    <div className={`grid gap-2 ${className}`}>
      {/* Toggle Conta/Cartão */}
      <div className="inline-flex overflow-hidden rounded-xl border border-white/30 bg-white/70 backdrop-blur shadow-sm dark:border-white/10 dark:bg-zinc-900/50">
        <button
          type="button"
          className={`px-3 py-2 text-sm transition-colors ${kind === "account" ? "bg-emerald-600 text-white" : "text-zinc-700 dark:text-zinc-200"}`}
          onClick={() => onChange({ kind: "account", id: null })}
          title="Usar conta como fonte"
        >
          <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4"/> Conta</span>
        </button>
        <button
          type="button"
          className={`px-3 py-2 text-sm transition-colors ${kind === "card" ? "bg-emerald-600 text-white" : "text-zinc-700 dark:text-zinc-200"}`}
          onClick={() => onChange({ kind: "card", id: null })}
          title="Usar cartão como fonte"
        >
          <span className="inline-flex items-center gap-1"><CreditCard className="h-4 w-4"/> Cartão</span>
        </button>
      </div>

      {/* Picker por tipo */}
      {kind === "account" ? (
        <Select value={selectedId ?? undefined} onValueChange={(v) => onChange({ kind: "account", id: v || null })}>
          <SelectTrigger className="w-full rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-72">
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium">{a.name}</span>
                  {a.institution && (
                    <span className="ml-1 text-xs opacity-70">{a.institution}</span>
                  )}
                </span>
              </SelectItem>
            ))}
            {allowCreate && (
              <SelectItem value="__new_account__" onClick={(e) => { e.preventDefault(); onRequestNewAccount?.(); }}>
                <span className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Plus className="h-4 w-4"/> Nova conta…</span>
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      ) : (
        <>
          <Select value={selectedId ?? undefined} onValueChange={(v) => onChange({ kind: "card", id: v || null })}>
            <SelectTrigger className="w-full rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-xl max-h-72">
              {cards.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <span className="font-medium">{c.name}</span>
                    {typeof c.limit_amount === "number" && (
                      <span className="ml-1 text-xs opacity-70">limite {brl(c.limit_amount)}</span>
                    )}
                  </span>
                </SelectItem>
              ))}
              {allowCreate && (
                <SelectItem value="__new_card__" onClick={(e) => { e.preventDefault(); onRequestNewCard?.(); }}>
                  <span className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300"><Plus className="h-4 w-4"/> Novo cartão…</span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {cardHint && (
            <div className="text-xs text-zinc-600 dark:text-zinc-300/80 px-1">
              {cardHint}
            </div>
          )}
        </>
      )}
    </div>
  );
}