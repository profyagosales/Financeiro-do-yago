import { ShoppingCart } from 'lucide-react';

export default function MarketTickerCard(){
  // Stub temporário
  const items = [
    { id:1, name:'Arroz', price: 24.9 },
    { id:2, name:'Feijão', price: 8.5 },
    { id:3, name:'Leite', price: 5.2 }
  ];
  return (
    <div className="rounded-lg bg-[--surface] ring-1 ring-[--border] p-5" aria-label="Mercado">
      <h3 className="flex items-center gap-2 text-sm font-medium" style={{color:'var(--clr-mercado)'}}>
        <ShoppingCart className="w-4 h-4" />
        Mercado
      </h3>
      <ul className="mt-2 space-y-1 text-xs">
        {items.map(it => (
          <li key={it.id} className="flex justify-between">
            <span className="truncate max-w-[60%]">{it.name}</span>
            <span className="font-medium">{it.price.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
