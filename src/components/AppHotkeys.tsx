import * as React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const map: Record<string, string> = {
  d: "/dashboard",
  f: "/financas/mensal",
  i: "/investimentos",
  m: "/metas",
  c: "/configuracoes",
};

export function AppHotkeys() {
  const nav = useNavigate();
  const [awaiting, setAwaiting] = React.useState(false);
  const timer = React.useRef<number | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return;

      // Ajuda
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        toast.message("Atalhos", {
          description:
            "N: nova transação • /: buscar • F: Finanças • M: Milhas • g d: Visão geral • g f: Finanças • g i: Investimentos • g m: Metas • g c: Configurações",
        });
        return;
      }

      const key = e.key.toLowerCase();

      // atalhos diretos (sem aguardando 'g')
      if (!awaiting && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (key === 'f') {
          e.preventDefault();
          nav('/financas/mensal');
          return;
        }
        if (key === 'm') {
          e.preventDefault();
          nav('/milhas/livelo');
          return;
        }
        if (key === 'n') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('nova-transacao'));
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('global-search'));
          return;
        }
      }

      // Sequência "g" + letra
      if (!awaiting && key === "g") {
        setAwaiting(true);
        timer.current = window.setTimeout(() => setAwaiting(false), 1200) as unknown as number;
        return;
      }
      if (awaiting) {
        const path = map[key];
        if (path) {
          e.preventDefault();
          if (timer.current) window.clearTimeout(timer.current);
          setAwaiting(false);
          nav(path);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [awaiting, nav]);

  return null;
}

export default AppHotkeys;