import React from 'react';

import { Button } from "@/components/ui/button";
// Removidos cards inline em favor de WishlistCard reutilizável
import { SectionChroming } from "@/components/layout/SectionChroming";
import PageHeader from "@/components/PageHeader";
import WishlistCard from "@/components/wishlist/WishlistCard";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";
import WishlistFilters from "@/components/wishlist/WishlistFilters";
import WishlistNewItemModal, { type WishlistItem } from "@/components/wishlist/WishlistNewItemModal";
// WishlistSimulateModal removido (simulação não exibida na grade padronizada)

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
  // Estados de simulação removidos nesta refatoração (botão de simular retirado)
  const [drawerItem, setDrawerItem] = React.useState<WishlistItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleCreated = (item: WishlistItem) => {
    setItems(prev => [...prev, item]);
  };

  return (
  <SectionChroming clr="desejos" className="space-y-4">
      <WishlistFilters
        onPeriodChange={() => {}}
        onStatusChange={() => {}}
        onCategoryChange={() => {}}
      />
  <PageHeader title="🛍️ Desejos" actions={<Button onClick={() => setNewOpen(true)}>Novo desejo</Button>} />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(item => (
          <WishlistCard
            key={item.id}
            item={item}
            onMoveToPurchases={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
            onExportPdf={() => {}}
            onMouseEnter={() => { setDrawerItem(item); setDrawerOpen(true); }}
            className="cursor-pointer"
          />
        ))}
      </div>
      <WishlistNewItemModal open={newOpen} onOpenChange={setNewOpen} onCreated={handleCreated} />
      <WishlistDrawer item={drawerItem} open={drawerOpen} onOpenChange={setDrawerOpen} />
  </SectionChroming>
  );
}

