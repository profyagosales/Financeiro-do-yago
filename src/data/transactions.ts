// src/data/transactions.ts
//--------------------------------------------------------------
// Modelo de transação (mock).  Ao migrar para Supabase, basta
// usar a mesma estrutura de colunas.
//--------------------------------------------------------------

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  date: string;              // ISO → "2025-08-01"
  description: string;
  value: number;             // valor bruto (positivo sempre)
  type: TransactionType;     // 'income' ou 'expense'
  category: string;          // Alimentação, Moradia, etc.
  paymentMethod: string;     // Cartão, Pix, Dinheiro, ...
  // campos derivados para filtros rápidos
  month: string;             // "2025-08"
  year: string;              // "2025"
}

//--------------------------------------------------------------
// Mock de dados — trocaremos pelo Supabase depois.
//--------------------------------------------------------------
export const transactions: Transaction[] = [
  {
    id: 1,
    date: '2025-08-01',
    description: 'Mercado',
    value: 180.5,
    type: 'expense',
    category: 'Alimentação',
    paymentMethod: 'Cartão',
    month: '2025-08',
    year: '2025',
  },
  {
    id: 2,
    date: '2025-08-02',
    description: 'Salário',
    value: 6500,
    type: 'income',
    category: 'Salário',
    paymentMethod: 'Transferência',
    month: '2025-08',
    year: '2025',
  },
  {
    id: 3,
    date: '2025-08-05',
    description: 'Uber',
    value: 32,
    type: 'expense',
    category: 'Transporte',
    paymentMethod: 'Pix',
    month: '2025-08',
    year: '2025',
  },
  {
    id: 4,
    date: '2025-07-28',
    description: 'Aluguel',
    value: 1200,
    type: 'expense',
    category: 'Moradia',
    paymentMethod: 'Transferência',
    month: '2025-07',
    year: '2025',
  },
  {
    id: 5,
    date: '2025-08-10',
    description: 'Cinema',
    value: 40,
    type: 'expense',
    category: 'Lazer',
    paymentMethod: 'Cartão',
    month: '2025-08',
    year: '2025',
  },
  {
    id: 6,
    date: '2025-08-12',
    description: 'Freelance design',
    value: 900,
    type: 'income',
    category: 'Freelance',
    paymentMethod: 'Pix',
    month: '2025-08',
    year: '2025',
  },
];