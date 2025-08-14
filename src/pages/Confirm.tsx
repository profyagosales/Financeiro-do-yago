import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { supabase } from "@/lib/supabaseClient";

export default function Confirm() {
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Lê os tokens do hash da URL e salva a sessão no storage
        // Shim de compat: algumas versões antigas não tinham a assinatura tipada
        const authAny = supabase.auth as any;
        const getFromUrl = authAny.getSessionFromUrl?.bind(authAny);
        const exchange = authAny.exchangeCodeForSession?.bind(authAny);
        const { error } = getFromUrl
        ? await getFromUrl({ storeSession: true })
        : exchange
        ? await exchange(window.location.href)
        : { error: null };
        if (error) throw error;
        setState("ok");
        toast.success("E-mail confirmado! Faça login.");
        setTimeout(() => navigate("/login", { replace: true }), 800);
      } catch (err) {
        console.error(err);
        setState("error");
        toast.error("Não foi possível confirmar seu e-mail. Tente novamente.");
      }
    })();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md glass border border-emerald-100/50 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-full bg-emerald-600 text-white grid place-items-center font-bold">FY</div>
          <h1 className="text-xl font-semibold text-emerald-900">Confirmando seu e-mail…</h1>
        </div>
        {state === "loading" && <p className="text-emerald-700">Preparando sessão segura…</p>}
        {state === "ok" && <p className="text-emerald-700">Tudo certo! Redirecionando…</p>}
        {state === "error" && (
          <div className="space-y-3">
            <p className="text-red-700">Link inválido ou expirado.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-10 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
            >
              Voltar para o login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

