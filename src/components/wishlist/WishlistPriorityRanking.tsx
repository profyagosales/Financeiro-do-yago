import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export type RankingItem = {
  id: string;
  title: string;
  priority: number;
};

interface WishlistPriorityRankingProps {
  items: RankingItem[];
}

export default function WishlistPriorityRanking({ items }: WishlistPriorityRankingProps) {
  const sorted = [...items].sort((a, b) => b.priority - a.priority);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de Prioridade</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-1">
          {sorted.map((item) => (
            <li key={item.id} className="text-sm">
              {item.title} - <span className="font-medium">{item.priority}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

