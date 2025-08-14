import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Percent,
  Flame,
  PiggyBank,
} from "lucide-react";

import KPIStrip, { type KpiItem } from "@/components/dashboard/KPIStrip";
import WishlistFilters, {
  type WishlistFilterValues,
} from "@/components/wishlist/WishlistFilters";
import WishlistPromoPanel from "@/components/wishlist/WishlistPromoPanel";
import WishlistPriorityRanking from "@/components/wishlist/WishlistPriorityRanking";
import WishlistCharts from "@/components/wishlist/WishlistCharts";
import WishlistOldestItems from "@/components/wishlist/WishlistOldestItems";
import WishlistSimulateModal from "@/components/wishlist/WishlistSimulateModal";
import WishlistCard from "@/components/wishlist/WishlistCard";
import { useWishlist } from "@/hooks/useWishlist";

// Hero baseado no dashboard, com gradiente emerald→teal e logo FY
function WishlistHero() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <LogoFY size={44} />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Lista de desejos</h1>
      </div>
    </div>
  );
}

// Logo copiada do HeroSection
function LogoFY({ size = 44 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Logo Finanças do Yago"
      className="rounded-xl shadow-md"
    >
      <defs>
        <linearGradient id="fy-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="fy-txt" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="64" height="64" rx="14" fill="url(#fy-bg)" />
      <circle cx="50" cy="14" r="18" fill="#fff" opacity="0.15" />
      <g transform="translate(12,16)" fill="url(#fy-txt)">
        <path d="M4 0h22v6H10v6h12v6H4z" />
        <path d="M34 0l-6 9 6 9h-8l-4-6-4 6h-8l6-9-6-9h8l4 6 4-6z" />
      </g>
    </svg>
  );
}

export default function Desejos() {
  const [filters, setFilters] = useState<WishlistFilterValues>({
    period: "",
    status: "",
    category: "",
  });

  const { items, itemsOnSale, itemsByPriority, categoryDistribution, itemsStale } =
    useWishlist({
      status: filters.status || undefined,
      category: filters.category || undefined,
    });

  const kpis = useMemo<KpiItem[]>(() => {
    const high = items.filter((i) => i.priority >= 4).length;
    const savings = items.reduce(
      (s, i) => s + Math.max((i.target_price ?? 0) - (i.current_price ?? 0), 0),
      0,
    );
    return [
      {
        title: "itens",
        icon: <ShoppingBag className="h-5 w-5" />,
        value: items.length,
        colorFrom: "#10b981",
        colorTo: "#0d9488",
        spark: [items.length],
        sparkColor: "#10b981",
      },
      {
        title: "em promoção",
        icon: <Percent className="h-5 w-5" />,
        value: itemsOnSale.length,
        colorFrom: "#16a34a",
        colorTo: "#0d9488",
        spark: [itemsOnSale.length],
        sparkColor: "#16a34a",
      },
      {
        title: "prioridade alta",
        icon: <Flame className="h-5 w-5" />,
        value: high,
        colorFrom: "#f43f5e",
        colorTo: "#fb7185",
        spark: [high],
        sparkColor: "#f43f5e",
      },
      {
        title: "economia potencial",
        icon: <PiggyBank className="h-5 w-5" />,
        value: savings,
        colorFrom: "#0ea5e9",
        colorTo: "#22d3ee",
        spark: [savings],
        sparkColor: "#0ea5e9",
      },
    ];
  }, [items, itemsOnSale]);

  const [simOpen, setSimOpen] = useState(false);

  return (
    <div className="space-y-6">
      <WishlistHero />
      <WishlistFilters value={filters} onChange={setFilters} />
      <KPIStrip items={kpis} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <WishlistPromoPanel items={itemsOnSale} />
        <WishlistPriorityRanking items={itemsByPriority} />
        <WishlistCharts data={categoryDistribution} />
        <WishlistOldestItems items={itemsStale} />
      </div>
      <div className="text-right">
        <button
          onClick={() => setSimOpen(true)}
          className="rounded bg-emerald-600 px-4 py-2 text-white"
        >
          Simulação mensal
        </button>
      </div>
      <WishlistSimulateModal open={simOpen} onOpenChange={setSimOpen} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((it) => (
          <WishlistCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  );
}

