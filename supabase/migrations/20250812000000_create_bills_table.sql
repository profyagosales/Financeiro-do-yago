-- Create bills table
create table if not exists public.bills (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    description text not null,
    due_date date not null,
    amount numeric not null,
    status text not null default 'pending' check (status in ('pending','paid','overdue')),
    account_id uuid references public.accounts(id),
    category_id uuid references public.categories(id),
    attachment_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.bills enable row level security;

create policy "bills_select_own" on public.bills
    for select to authenticated using (user_id = auth.uid());
create policy "bills_insert_own" on public.bills
    for insert to authenticated with check (user_id = auth.uid());
create policy "bills_update_own" on public.bills
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "bills_delete_own" on public.bills
    for delete to authenticated using (user_id = auth.uid());

create index if not exists idx_bills_user_due_date on public.bills(user_id, due_date);
