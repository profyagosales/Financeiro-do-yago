import * as React from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type WishlistItem = {
  id: string;
  titulo: string;
  link: string;
  vendedor: string;
  categoria: string;
  prioridade: string;
  precoAlvo: number;
  precoAtual: number;
  imagem: string;
  notas: string;
  alertas: boolean;
  historico?: { data: string; preco: number }[];
  ofertas?: { vendedor: string; preco: number; link: string }[];
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: WishlistItem) => void;
}

const CATEGORIAS = ["Eletrônicos", "Livros", "Casa", "Outros"];
const PRIORIDADES = ["Alta", "Média", "Baixa"];

export default function WishlistNewItemModal({ open, onOpenChange, onCreated }: Props) {
  const [titulo, setTitulo] = React.useState("");
  const [link, setLink] = React.useState("");
  const [vendedor, setVendedor] = React.useState("");
  const [categoria, setCategoria] = React.useState<string>(CATEGORIAS[0]);
  const [prioridade, setPrioridade] = React.useState<string>(PRIORIDADES[0]);
  const [precoAlvo, setPrecoAlvo] = React.useState(0);
  const [precoAtual, setPrecoAtual] = React.useState(0);
  const [imagem, setImagem] = React.useState("");
  const [notas, setNotas] = React.useState("");
  const [alertas, setAlertas] = React.useState(true);

  React.useEffect(() => {
    if (open) {
      setTitulo("");
      setLink("");
      setVendedor("");
      setCategoria(CATEGORIAS[0]);
      setPrioridade(PRIORIDADES[0]);
      setPrecoAlvo(0);
      setPrecoAtual(0);
      setImagem("");
      setNotas("");
      setAlertas(true);
    }
  }, [open]);

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    const item: WishlistItem = {
      id: crypto.randomUUID(),
      titulo,
      link,
      vendedor,
      categoria,
      prioridade,
      precoAlvo,
      precoAtual,
      imagem,
      notas,
      alertas,
    };
    onCreated(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo desejo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSalvar} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input value={titulo} onChange={e => setTitulo(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Link</label>
              <Input value={link} onChange={e => setLink(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Vendedor</label>
              <Input value={vendedor} onChange={e => setVendedor(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Prioridade</label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORIDADES.map(p => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">Preço alvo</label>
              <Input
                type="number"
                value={precoAlvo}
                onChange={e => setPrecoAlvo(Number(e.target.value))}
                min={0}
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço atual</label>
              <Input
                type="number"
                value={precoAtual}
                onChange={e => setPrecoAtual(Number(e.target.value))}
                min={0}
                step="0.01"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Imagem (URL)</label>
            <Input value={imagem} onChange={e => setImagem(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <Textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={alertas} onCheckedChange={setAlertas} id="alertas" />
            <label htmlFor="alertas" className="text-sm font-medium">
              Alertas de preço
            </label>
          </div>
          <DialogFooter className="mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!titulo.trim()}>Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


