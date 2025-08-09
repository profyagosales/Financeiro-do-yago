import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function MotionCard({ children, className='' }:{children:ReactNode; className?:string}) {
  return (
    <motion.div
      className={`bg-white dark:bg-slate-800 rounded-card shadow-card p-6 ${className}`}
      initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
      transition={{ duration: .3 }}
      whileHover={{ y: -3, scale: 1.01 }}
    >
      {children}
    </motion.div>
  );
}