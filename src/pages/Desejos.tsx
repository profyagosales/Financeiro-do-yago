import * as React from "react";
import { ShoppingBag, Tag, Flag, PiggyBank } from "lucide-react";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import KPIStrip, { type KpiItem } from "@/components/dashboard/KPIStrip";
import WishlistNewItemModal, { WishlistItem } from "@/components/wishlist/WishlistNewItemModal";
import WishlistSimulateModal from "@/components/wishlist/WishlistSimulateModal";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";

export default function Desejos() {
  const [items, setItems] = React.useState<WishlistItem[]>([
    {
      id: "1",
      titulo: "Nintendo Switch",
      link: "https://example.com/switch",
      vendedor: "Loja X",
      categoria: "Eletrônicos",
      prioridade: "Alta",
      precoAlvo: 2000,
      precoAtual: 1500,
      imagem: "https://via.placeholder.com/150",
      notas: "Aguardar promoção",
      alertas: true,
      historico: [
        { data: "Jan", preco: 2500 },
        { data: "Fev", preco: 2300 },
        { data: "Mar", preco: 2100 },
        { data: "Abr", preco: 1900 },
      ],
      ofertas: [
        { vendedor: "Loja Y", preco: 1550, link: "https://example.com/oferta1" },
        { vendedor: "Loja Z", preco: 1600, link: "https://example.com/oferta2" },
      ],
    },
  ]);
  const [newOpen, setNewOpen] = React.useState(false);
  const [simulateItem, setSimulateItem] = React.useState<WishlistItem | null>(null);
  const [simulateOpen, setSimulateOpen] = React.useState(false);
  const [drawerItem, setDrawerItem] = React.useState<WishlistItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleCreated = (item: WishlistItem) => {
    setItems(prev => [...prev, item]);
  };

  const kpiItems: KpiItem[] = [
    {
      title: "Itens",
      icon: <ShoppingBag className="size-5" />,
      value: items.length,
      colorFrom: "#6366f1",
      colorTo: "#8b5cf6",
      spark: [2, 3, 4, 5, 4, 6],
      sparkColor: "#6366f1",
    },
    {
      title: "Em promoção",
      icon: <Tag className="size-5" />,
      value: items.filter(i => i.precoAtual < i.precoAlvo).length,
      colorFrom: "#f59e0b",
      colorTo: "#f97316",
      spark: [1, 2, 1, 3, 2, 3],
      sparkColor: "#f59e0b",
    },
    {
      title: "Prioridade alta",
      icon: <Flag className="size-5" />,
      value: items.filter(i => i.prioridade === "Alta").length,
      colorFrom: "#ef4444",
      colorTo: "#f97316",
      spark: [3, 3, 4, 5, 4, 5],
      sparkColor: "#ef4444",
    },
    {
      title: "Economia potencial",
      icon: <PiggyBank className="size-5" />,
      value: items.reduce((s, i) => s + Math.max(0, i.precoAlvo - i.precoAtual), 0),
      colorFrom: "#10b981",
      colorTo: "#34d399",
      spark: [4, 5, 6, 5, 7, 6],
      sparkColor: "#10b981",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛍️ Desejos</h1>
        <Button onClick={() => setNewOpen(true)}>Novo desejo</Button>
      </div>
      <KPIStrip items={kpiItems} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <Card
            key={item.id}
            onMouseEnter={() => {
              setDrawerItem(item);
              setDrawerOpen(true);
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base line-clamp-1">{item.titulo}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              {item.imagem && (
                <img src={item.imagem} alt="" className="h-32 w-full object-cover rounded" />
              )}
              <p className="mt-2 text-sm">Atual: R$ {item.precoAtual.toFixed(2)}</p>
              <p className="text-sm">Alvo: R$ {item.precoAlvo.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
              <Button size="sm" onClick={() => { setSimulateItem(item); setSimulateOpen(true); }}>
                Simular
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <WishlistNewItemModal open={newOpen} onOpenChange={setNewOpen} onCreated={handleCreated} />
      <WishlistSimulateModal item={simulateItem} open={simulateOpen} onOpenChange={setSimulateOpen} />
      <WishlistDrawer item={drawerItem} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

