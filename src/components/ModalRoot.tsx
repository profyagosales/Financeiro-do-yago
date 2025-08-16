import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Contexto para futuros modais programáticos (placeholder extensível)
type RegistryEntry = { id: string; node: ReactNode };
interface ModalRootContextValue {
  register: (id: string, node: ReactNode) => void;
  unregister: (id: string) => void;
}

const ModalRootContext = createContext<ModalRootContextValue | null>(null);

export function useModalRoot() {
  return useContext(ModalRootContext);
}

// Hook para registro programático simples
export function useModal(id: string, node?: ReactNode) {
  const ctx = useModalRoot();
  useEffect(() => {
    if (!ctx || !node) return;
    ctx.register(id, node);
    return () => ctx.unregister(id);
  }, [ctx, id, node]);
  return ctx;
}

export function ModalRoot({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<RegistryEntry[]>([]);

  const register = useCallback((id: string, node: ReactNode) => {
    setModals((prev) => {
      const exists = prev.find((m) => m.id === id);
      if (exists) return prev.map((m) => (m.id === id ? { ...m, node } : m));
      return [...prev, { id, node }];
    });
  }, []);

  const unregister = useCallback((id: string) => {
    setModals((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <ModalRootContext.Provider value={{ register, unregister }}>
      {children}
      {/* Área onde modais registrados programaticamente são montados */}
      {modals.map((m) => (
        <span key={m.id}>{m.node}</span>
      ))}
    </ModalRootContext.Provider>
  );
}

export default ModalRoot;
