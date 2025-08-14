import { useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

import { cn } from '@/lib/utils';

export function AnimatedNumber({ value, currency=true, className='' }:{ value:number; currency?:boolean; className?:string }) {
  const spring = useSpring(0, { stiffness: 120, damping: 20 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  const text = useTransform(spring, (v) =>
    currency
      ? v.toLocaleString('pt-BR',{ style:'currency', currency:'BRL' })
      : v.toLocaleString('pt-BR')
  );

  return (
    <motion.span className={cn('font-numeric font-semibold text-2xl', className)}>
      {text}
    </motion.span>
  );
}