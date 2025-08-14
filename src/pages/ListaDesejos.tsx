import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type WishlistItem = {
  id: string;
  title: string;
  status: string;
};

export default function ListaDesejos() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<WishlistItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [estimatedPrice, setEstimatedPrice] = useState("");
  const [store, setStore] = useState("");
  const [dueAt, setDueAt] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("wishlist_items").select("*");
      setItems(data as WishlistItem[] ?? []);
    };
    load();
  }, []);

  const handleMove = async () => {
    if (!current) return;
    await supabase.rpc("wishlist_move_to_shopping_list", {
      item_id: current.id,
      quantity,
      estimated_price: estimatedPrice ? Number(estimatedPrice) : null,
      store,
      due_at: dueAt || null,
    });
    setItems(prev => prev.map(i => i.id === current.id ? { ...i, status: "ready" } : i));
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">🛍️ Lista de desejos</h1>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id} className="flex items-center justify-between">
            <span>{item.title} - {item.status}</span>
            <Button onClick={() => { setCurrent(item); setOpen(true); }}>Mover p/ Compras</Button>
          </li>
        ))}
      </ul>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mover para compras</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="quantity">Quantidade</Label>
              <Input id="quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
            </div>
            <div>
              <Label htmlFor="price">Preço estimado</Label>
              <Input id="price" type="number" value={estimatedPrice} onChange={e => setEstimatedPrice(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="store">Loja</Label>
              <Input id="store" value={store} onChange={e => setStore(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="due">Data prevista</Label>
              <Input id="due" type="date" value={dueAt} onChange={e => setDueAt(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleMove}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
