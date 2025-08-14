alter table public.miles_movements
  add column if not exists transaction_id bigint references public.transactions(id) on delete set null,
  add column if not exists program text,
  add column if not exists amount integer,
  add column if not exists expected_at date,
  add column if not exists status text default 'pending' check (status in ('pending','posted','expired'));

create index if not exists miles_movements_tx_id_idx on public.miles_movements(transaction_id);
