import * as Icons from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';
import type { NavItem } from '@/routes/nav.tsx';
import { APP_COLORS } from '@/theme/colors';

interface SubNavProps {
  items: NavItem[];
  parentLabel: string;
}

export function SubNav({ items, parentLabel }: SubNavProps) {
  return (
    <nav className="subnav w-full border-t border-white/10 dark:border-white/5 backdrop-blur" aria-label={`Submenu de ${parentLabel}`} role="tablist">
      <div className="flex justify-center gap-6 px-6 py-2 flex-wrap">
        {items.map(item => {
          const IconCmp = typeof item.icon === 'function' ? item.icon : (item.icon && (Icons as any)[item.icon]);
          const key = Object.keys(APP_COLORS).find(k => item.color?.includes(k)) as keyof typeof APP_COLORS | undefined;
          const clr = key ? APP_COLORS[key] : (item.color || 'var(--clr)');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              role="tab"
              style={{ ['--clr' as any]: clr }}
              className={({ isActive }) => cn(
                'subnav-item inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--clr)]',
                isActive
                  ? 'ring-1 ring-[color:var(--clr)] bg-[color:var(--clr)/10] text-[color:var(--clr)] dark:text-[color:var(--clr)]'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[color:var(--clr)]'
              )}
            >
              {IconCmp && (typeof IconCmp === 'function'
                ? IconCmp('h-4 w-4 stroke-current')
                : <IconCmp className="h-4 w-4 stroke-current" />)}
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
