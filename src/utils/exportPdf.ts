import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportOverviewToPdf(element: HTMLElement) {
  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgProps = pdf.getImageProperties(imgData);
  const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

  pdf.setFontSize(16);
  pdf.text("Financeiro do Yago", 14, 16);
  pdf.setFontSize(10);
  pdf.text(new Date().toLocaleDateString("pt-BR"), 14, 24);
  pdf.addImage(imgData, "PNG", 0, 30, pageWidth, imgHeight);
  pdf.save("resumo-financeiro.pdf");
}
