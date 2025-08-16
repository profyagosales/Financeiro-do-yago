import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logoSvg from "../icons/icon-512.svg?raw";

export function exportTransactionsPDF(rows: any[], _filtros: any, period: string) {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const startColor = [16, 185, 129];
  const endColor = [5, 150, 105];
  const steps = 20;
  for (let i = 0; i < steps; i++) {
    const r = startColor[0] + ((endColor[0] - startColor[0]) * i) / steps;
    const g = startColor[1] + ((endColor[1] - startColor[1]) * i) / steps;
    const b = startColor[2] + ((endColor[2] - startColor[2]) * i) / steps;
    doc.setFillColor(r, g, b);
    doc.rect(0, (pageHeight / steps) * i, pageWidth, pageHeight / steps, "F");
  }

  const logoBase64 = `data:image/svg+xml;base64,${btoa(
    unescape(encodeURIComponent(logoSvg)),
  )}`;
  doc.addImage(logoBase64, "SVG", pageWidth / 2 - 30, 40, 60, 60);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text("Relatório Financeiro", pageWidth / 2, 120, { align: "center" });
  doc.setFontSize(14);
  doc.text(`Período: ${period}`, pageWidth / 2, 130, { align: "center" });

  doc.addPage();

  const incomeTotal = rows.reduce(
    (sum, r) => (r.type === "income" ? sum + (r.value ?? 0) : sum),
    0,
  );
  const expenseTotal = rows.reduce(
    (sum, r) => (r.type === "expense" ? sum + (r.value ?? 0) : sum),
    0,
  );
  const balance = incomeTotal - expenseTotal;

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
    startY: 20,
    head: [["Data", "Descrição", "Categoria", "Fonte", "Valor", "Tipo"]],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129] },
    foot: [
      [
        {
          content: "Receitas",
          colSpan: 4,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: incomeTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          styles: { fontStyle: "bold" },
        },
        "",
      ],
      [
        {
          content: "Despesas",
          colSpan: 4,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: expenseTotal.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          styles: { fontStyle: "bold" },
        },
        "",
      ],
      [
        {
          content: "Saldo",
          colSpan: 4,
          styles: { halign: "right", fontStyle: "bold" },
        },
        {
          content: balance.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          }),
          styles: { fontStyle: "bold" },
        },
        "",
      ],
    ],
    footStyles: { fillColor: [243, 244, 246] },
  });

  const now = new Date();
  doc.setFontSize(9);
  const totalsText = `Receitas: ${incomeTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })} | Despesas: ${expenseTotal.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })} | Saldo: ${balance.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })}`;
  doc.text(totalsText, pageWidth / 2, pageHeight - 15, { align: "center" });
  doc.text(
    `Emitido em ${now.toLocaleString("pt-BR")}`,
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" },
  );
  doc.save(`relatorio-${period}.pdf`);
}

