import { NavLink, NavLinkProps } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

interface Props extends NavLinkProps {
  variant?: 'pill' | 'ghost';
  children: React.ReactNode;
}

export default function NavItem({
  variant = 'ghost',
  className,
  children,
  ...props
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <NavLink
      {...props}
      className={({ isActive }) =>
        cn(
          'relative rounded-full px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
          variant === 'pill'
            ? 'text-white/80 hover:text-white'
            : 'text-white/80 hover:text-white hover:bg-white/10',
          isActive &&
            (variant === 'pill'
              ? 'bg-white/20 text-white'
              : 'text-white'),
          className,
        )
      }
    >
      {({ isActive }) => (
        <span className="relative">
          {children}
          {isActive && (
            reduceMotion ? (
              <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-white" />
            ) : (
              <motion.span
                layoutId="nav-underline"
                className="absolute left-0 right-0 -bottom-0.5 h-0.5 bg-white"
              />
            )
          )}
        </span>
      )}
    </NavLink>
  );
}
