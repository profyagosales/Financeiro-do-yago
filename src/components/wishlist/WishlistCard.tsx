import { ShoppingCart, Edit2, Trash2, FileDown } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { WishlistItem } from "@/services/wishlistApi";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function WishlistCard({ item }: { item: WishlistItem }) {
  const pct = Math.min(
    100,
    ((item.current_price ?? 0) / (item.target_price || 1)) * 100,
  );
  return (
    <div className="flex flex-col rounded-lg border p-4">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="mb-2 h-32 w-full rounded object-cover"
        />
      ) : null}
      <h3 className="font-medium">{item.name}</h3>
      <p className="text-sm text-muted-foreground">
        {formatCurrency(item.current_price ?? 0)} / {" "}
        {formatCurrency(item.target_price ?? 0)}
      </p>
      <Progress value={pct} className="my-2" />
      <div className="mt-auto flex items-center justify-between text-sm">
        <span>Prioridade {item.priority}</span>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" title="Mover p/Compras">
            <ShoppingCart className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Editar">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="Excluir">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" title="PDF">
            <FileDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

