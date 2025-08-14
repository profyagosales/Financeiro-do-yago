// src/pages/Metas.tsx
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Target,
  CalendarDays,
  TrendingUp,
  PiggyBank,
  MoreHorizontal,
  CheckCircle2,
  Archive,
  Trash2,
  HandCoins,
  AlertTriangle,
  Clock,
  Search,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


/* ----------------------------- Tipos ----------------------------- */
type GoalRow = {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  priority: number | null; // 1-5
  target_value: number;
  deadline: string; // yyyy-mm-dd
  expected_rate: number | null;
  status: "active" | "archived" | "completed";
  created_at: string;
  updated_at: string;

  contributed: number;
  progress_pct: number; // 0-100
  months_remaining: number;
  days_remaining: number;
  suggested_monthly: number;
  health_hint: "done" | "late" | "risk_or_track";
};

type NewGoal = {
  title: string;
  description?: string;
  category?: string;
  priority?: number;
  target_value: number;
  deadline: string; // yyyy-mm-dd
  expected_rate?: number | null;
};

type NewContribution = {
  goal_id: number;
  date: string; // yyyy-mm-dd
  amount: number;
  note?: string;
};

/* --------------------------- Utilidades -------------------------- */
const BRL = (v: number | null | undefined) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("pt-BR");

const healthBadge = (g: GoalRow) => {
  if (g.health_hint === "done" || g.status === "completed") {
    return (
      <Badge className="bg-emerald-600 hover:bg-emerald-600/90">
        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
        Concluída
      </Badge>
    );
  }
  if (g.health_hint === "late" || new Date(g.deadline) < new Date()) {
    return (
      <Badge variant="destructive">
        <AlertTriangle className="mr-1 h-3.5 w-3.5" />
        Atrasada
      </Badge>
    );
  }
  return (
    <Badge className="bg-amber-500 hover:bg-amber-500/90">
      <Clock className="mr-1 h-3.5 w-3.5" />
      Em andamento
    </Badge>
  );
};

