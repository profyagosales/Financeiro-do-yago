import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "wallet" | "other";
  institution: string | null;
  currency: string | null; // ex.: "BRL"
};

// Sanitiza/normaliza payloads sem inventar colunas novas
function sanitize(payload: Partial<Account>) {
  const p: Partial<Account> = { ...payload };
  if (typeof p.name === "string") p.name = p.name.trim();
  if (p.type && !["cash", "bank", "wallet", "other"].includes(p.type)) {
    p.type = "other";
  }
  if (p.currency === undefined) p.currency = undefined as any; // não envia se não vier
  if (p.institution === undefined) p.institution = undefined as any;
  return p;
}

export function useAccounts() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const list = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("accounts")
      .select("id,name,type,institution,currency")
      .order("name", { ascending: true });
    if (error) {
      setError(error.message);
      setData([]);
    } else {
      setData((data || []) as Account[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void list();
  }, [list]);

  // ---------- CRUD ----------
  type CreatePayload = Pick<Account, "name" | "type"> &
    Partial<Pick<Account, "institution" | "currency">>;

  const create = useCallback(
    async (payload: CreatePayload) => {
      const base = sanitize(payload);
      const toInsert = {
        name: base.name!,
        type: (base.type as Account["type"]) || "other",
        institution: base.institution ?? null,
        currency: base.currency ?? "BRL",
      };
      const { error } = await supabase.from("accounts").insert(toInsert);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const update = useCallback(
    async (id: string, patch: Partial<Omit<Account, "id">>) => {
      const upd = sanitize(patch);
      const { error } = await supabase
        .from("accounts")
        .update(upd)
        .eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const removeMany = useCallback(
    async (ids: string[]) => {
      if (!ids?.length) return;
      const { error } = await supabase.from("accounts").delete().in("id", ids);
      if (error) throw error;
      await list();
    },
    [list]
  );

  const upsert = useCallback(
    async (payload: Partial<Account>) => {
      if (payload.id) {
        const { id, ...rest } = payload as Account;
        return update(id, rest);
      }
      return create(payload as CreatePayload);
    },
    [create, update]
  );

  // ---------- Helpers ----------
  const findById = useCallback(
    (id: string) => data.find((a) => a.id === id) ?? null,
    [data]
  );

  const findByName = useCallback(
    (name: string) => data.find((a) => a.name === name) ?? null,
    [data]
  );

  const setCurrency = useCallback(
    async (id: string, currency: string | null) => update(id, { currency }),
    [update]
  );

  const setInstitution = useCallback(
    async (id: string, institution: string | null) => update(id, { institution }),
    [update]
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
    list, // refresh
    create,
    update,
    remove,
    removeMany,
    upsert,
    findById,
    findByName,
    setCurrency,
    setInstitution,
  } as const;
}