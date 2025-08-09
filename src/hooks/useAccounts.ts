import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Account = {
  id: string;
  name: string;
  type: "conta" | "carteira" | "poupanca";
  institution: string | null;
  balance: number;
};

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

  useEffect(() => { list(); }, [list]);

  const create = async (payload: Partial<Account>) => {
    const { error } = await supabase.from("accounts").insert(payload);
    if (error) throw error;
    await list();
  };

  const update = async (id: string, patch: Partial<Account>) => {
    const { error } = await supabase.from("accounts").update(patch).eq("id", id);
    if (error) throw error;
    await list();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) throw error;
    await list();
  };

  return { data, loading, list, create, update, remove };
}