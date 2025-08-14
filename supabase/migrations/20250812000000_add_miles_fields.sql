alter table public.miles
  add column if not exists transaction_id bigint references public.transactions(id) on delete set null,
  add column if not exists expected_at date,
  add column if not exists status text default 'pending' check (status in ('pending','posted','expired'));

create index if not exists miles_tx_id_idx on public.miles(transaction_id);
