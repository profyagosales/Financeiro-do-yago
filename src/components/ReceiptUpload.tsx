import { useEffect, useState } from "react";

import { useReceiptOCR, type ReceiptData } from "@/hooks/useReceiptOCR";

type Props = {
  onExtract: (data: ReceiptData) => void;
};

export default function ReceiptUpload({ onExtract }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { parse } = useReceiptOCR();

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const extract = async () => {
    if (!file) return;
    const data = await parse(file);
    onExtract(data);
  };

  return (
    <div className="flex flex-col gap-4">
      <input type="file" accept="image/*,application/pdf" onChange={onFileChange} />
      {previewUrl && (
        <div className="max-w-xs">
          {file?.type === "application/pdf" ? (
            <iframe src={previewUrl} className="h-64 w-full" title="Preview" />
          ) : (
            <img src={previewUrl} alt="Preview" className="h-64 w-full object-contain" />
          )}
        </div>
      )}
      <button
        type="button"
        onClick={extract}
        disabled={!file}
  className="rounded bg-emerald-600 px-4 py-2 text-white disabled:bg-[hsl(var(--disabled-bg))] disabled:text-[hsl(var(--disabled-fg))]"
      >
        Extrair dados
      </button>
    </div>
  );
}

