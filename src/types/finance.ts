import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string(),
  type: z.enum(['conta', 'carteira', 'poupanca']),
  institution: z.string().nullable(),
  currency: z.string().nullable(),
});
export type Account = z.infer<typeof AccountSchema>;

export const CreditCardSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string(),
  bank: z.string().nullable(),
  limit_amount: z.number().nullable(),
  cut_day: z.number().int().nullable(),
  due_day: z.number().int().nullable(),
  account_id: z.string().uuid(),
});
export type CreditCard = z.infer<typeof CreditCardSchema>;

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
  name: z.string(),
  parent_id: z.string().uuid().nullable(),
  kind: z.enum(['expense', 'income', 'transfer']),
  color: z.string().nullable(),
  icon_key: z.string().nullable(),
});
export type Category = z.infer<typeof CategorySchema>;

export const TransactionSchema = z.object({
  id: z.number().optional(),
  user_id: z.string().uuid().optional(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  category_id: z.string().uuid().nullable(),
  source_type: z.enum(['account', 'card']),
  source_id: z.string().uuid(),
  installment_no: z.number().int().nullable(),
  installments_total: z.number().int().nullable(),
  parent_installment_id: z.number().nullable(),
  attachment_url: z.string().url().nullable(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const TransactionInputSchema = TransactionSchema.omit({ id: true, parent_installment_id: true, attachment_url: true });
export type TransactionInput = z.infer<typeof TransactionInputSchema>;

