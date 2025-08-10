import React, { useMemo, useState } from "react";
import { useCategories, type CategoryNode } from "@/hooks/useCategories";
import { ChevronDown, Plus, Pencil, Trash2, Settings, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

/**
 * CategoryPicker (premium + CRUD embutido)
 * - Usa shadcn/ui Select (sem nativo)
 * - Exibe árvore de categorias com indentação visual
 * - Filtro opcional por kind (expense|income|transfer|all)
 * - "Nova categoria…" e "Gerenciar categorias…" embutidos
 * - CRUD completo num Dialog interno (create/update/delete com opções)
 */
export default function CategoryPicker({
  value,
  onChange,
  placeholder = "Selecione a categoria",
  kind = "all",
  allowClear = true,
  allowCreate = false,
  allowManage = true,
  onRequestCreate,
  className = "",
}: {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  placeholder?: string;
  kind?: "expense" | "income" | "transfer" | "all";
  allowClear?: boolean;
  allowCreate?: boolean;
  allowManage?: boolean;
  onRequestCreate?: () => void; // se vier, priorizamos externo; senão, usamos o Dialog interno
  className?: string;
}) {
  const { tree, flat, byId, loading, create, update, remove, list } = useCategories();

  // ====== Flatten para Select/Parent ======
  const flattened = useMemo(() => flattenTree(tree, kind), [tree, kind]);
  const flattenedAllKinds = useMemo(() => flattenTree(tree, "all"), [tree]);

  const handleChange = (v: string) => {
    if (v === "__create__") {
      if (onRequestCreate) onRequestCreate();
      else openManagerForCreate(value ?? null);
      return;
    }
    if (v === "__manage__") {
      setMgrOpen(true);
      // se houver valor atual, preseleciona para editar
      if (value && byId.get(value)) openManagerForEdit(value);
      return;
    }
    onChange(v || null);
  };

  // ====== State do Gerenciador ======
  const [mgrOpen, setMgrOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [kindForm, setKindForm] = useState<"expense" | "income" | "transfer">("expense");
  const [parentId, setParentId] = useState<string | null>(null);
  const [color, setColor] = useState<string>("#10B981");
  // Delete options
  const [delMode, setDelMode] = useState<"block" | "cascade" | "reassign">("block");
  const [reassignTarget, setReassignTarget] = useState<string | null>(null);

  function resetForm() {
    setMode("create");
    setEditId(null);
    setName("");
    setKindForm(kind === "all" ? "expense" : (kind as any));
    setParentId(null);
    setColor("#10B981");
    setDelMode("block");
    setReassignTarget(null);
  }

  function openManagerForCreate(suggestParent: string | null) {
    resetForm();
    setMgrOpen(true);
    if (suggestParent && byId.get(suggestParent || "")) {
      setParentId(suggestParent);
      // herda o kind do pai
      const p = byId.get(suggestParent!)!;
      setKindForm(p.kind);
    } else if (kind !== "all") {
      setKindForm(kind as any);
    }
  }

  function openManagerForEdit(id: string) {
    const c = byId.get(id);
    if (!c) return;
    setMode("edit");
    setEditId(c.id);
    setName(c.name);
    setKindForm(c.kind);
    setParentId(c.parent_id);
    setColor(c.color || "#10B981");
    setMgrOpen(true);
  }

  // Helpers
  const currentChildrenCount = useMemo(() => flat.filter(c => c.parent_id === editId).length, [flat, editId]);

  // ====== Ações CRUD ======
  async function handleSave() {
    const nm = name.trim();
    if (!nm) { toast.info("Informe o nome"); return; }

    if (mode === "create") {
      await create({ name: nm, kind: kindForm, parent_id: parentId, color });
      await list();
      // tentar posicionar seleção na criada (por nome+parent)
      const created = flat.find(c => c.name === nm && c.parent_id === parentId && c.kind === kindForm);
      if (created) onChange(created.id);
      toast.success("Categoria criada!");
      resetForm(); setMgrOpen(false);
    } else if (mode === "edit" && editId) {
      await update(editId, { name: nm, kind: kindForm, parent_id: parentId, color });
      await list();
      toast.success("Categoria atualizada!");
      setMgrOpen(false);
    }
  }

  async function handleDelete() {
    if (!editId) return;
    const baseMsg = `Excluir a categoria selecionada?`;
    const ok = confirm(baseMsg);
    if (!ok) return;

    try {
      if (delMode === "cascade") {
        await remove(editId, { mode: "cascadeChildren" });
      } else if (delMode === "reassign") {
        await remove(editId, { mode: "reassignChildrenTo", targetParentId: reassignTarget ?? null });
      } else {
        await remove(editId, { mode: "blockIfChildren" });
      }
      await list();
      toast.success("Categoria excluída!");
      // se deletou a categoria atualmente selecionada no picker
      if (value === editId) onChange(null);
      resetForm(); setMgrOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Erro ao excluir categoria");
    }
  }

  return (
    <div className={`relative flex w-full items-center gap-2 ${className}`}>
      <Select value={value ?? undefined} onValueChange={handleChange} disabled={loading}>
        <SelectTrigger className="w-full rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="rounded-xl max-h-80">
          {flattened.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: byId.get(opt.id)?.color || '#CBD5E1' }} />
                {opt.label}
              </span>
            </SelectItem>
          ))}
          {allowCreate && (
            <SelectItem value="__create__" className="text-emerald-700 dark:text-emerald-300">
              <span className="inline-flex items-center gap-2"><Plus className="h-4 w-4"/> Nova categoria…</span>
            </SelectItem>
          )}
          {allowManage && (
            <SelectItem value="__manage__" className="text-sky-700 dark:text-sky-300">
              <span className="inline-flex items-center gap-2"><Settings className="h-4 w-4"/> Gerenciar categorias…</span>
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {allowClear && value && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => onChange(null)}
          className="h-9 w-9 rounded-xl bg-white/70 backdrop-blur border border-white/30 dark:bg-zinc-900/50 dark:border-white/10"
          title="Limpar seleção"
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      {/* Ícone visual (compat) */}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0" />

      {/* Dialog: Gerenciar Categorias */}
      <Dialog open={mgrOpen} onOpenChange={(o) => setMgrOpen(o)}>
        <DialogContent className="sm:max-w-3xl bg-white/85 dark:bg-zinc-950/85 backdrop-blur rounded-2xl border border-white/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/> Gerenciar categorias</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Coluna esquerda: árvore clicável */}
            <div className="rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 p-3 max-h-96 overflow-auto">
              <TreeView
                tree={tree}
                kindFilter={kind}
                selectedId={editId}
                onSelect={(id) => openManagerForEdit(id)}
              />
            </div>

            {/* Coluna direita: formulário */}
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Button variant={mode === 'create' ? 'default' : 'outline'} size="sm" onClick={() => openManagerForCreate(value ?? null)}>
                  <Plus className="h-4 w-4"/> Nova
                </Button>
                <Button variant={mode === 'edit' ? 'default' : 'outline'} size="sm" disabled={!editId} onClick={() => editId && openManagerForEdit(editId)}>
                  <Pencil className="h-4 w-4"/> Editar
                </Button>
              </div>

              <div className="grid gap-2">
                <div className="grid gap-1">
                  <Label>Nome</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Streaming" />
                </div>

                <div className="grid gap-1">
                  <Label>Tipo</Label>
                  <Select value={kindForm} onValueChange={(v: any) => setKindForm(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label>Pai (opcional)</Label>
                  <Select value={parentId ?? "__root__"} onValueChange={(v: string) => setParentId(v === "__root__" ? null : v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__root__">(Raiz)</SelectItem>
                      {flattenedAllKinds.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-1">
                  <Label>Cor</Label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-9 w-12 rounded" />
                    <Input value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {mode === 'edit' && (
                    <Button variant="destructive" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4"/> Excluir
                    </Button>
                  )}
                  <Button onClick={handleSave}>{mode === 'create' ? 'Criar' : 'Salvar'}</Button>
                </div>
              </div>

              {mode === 'edit' && (
                <div className="rounded-lg border border-white/30 dark:border-white/10 p-3 text-sm">
                  <div className="font-medium mb-2">Excluir: opções</div>
                  <div className="grid gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="delmode" checked={delMode==='block'} onChange={() => setDelMode('block')} />
                      Bloquear se tiver subcategorias {currentChildrenCount>0 && <span className="opacity-70">({currentChildrenCount})</span>}
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="delmode" checked={delMode==='cascade'} onChange={() => setDelMode('cascade')} />
                      Apagar esta e <b>todas</b> as subcategorias
                    </label>
                    <div className="flex flex-col gap-2">
                      <label className="inline-flex items-center gap-2">
                        <input type="radio" name="delmode" checked={delMode==='reassign'} onChange={() => setDelMode('reassign')} />
                        Mover subcategorias para… e excluir esta
                      </label>
                      {delMode==='reassign' && (
                        <Select value={reassignTarget ?? '__root__'} onValueChange={(v: string) => setReassignTarget(v==='__root__' ? null : v)}>
                          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__root__">(Raiz)</SelectItem>
                            {flattenedAllKinds
                              .filter(o => o.id !== editId) // não mover para si mesma
                              .map((opt) => (
                                <SelectItem key={opt.id} value={opt.id}>{opt.label}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setMgrOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Helpers =====
function flattenTree(tree: CategoryNode[], kind: "expense" | "income" | "transfer" | "all") {
  const out: { id: string; label: string }[] = [];
  function walk(nodes: CategoryNode[], depth = 0) {
    for (const n of nodes) {
      if (kind !== "all" && n.kind !== kind) continue;
      const indent = depth > 0 ? "".padStart(depth * 2, "· ") : "";
      out.push({ id: n.id, label: `${indent}${n.name}` });
      if (n.children?.length) walk(n.children, depth + 1);
    }
  }
  walk(tree, 0);
  return out;
}

function TreeView({ tree, kindFilter, selectedId, onSelect }: {
  tree: CategoryNode[];
  kindFilter: "expense" | "income" | "transfer" | "all";
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <ul className="text-sm">
      {tree.map((n) => (
        <TreeNode key={n.id} node={n} level={0} kindFilter={kindFilter} selectedId={selectedId} onSelect={onSelect} />
      ))}
    </ul>
  );
}

function TreeNode({ node, level, kindFilter, selectedId, onSelect }: {
  node: CategoryNode;
  level: number;
  kindFilter: "expense" | "income" | "transfer" | "all";
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (kindFilter !== "all" && node.kind !== kindFilter) return null;
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(node.id)}
        className={`w-full text-left px-2 py-1.5 rounded-md hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20 ${selectedId===node.id ? 'bg-emerald-100/70 dark:bg-emerald-900/40' : ''}`}
        style={{ paddingLeft: 8 + level * 14 }}
        title="Selecionar para editar"
      >
        <span className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: node.color || '#CBD5E1' }} />
          <span>{node.name}</span>
        </span>
      </button>
      {node.children?.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <TreeNode key={c.id} node={c} level={level + 1} kindFilter={kindFilter} selectedId={selectedId} onSelect={onSelect} />)
          )}
        </ul>
      )}
    </li>
  );
}