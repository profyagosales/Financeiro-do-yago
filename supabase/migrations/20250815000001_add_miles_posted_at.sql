alter table public.miles
  add column if not exists posted_at timestamptz;

