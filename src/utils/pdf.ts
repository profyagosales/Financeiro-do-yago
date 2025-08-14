import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportTransactionsPDF(rows: any[], filtros: any, period: string) {
  const doc = new jsPDF();
  doc.setFillColor(16, 185, 129); // emerald-500
  doc.rect(0, 0, 210, 36, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text("Relatório Financeiro", 14, 22);
  doc.setFontSize(11);
  doc.text(`Período: ${period}`, 14, 30);

  doc.setTextColor(0, 0, 0);
  const body = rows.map((r) => [
    r.date,
    r.description ?? "",
    r.category ?? "-",
    r.source_kind ?? "-",
    (r.value ?? 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    }),
    r.type,
  ]);

  autoTable(doc, {
    startY: 42,
    head: [["Data", "Descrição", "Categoria", "Fonte", "Valor", "Tipo"]],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
  });

  const now = new Date();
  doc.setFontSize(9);
  doc.text(
    `Emitido em ${now.toLocaleString("pt-BR")}`,
    14,
    doc.internal.pageSize.getHeight() - 10,
  );
  doc.save(`relatorio-${period}.pdf`);
}

