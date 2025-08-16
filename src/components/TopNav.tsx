import { ChevronDown, Settings } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import AlertsDrawer from './financas/AlertsDrawer';
import { Logo } from './Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ThemeToggle } from './ui/ThemeToggle';

import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { navRoutes } from '@/routes/nav';

const buttonStyles = {
  base: "inline-flex items-center justify-center whitespace-nowrap gap-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  active: "bg-white/20 text-white hover:bg-white/30",
  inactive: "text-white/70 hover:text-white hover:bg-white/10"
};

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className="flex items-center text-white">
            <Logo size="lg" />
            <span className="ml-2 text-xl font-semibold">FY</span>
          </NavLink>

          <nav className="flex items-center gap-1">
            {navRoutes.map((route) => {
              const isActive = location.pathname === route.to || 
                             route.children?.some(child => child.to === location.pathname);

              if (route.children) {
                return (
                  <DropdownMenu key={route.to}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          buttonStyles.base,
                          "px-3 py-2 rounded-lg",
                          isActive ? buttonStyles.active : buttonStyles.inactive
                        )}
                      >
                        <span>{route.label}</span>
                        <ChevronDown className="ml-1 h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      sideOffset={4}
                      alignOffset={-3}
                      className="w-52 p-1 bg-background/95 backdrop-blur-sm border-border/50 shadow-lg"
                    >
                      {route.children.map((item) => (
                        <DropdownMenuItem
                          key={item.to}
                          onClick={() => navigate(item.to)}
                          className={cn(
                            "cursor-pointer rounded-md px-3 py-2 text-sm transition-colors",
                            location.pathname === item.to 
                              ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" 
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          <span className="flex-1">{item.label}</span>
                          {/* Active indicator */}
                          {location.pathname === item.to && (
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          )}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }

              return (
                <NavLink
                  key={route.to}
                  to={route.to}
                  className={({ isActive }) =>
                    cn(
                      buttonStyles.base,
                      "px-3 py-2 rounded-lg",
                      isActive ? buttonStyles.active : buttonStyles.inactive
                    )
                  }
                >
                  {route.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <AlertsDrawer />
          <ThemeToggle />
          <NavLink
            to="/configuracoes"
            className={cn(
              buttonStyles.base,
              "p-2 rounded-lg",
              location.pathname === '/configuracoes' ? buttonStyles.active : buttonStyles.inactive
            )}
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
          <button
            onClick={signOut}
            className={cn(
              buttonStyles.base,
              "gap-2 rounded-lg px-2 py-1",
              buttonStyles.inactive
            )}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-semibold">
              {initials}
            </div>
            <div className="hidden md:flex min-w-0 flex-col text-left">
              <span className="truncate text-sm font-medium text-white">
                {user?.user_metadata?.full_name || user?.email}
              </span>
              <span className="truncate text-xs text-white/80">{user?.email}</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
