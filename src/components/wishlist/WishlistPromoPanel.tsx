import type { WishlistItem } from "@/services/wishlistApi";
import { Badge } from "@/components/ui/badge";

export default function WishlistPromoPanel({ items }: { items: WishlistItem[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-medium">Em promoção</h3>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-center justify-between text-sm">
            <span>{it.name}</span>
            <Badge variant="secondary">-10% vs histórico</Badge>
          </li>
        ))}
      </ul>
    </div>
  );
}

