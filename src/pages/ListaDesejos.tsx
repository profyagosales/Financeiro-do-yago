import { Download } from 'lucide-react';

import PageHeader from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/useWishlist';
import { exportWishlistPDF } from '@/utils/pdf-wishlist';

export default function Desejos() {
  const { items } = useWishlist();

  const handleExport = () => {
    void exportWishlistPDF(items);
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Lista de Desejos"
        actions={
          <Button onClick={handleExport} className="inline-flex items-center gap-2" variant="outline">
            <Download className="h-4 w-4" /> Exportar PDF
          </Button>
        }
      />
    </div>
  );
}
