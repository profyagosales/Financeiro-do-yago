// src/pages/CarteiraFIIs.tsx
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Pencil, Trash2, Building2 } from "lucide-react";

import { useInvestments } from "@/hooks/useInvestments";
import ModalInvest from "@/components/ModalInvest";
import PageHeader from "@/components/PageHeader";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Formatter BRL
const BRL = (v: number | null | undefined) => (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function CarteiraFIIs() {
  const { rows, loading, kpis, add, update, remove } = useInvestments({ type: "FIIs" });

  const [q, setQ] = useState("");
  const [openNew, setOpenNew] = useState(false);
  const [editing, setEditing] = useState<typeof rows[number] | null>(null);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return rows;
    return rows.filter((it) => [it.name, it.symbol, it.broker, it.note, (it as any).notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(t)
    );
  }, [rows, q]);

  const onCreate = async (payload: any) => {
    try {
      await add({ ...payload, type: "FIIs" });
      toast.success("Aporte cadastrado!");
      setOpenNew(false);
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e.message });
    }
  };

  const onUpdate = async (id: number, patch: any) => {
    try {
      await update(id, { ...patch, type: "FIIs" });
      toast.success("Atualizado!");
      setEditing(null);
    } catch (e: any) {
      toast.error("Erro ao atualizar", { description: e.message });
    }
  };

  const onDelete = async (id: number, name: string) => {
    if (!confirm(`Excluir "${name}"?`)) return;
    try {
      await remove(id);
      toast.success("Excluído.");
    } catch (e: any) {
      toast.error("Erro ao excluir", { description: e.message });
    }
  };

  return (
    <>
      <PageHeader
        title="Carteira — FIIs"
        subtitle="Lançamentos e aportes desta classe."
        icon={<Building2 className="h-5 w-5" />}
        breadcrumbs={[{ label: "Investimentos", href: "/investimentos" }, { label: "Carteira", href: "/investimentos/fiis" }, { label: "FIIs" }]}
        actions={<Button className="gap-2" onClick={() => setOpenNew(true)}><Plus className="h-4 w-4" /> Novo investimento</Button>}
      />

      {/* Filtro + KPIs */}
      <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, ticker ou corretora…"
          className="w-full md:w-80"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardDescription>Total investido</CardDescription>
            <CardTitle className="text-2xl">{BRL(kpis.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardDescription>Operações (mês atual)</CardDescription>
            <CardTitle className="text-2xl">{kpis.opsMes}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2"><CardDescription>Ativos</CardDescription>
            <CardTitle className="text-2xl">{kpis.ativos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Lista */}
      <div className="mt-6 grid gap-3">
        {loading && <Card className="h-24 animate-pulse bg-muted/40" />} 
        {!loading && filtered.length === 0 && (
          <Card className="p-6">
            <CardTitle className="text-base">Sem lançamentos</CardTitle>
            <CardDescription>Use “Novo investimento” para cadastrar.</CardDescription>
          </Card>
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
                    <Badge>FIIs</Badge>
                    {it.broker ? <span className="text-xs text-muted-foreground">• {it.broker}</span> : null}
                    <span className="text-xs text-muted-foreground">• {new Date(it.date).toLocaleDateString("pt-BR")}</span>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(it)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => onDelete(it.id, it.name)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Quantidade</div>
                <div className="font-medium">{it.quantity}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Preço unit.</div>
                <div className="font-medium">{BRL(it.price)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Taxas</div>
                <div className="font-medium">{BRL(it.fees)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Investido</div>
                <div className="font-medium">{BRL(it.quantity * it.price + (it.fees ?? 0))}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Obs.</div>
                <div className="truncate">{(it as any).note || (it as any).notes || "-"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modais */}
      <ModalInvest
        open={openNew}
        onClose={() => setOpenNew(false)}
        defaultType="FIIs"
        onSubmit={onCreate}
      />

        <ModalInvest
          open={!!editing}
          onClose={() => setEditing(null)}
          initial={editing as any}
          defaultType="FIIs"
          onSubmit={(payload) => { if (editing) return onUpdate(editing.id, payload); }}
        />
    </>
  );
}