import * as React from "react";

import WishlistPromoPanel, { PromoItem } from "@/components/wishlist/WishlistPromoPanel";
import WishlistPriorityRanking, { RankingItem } from "@/components/wishlist/WishlistPriorityRanking";
import WishlistCharts from "@/components/wishlist/WishlistCharts";
import WishlistOldestItems, { OldItem } from "@/components/wishlist/WishlistOldestItems";
import WishlistSimulateModal from "@/components/wishlist/WishlistSimulateModal";
import type { WishlistItem as ApiWishlistItem, PricePoint } from "@/services/wishlistApi";
import type { WishlistItem } from "@/components/wishlist/WishlistNewItemModal";
import { Button } from "@/components/ui/button";

export default function Desejos() {
  const promos: PromoItem[] = [
    { id: "promo1", title: "Desconto Laptop", description: "R$ 200 off" },
  ];

  const ranking: RankingItem[] = [
    { id: "1", title: "Laptop", priority: 3 },
    { id: "2", title: "Fone", priority: 1 },
    { id: "3", title: "Cadeira", priority: 2 },
  ];

  const oldest: OldItem[] = [
    { id: "1", title: "Livro", addedAt: "2023-11-01" },
    { id: "2", title: "Mesa", addedAt: "2024-01-15" },
    { id: "3", title: "Caneca", addedAt: "2024-02-20" },
  ];

  const chartItems: ApiWishlistItem[] = [
    {
      id: "1",
      name: "Laptop",
      category: "Tech",
      priority: 3,
      status: "pending",
      current_price: 600,
      target_price: 1000,
    },
    {
      id: "2",
      name: "Fone",
      category: "Tech",
      priority: 1,
      status: "pending",
      current_price: 100,
      target_price: 200,
    },
    {
      id: "3",
      name: "Livro",
      category: "Books",
      priority: 2,
      status: "pending",
      current_price: 40,
      target_price: 80,
    },
  ];

  const pricePoints: PricePoint[] = [
    { price: 1000, created_at: "2024-01-01" },
    { price: 900, created_at: "2024-02-01" },
    { price: 850, created_at: "2024-03-01" },
  ];

  const simulateItem: WishlistItem = {
    id: "sim1",
    titulo: "Laptop",
    link: "",
    vendedor: "Loja X",
    categoria: "Tech",
    prioridade: "Alta",
    precoAlvo: 1000,
    precoAtual: 600,
    imagem: "",
    notas: "",
    alertas: false,
  };

  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Widgets de Desejos</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <WishlistPromoPanel promos={promos} />
        <WishlistPriorityRanking items={ranking} />
        <WishlistCharts items={chartItems} points={pricePoints} />
        <WishlistOldestItems items={oldest} />
      </div>
      <Button onClick={() => setModalOpen(true)}>Simular</Button>
      <WishlistSimulateModal item={simulateItem} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}

