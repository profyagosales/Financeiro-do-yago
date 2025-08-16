import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export interface ShoppingCardItem {
  id: string;
  name: string;
  price?: number;
  purchased: boolean;
}

interface ShoppingCardProps {
  item: ShoppingCardItem;
  onToggle: (item: ShoppingCardItem, purchased: boolean) => void | Promise<void>;
  className?: string;
}

export function ShoppingCard({ item, onToggle, className }: ShoppingCardProps) {
  return (
    <Card
      className={cn(
        'flex flex-col justify-between border border-white/10 rounded-2xl p-4 transition-transform hover:scale-[1.02] gap-2',
        className
      )}
    >
      <CardHeader className="p-0">
        <h3 className={cn(
          'text-sm font-medium line-clamp-2',
          item.purchased && 'line-through text-muted-foreground'
        )}>{item.name}</h3>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex items-end">
        {item.price != null && (
          <p className="text-xs text-muted-foreground">R$ {item.price.toFixed(2)}</p>
        )}
      </CardContent>
      <CardFooter className="p-0 flex justify-end">
        <Switch checked={item.purchased} onCheckedChange={(checked) => onToggle(item, checked)} />
      </CardFooter>
    </Card>
  );
}

export default ShoppingCard;
