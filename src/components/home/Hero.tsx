import React from "react";
import { motion } from "framer-motion";

import Logo from "@/components/Logo";

export interface HeroProps {
  quickLinks?: React.ReactNode[];
}

export default function Hero({ quickLinks }: HeroProps) {
  return (
    <section className="hero-gradient flex min-h-screen flex-col items-center justify-center p-6">
      <motion.div
        className="glass flex flex-col items-center rounded-3xl p-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Logo size="lg" />
        <motion.h1
          className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-6xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          Financeiro do Yago
        </motion.h1>

        {quickLinks && quickLinks.length > 0 && (
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            {quickLinks.map((link, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass rounded-xl p-3"
              >
                {link}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}

