import React from "react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export type WishlistFiltersProps = {
  onPeriodChange?: (value: string) => void;
  onStatusChange?: (value: string) => void;
  onCategoryChange?: (value: string) => void;
};

export default function WishlistFilters({
  onPeriodChange = () => {},
  onStatusChange = () => {},
  onCategoryChange = () => {},
}: WishlistFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select defaultValue="all" onValueChange={onPeriodChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todo período</SelectItem>
          <SelectItem value="30d">Últimos 30 dias</SelectItem>
          <SelectItem value="6m">Últimos 6 meses</SelectItem>
          <SelectItem value="1y">Último ano</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all" onValueChange={onStatusChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="active">Ativo</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
        </SelectContent>
      </Select>

      <Select defaultValue="all" onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="electronics">Eletrônicos</SelectItem>
          <SelectItem value="other">Outras</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

