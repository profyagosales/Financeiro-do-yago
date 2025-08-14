import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { getListsSummary } from '@/data/lists';

interface SummaryData {
  wishlistCount: number;
  shoppingCount: number;
  completedPercent: number;
}

export default function ListsSummaryCard() {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(getListsSummary());
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-semibold">Listas</span>
        {data ? (
          <Badge variant="secondary">{data.completedPercent}%</Badge>
        ) : (
          <Skeleton className="h-5 w-12" />
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Desejos</span>
          {data ? (
            <Badge variant="outline">{data.wishlistCount}</Badge>
          ) : (
            <Skeleton className="h-5 w-6" />
          )}
        </div>
        <div className="flex items-center justify-between">
          <span>Compras</span>
          {data ? (
            <Badge variant="outline">{data.shoppingCount}</Badge>
          ) : (
            <Skeleton className="h-5 w-6" />
          )}
        </div>
        {data ? (
          <Progress value={data.completedPercent} className="h-2" />
        ) : (
          <Skeleton className="h-2 w-full" />
        )}
      </div>
    </Card>
  );
}

