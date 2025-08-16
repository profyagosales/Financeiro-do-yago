import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type OldItem = {
  id: string;
  title: string;
  addedAt: string;
};

interface WishlistOldestItemsProps {
  items: OldItem[];
  limit?: number;
}

export default function WishlistOldestItems({ items, limit = 5 }: WishlistOldestItemsProps) {
  const sorted = [...items]
    .sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())
    .slice(0, limit);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Itens mais antigos</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1">
          {sorted.map((item) => (
            <li key={item.id} className="text-sm">
              {item.title}{" "}
              <span className="text-fg-muted">
                ({new Date(item.addedAt).toLocaleDateString()})
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

