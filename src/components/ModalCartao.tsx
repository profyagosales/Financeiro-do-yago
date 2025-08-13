

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreditCards, cycleFor } from "@/hooks/useCreditCards";
import { supabase } from "@/lib/supabaseClient";


export type ModalCartaoProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void; // retorna o id para selecionar no SourcePicker
};

export default function ModalCartao({ open, onClose, onCreated }: ModalCartaoProps) {
  const { data: accounts } = useAccounts();
  const { list } = useCreditCards();

  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [limitAmount, setLimitAmount] = useState<number | "">("");
  const [cutDay, setCutDay] = useState<number | "">("");
  const [dueDay, setDueDay] = useState<number | "">("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const parsedLimit = typeof limitAmount === "string" ? Number(limitAmount) : limitAmount;
  const parsedCut = typeof cutDay === "string" ? Number(cutDay) : cutDay;
  const parsedDue = typeof dueDay === "string" ? Number(dueDay) : dueDay;

  const ciclo = useMemo(() => {
    const cut = Number(parsedCut);
    const due = Number(parsedDue);
    if (!Number.isFinite(cut) || cut < 1 || cut > 31) return null;
    return cycleFor({ cut_day: cut, due_day: Number.isFinite(due) ? due : null } as any);
  }, [parsedCut, parsedDue]);

  function reset() {
    setName("");
    setBank("");
    setLimitAmount("");
    setCutDay("");
    setDueDay("");
    setAccountId(null);
  }

  async function handleSave() {
    const nm = name.trim();
    if (!nm) { toast.info("Informe o nome do cartão"); return; }

    // validações leves
    const cut = Number(parsedCut);
    if (!Number.isFinite(cut) || cut < 1 || cut > 31) { toast.error("Dia de fechamento deve ser entre 1 e 31"); return; }
    const due = Number(parsedDue);
    if (Number.isFinite(due) && (due < 1 || due > 31)) { toast.error("Dia de vencimento deve ser entre 1 e 31"); return; }

    setLoading(true);
    try {
      // Inserimos direto via Supabase para obter o ID de imediato
      const { data, error } = await supabase
        .from("credit_cards")
        .insert({
          name: nm,
          bank: bank.trim() || null,
          limit_amount: Number.isFinite(parsedLimit) ? Number(parsedLimit) : null,
          cut_day: cut,
          due_day: Number.isFinite(due) ? due : null,
          account_id: accountId || null,
        })
        .select("id")
        .single();
      if (error) throw error;

      // Atualiza listagem do hook para refletir no UI
      await list();

      const id = (data as any)?.id as string;
      toast.success("Cartão criado!");
      onCreated?.(id);
      onClose();
      reset();
    } catch (e: any) {
      toast.error(e?.message || "Erro ao criar cartão");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Cartão</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1">
            <Label>Nome do cartão</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Nubank Visa final 1234" />
          </div>

          <div className="grid gap-1">
            <Label>Banco (opcional)</Label>
            <Input value={bank} onChange={(e) => setBank(e.target.value)} placeholder="Ex.: Nubank, Itaú, Santander" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Limite (R$) — opcional</Label>
              <Input
                type="number"
                step="0.01"
                inputMode="decimal"
                value={limitAmount as any}
                onChange={(e) =>
                  setLimitAmount(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Conta p/ débito da fatura (opcional)</Label>
              <Select value={accountId ?? undefined} onValueChange={(v) => setAccountId(v || null)}>
                <SelectTrigger><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                  <SelectItem value="">(Nenhuma)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Label>Dia de fechamento</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={cutDay as any}
                onChange={(e) =>
                  setCutDay(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
            <div className="grid gap-1">
              <Label>Dia de vencimento (opcional)</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dueDay as any}
                onChange={(e) =>
                  setDueDay(e.target.value === "" ? "" : Number(e.target.value))
                }
              />
            </div>
          </div>

          {ciclo && (
            <div className="text-xs text-zinc-600 dark:text-zinc-300/80">
              Ciclo estimado (para este mês): fechamento em <b>{ciclo.endISO.split('-').reverse().join('/')}</b>
              {ciclo.dueISO && <> • vencimento em <b>{ciclo.dueISO.split('-').reverse().join('/')}</b></>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>{loading ? 'Salvando…' : 'Salvar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}