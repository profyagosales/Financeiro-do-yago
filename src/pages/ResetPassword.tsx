// src/pages/ResetPassword.tsx
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabaseClient';

function extractTokens(url: string) {
  // Suporta formatos do Supabase:
  // 1) /reset-password#access_token=...&refresh_token=...&type=recovery
  // 2) /reset-password?access_token=...&refresh_token=...&type=recovery
  // 3) /reset-password?code=...&type=recovery (PKCE / exchangeCodeForSession)
  const u = new URL(url);

  const hashParams = new URLSearchParams(u.hash.startsWith('#') ? u.hash.slice(1) : u.hash);
  const queryParams = new URLSearchParams(u.search);

  const access_token =
    hashParams.get('access_token') || queryParams.get('access_token') || undefined;
  const refresh_token =
    hashParams.get('refresh_token') || queryParams.get('refresh_token') || undefined;
  const code = hashParams.get('code') || queryParams.get('code') || undefined;
  const type = hashParams.get('type') || queryParams.get('type') || undefined;

  return { access_token, refresh_token, code, type };
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const { access_token, refresh_token, code, type } = useMemo(
    () => extractTokens(window.location.href),
    [location.search, location.hash]
  );

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');

  // 1) Assim que chegar, setSession com os tokens do link de recuperação
  useEffect(() => {
    (async () => {
      try {
        // Prioridade: fluxo com "code" (PKCE, recomendado nas versões recentes do supabase-js)
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            toast.error(error.message || 'Não foi possível validar o link de recuperação.');
            return;
          }
          // sessão disponível; seguimos para permitir updateUser
          setReady(true);
          return;
        }

        // Fallback para links antigos com access/refresh tokens
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) {
            toast.error(error.message || 'Não foi possível iniciar a sessão de recuperação.');
            return;
          }
          setReady(true);
          return;
        }

        // Nenhum formato reconhecido
        toast.error('Link inválido ou expirado. Refaça o pedido de redefinição.');
      } catch (e: any) {
        toast.error(e?.message ?? 'Falha ao preparar redefinição.');
      }
    })();
  }, [access_token, refresh_token, code, type]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready) return;

    if (pwd.length < 6) {
      toast.error('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (pwd !== pwd2) {
      toast.error('As senhas não conferem.');
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwd });
      if (error) {
        toast.error(error.message || 'Não foi possível salvar a nova senha.');
        return;
      }

      toast.success('Senha atualizada! Faça login novamente.');
      // Garante que a sessão "de recuperação" não persista
      await supabase.auth.signOut();
      // Limpa hash/query e redireciona
      navigate('/login', { replace: true, state: { resetSuccess: true } });
    } catch (e: any) {
      toast.error(e?.message ?? 'Erro inesperado ao salvar a senha.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* fundo esmeralda */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-emerald-50" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-300 blur-3xl opacity-30 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-400 blur-3xl opacity-20 animate-[pulse_3s_ease-in-out_infinite]" />

      <div className="relative grid min-h-screen place-items-center p-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-3xl border border-emerald-900/5 bg-white/70 backdrop-blur-xl p-6 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="size-11 rounded-full bg-emerald-600 text-white grid place-items-center shadow-lg">
              <span className="font-bold">FY</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-emerald-900">Definir nova senha</h1>
              <p className="text-sm text-emerald-800/70">Informe sua nova senha abaixo.</p>
            </div>
          </div>

          {!ready ? (
            <p className="mt-4 text-sm text-emerald-900/70">
              Preparando a sessão segura para redefinir sua senha…
            </p>
          ) : (
            <>
              <label className="mt-4 block text-sm font-medium text-emerald-900">
                Nova senha
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 outline-none ring-emerald-500/20 focus:ring-2"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                minLength={6}
                required
              />

              <label className="mt-4 block text-sm font-medium text-emerald-900">
                Confirmar senha
              </label>
              <input
                type="password"
                className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 outline-none ring-emerald-500/20 focus:ring-2"
                value={pwd2}
                onChange={(e) => setPwd2(e.target.value)}
                minLength={6}
                required
              />

              <button
                type="submit"
                disabled={busy || !ready}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}