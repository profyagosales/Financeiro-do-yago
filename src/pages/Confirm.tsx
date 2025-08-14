// src/pages/Confirm.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { supabase } from '@/lib/supabaseClient';

export default function Confirm() {
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // o link pode vir como #access_token=... OU ?code=...
        const payload = window.location.hash || window.location.search;
        if (payload) {
          await supabase.auth.exchangeCodeForSession(payload);
        }
        toast.success('E-mail confirmado! 👌');
        navigate('/', { replace: true });
      } catch (err: any) {
        toast.error(err?.message ?? 'Falha ao confirmar e-mail');
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate]);

  return (
    <div className="grid min-h-screen place-items-center text-emerald-900">
      Processando confirmação…
    </div>
  );
}