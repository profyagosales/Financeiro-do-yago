import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useReceiptOCR, type ReceiptData } from "@/hooks/useReceiptOCR";

type Props = {
  /** Dispara quando o OCR extrai os dados com sucesso */
  onParsed: (data: ReceiptData) => void;
  /** Prop opcional para repassar o arquivo selecionado ao componente pai */
  onFileChange?: (file: File | null) => void;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function ReceiptUpload({ onParsed, onFileChange }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { parse } = useReceiptOCR();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f && f.size > MAX_FILE_SIZE) {
      toast.error("Arquivo muito grande (máx. 5MB)");
      e.target.value = "";
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
    onFileChange?.(f);
  };

  const extract = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await parse(file);
      onParsed(data);
      toast.success("Dados preenchidos!");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Falha ao extrair dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept="image/*,application/pdf" onChange={onFileInput} />
      {previewUrl && (
        <div className="max-w-xs">
          {file?.type === "application/pdf" ? (
            <iframe src={previewUrl} className="h-64 w-full" title="Preview" />
          ) : (
            <img src={previewUrl} alt="Preview" className="h-64 w-full object-contain" />
          )}
        </div>
      )}
      <Button type="button" onClick={extract} disabled={!file || loading}>
        {loading ? "Processando..." : "Preencher com OCR"}
      </Button>
    </div>
  );
}

