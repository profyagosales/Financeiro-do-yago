import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { mapCategoryColor } from "@/lib/palette";

export type Category = {
  id: string;
  name: string;
  parent_id?: string | null;
  color?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type CategoryNode = Category & { children: CategoryNode[] };

function buildTree(list: Category[]): CategoryNode[] {
  const byId = new Map<string, CategoryNode>();
  list.forEach((c) => byId.set(c.id, { ...c, children: [] }));
  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRec = (nodes: CategoryNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

export function useCategories() {
  const [flat, setFlat] = useState<Category[]>([]);

  const list = useCallback(async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("parent_id", { ascending: true })
      .order("name", { ascending: true })
      .returns<Category[]>();
    if (error) throw error;
    const rows = data ?? [];
    setFlat(rows);
    return rows;
  }, []);

  useEffect(() => {
    void list();
  }, [list]);

  const create = useCallback(
    async (
      input: Omit<Category, "id" | "created_at" | "updated_at">
    ): Promise<Category> => {
      const toInsert = {
        name: input.name.trim(),
        parent_id: input.parent_id ?? null,
        color: input.color ?? mapCategoryColor(input.name),
      };
      const { data, error } = await supabase
        .from("categories")
        .insert(toInsert)
        .select("*")
        .single<Category>();
      if (error || !data) throw error || new Error("Falha ao inserir");
      await list();
      return data;
    },
    [list]
  );

  const update = useCallback(
    async (
      id: string,
      patch: Partial<Omit<Category, "id">>
    ): Promise<void> => {
      const upd: Partial<Omit<Category, "id">> = { ...patch };
      if (upd.name && upd.color === undefined) {
        upd.color = colorForCategory(upd.name);
      }
      const { error } = await supabase
        .from("categories")
        .update(upd)
        .eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const tree = useMemo(() => buildTree(flat), [flat]);
  const byId = useMemo(() => new Map(flat.map((c) => [c.id, c])), [flat]);

  return { flat, tree, byId, list, create, update, remove } as const;
}

