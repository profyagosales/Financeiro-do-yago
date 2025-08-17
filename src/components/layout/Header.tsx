import { NavLink, useLocation } from 'react-router-dom';

import AvatarMenu from './AvatarMenu';
import LogoBlock from './LogoBlock';
import NavItem from './NavItem';

import { navRoutes, type NavRoute, type NavItem as RouteItem } from '@/routes/nav';
import { Settings } from '@/components/icons';

function deriveActive(path: string): NavRoute | RouteItem | null {
  for (const top of navRoutes) {
    if (path === top.to || path.startsWith(top.to + '/')) return top;
    if (top.children) {
      const child = top.children.find(c => path === c.to);
      if (child) return child;
    }
  }
  return null;
}

export default function Header() {
  const { pathname } = useLocation();
  const active = deriveActive(pathname) as NavRoute | null;
  const subRoutes = (active && 'children' in active && active.children?.length ? active.children : (navRoutes.find(r => r.children?.some(c => c.to === pathname))?.children)) || [];
  const topRoute = navRoutes.find(r => pathname === r.to || pathname.startsWith(r.to + '/'));
  const activeColor = topRoute?.color || 'var(--clr-home)';

  return (
    <header
      className="relative z-50 grid w-full grid-cols-[var(--logo-w)_1fr_auto] grid-rows-[56px_40px] bg-[linear-gradient(to_bottom,rgba(30,36,46,0.85)_0%,rgba(30,36,46,0.78)_55%,rgba(30,36,46,0.74)_100%)] backdrop-blur-xl supports-[backdrop-filter]:bg-[linear-gradient(to_bottom,rgba(30,36,46,0.85)_0%,rgba(30,36,46,0.78)_55%,rgba(30,36,46,0.74)_100%)] border-b border-white/10"
      style={{ ['--logo-w' as any]: '200px', ['--clr' as any]: activeColor }}
    >
  <LogoBlock color={activeColor} />
      {/* Topbar */}
      <div className="row-start-1 col-start-2 col-span-1 flex items-center justify-center gap-2 px-2">
        {navRoutes.map(r => (
          <NavItem
            key={r.to}
            to={r.to}
            label={r.label}
            color={r.color}
            icon={typeof r.icon === 'function' ? r.icon('h-5 w-5 stroke-current') : undefined}
          />
        ))}
      </div>
      {/* Controles direita */}
      <div className="row-span-2 row-start-1 col-start-3 flex flex-col items-end justify-center pr-6">
        <div className="flex items-center gap-3">
          <NavLink
            to="/configuracoes"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--clr)]"
          >
            <Settings className="h-6 w-6" />
          </NavLink>
          <div className="h-12 w-12 flex items-center justify-center">
            <AvatarMenu />
          </div>
        </div>
      </div>
      {/* SubNav */}
  <div className="row-start-2 col-start-2 col-span-1 flex items-center justify-center px-2">
        {subRoutes.length > 0 && (
          <nav className="flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-white/80">
            {subRoutes.map(sr => (
              <NavLink
                key={sr.to}
                to={sr.to}
                style={{ ['--clr' as any]: sr.color || activeColor }}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center rounded-full px-4 py-1.5 transition focus-visible:outline-none',
                    'text-white/70 hover:text-white',
                    isActive && 'ring-1 ring-[color:var(--clr)] bg-[color:var(--clr)/18] text-[color:var(--clr)]',
                  ].filter(Boolean).join(' ')
                }
              >
                {sr.label}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
