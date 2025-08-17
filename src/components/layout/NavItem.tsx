import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/utils';

interface NavItemProps {
  to: string;
  label: string;
  icon?: ReactNode;
  color?: string; // hex ou var(--clr-*)
  className?: string;
}

/**
 * NavItem moderno usando identidade de cor por rota.
 * - Usa CSS var --clr para ring/realce ativo.
 * - Foca acessibilidade (area de clique generosa + focus-visible).
 */
export default function NavItem({ to, label, icon, color, className }: NavItemProps) {
  return (
    <NavLink
      to={to}
      style={color ? ({ '--clr': color } as React.CSSProperties) : undefined}
      className={({ isActive }) =>
        cn(
          'group nav-item relative flex items-center gap-1 px-5 py-2 rounded-full text-sm font-semibold transition',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--clr)] focus-visible:ring-offset-0',
          isActive
            ? 'ring-1 ring-[color:var(--clr)] bg-[color:var(--clr)/12] text-[color:var(--clr)]'
            : 'text-white/85 hover:text-white',
          className,
        )
      }
    >
      {icon && (
        <span className="flex h-5 w-5 items-center justify-center text-current group-hover:scale-110 transition-transform">
          {/* ícone herda cor via stroke-current */}
          {icon}
        </span>
      )}
  <span className="leading-none" data-active={undefined}>{label}</span>
    </NavLink>
  );
}
