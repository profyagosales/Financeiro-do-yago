import { FileDown, Pencil, ShoppingCart, Trash2 } from "lucide-react";
import * as React from "react";

import type { WishlistItem } from "./WishlistNewItemModal";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  item: WishlistItem;
  onMoveToPurchases: (item: WishlistItem) => void;
  onEdit: (item: WishlistItem) => void;
  onDelete: (item: WishlistItem) => void;
  onExportPdf: (item: WishlistItem) => void;
}

export default function WishlistCard({
  item,
  onMoveToPurchases,
  onEdit,
  onDelete,
  onExportPdf,
  className,
  ...props
}: Props) {
  const progress = item.precoAlvo > 0 ? Math.min((item.precoAtual / item.precoAlvo) * 100, 100) : 0;

  const priorityColor =
    item.prioridade === "Alta"
      ? "bg-red-100 text-red-800"
      : item.prioridade === "Média"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-green-100 text-green-800";

  return (
    <Card
      className={cn(
        "overflow-hidden flex flex-col border border-white/10 rounded-2xl transition-transform hover:scale-[1.02]",
        className
      )}
      {...props}
    >
      {item.imagem && (
        <img src={item.imagem} alt={item.titulo} className="h-40 w-full object-cover" />
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium line-clamp-1">{item.titulo}</h3>
          <Badge className={priorityColor}>{item.prioridade}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="text-sm">
          <p>Atual: R$ {item.precoAtual.toFixed(2)}</p>
          <p>Alvo: R$ {item.precoAlvo.toFixed(2)}</p>
        </div>
        <Progress value={progress} />
      </CardContent>
      <CardFooter className="justify-end gap-1 pt-2">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={() => onMoveToPurchases(item)}>
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Mover para compras</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Editar</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Excluir</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" onClick={() => onExportPdf(item)}>
                <FileDown className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Exportar PDF</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

