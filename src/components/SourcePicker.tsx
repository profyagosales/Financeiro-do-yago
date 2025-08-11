import { useEffect, useMemo, useState, useId } from "react";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreditCards, cycleFor as cardCycleFor } from "@/hooks/useCreditCards";
import { Wallet, CreditCard, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import type { CreditCard as CreditCardModel } from "@/hooks/useCreditCards";

export type SourceValue = { kind: "account" | "card"; id: string | null };

export default function SourcePicker({
  value,
  onChange,
  placeholder = "Selecione a fonte",
  ariaLabel,
  allowCreate = false,
  showCardHints = true,
  className = "",
}: {
  value: SourceValue;
  onChange: (s: SourceValue) => void;
  placeholder?: string;
  ariaLabel?: string;
  allowCreate?: boolean;
  showCardHints?: boolean;
  className?: string;
}) {
  const { data: accounts, create: createAccount } = useAccounts();
  const { data: cards, byId: cardsById, create: createCard } = useCreditCards();

  const [accOpen, setAccOpen] = useState(false);
  const [accName, setAccName] = useState("");
  const [accBank, setAccBank] = useState("");
  const [cardOpen, setCardOpen] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardBrand, setCardBrand] = useState("");
  const [savingAcc, setSavingAcc] = useState(false);
  const [savingCard, setSavingCard] = useState(false);

  const accNameId = useId();
  const accBankId = useId();
  const cardNameId = useId();
  const cardBrandId = useId();

  const [kind, setKind] = useState<SourceValue["kind"]>(value.kind);
  const selectedId = value.id;

  useEffect(() => {
    setKind(value.kind);
  }, [value.kind]);

  const brl = (n?: number | null) =>
    typeof n === "number" ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";

  const cardHint = useMemo(() => {
    if (!showCardHints || kind !== "card" || !selectedId) return null;
    const cc: CreditCardModel | undefined = cardsById.get(selectedId);
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
          onClick={() => {
            setKind("account");
            onChange({ kind: "account", id: null });
          }}
          title="Usar conta como fonte"
        >
          <span className="inline-flex items-center gap-1"><Wallet className="h-4 w-4"/> Conta</span>
        </button>
        <button
          type="button"
          className={`px-3 py-2 text-sm transition-colors ${kind === "card" ? "bg-emerald-600 text-white" : "text-zinc-700 dark:text-zinc-200"}`}
          onClick={() => {
            setKind("card");
            onChange({ kind: "card", id: null });
          }}
          title="Usar cartão como fonte"
        >
          <span className="inline-flex items-center gap-1"><CreditCard className="h-4 w-4"/> Cartão</span>
        </button>
      </div>

      {/* Picker por tipo */}
      {kind === "account" ? (
        <Select
          value={selectedId ?? ""}
          onValueChange={(v) => onChange({ kind: "account", id: v || null })}
        >
          <SelectTrigger
            aria-label={ariaLabel ?? placeholder}
            className="w-full h-10 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-72">
            <SelectItem value="">Todas</SelectItem>
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
          </SelectContent>
        </Select>
      ) : (
        <>
          <Select
            value={selectedId ?? ""}
            onValueChange={(v) => onChange({ kind: "card", id: v || null })}
          >
          <SelectTrigger
            aria-label={ariaLabel ?? placeholder}
            className="w-full h-10 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="rounded-xl max-h-72">
            <SelectItem value="">Todas</SelectItem>
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
            </SelectContent>
          </Select>
          {cardHint && (
            <div className="text-xs text-zinc-600 dark:text-zinc-300/80 px-1">
              {cardHint}
            </div>
          )}
        </>
      )}
      {allowCreate && (
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" size="sm" onClick={() => setAccOpen(true)} className="flex-1">
            <Plus className="h-4 w-4 mr-1" /> Conta
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setCardOpen(true)} className="flex-1">
            <Plus className="h-4 w-4 mr-1" /> Cartão
          </Button>
        </div>
      )}

      {/* Modal nova conta */}
      <Dialog open={accOpen} onOpenChange={setAccOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Nova Conta</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1">
              <Label htmlFor={accNameId}>Nome</Label>
              <Input id={accNameId} value={accName} onChange={(e) => setAccName(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={accBankId}>Banco (opcional)</Label>
              <Input id={accBankId} value={accBank} onChange={(e) => setAccBank(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAccOpen(false)} disabled={savingAcc}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                const nm = accName.trim();
                if (!nm) {
                  toast.error("Informe o nome da conta");
                  return;
                }
                setSavingAcc(true);
                try {
                  const acc = await createAccount({ name: nm, institution: accBank.trim() || null });
                  onChange({ kind: "account", id: acc.id });
                  setKind("account");
                  toast.success("Conta criada!");
                  setAccOpen(false);
                  setAccName("");
                  setAccBank("");
                } catch (e: unknown) {
                  const err = e as Error;
                  toast.error(err.message || "Erro ao criar conta");
                } finally {
                  setSavingAcc(false);
                }
              }}
              disabled={savingAcc}
            >
              {savingAcc ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal novo cartão */}
      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Novo Cartão</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1">
              <Label htmlFor={cardNameId}>Nome</Label>
              <Input id={cardNameId} value={cardName} onChange={(e) => setCardName(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={cardBrandId}>Bandeira (opcional)</Label>
              <Input id={cardBrandId} value={cardBrand} onChange={(e) => setCardBrand(e.target.value)} placeholder="Visa, Mastercard..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCardOpen(false)} disabled={savingCard}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                const nm = cardName.trim();
                if (!nm) {
                  toast.error("Informe o nome do cartão");
                  return;
                }
                setSavingCard(true);
                try {
                  const c = await createCard({ name: nm, brand: cardBrand.trim() || null });
                  onChange({ kind: "card", id: c.id });
                  setKind("card");
                  toast.success("Cartão criado!");
                  setCardOpen(false);
                  setCardName("");
                  setCardBrand("");
                } catch (e: unknown) {
                  const err = e as Error;
                  toast.error(err.message || "Erro ao criar cartão");
                } finally {
                  setSavingCard(false);
                }
              }}
              disabled={savingCard}
            >
              {savingCard ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}