import { ShoppingCart } from 'lucide-react';

import { SectionChroming } from '@/components/layout/SectionChroming';
import PageHeader from '@/components/PageHeader';

export default function Mercado() {
  return (
  <SectionChroming clr="mercado" className="space-y-6 pb-24">
      <PageHeader
        title="Mercado — Comparadores"
        subtitle="Rastreamento de preços, listas de compras e análises de variação (em breve)."
        icon={<ShoppingCart className="h-5 w-5" />}
      />
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-foreground/80">
        <p>
          Área em construção. Em breve: comparar preços por loja, histórico de variação, alertas de queda e
          integração com listas otimizadas.
        </p>
      </div>
  </SectionChroming>
  );
}
