import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "@/components/ui/Toasts";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPassword() {
  const [phase, setPhase] = useState<"preparing" | "form" | "saving">("preparing");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const navigate = useNavigate();

  // 1) Quando chega do e-mail, o Supabase manda tokens no hash.
  // Precisamos ler e armazenar a sessão antes de permitir trocar a senha.
  useEffect(() => {
    (async () => {
      try {
        // Compat: usa getSessionFromUrl quando disponível, senão fallback
        const authAny = supabase.auth as any;
        const getFromUrl = authAny.getSessionFromUrl?.bind(authAny);
        const exchange = authAny.exchangeCodeForSession?.bind(authAny);
        const { error } = getFromUrl
          ? await getFromUrl({ storeSession: true })
          : exchange
          ? await exchange(window.location.href)
          : { error: null };
        if (error) throw error;
        setPhase("form");
      } catch (err) {
        console.error(err);
        toast.error("Link inválido ou expirado.");
        navigate("/login", { replace: true });
      }
    })();
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("A senha precisa ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas não conferem.");
      return;
    }

    setPhase("saving");
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error(error);
      toast.error("Não foi possível salvar sua nova senha.");
      setPhase("form");
      return;
    }

    toast.success("Senha alterada! Faça login novamente.");
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  if (phase === "preparing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 grid place-items-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur shadow-xl border border-emerald-100 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-full bg-emerald-600 text-white grid place-items-center font-bold">FY</div>
            <h1 className="text-xl font-semibold text-emerald-900">Definir nova senha</h1>
          </div>
          <p className="text-emerald-700">Preparando a sessão segura para redefinir sua senha…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 grid place-items-center p-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white/70 backdrop-blur shadow-xl border border-emerald-100 p-6 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white grid place-items-center font-bold">FY</div>
          <h1 className="text-xl font-semibold text-emerald-900">Definir nova senha</h1>
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-900 mb-1">Nova senha</label>
          <input
            type="password"
            className="w-full h-10 rounded-lg border border-emerald-200 bg-white/80 px-3 outline-none focus:ring-2 focus:ring-emerald-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-emerald-900 mb-1">Confirmar senha</label>
          <input
            type="password"
            className="w-full h-10 rounded-lg border border-emerald-200 bg-white/80 px-3 outline-none focus:ring-2 focus:ring-emerald-400"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </div>

        <button
          type="submit"
          disabled={phase === "saving"}
          className="w-full h-10 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 transition"
        >
          {phase === "saving" ? "Salvando…" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}

