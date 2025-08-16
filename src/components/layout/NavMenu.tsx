import { ChevronDown } from 'lucide-react';
import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAlerts } from '@/hooks/useAlerts';
import { cn } from '@/lib/utils';
import { navRoutes } from '@/routes/nav';

// Mapeamento simples de ícones
const iconMap: Record<string, React.ComponentType<any>> = {
  Home: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Wallet: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  Landmark: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  Plane: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Target: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" strokeWidth={2}/><circle cx="12" cy="12" r="6" strokeWidth={2}/><circle cx="12" cy="12" r="2" strokeWidth={2}/></svg>,
  Heart: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  ShoppingCart: ({ className }: any) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" /></svg>,
};

export function NavMenu() {
  const location = useLocation();
  const { count: alertsCount } = useAlerts();

  const activeRoute = React.useMemo(() => {
    for (const route of navRoutes) {
      if (location.pathname === route.to) return route;
      if (route.children) {
        const child = route.children.find(child => location.pathname === child.to);
        if (child) return route;
      }
      if (location.pathname.startsWith(route.to + '/')) return route;
    }
    return null;
  }, [location.pathname]);

  return (
    <nav className="relative">
      <ul className="flex items-center gap-2">
        {navRoutes.map((route) => {
          const Icon = iconMap[route.icon || ''] || iconMap.Home;
          const isActive = activeRoute?.label === route.label;

          if (route.children) {
            return (
              <li key={route.label} className="relative">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn(
                        "group flex items-center gap-1.5 text-sm",
                        isActive && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="inline-flex items-center gap-1">
                        {route.label}
                        {route.label === 'Finanças' && alertsCount ? (
                          <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
                            {alertsCount}
                          </span>
                        ) : null}
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 transition duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56 bg-background/95 backdrop-blur-sm border-border/50 shadow-lg"
                    sideOffset={8}
                    align="start"
                    alignOffset={0}
                  >
                    {route.children.map((child) => (
                      <DropdownMenuItem
                        key={child.to}
                        asChild
                        className="focus:bg-accent focus:text-accent-foreground"
                      >
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            cn(
                              "flex w-full items-center gap-2 py-2 px-2 text-sm rounded-md transition-colors",
                              isActive && "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                              !isActive && "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                            )
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <span className="flex-1">{child.label}</span>
                              {/* Active indicator */}
                              {isActive && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          }

          return (
            <li key={route.to} className="relative">
              <Button
                asChild
                variant={route.variant || (isActive ? "secondary" : "ghost")}
                size="sm"
              >
                <NavLink
                  to={route.to}
                  className={cn(
                    "gap-2 text-sm",
                    isActive && "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="inline-flex items-center gap-2">
                    <span>{route.label}</span>
                    {route.label === 'Finanças' && alertsCount ? (
                      <span className="inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-xs font-semibold text-destructive-foreground">
                        {alertsCount}
                      </span>
                    ) : null}
                  </span>
                </NavLink>
              </Button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavMenu;
