import { useEffect, useState } from 'react';

import PageHeader from '@/components/PageHeader';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/lib/supabaseClient';

interface ShoppingItem {
  id: string;
  name: string;
  price?: number;
  purchased: boolean;
  wishlist_item_id?: string;
}

export default function Compras() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('shopping_list')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.error(error);
      }
      setItems((data as ShoppingItem[]) || []);
      setLoading(false);
    };
    void load();
  }, []);

  const togglePurchased = async (item: ShoppingItem, purchased: boolean) => {
    const { error } = await supabase
      .from('shopping_list')
      .update({ purchased })
      .eq('id', item.id);
    if (error) {
      console.error(error);
      return;
    }
    if (purchased && item.wishlist_item_id) {
      const wishlistUpdate = supabase
        .from('wishlist_items')
        .update({ status: 'done' })
        .eq('id', item.wishlist_item_id);
      const priceInsert = item.price != null
        ? supabase
            .from('wishlist_price_history')
            .insert({ wishlist_item_id: item.wishlist_item_id, price: item.price })
        : Promise.resolve();
      await Promise.all([wishlistUpdate, priceInsert]);
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, purchased } : i)));
  };

  const list = () => {
    if (loading) return <p>Carregando…</p>;
    if (!items.length) return <p>Nenhum item na lista.</p>;
    return (
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded border p-2">
            <span className={item.purchased ? 'line-through text-muted-foreground' : ''}>{item.name}</span>
            <Switch
              checked={item.purchased}
              onCheckedChange={(checked) => void togglePurchased(item, checked)}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="🧾 Compras" />
      {list()}
    </div>
  );
}
