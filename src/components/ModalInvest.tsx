import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

// Tipos aceitos no projeto (compatível com snake_case e PT-BR)
type TypeSnake = "renda_fixa" | "fii" | "acoes" | "cripto";
type TypePt = "Renda fixa" | "FIIs" | "Ações" | "Cripto" | "Outros";
export type InvestmentType = TypeSnake | TypePt;

// Props do componente
interface Props {
  open: boolean;
  onClose: () => void;
  /**
   * Registros existentes (edição). Aceita tanto snake quanto PT-BR e `note`/`notes`.
   */
  initial?: {
    type?: InvestmentType;
    symbol?: string | null;
    name?: string;
    broker?: string | null;
    quantity?: number;
    price?: number;
    fees?: number;
    date?: string; // yyyy-mm-dd
    note?: string | null;
    notes?: string | null;
  } | null;
  /**
   * Define o tipo padrão quando criando novo (ex.: "Renda fixa").
   */
  defaultType?: InvestmentType;
  /**
   * Recebe o payload pronto para o hook/useInvestments (inclui `note` e `notes`).
   */
  onSubmit: (payload: {
    type: InvestmentType;
    symbol: string | null;
    name: string;
    broker: string | null;
    quantity: number;
    price: number;
    fees: number;
    date: string;
    note?: string | null;  // compatível com banco
    notes?: string | null; // compatível com banco
  }) => Promise<void> | void;
}

// Utilidades
const TYPE_OPTIONS: TypePt[] = [
  "Renda fixa",
  "FIIs",
  "Ações",
  "Cripto",
  "Outros",
];

function normalizeType(t?: InvestmentType | null): TypePt {
  if (!t) return "Renda fixa";
  const key = String(t).toLowerCase();
  const map: Record<string, TypePt> = {
    renda_fixa: "Renda fixa",
    fii: "FIIs",
    acoes: "Ações",
    ações: "Ações",
    cripto: "Cripto",
    "renda fixa": "Renda fixa",
    fiis: "FIIs",
  };
  return map[key] ?? (t as TypePt);
}

export default function ModalInvest({ open, onClose, initial, defaultType, onSubmit }: Props) {
  const [loading, setLoading] = useState(false);

  const initialType = useMemo(() => normalizeType(initial?.type ?? defaultType ?? "Renda fixa"), [initial?.type, defaultType]);

  const [f, setF] = useState({
    type: initialType as TypePt,
    symbol: "" as string | null,
    name: "",
    broker: "" as string | null,
    quantity: 0,
    price: 0,
    fees: 0,
    date: new Date().toISOString().slice(0, 10),
    note: "" as string | null,
  });

  useEffect(() => {
    if (initial) {
      setF({
        type: normalizeType(initial.type),
        symbol: initial.symbol ?? "",
        name: initial.name ?? "",
        broker: initial.broker ?? "",
        quantity: Number(initial.quantity ?? 0),
        price: Number(initial.price ?? 0),
        fees: Number(initial.fees ?? 0),
        date: initial.date ?? new Date().toISOString().slice(0, 10),
        note: (initial.note ?? initial.notes ?? "") as string | null,
      });
    } else {
      setF((p) => ({ ...p, type: initialType }));
    }
  }, [initial, open, initialType]);

  const set = (k: keyof typeof f, v: any) => setF((p) => ({ ...p, [k]: v }));

  const submit = async () => {
    if (!f.name || !f.type) return;
    setLoading(true);
    try {
      await onSubmit({
        type: f.type,
        symbol: f.symbol || null,
        name: f.name.trim(),
        broker: f.broker || null,
        quantity: Number(f.quantity || 0),
        price: Number(f.price || 0),
        fees: Number(f.fees || 0),
        date: f.date,
        note: f.note || null,
        notes: f.note || null,
      });
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg" onKeyDown={onKeyDown}>
        <DialogHeader>
          <DialogTitle>{initial ? "Editar investimento" : "Novo investimento"}</DialogTitle>
          <DialogDescription>Cadastre sua operação (compra/aporte).</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label>Tipo</Label>
            <Select value={f.type} onValueChange={(v: any) => set("type", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Nome</Label>
            <Input
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ex.: Tesouro Selic 2029 / MXRF11 / PETR4 / BTC"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Ticker/Símbolo (opcional)</Label>
              <Input
                value={f.symbol ?? ""}
                onChange={(e) => set("symbol", e.target.value)}
                placeholder="MXRF11, PETR4, BTC…"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Quantidade</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={f.quantity}
                onChange={(e) => set("quantity", Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Preço unitário</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={f.price}
                onChange={(e) => set("price", Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label>Taxas (R$)</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={f.fees}
                onChange={(e) => set("fees", Number(e.target.value))}
                min={0}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Corretora (opcional)</Label>
              <Input value={f.broker ?? ""} onChange={(e) => set("broker", e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label>Data</Label>
              <Input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Observação (opcional)</Label>
            <Input
              value={f.note ?? ""}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Ex.: aporte mensal, compra fracionada…"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Salvando…" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}