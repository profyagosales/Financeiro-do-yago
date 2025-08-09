import { useEffect, useState } from 'react';
import { getFcmToken, requestPermission, unsubscribeFcm } from '@/lib/firebase';

export function PushToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('fcm_token');
    setEnabled(!!token);
  }, []);

  const toggle = async () => {
    if (enabled) {
      await unsubscribeFcm();
      localStorage.removeItem('fcm_token');
      setEnabled(false);
    } else {
      const ok = await requestPermission();
      if (!ok) return;
      const token = await getFcmToken(import.meta.env.VITE_FIREBASE_VAPID_KEY as string);
      if (token) {
        // TODO: send token to backend to store subscription
        localStorage.setItem('fcm_token', token);
        setEnabled(true);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="px-3 py-2 rounded-md bg-slate-200 dark:bg-slate-700 text-sm"
    >
      {enabled ? 'Desativar notificações' : 'Ativar notificações'}
    </button>
  );
}
