import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Variantes semânticas de heading para padronizar espaçamento/tamanho
// h1: page title, h2: section, h3: card title
export type HeadingLevel = 1|2|3|4|5|6;
interface HeadingProps { level?: HeadingLevel; children: ReactNode; className?: string; noMargin?: boolean; }

const base = 'font-display tracking-tight text-text dark:text-text-dark';
const map: Record<HeadingLevel,string> = {
  1: 'text-3xl sm:text-4xl font-bold',
  2: 'text-2xl sm:text-3xl font-semibold',
  3: 'text-xl font-semibold',
  4: 'text-lg font-medium',
  5: 'text-base font-medium',
  6: 'text-sm font-semibold uppercase'
};

export function Heading({ level=3, children, className, noMargin }: HeadingProps) {
  const Tag = `h${level}` as any;
  return <Tag className={cn(base, map[level], !noMargin && 'mb-3', className)}>{children}</Tag>;
}

export default Heading;
