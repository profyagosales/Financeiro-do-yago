-- Create categories table
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    parent_id uuid references public.categories(id),
    name text not null,
    icon text,
    color text,
    created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "categories_select" on public.categories
    for select to authenticated using (true);
create policy "categories_insert" on public.categories
    for insert to authenticated with check (true);
create policy "categories_update" on public.categories
    for update to authenticated using (true) with check (true);
create policy "categories_delete" on public.categories
    for delete to authenticated using (true);

-- Create accounts table
create table if not exists public.accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    name text not null,
    type text not null check (type in ('conta','carteira','poupanca')),
    institution text,
    balance numeric not null default 0,
    created_at timestamptz not null default now()
);

alter table public.accounts enable row level security;

create policy "accounts_select_own" on public.accounts
    for select to authenticated using (user_id = auth.uid());
create policy "accounts_insert_own" on public.accounts
    for insert to authenticated with check (user_id = auth.uid());
create policy "accounts_update_own" on public.accounts
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "accounts_delete_own" on public.accounts
    for delete to authenticated using (user_id = auth.uid());

-- Create credit_cards table
create table if not exists public.credit_cards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    name text not null,
    brand text,
    limit_value numeric not null default 0,
    closing_day int not null,
    due_day int not null,
    account_id uuid not null references public.accounts(id),
    created_at timestamptz not null default now()
);

alter table public.credit_cards enable row level security;

create policy "credit_cards_select_own" on public.credit_cards
    for select to authenticated using (user_id = auth.uid());
create policy "credit_cards_insert_own" on public.credit_cards
    for insert to authenticated with check (user_id = auth.uid() and account_id in (select id from public.accounts where user_id = auth.uid()));
create policy "credit_cards_update_own" on public.credit_cards
    for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid() and account_id in (select id from public.accounts where user_id = auth.uid()));
create policy "credit_cards_delete_own" on public.credit_cards
    for delete to authenticated using (user_id = auth.uid());

-- Adjust transactions table
drop table if exists public.transactions cascade;

create table public.transactions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id),
    date date not null,
    description text,
    amount numeric not null,
    type text not null check (type in ('income','expense','transfer')),
    category_id uuid references public.categories(id),
    source_type text not null check (source_type in ('account','card')),
    source_id uuid not null,
    installments_total int not null default 1,
    installment_number int not null default 1,
    parent_installment_id uuid references public.transactions(id),
    notes text,
    attachment_url text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "transactions_select_own" on public.transactions
    for select to authenticated using (user_id = auth.uid());
create policy "transactions_insert_own" on public.transactions
    for insert to authenticated with check (
        user_id = auth.uid() and (
            (source_type = 'account' and source_id in (select id from public.accounts where user_id = auth.uid())) or
            (source_type = 'card' and source_id in (select id from public.credit_cards where user_id = auth.uid()))
        )
    );
create policy "transactions_update_own" on public.transactions
    for update to authenticated using (user_id = auth.uid()) with check (
        user_id = auth.uid() and (
            (source_type = 'account' and source_id in (select id from public.accounts where user_id = auth.uid())) or
            (source_type = 'card' and source_id in (select id from public.credit_cards where user_id = auth.uid()))
        )
    );
create policy "transactions_delete_own" on public.transactions
    for delete to authenticated using (user_id = auth.uid());

-- Indexes
create index if not exists idx_transactions_user_date on public.transactions(user_id, date);
create index if not exists idx_txn_parent on public.transactions(parent_installment_id);
create index if not exists idx_txn_source on public.transactions(source_type, source_id);

-- Views
create or replace view public.v_month_summary as
select
    date_part('year', t.date)::int as year,
    date_part('month', t.date)::int as month,
    t.date,
    t.category_id,
    c.name as category_name,
    sum(case when t.type = 'income' then t.amount else 0 end) as income,
    sum(case when t.type = 'expense' then t.amount else 0 end) as expense,
    sum(case when t.type = 'income' then t.amount else -t.amount end) as balance
from public.transactions t
left join public.categories c on c.id = t.category_id
group by 1,2,3,4,5;

create or replace view public.v_annual_summary as
select
    date_part('year', t.date)::int as year,
    date_part('month', t.date)::int as month,
    t.category_id,
    c.name as category_name,
    sum(case when t.type = 'income' then t.amount else 0 end) as income,
    sum(case when t.type = 'expense' then t.amount else 0 end) as expense,
    sum(case when t.type = 'income' then t.amount else -t.amount end) as balance
from public.transactions t
left join public.categories c on c.id = t.category_id
group by 1,2,3,4;
