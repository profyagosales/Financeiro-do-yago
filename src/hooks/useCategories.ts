import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Category = {
  id: string; // uuid/text no banco
  name: string;
  parent_id: string | null;
  kind: "expense" | "income" | "transfer"; // usamos expense/income para filtros; transfer reservado
  color: string | null; // hex ou tailwind token
  icon_key: string | null; // mapeamos no futuro para BrandIcon/Iconify
};

export type CategoryNode = Category & { children: CategoryNode[] };

// Paleta fallback simples (se não vier cor explícita)
const FALLBACK_COLORS = [
  "#10B981", // emerald-500
  "#3B82F6", // blue-500
  "#F59E0B", // amber-500
  "#6366F1", // indigo-500
  "#EF4444", // red-500
  "#22C55E", // green-500
  "#14B8A6", // teal-500
  "#A855F7", // purple-500
  "#EC4899", // pink-500
  "#F97316", // orange-500
];

function pickColorFor(name: string) {
  const s = name?.toLowerCase() || "";
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return FALLBACK_COLORS[h % FALLBACK_COLORS.length];
}

function buildTree(flat: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  flat.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  // ordenar por nome em cada nível
  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

export function useCategories() {
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("parent_id", { ascending: true })
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setFlat([]);
    } else {
      setFlat((data || []) as Category[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void list();
  }, [list]);

  // ========= CRUD =========
  const create = useCallback(
    async (payload: Partial<Category> & { name: string; kind?: Category["kind"]; parent_id?: string | null }) => {
      const toInsert = {
        name: payload.name.trim(),
        kind: payload.kind ?? "expense",
        parent_id: payload.parent_id ?? null,
        color: payload.color ?? pickColorFor(payload.name),
        icon_key: payload.icon_key ?? null,
      };
      const { error } = await supabase.from("categories").insert(toInsert);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Category, "id">>) => {
      const upd: any = { ...patch };
      if (upd.name && !upd.color) {
        upd.color = pickColorFor(upd.name);
      }
      const { error } = await supabase.from("categories").update(upd).eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  type RemoveOptions =
    | { mode: "blockIfChildren" }
    | { mode: "cascadeChildren" }
    | { mode: "reassignChildrenTo"; targetParentId: string | null };

  const remove = useCallback(
    async (id: string, options: RemoveOptions = { mode: "blockIfChildren" }) => {
      // Verifica se há filhos
      const children = flat.filter((c) => c.parent_id === id).map((c) => c.id);
      if (children.length > 0) {
        if (options.mode === "blockIfChildren") {
          throw new Error("Esta categoria possui subcategorias. Reatribua ou use remoção em cascata.");
        }
        if (options.mode === "reassignChildrenTo") {
          const { error: e1 } = await supabase
            .from("categories")
            .update({ parent_id: options.targetParentId ?? null })
            .eq("parent_id", id);
          if (e1) throw e1;
        }
        if (options.mode === "cascadeChildren") {
          const ids = [id, ...children];
          const { error: eDel } = await supabase.from("categories").delete().in("id", ids);
          if (eDel) throw eDel;
          await list();
          return;
        }
      }
      // sem filhos ou já reatribuídos
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
      await list();
    },
    [flat, list]
  );

  const createMany = useCallback(
    async (
      items: (Partial<Category> & { name: string; kind?: Category["kind"]; parent_id?: string | null })[]
    ) => {
      if (!items?.length) return;
      const payload = items.map((p) => ({
        name: p.name.trim(),
        kind: p.kind ?? "expense",
        parent_id: p.parent_id ?? null,
        color: p.color ?? pickColorFor(p.name),
        icon_key: p.icon_key ?? null,
      }));
      const { error } = await supabase.from("categories").insert(payload);
      if (error) throw error;
      await list();
    },
    [list]
  );

  // ========= Helpers =========
  const tree = useMemo(() => buildTree(flat), [flat]);
  const byId = useMemo(() => new Map(flat.map((c) => [c.id, c])), [flat]);

  const findByName = useCallback(
    (name: string, parentId: string | null = null) => flat.find((c) => c.name === name && c.parent_id === parentId) || null,
    [flat]
  );

  /**
   * Garante um conjunto hierárquico: path ex.: ["Lazer", "Streaming"].
   * Cria níveis que não existirem. Retorna o id da última categoria.
   */
  const ensurePath = useCallback(
    async (path: string[], kind: Category["kind"] = "expense") => {
      let parent: string | null = null;
      let lastId: string | null = null;
      for (const levelName of path) {
        const existing = flat.find((c) => c.name === levelName && c.parent_id === parent);
        if (existing) {
          lastId = existing.id; parent = existing.id; continue;
        }
        const toInsert = {
          name: levelName.trim(),
          parent_id: parent,
          kind,
          color: pickColorFor(levelName),
          icon_key: null,
        };
        const { data, error } = await supabase
          .from("categories")
          .insert(toInsert)
          .select("id")
          .single();
        if (error) throw error;
        lastId = (data as any).id as string;
        parent = lastId;
      }
      await list();
      return lastId;
    },
    [flat, list]
  );

  return {
    flat,
    tree,
    byId,
    loading,
    error,
    list,
    create,
    createMany,
    update,
    remove,
    findByName,
    ensurePath,
  } as const;
}