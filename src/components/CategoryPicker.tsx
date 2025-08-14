import { useMemo, useState, useId } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCategories, type Category } from "@/hooks/useCategories";

// quando showAll, não use value="" – use "Todas"
// e garanta value controlado nunca vazio

type Props = {
  value: string | null | undefined;
  onChange: (id: string | null) => void;
  placeholder?: string;
  /** optional aria-label for the select trigger */
  ariaLabel?: string;
  kind?: "expense" | "income" | "transfer" | "all";
  allowClear?: boolean;
  allowCreate?: boolean;
  onRequestCreate?: () => void;
  /** when true, include an option to select all categories */
  showAll?: boolean;
  className?: string;
};

export default function CategoryPicker({
  value,
  onChange,
  placeholder = "Selecione a categoria",
  ariaLabel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- API placeholder
  kind: _kind = "all",
  allowClear = true,
  allowCreate = false,
  onRequestCreate,
  showAll = false,
  className = "",
}: Props) {
  const { flat, byId, create, update, remove } = useCategories();

  const options = useMemo(() => buildOptions(flat), [flat]);

  // ===== Modal state =====
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editId, setEditId] = useState<string | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string | null>(null);

  const nameId = useId();
  const colorId = useId();
  const colorHexId = useId();

  function openCreate(pId: string | null) {
    setMode("create");
    setEditId(null);
    setParentId(pId);
    setName("");
    setColor(null);
    setOpen(true);
  }

  function openEdit(id: string) {
    const c = byId.get(id);
    if (!c) return;
    setMode("edit");
    setEditId(id);
    setParentId(c.parent_id ?? null);
    setName(c.name);
    setColor(c.color ?? null);
    setOpen(true);
  }

  async function handleSave() {
    const nm = name.trim();
    if (!nm) {
      toast.info("Informe o nome");
      return;
    }
    const exists = flat.some(
      (c) =>
        c.parent_id === parentId &&
        c.id !== editId &&
        c.name.toLowerCase() === nm.toLowerCase()
    );
    if (exists) {
      toast.error("Já existe categoria com este nome");
      return;
    }

    const colorToSave = color?.trim() || undefined;

    try {
      if (mode === "create") {
        const newCat = await create({ name: nm, parent_id: parentId, color: colorToSave });
        onChange(newCat.id);
      } else if (editId) {
        await update(editId, { name: nm, color: colorToSave });
        onChange(editId);
      }
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar";
      toast.error(msg);
    }
  }

  async function handleDelete() {
    if (!editId) return;
    const ok = confirm("Excluir categoria?");
    if (!ok) return;
    const parent = byId.get(editId)?.parent_id ?? null;
    try {
      await remove(editId);
      if (value === editId) onChange(parent);
      setOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir";
      toast.error(msg);
    }
  }

  async function handleDeleteDirect(id: string) {
    setEditId(id);
    await handleDelete();
  }

  return (
    <div className={`flex w-full items-center gap-2 ${className}`}>
      <Select
        value={value ?? undefined}
        onValueChange={(v) => onChange(v)}
      >
        <SelectTrigger
          aria-label={ariaLabel ?? placeholder}
          className="w-full h-10 rounded-xl bg-white/70 backdrop-blur border border-white/30 shadow-sm dark:bg-zinc-900/50 dark:border-white/10"
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-80 rounded-xl">
          {showAll && (
            // Nunca use value="" em Radix Select
            <SelectItem value="Todas">Todas</SelectItem>
          )}
          {/* Opção "Sem categoria" */}
          {/* Token estável para representar ausência de categoria */}
          <SelectItem value="SemCategoria">Sem categoria</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.id} value={opt.id}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: byId.get(opt.id)?.color || "#CBD5E1" }}
                />
                {opt.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {allowCreate && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Nova categoria"
          aria-label="Nova categoria"
          onClick={() =>
            onRequestCreate ? onRequestCreate() : openCreate(null)
          }
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}

      {value && (
        <>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Nova subcategoria"
            aria-label="Nova subcategoria"
            onClick={() => openCreate(value)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Editar"
            aria-label="Editar"
            onClick={() => openEdit(value)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            title="Excluir"
            aria-label="Excluir"
            onClick={() => handleDeleteDirect(value)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}

      {allowClear && value && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          title="Limpar seleção"
          aria-label="Limpar seleção"
          onClick={() => onChange(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={(o) => setOpen(o)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {mode === "create"
                ? parentId
                  ? "Nova subcategoria"
                  : "Nova categoria"
                : "Editar categoria"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <Label htmlFor={nameId}>Nome</Label>
              <Input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Streaming"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={colorId}>Cor (opcional)</Label>
              <div className="flex items-center gap-3">
                <input
                  id={colorId}
                  type="color"
                  value={color ?? "#10B981"}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 rounded"
                />
                <Input
                  id={colorHexId}
                  aria-label="Código da cor"
                  value={String(color ?? "TokenSemVazio")}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#RRGGBB"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            {mode === "edit" && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            )}
            <Button onClick={handleSave}>
              {mode === "create" ? "Criar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Helpers =====
function buildOptions(items: Category[]) {
  const byParent = new Map<string | null, Category[]>();
  for (const c of items) {
    const p = c.parent_id ?? null;
    const arr = byParent.get(p);
    if (arr) arr.push(c);
    else byParent.set(p, [c]);
  }
  byParent.forEach((arr) =>
    arr.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  );
  const out: { id: string; label: string }[] = [];
  const walk = (parent: string | null, depth: number) => {
    const children = byParent.get(parent);
    if (!children) return;
    for (const c of children) {
      const indent = depth ? "".padStart(depth * 2, "· ") : "";
      out.push({ id: c.id, label: `${indent}${c.name}` });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

