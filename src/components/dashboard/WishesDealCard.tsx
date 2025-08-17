import { Heart, Tag } from 'lucide-react';

import useWishesDeals from '../../hooks/useWishesDeals';

export default function WishesDealCard(){
  const { deals } = useWishesDeals();
  return (
    <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Desejos">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{color:'var(--clr-desejos)'}}>
        <Heart className="w-4 h-4" />
        Desejos
      </h3>
      <ul className="mt-2 space-y-1 text-xs">
        {deals.slice(0,4).map((d) => (
          <li key={d.id} className="flex items-center gap-1">
            <Tag className="w-3 h-3 text-emerald-600" />
            <span className="truncate">{d.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
