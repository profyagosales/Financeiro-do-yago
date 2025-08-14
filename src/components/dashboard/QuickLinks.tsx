import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export type QuickLink = {
  title: string;
  icon: ReactNode;
  href: string;
};

// Displays a grid of quick navigation links used on the dashboard.
export default function QuickLinks({ items }: { items: QuickLink[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {items.map(({ title, icon, href }) => (
        <motion.div
          key={title}
          whileHover={{ scale: 1.02 }}
          className="glass rounded-xl p-4 text-center shadow-sm"
        >
          <Link to={href} className="flex flex-col items-center gap-2">
            <span className="text-neutral-100">{icon}</span>
            <span className="text-sm font-medium text-neutral-200">{title}</span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
