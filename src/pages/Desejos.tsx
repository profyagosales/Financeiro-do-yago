import React from 'react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";
import WishlistFilters from "@/components/wishlist/WishlistFilters";
import WishlistNewItemModal, { WishlistItem } from "@/components/wishlist/WishlistNewItemModal";
import WishlistSimulateModal from "@/components/wishlist/WishlistSimulateModal";

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

  return (
    <div className="space-y-4">
      <WishlistFilters
        onPeriodChange={() => {}}
        onStatusChange={() => {}}
        onCategoryChange={() => {}}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🛍️ Desejos</h1>
        <Button onClick={() => setNewOpen(true)}>Novo desejo</Button>
      </div>

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

