import { motion } from 'framer-motion';
import { ChevronDown, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { useState } from 'react';
import { NavLink, NavLink as RouterNavLink } from "react-router-dom";

import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from "@/contexts/AuthContext";
import useRouteVisits, { clearVisits, incrementVisit, writeWindowDays } from '@/hooks/useRouteVisits';
import { cn } from "@/lib/utils";
import { navRoutes } from '@/routes/nav';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  // estado de expansão por seção (label -> boolean)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const { user } = useAuth();
  const { countsLastN, totalVisits, top, userWindow } = useRouteVisits();
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const avatarUrl = (user as any)?.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      style={{ minWidth: collapsed ? 64 : 256 }}
      className={cn("flex h-screen flex-col bg-gradient-to-b from-white/10 dark:from-black/10 overflow-hidden")}
    >
      <div className="flex items-center gap-3 p-4">
        <RouterNavLink to="/" className="flex items-center gap-3">
          {/* Ícone fixo: primeira seção (Visão geral) */}
          {(() => {
            const Icon = navRoutes[0]?.icon;
            return Icon ? <div className="h-8 w-8 text-emerald-400 flex items-center justify-center">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div> : null;
          })()}
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
              <div className="text-lg font-bold">Financeiro do Yago</div>
              <div className="text-xs text-neutral-400">Resumo & controle</div>
            </motion.div>
          )}
        </RouterNavLink>
        {!collapsed && (
          <div className="mt-2 mb-1 px-2">
            <div className="rounded-md bg-white/5 p-2 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-neutral-300">Visitas ({userWindow}d)</div>
                  <div className="font-medium">{totalVisits} no total</div>
                </div>
                <div className="text-right text-xs text-neutral-400">
                  {top ? (
                    <div>
                      <div className="font-medium truncate max-w-[10rem]">{top.path}</div>
                      <div className="text-neutral-400">{top.count}x</div>
                    </div>
                  ) : (
                    <div className="text-neutral-400">Sem dados</div>
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {[7,30,90].map((d) => (
                  <button
                    key={d}
                    onClick={() => { writeWindowDays(d); window.dispatchEvent(new Event('routeVisitsWindowChanged')) }}
                    className={cn("rounded-md px-2 py-1 text-xs", userWindow === d ? 'bg-emerald-600 text-white' : 'bg-white/3')}
                  >
                    {d}d
                  </button>
                ))}
                <button
                  onClick={() => {
                    clearVisits()
                    setSnackbar('Contadores resetados')
                    setTimeout(() => setSnackbar(null), 3000)
                  }}
                  className="ml-auto rounded-md px-2 py-1 text-xs bg-red-600 text-white"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
        {snackbar && (
          <div className="absolute left-1/2 top-4 z-50 -translate-x-1/2 rounded-md bg-zinc-900/90 px-3 py-1 text-sm text-white shadow-lg">
            {snackbar}
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          {!collapsed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>{<ThemeToggle />}</motion.div>}
          {!collapsed && (
            <NavLink
              to="/configuracoes"
              aria-label="Configurações"
              className="rounded-md p-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
            >
              <Settings className="h-4 w-4" />
            </NavLink>
          )}
          <button
            aria-label="Alternar modo compacto"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2">
      {navRoutes.map((item) => {
          const iconName = item.icon || 'Home';
          const IconComponent = ({ className }: { className?: string }) => {
            const icons: Record<string, React.ReactElement> = {
              Home: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
              Wallet: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />,
              Landmark: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
              Plane: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />,
              Target: <><circle cx="12" cy="12" r="10" strokeWidth={2}/><circle cx="12" cy="12" r="6" strokeWidth={2}/><circle cx="12" cy="12" r="2" strokeWidth={2}/></>,
              Heart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
              ShoppingCart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            };
            return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">{icons[iconName] || icons.Home}</svg>;
          };
          
          if (item.children) {
    const expanded = openSections[item.label] ?? false;
            return (
              <div key={item.label}>
                <button
      onClick={() => setOpenSections(s => ({ ...s, [item.label]: !expanded }))}
                  className="flex w-full items-center rounded-md p-2 text-sm hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
                >
                  <IconComponent className="h-5 w-5" />
                  {!collapsed && (
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
        expanded ? "rotate-180" : ""
                      )}
                    />
                  )}
                </button>
                {!collapsed && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
        animate={expanded ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="ml-6 mt-1 space-y-1 overflow-hidden"
                  >
                    {item.children.map((child) => {
                      const cnt = countsLastN[child.to!] ?? 0
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to!}
                          onClick={() => incrementVisit(child.to!)}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center rounded-md p-2 text-sm transition-all duration-200 ease-out",
                              isActive && "bg-white/20 dark:bg-black/20"
                            )
                          }
                        >
                          <motion.div whileHover={{ scale: 1.03 }} className="flex w-full items-center gap-2">
                            <span className="h-4 w-4 rounded-full bg-white/20"></span>
                            {!collapsed && <span className="ml-2">{child.label}</span>}
                            {!collapsed && cnt > 0 && (
                              <span className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white px-2">{cnt}</span>
                            )}
                          </motion.div>
                        </NavLink>
                      );
                    })}
                  </motion.div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              onClick={() => incrementVisit(item.to!)}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md p-2 text-sm hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out",
                  isActive && "bg-white/20 dark:bg-black/20",
                  item.to === '/dashboard' && "text-emerald-400"
                )
              }
            >
               <IconComponent className="h-5 w-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
              {!collapsed && (countsLastN[item.to!] ?? 0) > 0 && (
                <span className="ml-auto inline-flex items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white px-2">{countsLastN[item.to!]}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
              {initials}
            </span>
          )}
          {!collapsed && (
            <>
              <span className="text-sm font-medium">{displayName}</span>
              <NavLink
                to="/configuracoes"
                aria-label="Configurações"
                className="ml-auto rounded-md p-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
              >
                <Settings className="h-4 w-4" />
              </NavLink>
            </>
          )}
        </div>
      </div>
  </motion.aside>
  );
}

