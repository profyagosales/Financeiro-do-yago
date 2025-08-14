import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import type { WishlistItem } from '@/services/wishlistApi';

async function fetchImageAsDataUrl(url: string) {
  if (!url) return null;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('fail'));
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function exportWishlistPDF(items: WishlistItem[]) {
  const doc = new jsPDF();
  const rows: Array<{
    img: string | null;
    name: string;
    current: string;
    target: string;
    progress: string;
    link: string;
  }> = [];

  for (const item of items) {
    const img = await fetchImageAsDataUrl(item.image ?? '');
    const current = (item.current_price ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const target = (item.target_price ?? 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
    const progress =
      item.current_price && item.target_price
        ? `${Math.min(
            100,
            Math.round((item.current_price / item.target_price) * 100),
          )}%`
        : '-';
    rows.push({
      img,
      name: item.name,
      current,
      target,
      progress,
      link: item.link ?? '',
    });
  }

  autoTable(doc, {
    head: [['', 'Item', 'Atual', 'Meta', 'Progresso', 'Link']],
    body: rows.map((r) => ['', r.name, r.current, r.target, r.progress, r.link]),
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 0) {
        const row = rows[data.row.index];
        if (row.img) {
          doc.addImage(row.img, 'PNG', data.cell.x + 2, data.cell.y + 2, 16, 16);
        }
      }
    },
  });

  doc.save('wishlist.pdf');
}
