import type { ElementType } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export interface QuickShortcut {
  title: string;
  href: string;
  icon: ElementType;
  description: string;
}

interface QuickShortcutsProps {
  items: QuickShortcut[];
  className?: string;
}

export default function QuickShortcuts({ items, className }: QuickShortcutsProps) {
  return (
    <div className={`grid gap-6 sm:grid-cols-2 md:grid-cols-3 ${className ?? ""}`.trim()}>
      {items.map(({ title, href, icon: Icon, description }) => (
        <motion.div key={title} whileHover={{ scale: 1.01 }}>
          <Link
            to={href}
            aria-label={`${title}: ${description}`}
            className="block rounded-2xl bg-gradient-to-br from-emerald-600/15 to-teal-600/15 p-6 transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 hover:shadow"
          >
            <div className="flex items-start gap-4">
              <Icon aria-hidden="true" className="size-8 text-emerald-600 dark:text-emerald-400" />
              <div className="text-left">
                <div className="font-medium">{title}</div>
                <div className="text-sm text-muted-foreground">{description}</div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

