import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Account = {
  id: string;
  name: string;
  institution?: string | null;
  balance?: number | null;
  color?: string | null;
  created_at?: string;
  // campos legados ainda usados em partes do app
  type?: "cash" | "bank" | "wallet" | "other" | null;
  currency?: string | null;
};

function sanitize(payload: Partial<Account>) {
  const p: Partial<Account> = { ...payload };
  if (typeof p.name === "string") p.name = p.name.trim();
  return p;
}

export function useAccounts() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async (): Promise<Account[]> => {
    setLoading(true);
    setError(null);
    const { data: rows, error } = await supabase
      .from<Account>("accounts")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setData([]);
      setLoading(false);
      return [];
    }
    setData(rows ?? []);
    setLoading(false);
    return rows ?? [];
  }, []);

  useEffect(() => {
    void list();
  }, [list]);

  const create = useCallback(
    async (payload: Omit<Account, "id" | "created_at">): Promise<Account> => {
      const base = sanitize(payload);
      const { data: row, error } = await supabase
        .from<Account>("accounts")
        .insert(base)
        .select("*")
        .single();
      if (error) throw error;
      setData((d) => [...d, row]);
      return row;
    },
    []
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Account, "id">>): Promise<void> => {
      const upd = sanitize(patch);
      const { error } = await supabase
        .from<Account>("accounts")
        .update(upd)
        .eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
      setData((d) => d.filter((a) => a.id !== id));
    },
    []
  );

  const removeMany = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!ids.length) return;
      const { error } = await supabase.from("accounts").delete().in("id", ids);
      if (error) throw error;
      setData((d) => d.filter((a) => !ids.includes(a.id)));
    },
    []
  );

  const upsert = useCallback(
    async (payload: Partial<Account>) => {
      if (payload.id) {
        const { id, ...rest } = payload;
        return update(id, rest);
      }
      return create(payload as Omit<Account, "id" | "created_at">);
    },
    [create, update]
  );

  const findById = useCallback(
    (id: string) => data.find((a) => a.id === id) ?? null,
    [data]
  );

  const findByName = useCallback(
    (name: string) => data.find((a) => a.name === name) ?? null,
    [data]
  );

  const grouped = useMemo(() => {
    return {
      cash: data.filter((d) => d.type === "cash"),
      bank: data.filter((d) => d.type === "bank"),
      wallet: data.filter((d) => d.type === "wallet"),
      other: data.filter((d) => d.type === "other"),
    } as const;
  }, [data]);

  return {
    data,
    grouped,
    loading,
    error,
    list,
    create,
    update,
    remove,
    removeMany,
    upsert,
    findById,
    findByName,
  } as const;
}