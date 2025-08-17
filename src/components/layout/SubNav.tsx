import clsx from 'clsx';
import { NavLink, useLocation } from 'react-router-dom';

const FIN_SUB = [
  { label: 'Mensal', to: '/financas/mensal' },
  { label: 'Anual',  to: '/financas/anual'  },
];

const INVEST_SUB = [
  { label: 'Renda Fixa', to: '/investimentos/renda-fixa' },
  { label: 'FIIs',       to: '/investimentos/fiis' },
  { label: 'Bolsa',      to: '/investimentos/bolsa' },
  { label: 'Cripto',     to: '/investimentos/cripto' },
];

export function SubNav(){
  const { pathname } = useLocation();
  const items = pathname.startsWith('/financas')
    ? FIN_SUB
    : pathname.startsWith('/investimentos')
    ? INVEST_SUB
    : [];
  if (!items.length) return null;
  return (
    <nav className="flex gap-4 py-2 px-6 border-b border-neutral-200 bg-gradient-to-b from-neutral-800/10 to-transparent">
      {items.map(i => (
        <NavLink
          key={i.to}
          to={i.to}
          className={({ isActive }) => clsx(
            'rounded-full px-4 py-1 text-sm font-medium transition',
            isActive
              ? 'ring-1 ring-[--clr-financas]/50 text-[--clr-financas]'
              : 'text-neutral-500 hover:text-[--clr-financas]'
          )}
        >
          {i.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default SubNav;
