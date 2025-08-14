import type { WishlistItem } from "@/services/wishlistApi";

export default function WishlistOldestItems({ items }: { items: WishlistItem[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-medium">Sem progresso</h3>
      <ul className="space-y-1 text-sm">
        {items.slice(0, 5).map((it) => (
          <li key={it.id}>{it.name}</li>
        ))}
      </ul>
    </div>
  );
}

