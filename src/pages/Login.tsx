// src/pages/Login.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';

/**
 * Tela de autenticação com fluxo híbrido (login / cadastro + verificação de e‑mail)
 * Identidade visual em verde e estética "glass".
 * Agora com:
 * - validação básica de campos
 * - tradução de erros comuns do Supabase
 * - link "Esqueci minha senha"
 * - indicador de CapsLock
 * - mensagens de sucesso/erro consistentes (toasts)
 */
export default function Login() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { loginWithPassword, signUpWithPassword } = useAuth() as {
    loginWithPassword: (e: string, p: string) => Promise<void>;
    signUpWithPassword: (e: string, p: string) => Promise<void>;
  };

  type Mode = 'login' | 'signup' | 'check-email';
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [capsOn, setCapsOn] = useState(false);
  const pwdRef = useRef<HTMLInputElement | null>(null);

  // Se voltamos de um reset de senha bem sucedido, informe o usuário.
  useEffect(() => {
    if ((state as any)?.resetSuccess) {
      toast.success('Senha redefinida. Faça login com a nova senha.');
      // limpa o state da navigation
      window.history.replaceState({}, document.title);
    }
  }, [state]);

  useEffect(() => {
    const el = pwdRef.current;
    if (!el) return;
    const handle = (e: KeyboardEvent) => {
      // @ts-expect-error Chrome
      const isCaps = e.getModifierState?.('CapsLock');
      setCapsOn(!!isCaps);
    };
    el.addEventListener('keyup', handle);
    el.addEventListener('keydown', handle);
    return () => {
      el.removeEventListener('keyup', handle);
      el.removeEventListener('keydown', handle);
    };
  }, []);

  const canSubmit = useMemo(() => {
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const okPwd = password.length >= 6;
    return okEmail && okPwd && !busy;
  }, [email, password, busy]);

  function humanizeError(msg?: string) {
    if (!msg) return 'Falha na autenticação';
    const m = msg.toLowerCase();
    if (m.includes('invalid login credentials')) return 'E‑mail ou senha inválidos.';
    if (m.includes('email not confirmed')) return 'E‑mail ainda não confirmado. Verifique sua caixa de entrada.';
    if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    if (m.includes('password should be at least')) return 'A senha deve ter pelo menos 6 caracteres.';
    if (m.includes('user already registered')) return 'Este e‑mail já está cadastrado. Faça login.';
    return msg;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Informe um e‑mail válido.');
      return;
    }
    if (password.length < 6) {
      setFieldError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        await loginWithPassword(trimmed, password);
        toast.success('Bem‑vindo 👋');
        navigate('/');
      } else if (mode === 'signup') {
        await signUpWithPassword(trimmed, password);
        setMode('check-email');
        toast.success('Conta criada! Se necessário, confirme o e‑mail para continuar.');
      }
    } catch (err: any) {
      const nice = humanizeError(err?.message);
      setFieldError(nice);
      toast.error(nice);
    } finally {
      setBusy(false);
    }
  }

  function Header() {
    return (
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-full bg-emerald-600 text-white grid place-items-center shadow-lg">
          <span className="font-bold">FY</span>
        </div>
        <div>
          <h1 className="text-xl font-semibold text-emerald-900">
            {mode === 'login' && 'Entrar'}
            {mode === 'signup' && 'Criar conta'}
            {mode === 'check-email' && 'Verifique seu e‑mail'}
          </h1>
          <p className="text-sm text-emerald-800/70">Acesse o Financeiro do Yago</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fundo com gradiente e "bolhas" animadas */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-white to-emerald-50" />
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-300 blur-3xl opacity-30 animate-pulse" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-400 blur-3xl opacity-20 animate-[pulse_3s_ease-in-out_infinite]" />

      <div className="relative grid min-h-screen place-items-center p-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-md rounded-3xl border border-emerald-900/5 bg-white/70 backdrop-blur-xl p-6 shadow-xl"
        >
          <Header />

          {mode !== 'check-email' && (
            <>
              <label className="mt-6 block text-sm font-medium text-emerald-900">E‑mail</label>
              <input
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-emerald-900/10 bg-white px-3 py-2 outline-none ring-emerald-500/20 focus:ring-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                aria-invalid={!!fieldError}
              />

              <label className="mt-4 block text-sm font-medium text-emerald-900">Senha</label>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-emerald-900/10 bg-white px-3 py-2">
                <input
                  ref={pwdRef}
                  type={showPwd ? 'text' : 'password'}
                  required
                  minLength={6}
                  className="w-full outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  {showPwd ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {capsOn && (
                <p className="mt-2 text-xs text-amber-700">
                  Atenção: Caps Lock ativo.
                </p>
              )}

              {fieldError && (
                <p className="mt-2 text-sm text-rose-700">{fieldError}</p>
              )}

              <div className="mt-3 flex items-center justify-between text-sm">
                <div />
                <Link
                  to="/reset-password"
                  className="text-emerald-700 underline underline-offset-2 hover:text-emerald-800"
                >
                  Esqueci minha senha
                </Link>
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-2.5 font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? 'Aguarde…' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>

              <div className="mt-4 text-center text-sm">
                {mode === 'login' ? (
                  <>
                    Não tem conta?{' '}
                    <button
                      type="button"
                      className="text-emerald-700 underline"
                      onClick={() => {
                        setFieldError(null);
                        setMode('signup');
                      }}
                    >
                      Criar conta
                    </button>
                  </>
                ) : (
                  <>
                    Já tem conta?{' '}
                    <button
                      type="button"
                      className="text-emerald-700 underline"
                      onClick={() => {
                        setFieldError(null);
                        setMode('login');
                      }}
                    >
                      Entrar
                    </button>
                  </>
                )}
              </div>

              <p className="mt-4 text-center text-xs text-emerald-900/60">
                * Senha com no mínimo 6 caracteres. Você pode ativar confirmação por e‑mail no painel do Supabase.
              </p>
            </>
          )}

          {mode === 'check-email' && (
            <div className="mt-6">
              <p className="text-sm text-emerald-900/80">
                Enviamos instruções para <span className="font-medium">{email}</span>.
                <br /> Confirme seu e‑mail para continuar. Depois, volte e faça login normalmente.
              </p>

              <div className="mt-6 grid gap-3">
                <button
                  type="button"
                  className="w-full rounded-xl border border-emerald-900/10 bg-white py-2.5 font-medium text-emerald-800 hover:bg-emerald-50"
                  onClick={() => setMode('login')}
                >
                  Voltar para login
                </button>
                <button
                  type="button"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 font-medium text-white hover:bg-emerald-700"
                  onClick={() => {
                    toast.info('Dica: procure por mensagens do Supabase na sua caixa de entrada/spam.');
                  }}
                >
                  Abrir e‑mail / Já confirmei
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}