import type { ReactNode } from 'react';

import { motion } from 'framer-motion';

export function MotionCard({ children, className='' }:{children:ReactNode; className?:string}) {
  return (
    <motion.div
      className={`bg-[var(--color-surface)] rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-6 ${className}`}
      initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: .3 }}
      whileHover={{ y: -3, scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}