import * as React from "react";

import type { WishlistItem } from "./WishlistNewItemModal";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  item: WishlistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WishlistSimulateModal({ item, open, onOpenChange }: Props) {
  const [mensal, setMensal] = React.useState(0);
  const restante = item ? Math.max(item.precoAlvo - item.precoAtual, 0) : 0;
  const meses = mensal > 0 ? Math.ceil(restante / mensal) : 0;

  React.useEffect(() => {
    if (open) setMensal(0);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Simular poupança</DialogTitle>
        </DialogHeader>
        {item ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm">Item: <strong>{item.titulo}</strong></p>
            <div>
              <label className="block text-sm font-medium mb-1">Aporte mensal</label>
              <Input
                type="number"
                value={mensal}
                onChange={e => setMensal(Number(e.target.value))}
                min={0}
                step="0.01"
                autoFocus
              />
            </div>
            {mensal > 0 && (
              <p className="text-sm">
                Você atingirá o alvo em <strong>{meses}</strong> {meses === 1 ? 'mês' : 'meses'}.
              </p>
            )}
          </div>
        ) : null}
        <DialogFooter className="mt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

