import { Star, TrendingDown, Target, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

const items = [
  { icon: Star, label: "Favoritos" },
  { icon: TrendingDown, label: "Promoções" },
  { icon: Target, label: "Metas" },
  { icon: ShoppingBag, label: "Compras" },
];

export default function Desejos() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛍️ Desejos</h1>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="flex items-center gap-3 p-4">
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

