import type { WishlistItem } from "@/services/wishlistApi";

export default function WishlistPriorityRanking({ items }: { items: WishlistItem[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-medium">Prioridade</h3>
      <ol className="space-y-1 text-sm">
        {items.slice(0, 5).map((it, idx) => (
          <li key={it.id}>{idx + 1}. {it.name}</li>
        ))}
      </ol>
    </div>
  );
}

