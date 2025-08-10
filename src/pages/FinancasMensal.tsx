import { useMemo, useState } from "react";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

import { PageHeader } from "@/components/PageHeader";
import CategoryPicker from "@/components/CategoryPicker";
import { ModalTransacao, type BaseData } from "@/components/ModalTransacao";
import DailyBars from "@/components/charts/DailyBars";
import CategoryDonut from "@/components/charts/CategoryDonut";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { usePeriod } from "@/state/periodFilter";
import { useTransactions, type Transaction } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useAccounts } from "@/hooks/useAccounts";
import { useCreditCards } from "@/hooks/useCreditCards";

import { Wallet, CreditCard, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

dayjs.locale("pt-br");

export default function FinancasMensal() {
  const { month, year, setMonth, setYear } = usePeriod();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [source, setSource] = useState<{ kind: "all" | "account" | "card"; id: string | null }>({
    kind: "all",
    id: null,
  });
  const [query, setQuery] = useState("");

  const { data, add, update, remove, bulkCreate, kpis } = useTransactions(year, month);
  const { flat: categories } = useCategories();
  const { data: accounts } = useAccounts();
  const { data: cards } = useCreditCards();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const accountMap = useMemo(() => {
    const map = new Map<string, string>();
    accounts.forEach((a) => map.set(a.id, a.name));
    return map;
  }, [accounts]);

  const cardMap = useMemo(() => {
    const map = new Map<string, string>();
    cards.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [cards]);

  const categoryDesc = useMemo(() => {
    if (!categoryId) return null;
    const ids = new Set<string>();
    const walk = (id: string) => {
      ids.add(id);
      categories.filter((c) => c.parent_id === id).forEach((c) => walk(c.id));
    };
    walk(categoryId);
    return ids;
  }, [categoryId, categories]);

  const filtered = useMemo(() => {
    return data.filter((t) => {
      if (query && !t.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (categoryDesc && !categoryDesc.has(t.category_id || "")) return false;
      if (source.kind === "account") {
        if (source.id) return t.account_id === source.id;
        return !!t.account_id;
      }
      if (source.kind === "card") {
        if (source.id) return t.card_id === source.id;
        return !!t.card_id;
      }
      return true;
    });
  }, [data, query, categoryDesc, source]);

  const totalFiltrado = useMemo(() => filtered.reduce((s, t) => s + t.amount, 0), [filtered]);

  const [selected, setSelected] = useState<number[]>([]);
  const allSelected = filtered.length > 0 && filtered.every((t) => selected.includes(t.id));

  function toggleRow(id: number) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }
  function toggleAll(checked: boolean) {
    setSelected(checked ? filtered.map((t) => t.id) : []);
  }

  const openNew = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (t: Transaction) => {
    setEditing(t);
    setModalOpen(true);
  };

  const save = async (form: BaseData) => {
    const payload: Omit<Transaction, "id"> = {
      date: form.date,
      description: form.description,
      amount: form.type === "expense" ? -form.value : form.value,
      category_id: form.category || null,
      account_id: form.source_kind === "account" ? form.source_label || null : null,
      card_id: form.source_kind === "card" ? form.source_label || null : null,
      installment_no: form.installments ? 1 : null,
      installment_total: form.installments || null,
      parent_installment_id: null,
    };
    try {
      if (editing) await update(editing.id, payload);
      else await add(payload);
      toast.success("Transação salva!");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao salvar");
    }
  };

  const del = async (id: number) => {
    try {
      await remove(id);
      toast.success("Transação excluída");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao excluir");
    }
  };

  const deleteSelected = async () => {
    await Promise.all(selected.map((id) => remove(id)));
    setSelected([]);
    toast.success("Transações excluídas");
  };

  const duplicateSelected = async () => {
    const target = prompt("Duplicar para (YYYY-MM)");
    if (!target) return;
    const [y, m] = target.split("-").map((n) => Number(n));
    const rows = filtered
      .filter((t) => selected.includes(t.id))
      .map((t) => {
        const d = new Date(t.date);
        const dt = new Date(y, m - 1, d.getDate());
        return {
          date: dt.toISOString().slice(0, 10),
          description: t.description,
          amount: t.amount,
          category_id: t.category_id,
          account_id: t.account_id,
          card_id: t.card_id,
          installment_no: t.installment_no,
          installment_total: t.installment_total,
          parent_installment_id: t.parent_installment_id,
        } as Omit<Transaction, "id">;
      });
    try {
      await bulkCreate(rows);
      toast.success("Transações duplicadas");
    } catch (e: any) {
      toast.error(e?.message || "Erro ao duplicar");
    }
    setSelected([]);
  };

  const MONTHS = [
    { v: 1, n: "Jan" },
    { v: 2, n: "Fev" },
    { v: 3, n: "Mar" },
    { v: 4, n: "Abr" },
    { v: 5, n: "Mai" },
    { v: 6, n: "Jun" },
    { v: 7, n: "Jul" },
    { v: 8, n: "Ago" },
    { v: 9, n: "Set" },
    { v: 10, n: "Out" },
    { v: 11, n: "Nov" },
    { v: 12, n: "Dez" },
  ];
  const YEARS = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => y - i);
  }, []);

  const legacyData = useMemo(
    () =>
      data.map((t) => ({
        id: t.id,
        date: t.date,
        description: t.description,
        value: Math.abs(t.amount),
        type: t.amount < 0 ? "expense" : "income",
        category: categoryMap.get(t.category_id || "") || "",
      })),
    [data, categoryMap]
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Finanças — Mensal" />

      {/* Filtros */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex items-center gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded border p-2 text-sm"
          >
            {MONTHS.map((m) => (
              <option key={m.v} value={m.v}>
                {m.n}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded border p-2 text-sm"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-[200px]">
          <CategoryPicker value={categoryId} onChange={setCategoryId} placeholder="Todas as categorias" />
        </div>

        <div>
          <select
            className="rounded border p-2 text-sm"
            value={`${source.kind}:${source.id || ""}`}
            onChange={(e) => {
              const [k, id] = e.target.value.split(":");
              setSource({ kind: k as any, id: id || null });
            }}
          >
            <option value="all:">Todas as fontes</option>
            <optgroup label="Contas">
              {accounts.map((a) => (
                <option key={a.id} value={`account:${a.id}`}>
                  {a.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Cartões">
              {cards.map((c) => (
                <option key={c.id} value={`card:${c.id}`}>
                  {c.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="p-4 rounded-lg bg-white shadow">
          <span className="text-sm text-slate-500">Saldo do mês</span>
          <AnimatedNumber value={kpis.saldo} />
        </div>
        <div className="p-4 rounded-lg bg-white shadow">
          <span className="text-sm text-slate-500">Entradas</span>
          <AnimatedNumber value={kpis.entradas} />
        </div>
        <div className="p-4 rounded-lg bg-white shadow">
          <span className="text-sm text-slate-500">Saídas</span>
          <AnimatedNumber value={-kpis.saidas} />
        </div>
      </section>

      {/* Gráficos */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBars transacoes={legacyData} mes={`${year}-${String(month).padStart(2, "0")}`} />
        </div>
        <div className="lg:col-span-1">
          <CategoryDonut transacoes={legacyData} />
        </div>
      </section>

      {/* Tabela */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por descrição..."
            className="w-full sm:max-w-xs"
          />

          {selected.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm">{selected.length} selecionada(s)</span>
              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                Excluir
              </Button>
              <Button variant="secondary" size="sm" onClick={duplicateSelected}>
                Duplicar
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-xl border overflow-hidden">
          <div className="max-h-[480px] overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-gray-50">
                <TableRow>
                  <TableHead className="w-8">
                    <input type="checkbox" checked={allSelected} onChange={(e) => toggleAll(e.target.checked)} />
                  </TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Parcela</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => {
                  const fonte = t.account_id
                    ? { icon: <Wallet className="h-4 w-4" />, name: accountMap.get(t.account_id) }
                    : t.card_id
                    ? { icon: <CreditCard className="h-4 w-4" />, name: cardMap.get(t.card_id) }
                    : { icon: null, name: "-" };
                  return (
                    <TableRow key={t.id} className="odd:bg-slate-50 dark:odd:bg-slate-800">
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selected.includes(t.id)}
                          onChange={() => toggleRow(t.id)}
                        />
                      </TableCell>
                      <TableCell>{dayjs(t.date).format("DD/MM")}</TableCell>
                      <TableCell className="max-w-[240px] truncate">{t.description}</TableCell>
                      <TableCell>{categoryMap.get(t.category_id || "") || "-"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          {fonte.icon}
                          {fonte.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        {t.installment_no && t.installment_total
                          ? `${t.installment_no}/${t.installment_total}`
                          : "-"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-numeric ${
                          t.amount < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {Math.abs(t.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="secondary" size="sm" onClick={() => openEdit(t)}>
                            <Pencil size={16} />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => del(t.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="py-6 text-center text-sm text-slate-500">
                      Nenhuma transação
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell
                    className={`text-right font-numeric ${
                      totalFiltrado < 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {totalFiltrado.toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </div>
      </div>

      {/* botão flutuante */}
      <Button
        onClick={openNew}
        className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg"
      >
        <Plus />
      </Button>

      {/* modal */}
      <ModalTransacao
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={
          editing && {
            date: editing.date,
            description: editing.description,
            value: Math.abs(editing.amount),
            type: editing.amount < 0 ? "expense" : "income",
            category: editing.category_id || "",
            payment_method: "",
            source_kind: editing.card_id ? "card" : "account",
            source_label: editing.card_id || editing.account_id || null,
            installments: editing.installment_total || null,
            notes: null,
            attachment_file: null,
          }
        }
        onSubmit={save}
      />
    </div>
  );
}

