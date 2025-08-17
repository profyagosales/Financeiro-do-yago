/**
 * DEPRECATED: Este arquivo era a estrutura antiga de navegação (navSections).
 * Agora usamos `nav.ts` como fonte única de verdade.
 * Mantido temporariamente apenas para evitar que imports quebrados falhem no build.
 * TODO: remover após confirmar que nada mais importa `navigation.ts`.
 */
import { type ComponentType } from 'react';

export interface NavChild {
  label: string;
  to: string;
  icon?: ComponentType<any>;
}

export interface NavSection {
  label: string;
  to?: string;
  icon: ComponentType<any>;
  children?: NavChild[];
}

 
export const navSections: NavSection[] = [];

export const INVESTMENTS_DEFAULT = '/investimentos/renda-fixa'; // mantido para compat.

export function flattenNav(): NavChild[] {
  const out: NavChild[] = [];
  for (const s of navSections) {
    if (s.children) out.push(...s.children);
    else if (s.to) out.push({ label: s.label, to: s.to, icon: s.icon });
  }
  return out;
}
