import { useEffect, useMemo, useState } from 'react';

export type AlertType = 'bills' | 'budget' | 'goals' | 'miles';

export type AlertConfig = {
  enabled: boolean;
  limit: number;
};

export type AlertsConfig = Record<AlertType, AlertConfig>;

export type ActiveAlert = {
  type: AlertType;
  message: string;
  cta: string;
};

const STORAGE_KEY = 'fy_alerts_config';

const defaultConfig: AlertsConfig = {
  bills: { enabled: true, limit: 7 },
  budget: { enabled: true, limit: 80 },
  goals: { enabled: true, limit: 80 },
  miles: { enabled: true, limit: 30 },
};

function loadConfig(): AlertsConfig {
  if (typeof window === 'undefined') return defaultConfig;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultConfig;
    const parsed = JSON.parse(raw) as AlertsConfig;
    return {
      bills: { ...defaultConfig.bills, ...parsed.bills },
      budget: { ...defaultConfig.budget, ...parsed.budget },
      goals: { ...defaultConfig.goals, ...parsed.goals },
      miles: { ...defaultConfig.miles, ...parsed.miles },
    };
  } catch {
    return defaultConfig;
  }
}

export function useAlerts() {
  const [config, setConfig] = useState<AlertsConfig>(loadConfig);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config]);

  const activeAlerts = useMemo<ActiveAlert[]>(() => {
    const list: ActiveAlert[] = [];
    if (config.bills.enabled) {
      list.push({
        type: 'bills',
        message: 'Contas a vencer',
        cta: '/financas/mensal',
      });
    }
    if (config.budget.enabled) {
      list.push({
        type: 'budget',
        message: 'Orçamento perto do limite',
        cta: '/financas/resumo',
      });
    }
    if (config.goals.enabled) {
      list.push({
        type: 'goals',
        message: 'Metas em risco',
        cta: '/metas',
      });
    }
    if (config.miles.enabled) {
      list.push({
        type: 'miles',
        message: 'Milhas a expirar',
        cta: '/milhas',
      });
    }
    return list;
  }, [config]);

  const updateConfig = (type: AlertType, patch: Partial<AlertConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [type]: { ...prev[type], ...patch },
    }));
  };

  return { config, updateConfig, activeAlerts, count: activeAlerts.length };
}

export default useAlerts;
