import * as React from "react";

import { Moon, Sun } from "@/components/icons";

function getInitialTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle({ className = "" }: { className?: string }) {
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
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      aria-label="Alternar tema"
      className={[
        "nav-pill nav-ghost h-9 w-9 justify-center",
        className,
      ].join(" ")}
    >
      <Sun className="h-4 w-4 block dark:hidden" />
      <Moon className="h-4 w-4 hidden dark:block" />
    </button>
  );
}

export default ThemeToggle;
