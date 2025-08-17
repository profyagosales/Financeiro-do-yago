import * as React from "react";
import { useNavigate } from "react-router-dom";

import { toast } from "@/components/ui/Toasts";

const map: Record<string, string> = {
  d: "/", // visão geral / home
  f: "/financas/mensal",
  i: "/investimentos/renda-fixa",
  m: "/metas",
  w: "/desejos",
  k: "/mercado",
  l: "/milhas/livelo",
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
            "N: nova transação • /: buscar • F: Finanças • M: Milhas • W: Desejos • K: Mercado • g d: Início • g f: Finanças • g i: Investimentos • g m: Metas • g l: Milhas • g w: Desejos • g k: Mercado • g c: Configurações",
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
        if (key === 'm') { // Milhas
          e.preventDefault();
          nav('/milhas/livelo');
          return;
        }
        if (key === 'w') { // Desejos (wishlist)
          e.preventDefault();
          nav('/desejos');
          return;
        }
        if (key === 'k') { // Mercado (compras)
          e.preventDefault();
          nav('/mercado');
          return;
        }
        if (key === 'n') {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('nova-transacao'));
          return;
        }
        if (e.key === '/') {
          e.preventDefault();
          // tenta focar input de busca global se existir
          const search: HTMLElement | null = document.querySelector('[data-global-search] input, input[data-global-search]');
          if (search && 'focus' in search) (search as HTMLInputElement).focus();
          else window.dispatchEvent(new CustomEvent('global-search'));
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
