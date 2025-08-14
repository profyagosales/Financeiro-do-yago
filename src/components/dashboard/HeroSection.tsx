import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  Landmark,
  Target,
  Plane,
  Heart,
  ShoppingCart,
} from 'lucide-react';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/Logo';

interface HeroSectionProps {
  title?: string;
  logo?: ReactNode;
}

const navItems = [
  { to: '/financas', icon: Wallet, label: 'Finanças' },
  { to: '/investimentos', icon: Landmark, label: 'Investimentos' },
  { to: '/metas', icon: Target, label: 'Metas & Projetos' },
  { to: '/milhas', icon: Plane, label: 'Milhas' },
  { to: '/lista-desejos', icon: Heart, label: 'Lista de desejos' },
  { to: '/lista-compras', icon: ShoppingCart, label: 'Lista de compras' },
];

export default function HeroSection({ title = 'Finanças do Yago', logo }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 text-white backdrop-blur-lg">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
          {logo ?? <Logo size="lg" />}
        </motion.div>
        <motion.h1
          className="text-2xl font-bold tracking-tight md:text-3xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {title}
        </motion.h1>
      </motion.div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navItems.map(({ to, icon: Icon, label }) => (
          <motion.div key={to} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to={to} className="block h-full">
              <Card className="h-full border-white/20 bg-white/10 text-center text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                <CardHeader className="flex h-full flex-col items-center justify-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-base font-medium">{label}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
