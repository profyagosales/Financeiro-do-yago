import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export type PromoItem = {
  id: string;
  title: string;
  description: string;
};

interface WishlistPromoPanelProps {
  promos: PromoItem[];
}

export default function WishlistPromoPanel({ promos }: WishlistPromoPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Promoções</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {promos.length ? (
          promos.map((p) => (
            <div key={p.id} className="text-sm">
              <strong>{p.title}</strong> — {p.description}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">Nenhuma promoção</div>
        )}
      </CardContent>
    </Card>
  );
}

