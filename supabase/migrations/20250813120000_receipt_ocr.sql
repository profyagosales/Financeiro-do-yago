-- Create receipts storage bucket with owner-only access
insert into storage.buckets (id, name, public)
values ('receipts','receipts', false)
on conflict (id) do nothing;

-- Row Level Security for receipts bucket
create policy "Receipts owners read" on storage.objects
  for select to authenticated using (
    bucket_id = 'receipts' and owner = auth.uid()
  );
create policy "Receipts owners insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'receipts' and owner = auth.uid()
  );
create policy "Receipts owners update" on storage.objects
  for update to authenticated using (
    bucket_id = 'receipts' and owner = auth.uid()
  );
create policy "Receipts owners delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'receipts' and owner = auth.uid()
  );

-- Log of OCR parsing attempts
create table if not exists public.receipt_parses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  file_path text not null,
  description text,
  amount numeric,
  date date,
  cnpj text,
  payment_method text,
  category text,
  raw_text text,
  error text,
  created_at timestamptz not null default now()
);

alter table public.receipt_parses enable row level security;

create policy "receipt_parses_select_own" on public.receipt_parses
  for select to authenticated using (user_id = auth.uid());
create policy "receipt_parses_insert_own" on public.receipt_parses
  for insert to authenticated with check (user_id = auth.uid());
