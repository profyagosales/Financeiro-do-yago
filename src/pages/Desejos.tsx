import * as React from "react";

import { Button } from "@/components/ui/button";
import WishlistCard from "@/components/wishlist/WishlistCard";
import WishlistNewItemModal, { WishlistItem } from "@/components/wishlist/WishlistNewItemModal";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";
import WishlistFilters from "@/components/wishlist/WishlistFilters";

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
    },
  ]);
  const [newOpen, setNewOpen] = React.useState(false);
  const [drawerItem, setDrawerItem] = React.useState<WishlistItem | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleCreated = (item: WishlistItem) => {
    setItems(prev => [...prev, item]);
  };

  const moveToPurchases = (item: WishlistItem) => {
    console.log("move to purchases", item);
  };

  const editItem = (item: WishlistItem) => {
    console.log("edit", item);
  };

  const deleteItem = (item: WishlistItem) => {
    setItems(prev => prev.filter(it => it.id !== item.id));
  };

  const exportPdf = (item: WishlistItem) => {
    console.log("export pdf", item);
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
          <WishlistCard
            key={item.id}
            item={item}
            onMoveToPurchases={moveToPurchases}
            onEdit={editItem}
            onDelete={deleteItem}
            onExportPdf={exportPdf}
            onClick={() => {
              setDrawerItem(item);
              setDrawerOpen(true);
            }}
            className="cursor-pointer"
          />
        ))}
      </div>
      <WishlistNewItemModal open={newOpen} onOpenChange={setNewOpen} onCreated={handleCreated} />
      <WishlistDrawer item={drawerItem} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  );
}

