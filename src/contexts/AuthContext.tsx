import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

interface Ctx {
  user: string | null;
  loading: boolean;
  signIn:  (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const AuthCtx = createContext<Ctx | undefined>(undefined);
export const useAuth = () => useContext(AuthCtx)!;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* escuta sessão */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user.id ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, sess) =>
      setUser(sess?.user.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) alert(error.message);
    else alert('⭕ Confira seu email para o link mágico');
    setLoading(false);
  };

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthCtx.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  );
}