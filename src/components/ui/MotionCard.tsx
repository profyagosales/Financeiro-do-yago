import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function MotionCard({ children, className='' }:{children:ReactNode; className?:string}) {
  return (
    <motion.div
      className={`u-card-interactive p-6 ${className}`}
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: .25 }}
      whileHover={{ y: -4 }}
    >
      {children}
    </motion.div>
  );
}