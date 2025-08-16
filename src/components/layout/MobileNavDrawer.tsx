import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Settings } from "lucide-react";
import * as React from "react";
import { NavLink } from "react-router-dom";

import { ThemeToggle } from "../ui/ThemeToggle";

import { navRoutes } from '@/routes/nav';

export default function MobileNavDrawer() {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [accordions, setAccordions] = React.useState<Record<string, boolean>>({});

  const toggleAccordion = (label: string) =>
    setAccordions((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (!o) {
      triggerRef.current?.focus();
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Trigger asChild>
        <button
          ref={triggerRef}
          aria-label="Menu"
          className="ml-6 inline-flex h-9 w-9 items-center justify-center rounded-md text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:focus:ring-emerald-300/50 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-40 bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </Dialog.Overlay>
              <Dialog.Content asChild forceMount>
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col rounded-r-2xl border-r border-white/40 bg-white/70 backdrop-blur shadow-xl dark:border-white/10 dark:bg-white/5"
                >
                  <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {navRoutes.map((item) => {
                      if (item.children) {
                        const isOpen = accordions[item.label];
                        return (
                          <div key={item.label} className="border-b pb-2">
                            <button
                              onClick={() => toggleAccordion(item.label)}
                              className="flex w-full items-center justify-between py-2 text-left font-medium"
                            >
                              {item.label}
                              <ChevronDown
                                className={`h-4 w-4 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {isOpen && (
                              <div className="mt-1 ml-2 flex flex-col space-y-1">
                                {item.children.map((child) => (
                                  <NavLink
                                    key={child.to}
                                    to={child.to}
                                    onClick={() => setOpen(false)}
                                    className={({ isActive }) =>
                                      `block rounded px-2 py-1 text-sm ${
                                        isActive
                                          ? "font-semibold text-emerald-600 dark:text-emerald-300"
                                          : "text-foreground/80"
                                      }`
                                    }
                                  >
                                    {child.label}
                                  </NavLink>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (item.to) {
                        return (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                              `block rounded px-3 py-2 text-sm ${
                                item.label === "Visão geral"
                                  ? "font-semibold"
                                  : ""
                              } ${
                                isActive
                                  ? "text-emerald-600 dark:text-emerald-300"
                                  : "text-foreground/80"
                              }`
                            }
                          >
                            {item.label}
                          </NavLink>
                        );
                      }

                      return null;
                    })}
                  </nav>
                  <div className="border-t p-4 flex items-center justify-between">
                    <ThemeToggle />
                    <NavLink
                      to="/configuracoes"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/70 dark:focus:ring-emerald-300/50"
                    >
                      <Settings className="h-4 w-4" />
                    </NavLink>
                  </div>
                </motion.aside>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