const priorityDot = (n?: number | null) => {
  if (!n) return null;
  const colors = ["bg-zinc-400", "bg-green-500", "bg-blue-500", "bg-violet-500", "bg-rose-500"];
  const idx = Math.min(Math.max(n, 1), 5) - 1;
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${colors[idx]} mr-1`} />;
};

/* ========================== Página Metas ========================= */
export default function Metas() {
  const { user } = useAuth() as { user: { id: string } | null };
  const [loading, setLoading] = useState(true);
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [tab, setTab] = useState<"ativas" | "atrasadas" | "concluidas" | "todas">("ativas");
  const [q, setQ] = useState("");

  // dialogs
  const [openGoal, setOpenGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null);

  const [openContrib, setOpenContrib] = useState(false);
  const [contribGoal, setContribGoal] = useState<GoalRow | null>(null);

  // forms
  const [goalForm, setGoalForm] = useState<NewGoal>({
    title: "",
    target_value: 0,
    deadline: new Date().toISOString().slice(0, 10),
    category: "",
    description: "",
    expected_rate: null,
    priority: 3,
  });

  const [contribForm, setContribForm] = useState<NewContribution>({
    goal_id: 0,
    date: new Date().toISOString().slice(0, 10),
    amount: 0,
    note: "",
  });

  /* ------------------------ Carregar metas ------------------------ */
  const load = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("goals_progress_v")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) throw error;
      setGoals((data || []) as GoalRow[]);
    } catch (e: any) {
      toast.error("Erro ao carregar metas", { description: e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ---------------------------- KPIs ----------------------------- */
  const kpis = useMemo(() => {
    const filtered = goals;
    const totalTarget = filtered.reduce((s, g) => s + (g.target_value || 0), 0);
    const totalContrib = filtered.reduce((s, g) => s + (g.contributed || 0), 0);
    const avgPct =
      filtered.length > 0
        ? Math.round(
            filtered.reduce((s, g) => s + (g.progress_pct || 0), 0) / filtered.length
          )
        : 0;
    const activeCount = filtered.filter((g) => g.status === "active").length;
    return { totalTarget, totalContrib, avgPct, activeCount };
  }, [goals]);

  /* --------------------------- Filtragem -------------------------- */
  const filteredGoals = useMemo(() => {
    const now = new Date();
    let rows = goals;

    if (tab === "ativas") rows = rows.filter((g) => g.status === "active");
    if (tab === "atrasadas")
      rows = rows.filter((g) => g.status !== "completed" && new Date(g.deadline) < now);
    if (tab === "concluidas") rows = rows.filter((g) => g.status === "completed");

    if (q.trim()) {
      const t = q.trim().toLowerCase();
      rows = rows.filter(
        (g) =>
          g.title.toLowerCase().includes(t) ||
          (g.category || "").toLowerCase().includes(t) ||
          (g.description || "").toLowerCase().includes(t)
      );
    }
    return rows;
  }, [goals, tab, q]);

  /* ------------------------- Ações / CRUD ------------------------- */
  const openNewGoal = () => {
    setEditingGoal(null);
    setGoalForm({
      title: "",
      target_value: 0,
      deadline: new Date().toISOString().slice(0, 10),
      category: "",
      description: "",
      expected_rate: null,
      priority: 3,
    });
    setOpenGoal(true);
  };

  const openEditGoal = (g: GoalRow) => {
    setEditingGoal(g);
    setGoalForm({
      title: g.title,
      target_value: g.target_value,
      deadline: g.deadline,
      category: g.category || "",
      description: g.description || "",
      expected_rate: g.expected_rate ?? null,
      priority: g.priority ?? 3,
    });
    setOpenGoal(true);
  };

  const saveGoal = async () => {
    try {
      if (!user) return;
      const payload = {
        user_id: user.id,
        title: goalForm.title.trim(),
        description: goalForm.description || null,
        category: goalForm.category || null,
        priority: goalForm.priority ?? 3,
        target_value: Number(goalForm.target_value || 0),
        deadline: goalForm.deadline,
        expected_rate:
          goalForm.expected_rate === null || goalForm.expected_rate === undefined
            ? null
            : Number(goalForm.expected_rate),
        status: editingGoal?.status ?? "active",
      };

      if (!payload.title || !payload.target_value || !payload.deadline) {
        toast.warning("Preencha título, valor alvo e prazo.");
        return;
      }

      if (editingGoal) {
        const { error } = await supabase.from("goals").update(payload).eq("id", editingGoal.id);
        if (error) throw error;
        toast.success("Meta atualizada!");
      } else {
        const { error } = await supabase.from("goals").insert(payload);
        if (error) throw error;
        toast.success("Meta criada!");
      }

      setOpenGoal(false);
      await load();
    } catch (e: any) {
      toast.error("Erro ao salvar meta", { description: e.message });
    }
  };

  const confirmDelete = async (g: GoalRow) => {
    if (!confirm(`Excluir a meta "${g.title}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const { error } = await supabase.from("goals").delete().eq("id", g.id);
      if (error) throw error;
      toast.success("Meta excluída.");
      await load();
    } catch (e: any) {
      toast.error("Erro ao excluir meta", { description: e.message });
    }
  };

  const updateStatus = async (g: GoalRow, status: GoalRow["status"]) => {
    try {
      const { error } = await supabase.from("goals").update({ status }).eq("id", g.id);
      if (error) throw error;
      toast.success(
        status === "completed" ? "Meta marcada como concluída." : "Meta arquivada."
      );
      await load();
    } catch (e: any) {
      toast.error("Erro ao atualizar status", { description: e.message });
    }
  };

  const openNewContrib = (g: GoalRow) => {
    setContribGoal(g);
    setContribForm({
      goal_id: g.id,
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      note: "",
    });
    setOpenContrib(true);
  };

  const saveContribution = async () => {
    try {
      if (!user || !contribGoal) return;
      const payload = {
        user_id: user.id,
        goal_id: contribForm.goal_id,
        date: contribForm.date,
        amount: Number(contribForm.amount || 0),
        note: contribForm.note || null,
      };
      if (!payload.amount || payload.amount <= 0) {
        toast.warning("Informe um valor de aporte válido.");
        return;
      }
      const { error } = await supabase.from("goal_contributions").insert(payload);
      if (error) throw error;
      toast.success("Aporte registrado!");
      setOpenContrib(false);
      await load();
    } catch (e: any) {
      toast.error("Erro ao registrar aporte", { description: e.message });
    }
  };

  /* ------------------------------ UI ------------------------------ */
  return (
    <>
      <PageHeader
        title="Metas & Projetos"
        subtitle="Defina objetivos, acompanhe progresso, registre aportes e mantenha tudo sob controle."
        icon={<Target className="h-5 w-5" />}
        actions={
          <Button
            onClick={openNewGoal}
            className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="h-4 w-4" />
            Nova meta
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Patrimônio alvo</CardDescription>
            <CardTitle className="text-2xl">{BRL(kpis.totalTarget)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-muted-foreground flex items-center gap-2">
            <Target className="h-4 w-4" /> total de todas as metas
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Aportado</CardDescription>
            <CardTitle className="text-2xl">{BRL(kpis.totalContrib)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-muted-foreground flex items-center gap-2">
            <PiggyBank className="h-4 w-4" /> soma de contribuições
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Conclusão média</CardDescription>
            <CardTitle className="text-2xl">{kpis.avgPct}%</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" /> média do progresso
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Metas ativas</CardDescription>
            <CardTitle className="text-2xl">{kpis.activeCount}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-muted-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> em andamento
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={tab} onValueChange={(v: any) => setTab(v)}>
          <TabsList>
            <TabsTrigger value="ativas">Ativas</TabsTrigger>
            <TabsTrigger value="atrasadas">Atrasadas</TabsTrigger>
            <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por título, categoria…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      {/* Lista / Grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && <Card className="h-40 animate-pulse bg-muted/40" />}

        {!loading && filteredGoals.length === 0 && (
          <Card className="p-6 col-span-full">
            <CardTitle className="text-base">Nenhuma meta encontrada</CardTitle>
            <CardDescription className="mt-1">
              Crie sua primeira meta clicando em <b>Nova meta</b>.
            </CardDescription>
          </Card>
        )}

        {!loading &&
          filteredGoals.map((g) => (
            <Card key={g.id} className="group overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="text-lg truncate">{g.title}</CardTitle>
                    <CardDescription className="mt-0.5 flex items-center gap-2">
                      {priorityDot(g.priority)}
                      {g.category || "Sem categoria"} • até {formatDate(g.deadline)}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditGoal(g)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(g, "completed")}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Concluir
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => updateStatus(g, "archived")}>
                        <Archive className="mr-2 h-4 w-4" /> Arquivar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => confirmDelete(g)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-2 flex items-center gap-2">{healthBadge(g)}</div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{Math.round(g.progress_pct)}%</span>
                </div>
                <Progress
                  value={Math.min(100, Math.max(0, g.progress_pct || 0))}
                  className="h-2"
                />

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-md border p-2">
                    <div className="text-muted-foreground">Aportado</div>
                    <div className="font-medium">{BRL(g.contributed)}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-muted-foreground">Alvo</div>
                    <div className="font-medium">{BRL(g.target_value)}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-muted-foreground">Sugerido/mês</div>
                    <div className="font-medium">{BRL(g.suggested_monthly)}</div>
                  </div>
                  <div className="rounded-md border p-2">
                    <div className="text-muted-foreground">Dias restantes</div>
                    <div className="font-medium">{g.days_remaining}</div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between">
                <Button variant="outline" onClick={() => openEditGoal(g)}>
                  Editar
                </Button>
                <Button onClick={() => openNewContrib(g)} className="gap-2">
                  <HandCoins className="h-4 w-4" />
                  Aportar
                </Button>
              </CardFooter>
            </Card>
          ))}
      </div>

      {/* Dialog Nova/Editar Meta */}
      <Dialog open={openGoal} onOpenChange={setOpenGoal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Editar meta" : "Nova meta"}</DialogTitle>
            <DialogDescription>
              Defina título, valor alvo e prazo. Os demais campos são opcionais.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label>Título</Label>
              <Input
                value={goalForm.title}
                onChange={(e) => setGoalForm((s) => ({ ...s, title: e.target.value }))}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Valor alvo</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={goalForm.target_value}
                  onChange={(e) =>
                    setGoalForm((s) => ({ ...s, target_value: Number(e.target.value) }))
                  }
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Prazo</Label>
                <Input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(e) => setGoalForm((s) => ({ ...s, deadline: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className="grid gap-1.5">
                <Label>Categoria</Label>
                <Input
                  placeholder="Ex.: Casa, Carro, Viagem…"
                  value={goalForm.category}
                  onChange={(e) => setGoalForm((s) => ({ ...s, category: e.target.value }))}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Prioridade</Label>
                <Select
                  value={String(goalForm.priority ?? 3)}
                  onValueChange={(v) => setGoalForm((s) => ({ ...s, priority: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 (baixa)</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="5">5 (alta)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Rentabilidade esperada (% a.a.)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="opcional"
                  value={goalForm.expected_rate ?? ""}
                  onChange={(e) =>
                    setGoalForm((s) => ({
                      ...s,
                      expected_rate: e.target.value === "" ? null : Number(e.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Notas rápidas…"
                value={goalForm.description}
                onChange={(e) => setGoalForm((s) => ({ ...s, description: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenGoal(false)}>
              Cancelar
            </Button>
            <Button onClick={saveGoal}>{editingGoal ? "Salvar alterações" : "Criar meta"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Aporte */}
      <Dialog open={openContrib} onOpenChange={setOpenContrib}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo aporte</DialogTitle>
            <DialogDescription>
              Registre um aporte para <b>{contribGoal?.title}</b>.
            </DialogDescription>
          </DialogHeader>

        <div className="grid gap-3">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={contribForm.date}
                  onChange={(e) => setContribForm((s) => ({ ...s, date: e.target.value }))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Valor</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={contribForm.amount}
                  onChange={(e) =>
                    setContribForm((s) => ({ ...s, amount: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Observação (opcional)</Label>
              <Input
                placeholder="Ex.: Aporte extra"
                value={contribForm.note}
                onChange={(e) => setContribForm((s) => ({ ...s, note: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpenContrib(false)}>
              Cancelar
            </Button>
            <Button onClick={saveContribution}>Salvar aporte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Botão flutuante (fallback) */}
      <Button
        size="icon"
        onClick={openNewGoal}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg bg-emerald-600 hover:bg-emerald-500 text-white"
        aria-label="Nova meta"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </>
  );
}