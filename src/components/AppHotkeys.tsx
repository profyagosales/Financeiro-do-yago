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
      // Ajuda
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        toast.message("Atalhos", {
          description:
            "g d: Dashboard • g f: Finanças • g i: Investimentos • g m: Metas • g c: Configurações",
        });
        return;
      }
      // Sequência "g" + letra
      if (!awaiting && e.key.toLowerCase() === "g") {
        setAwaiting(true);
        timer.current = window.setTimeout(() => setAwaiting(false), 1200) as unknown as number;
        return;
      }
      if (awaiting) {
        const path = map[e.key.toLowerCase()];
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