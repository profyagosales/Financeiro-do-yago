import { useEffect } from 'react';

import { motion, useSpring, useTransform } from 'framer-motion';

export function AnimatedNumber({ value, currency=true }:{ value:number; currency?:boolean }) {
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
    <motion.span className="font-numeric font-semibold text-2xl">
      {text}
    </motion.span>
  );
}