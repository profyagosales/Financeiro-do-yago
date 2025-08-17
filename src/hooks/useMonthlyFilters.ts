import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { type SourceValue } from '@/components/SourcePicker';

export interface MonthlyFiltersState {
  mesAtual: string;
  setMesAtual: (v: string) => void;
  categoriaId: string | undefined;
  setCategoriaId: (v: string | undefined) => void;
  fonte: SourceValue;
  setFonte: (v: SourceValue) => void;
  buscaInput: string;
  setBuscaInput: (v: string) => void;
  busca: string;
  limparFiltros: () => void;
  year: number;
  month: number;
}

/**
 * Hook para centralizar estado de filtros e sincronização com a query string (?mes=YYYY-MM&cat=...)
 */
export function useMonthlyFilters(): MonthlyFiltersState {
  const [searchParams, setSearchParams] = useSearchParams();
  const now = dayjs();
  const currentMes = now.format('YYYY-MM');
  const initMesParam = searchParams.get('mes');
  const initAnoParam = searchParams.get('ano');
  const initialMes = initMesParam ?? (initAnoParam ? `${initAnoParam}-${currentMes.slice(5, 7)}` : currentMes);
  const initialCategoriaId = searchParams.get('cat');
  const initialBusca = searchParams.get('q') ?? '';
  const initialFonte: SourceValue = (() => {
    const f = searchParams.get('fonte');
    if (f) {
      const [kind, id] = f.split(':');
      if ((kind === 'account' || kind === 'card') && id) {
        return { kind, id } as SourceValue;
      }
    }
    return { kind: 'account', id: 'all' } as SourceValue;
  })();

  const [mesAtual, setMesAtual] = useState(initialMes);
  const [categoriaId, setCategoriaId] = useState<string | undefined>(initialCategoriaId ?? undefined);
  const [fonte, setFonte] = useState<SourceValue>(initialFonte);
  const [buscaInput, setBuscaInput] = useState(initialBusca);
  const [busca, setBusca] = useState(initialBusca);

  // debounce da busca
  useEffect(() => {
    const id = setTimeout(() => setBusca(buscaInput), 300);
    return () => clearTimeout(id);
  }, [buscaInput]);

  // sincroniza URL
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('mes', mesAtual);
    params.set('ano', mesAtual.slice(0, 4));
    if (categoriaId) params.set('cat', categoriaId);
    if (fonte.id && fonte.id !== 'all') params.set('fonte', `${fonte.kind}:${fonte.id}`);
    if (busca) params.set('q', busca);
    setSearchParams(params, { replace: true });
  }, [mesAtual, categoriaId, fonte, busca, setSearchParams]);

  const limparFiltros = () => {
    setCategoriaId(undefined);
    setFonte({ kind: 'account', id: 'all' });
    setBusca('');
    setBuscaInput('');
  };

  const year = Number(mesAtual.slice(0, 4));
  const month = Number(mesAtual.slice(5, 7));

  return { mesAtual, setMesAtual, categoriaId, setCategoriaId, fonte, setFonte, buscaInput, setBuscaInput, busca, limparFiltros, year, month };
}
