-- Enable Row Level Security policies

-- Transactions
alter table if exists transactions enable row level security;
create policy if not exists "Users manage their transactions" on transactions
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_transactions_user_id on transactions(user_id);

-- Categories
alter table if exists categories enable row level security;
create policy if not exists "Users manage their categories" on categories
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_categories_user_id on categories(user_id);

-- Accounts
alter table if exists accounts enable row level security;
create policy if not exists "Users manage their accounts" on accounts
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_accounts_user_id on accounts(user_id);

-- Credit cards
alter table if exists credit_cards enable row level security;
create policy if not exists "Users manage their credit cards" on credit_cards
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_credit_cards_user_id on credit_cards(user_id);

-- Bills
alter table if exists bills enable row level security;
create policy if not exists "Users manage their bills" on bills
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_bills_user_id on bills(user_id);

-- Goals
alter table if exists goals enable row level security;
create policy if not exists "Users manage their goals" on goals
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_goals_user_id on goals(user_id);

-- Goal contributions
alter table if exists goal_contributions enable row level security;
create policy if not exists "Users manage their goal contributions" on goal_contributions
    for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
create index if not exists idx_goal_contributions_user_id on goal_contributions(user_id);


-- RPC: duplicate transactions to another month/year
create or replace function fn_duplicate_transactions(
    _ids int[],
    target_year int,
    target_month int
) returns setof transactions
language plpgsql
security definer
set search_path = public
as $$
declare
    max_day int;
begin
    -- clamp day to last day of target month
    max_day := extract(day from (date_trunc('month', make_date(target_year, target_month, 1)) + interval '1 month - 1 day'))::int;

    return query
    insert into transactions (
        user_id,
        date,
        description,
        amount,
        category_id,
        account_id,
        card_id,
        installment_no,
        installment_total,
        parent_installment_id
    )
    select
        user_id,
        make_date(target_year, target_month,
            least(extract(day from date)::int, max_day)),
        description,
        amount,
        category_id,
        account_id,
        card_id,
        installment_no,
        installment_total,
        parent_installment_id
    from transactions
    where id = any(_ids)
      and user_id = auth.uid()
    returning *;
end;
$$;

-- RPC: yearly summary with aggregates
create or replace function fn_year_summary(_year int)
returns jsonb
language sql
security definer
set search_path = public
as $$
with t as (
    select * from transactions
    where extract(year from date) = _year
      and user_id = auth.uid()
),
months as (
    select
        extract(month from date)::int as month,
        sum(case when amount >= 0 then amount else 0 end) as income,
        sum(case when amount < 0 then -amount else 0 end) as expense
    from t
    group by month
),
by_category as (
    select
        category_id,
        sum(case when amount < 0 then -amount else amount end) as total
    from t
    group by category_id
),
totals as (
    select
        sum(case when amount >= 0 then amount else 0 end) as income,
        sum(case when amount < 0 then -amount else 0 end) as expense
    from t
)
select jsonb_build_object(
    'months', coalesce((select jsonb_agg(jsonb_build_object(
        'month', m.month,
        'income', coalesce(m.income,0),
        'expense', coalesce(m.expense,0),
        'balance', coalesce(m.income,0) - coalesce(m.expense,0)
    ) order by m.month) from months m), '[]'::jsonb),
    'byCategory', coalesce((select jsonb_agg(jsonb_build_object(
        'category_id', b.category_id,
        'total', b.total
    )) from by_category b), '[]'::jsonb),
    'totals', (select jsonb_build_object(
        'income', coalesce(totals.income,0),
        'expense', coalesce(totals.expense,0),
        'balance', coalesce(totals.income,0) - coalesce(totals.expense,0)
    ) from totals)
);
$$;
