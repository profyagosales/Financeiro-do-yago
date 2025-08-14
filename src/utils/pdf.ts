import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

import type { UITransaction } from '@/components/TransactionsTable';

const brl = (n: number) => (Number(n) || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function exportTransactionsPDF(
  transacoes: UITransaction[],
  filtros: unknown,
  period: string
) {
  const doc = new jsPDF();
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // gradient background
  const top: [number, number, number] = [59, 130, 246]; // blue-500
  const bottom: [number, number, number] = [16, 185, 129]; // emerald-500
  for (let y = 0; y < height; y++) {
    const ratio = y / height;
    const r = Math.round(top[0] * (1 - ratio) + bottom[0] * ratio);
    const g = Math.round(top[1] * (1 - ratio) + bottom[1] * ratio);
    const b = Math.round(top[2] * (1 - ratio) + bottom[2] * ratio);
    doc.setFillColor(r, g, b);
    doc.rect(0, y, width, 1, 'F');
  }

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('Relatório Financeiro', width / 2, 30, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Período: ${period}`, width / 2, 40, { align: 'center' });
  if (filtros) {
    doc.setFontSize(10);
    doc.text(`Filtros: ${JSON.stringify(filtros)}`, width / 2, 48, {
      align: 'center',
    });
  }

  const rows = transacoes.map((t) => [
    dayjs(t.date).format('DD/MM/YYYY'),
    t.description,
    t.category ?? '',
    t.source?.entity?.name ?? t.source_name ?? '',
    brl(t.value),
    t.type === 'income' ? 'Receita' : 'Despesa',
  ]);

  autoTable(doc, {
    head: [['Data', 'Descrição', 'Categoria', 'Fonte', 'Valor', 'Tipo']],
    body: rows,
    startY: 60,
    styles: { halign: 'left' },
    headStyles: { fillColor: [16, 185, 129] },
  });

  const totalIncome = transacoes
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.value, 0);
  const totalExpense = transacoes
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.value, 0);

  // @ts-expect-error lastAutoTable provided by jspdf-autotable
  const finalY = doc.lastAutoTable?.finalY || 60;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.text(`Total receitas: ${brl(totalIncome)}`, 14, finalY + 10);
  doc.text(`Total despesas: ${brl(totalExpense)}`, 14, finalY + 16);
  doc.text(
    `Emitido em: ${dayjs().format('DD/MM/YYYY HH:mm')}`,
    14,
    finalY + 22
  );

  doc.save(`financas-${period}.pdf`);
}
