// src/pages/CarteiraTipo.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MoreHorizontal, Pencil, Trash2, Coins } from "lucide-react";

type Props = { tipo: "Renda fixa" | "FIIs" | "Ações" | "Cripto" | "Outros" };

type Investment = {
  id: number;
  user_id: string;
  type: string;
  name: string;
  symbol: string | null;
  quantity: number;
  price: number;
  fees: number | null;
  broker: string | null;
  date: string;
  note: string | null;
  created_at: string;
};

const BRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CarteiraTipo({ tipo }: Props) {
  const { user } = useAuth() as { user: { id: string } | null };
  const [items, setItems] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Investment | null>(null);
  const [form, setForm] = useState({
    name: "", symbol: "", quantity: 0, price: 0, fees: 0, broker: "", date: new Date().toISOString().slice(0, 10), note: ""
  });

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("investments")
          .select("*")
          .eq("type", tipo)
          .order("date", { ascending: true });
        if (error) throw error;
        setItems((data || []) as Investment[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tipo, user?.id]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", symbol: "", quantity: 0, price: 0, fees: 0, broker: "", date: new Date().toISOString().slice(0, 10), note: "" });
    setOpen(true);
  };
  const openEdit = (it: Investment) => {
    setEditing(it);
    setForm({
      name: it.name, symbol: it.symbol || "", quantity: it.quantity, price: it.price,
      fees: it.fees ?? 0, broker: it.broker ?? "", date: it.date, note: it.note ?? ""
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      if (!user) return;
      const payload = {
        user_id: user.id,
        type: tipo,
        name: form.name.trim(),
        symbol: form.symbol.trim() || null,
        quantity: Number(form.quantity || 0),
        price: Number(form.price || 0),
        fees: Number(form.fees || 0),
        broker: form.broker.trim() || null,
        date: form.date,
        note: form.note.trim() || null,
      };
      if (!payload.name) { toast.warning("Informe o nome do ativo."); return; }

      if (editing?.id) {
        const { error } = await supabase.from("investments").update(payload).eq("id", editing.id);
        if (error) throw error;
        toast.success("Atualizado!");
      } else {
        const { error } = await supabase.from("investments").insert(payload);
        if (error) throw error;
        toast.success("Aporte cadastrado!");
      }
      setOpen(false);
      // reload
      const { data } = await supabase.from("investments").select("*").eq("type", tipo).order("date", { ascending: true });
      setItems((data || []) as Investment[]);
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e.message });
    }
  };

  const remove = async (it: Investment) => {
    if (!confirm(`Excluir "${it.name}"?`)) return;
    try {
      const { error } = await supabase.from("investments").delete().eq("id", it.id);
      if (error) throw error;
      toast.success("Excluído.");
      setItems((s) => s.filter((x) => x.id !== it.id));
    } catch (e: any) {
      toast.error("Erro ao excluir", { description: e.message });
    }
  };

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter((it) => [it.name, it.symbol, it.broker].some((v) => (v || "").toLowerCase().includes(t)));
  }, [items, q]);

  const kpis = useMemo(() => {
    const invested = filtered.reduce((s, it) => s + it.quantity * it.price + (it.fees ?? 0), 0);
    const ativos = new Set(filtered.map((it) => (it.symbol || it.name).toUpperCase())).size;
    return { invested, ativos, ops: filtered.length };
  }, [filtered]);

  return (
    <>
      <PageHeader
        title={`Carteira – ${tipo}`}
        subtitle="Lançamentos e aportes desta classe."
        icon={<Coins className="h-5 w-5" />}
        actions={<Button onClick={openNew} className="gap-2"><Plus className="h-4 w-4" /> Novo investimento</Button>}
      />

      {/* Filtro e KPIs */}
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, ticker ou corretora…" className="w-full md:w-80" />
        <Tabs value="lista"><TabsList><TabsTrigger value="lista">Lista</TabsTrigger></TabsList></Tabs>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardDescription>Total investido</CardDescription><CardTitle className="text-2xl">{BRL(kpis.invested)}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Operações</CardDescription><CardTitle className="text-2xl">{kpis.ops}</CardTitle></CardHeader></Card>
        <Card><CardHeader className="pb-2"><CardDescription>Ativos</CardDescription><CardTitle className="text-2xl">{kpis.ativos}</CardTitle></CardHeader></Card>
      </div>

      {/* Lista */}
      <div className="mt-6 grid gap-3">
        {loading && <Card className="h-24 animate-pulse bg-muted/40" />}
        {!loading && filtered.length === 0 && (
          <Card className="p-6"><CardTitle className="text-base">Sem lançamentos</CardTitle>
            <CardDescription>Use “Novo investimento” para cadastrar.</CardDescription></Card>
        )}

        {!loading && filtered.map((it) => (
          <Card key={it.id} className="shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">
                    {it.name} {it.symbol ? <span className="text-muted-foreground">({it.symbol})</span> : null}
                  </CardTitle>
                  <CardDescription className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge>{tipo}</Badge>
                    {it.broker ? <span className="text-xs text-muted-foreground">• {it.broker}</span> : null}
                    <span className="text-xs text-muted-foreground">• {new Date(it.date).toLocaleDateString("pt-BR")}</span>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEdit(it)}><Pencil className="mr-2 h-4 w-4" /> Editar</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => remove(it)}><Trash2 className="mr-2 h-4 w-4" /> Excluir</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div><div className="text-muted-foreground">Quantidade</div><div className="font-medium">{it.quantity}</div></div>
              <div><div className="text-muted-foreground">Preço unit.</div><div className="font-medium">{BRL(it.price)}</div></div>
              <div><div className="text-muted-foreground">Taxas</div><div className="font-medium">{BRL(it.fees ?? 0)}</div></div>
              <div><div className="text-muted-foreground">Investido</div><div className="font-medium">{BRL(it.quantity * it.price + (it.fees ?? 0))}</div></div>
              <div><div className="text-muted-foreground">Obs.</div><div className="truncate">{it.note || "-"}</div></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo investimento"}</DialogTitle>
            <DialogDescription>{tipo}</DialogDescription></DialogHeader>

          <div className="grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
              </div>
              <div className="grid gap-1.5"><Label>Ticker (opcional)</Label>
                <Input value={form.symbol} onChange={(e) => setForm((s) => ({ ...s, symbol: e.target.value }))} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="grid gap-1.5"><Label>Quantidade</Label>
                <Input type="number" inputMode="decimal" value={form.quantity}
                  onChange={(e) => setForm((s) => ({ ...s, quantity: Number(e.target.value) }))} />
              </div>
              <div className="grid gap-1.5"><Label>Preço unitário</Label>
                <Input type="number" inputMode="decimal" value={form.price}
                  onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) }))} />
              </div>
              <div className="grid gap-1.5"><Label>Taxas</Label>
                <Input type="number" inputMode="decimal" value={form.fees}
                  onChange={(e) => setForm((s) => ({ ...s, fees: Number(e.target.value) }))} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Corretora (opcional)</Label>
                <Input value={form.broker} onChange={(e) => setForm((s) => ({ ...s, broker: e.target.value }))} />
              </div>
              <div className="grid gap-1.5"><Label>Data</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm((s) => ({ ...s, date: e.target.value }))} />
              </div>
            </div>

            <div className="grid gap-1.5"><Label>Observação (opcional)</Label>
              <Input value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{editing ? "Salvar alterações" : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}