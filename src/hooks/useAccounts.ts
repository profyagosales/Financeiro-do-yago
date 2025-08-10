import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Account } from "@/types/finance";

export type { Account };

export function useAccounts() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("id,name,type,institution,balance")
      .order("name", { ascending: true });
    if (error) throw error;
    setData(data as Account[]);
    setLoading(false);
  }, []);

  useEffect(() => { void list(); }, [list]);

  const create = async (payload: Omit<Account, "id" | "user_id">) => {
    const { data, error } = await supabase
      .from("accounts")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    setData((d) => [...d, data as Account]);
  };

  const update = async (id: string, changes: Partial<Account>) => {
    const { data, error } = await supabase
      .from("accounts")
      .update(changes)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    setData((d) => d.map((a) => (a.id === id ? (data as Account) : a)));
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
    setData((d) => d.filter((a) => a.id !== id));
  };

  return { data, loading, list, create, update, remove };
}

