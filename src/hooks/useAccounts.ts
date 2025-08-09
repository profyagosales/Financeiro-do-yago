import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export type Account = {
  id: string;
  name: string;
  type: "cash" | "bank" | "wallet" | "other";
  institution: string | null;
  currency: string | null;
};

export function useAccounts() {
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const list = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("accounts")
      .select("id,name,type,institution,currency")
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

  return { data, loading, list, create };
}