// src/contexts/AuthContext.tsx
import type { User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabaseClient';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error?: string }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error?: string; ok?: boolean }>;
  signUpWithPassword: (email: string, password: string) => Promise<{ error?: string; requiresConfirmation?: boolean; ok?: boolean }>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Carrega sessão inicial e escuta mudanças
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,

    // Magic link (continua funcionando)
    async signInWithOtp(email: string) {
      const { error } = await supabase.auth.signInWithOtp({ email });
      return { error: error?.message };
    },

    // ✅ Login com email + senha
    async signInWithPassword(email: string, password: string) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message, ok: !error && !!data.session };
    },

    // ✅ Cadastro com email + senha (com redirect de confirmação)
    async signUpWithPassword(email: string, password: string) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Onde o Supabase vai redirecionar depois do clique no e-mail de confirmação
          emailRedirectTo: `${window.location.origin}/confirm`,
        },
      });
      return {
        error: error?.message,
        ok: !error,
        requiresConfirmation: !error ? !data.session : undefined,
      };
    },

    // 🔐 Reset de senha por e-mail (envia link com redirect)
    async resetPassword(email: string) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        // Para onde o usuário será enviado ao clicar no e-mail
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error: error?.message };
    },

    // 🔐 Atualiza a senha do usuário (troca o código do e-mail por sessão se necessário)
    async updatePassword(newPassword: string) {
      try {
        // Links do Supabase podem vir como hash (#access_token=...) ou query (?code=...)
        const payload = window.location.hash || window.location.search;
        if (payload) {
          await supabase.auth.exchangeCodeForSession(payload);
        }
      } catch {
        // Se não houver código, seguimos em frente; pode já existir sessão
      }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      return { error: error?.message };
    },

    async signOut() {
      await supabase.auth.signOut();
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}