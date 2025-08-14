import * as React from "react";

import { Moon, Sun } from "@/components/icons";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeToggle({ className = "", onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [theme, setTheme] = React.useState<"light" | "dark">(getInitialTheme);

  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <button
      type="button"
      {...props}
      onClick={(e) => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
        onClick?.(e);
      }}
      aria-label={props["aria-label"] ?? "Alternar tema"}
      className={[
        "rounded-lg p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50",
        className,
      ].join(" ")}
    >
      <Sun className="h-4 w-4 block dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </button>
  );
}