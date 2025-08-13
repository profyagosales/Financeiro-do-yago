import { useCallback } from "react";

export type ReceiptData = {
  /** Texto descritivo identificado na nota */
  description: string;
  /** Valor numérico em reais, se identificado */
  value?: number;
  /** Data no formato YYYY-MM-DD, se identificada */
  date?: string;
};

// Heurísticas extremamente simples para extrair informações de um arquivo de nota/recibo.
// Não utiliza nenhum serviço externo de OCR — apenas tenta interpretar o conteúdo bruto do
// arquivo (PDF ou texto) quando possível. Para imagens, normalmente retornará apenas o nome.
export function useReceiptOCR() {
  const parse = useCallback(async (file: File): Promise<ReceiptData> => {
    // Nome do arquivo, sem extensão, usado como fallback de descrição
    const description = file.name.replace(/\.[^/.]+$/, "");
    let text = "";

    try {
      // `File.text()` funciona para PDFs com texto selecionável e arquivos texto.
      // Para imagens ou PDFs somente-imagem, provavelmente retornará dados ilegíveis,
      // o que é aceitável para este stub local.
      if (file.type.startsWith("text/") || file.type === "application/pdf") {
        text = await file.text();
      }
    } catch {
      // ignoramos erros — seguiremos apenas com o nome do arquivo
    }

    const result: ReceiptData = { description };

    if (text) {
      // Valor: procura padrões como "R$ 123,45" ou "123.45"
      const valueMatch = text.match(/(?:R\$\s*)?([0-9]{1,3}(?:[.\s][0-9]{3})*(?:[,.][0-9]{2}))/);
      if (valueMatch) {
        const normalized = valueMatch[1].replace(/\./g, "").replace(",", ".");
        const n = parseFloat(normalized);
        if (!Number.isNaN(n)) result.value = n;
      }

      // Data: aceita "YYYY-MM-DD" ou "DD/MM/YYYY"
      const dateIso = text.match(/(\d{4}-\d{2}-\d{2})/);
      const dateBr = text.match(/(\d{2})[/-](\d{2})[/-](\d{4})/);
      if (dateIso) {
        result.date = dateIso[1];
      } else if (dateBr) {
        const [, d, m, y] = dateBr;
        result.date = `${y}-${m}-${d}`;
      }
    }

    return result;
  }, []);

  return { parse };
}

