import { useCallback } from "react";

export type ReceiptData = {
  description: string;
  value: number;
  date: string;
};

export function useReceiptOCR() {
  const parse = useCallback(async (file: File): Promise<ReceiptData> => {
    void file;
    // Stub: return simulated data
    return {
      description: "Compra Mercado X",
      value: 123.45,
      date: "2025-08-11",
    };
  }, []);

  return { parse };
}

