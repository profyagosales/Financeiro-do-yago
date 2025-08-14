import * as React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Settings, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import { Logo } from "../Logo";
import { ThemeToggle } from "../ui/ThemeToggle";
import AlertsDrawer from "../financas/AlertsDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import { useAuth } from "@/contexts/AuthContext";

export default function AppTopbar() {
  const { user, signOut } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  const navigate = useNavigate();

  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkBase =
    "inline-flex items-center h-9 px-3 rounded-full text-white/80 hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:focus:ring-emerald-300/50";
  const navLinkActive = "bg-white/20 text-white";

  return (
    <motion.header
      initial={false}
      animate={{ height: scrolled ? 56 : 72 }}
      className={`sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600/90 dark:ring-1 dark:ring-white/10 ${scrolled ? "shadow-md" : ""}`}
    >
      <div className="mx-auto flex h-full items-center px-4">
        <NavLink to="/dashboard" className="flex items-center text-white">
          <Logo size="lg" />
          <span className="ml-2 text-xl font-semibold">FY</span>
        </NavLink>
        <nav className="ml-6 flex items-center gap-2">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : ""}`
            }
          >
            Visão geral
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <AlertsDrawer />
          <ThemeToggle className="focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:focus:ring-emerald-300/50" />
          <NavLink
            to="/configuracoes"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:focus:ring-emerald-300/50"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:focus:ring-emerald-300/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold">
                  {initials}
                </div>
                <span className="max-w-[8rem] truncate text-sm font-medium">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => navigate("/perfil")}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}

