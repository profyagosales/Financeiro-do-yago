

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useAccounts } from "@/hooks/useAccounts";

type ModalContaProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (id: string) => void;
};

const TIPO_OPCOES = [
  { value: "Dinheiro", label: "Dinheiro" },
  { value: "Banco", label: "Banco" },
  { value: "Carteira Digital", label: "Carteira Digital" },
  { value: "Outro", label: "Outro" },
];

export function ModalConta({ open, onOpenChange, onCreated }: ModalContaProps) {
  const { create } = useAccounts();
  const [nome, setNome] = React.useState("");
  const [tipo, setTipo] = React.useState<string>("Dinheiro");
  const [instituicao, setInstituicao] = React.useState("");
  const [moeda] = React.useState<string>("BRL");
  const [loading, setLoading] = React.useState(false);
  const [erroNome, setErroNome] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setNome("");
      setTipo("Dinheiro");
      setInstituicao("");
      setErroNome(null);
    }
  }, [open]);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!nome.trim()) {
      setErroNome("Nome obrigatório");
      return;
    }
    setErroNome(null);
    setLoading(true);
    try {
      const res = await create({
        name: nome,
        type:
          tipo === "Dinheiro"
            ? "cash"
            : tipo === "Banco"
              ? "bank"
              : tipo === "Carteira Digital"
                ? "wallet"
                : "other",
        institution: instituicao || undefined,
        currency: moeda,
      });
      // res pode ser id ou objeto com id
      const id = typeof res === "string" ? res : res?.id;
      onOpenChange(false);
      if (id) {
        onCreated(id);
      }
    } catch {
      // TODO: tratar erro de API
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Conta</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Nome da conta <span className="text-red-500">*</span>
            </label>
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
              autoFocus
              placeholder="Ex: Conta Corrente"
              disabled={loading}
            />
            {erroNome && <span className="text-xs text-red-500">{erroNome}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <Select value={tipo} onValueChange={setTipo} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPO_OPCOES.map(op => (
                  <SelectItem key={op.value} value={op.value}>
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Instituição</label>
            <Input
              value={instituicao}
              onChange={e => setInstituicao(e.target.value)}
              placeholder="Opcional"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Moeda</label>
            <Select value={moeda} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL - Real Brasileiro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !nome.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default ModalConta;