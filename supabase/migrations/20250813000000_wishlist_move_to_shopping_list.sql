create extension if not exists "pgcrypto";

create table if not exists wishlist_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  status text not null default 'new',
  created_at timestamptz default now()
);

create or replace function wishlist_move_to_shopping_list(
  item_id uuid,
  quantity numeric,
  estimated_price numeric,
  store text,
  due_at date
)
returns void
language plpgsql
as $$
begin
  insert into shopping_list (item_id, quantity, estimated_price, store, due_at)
  values (item_id, quantity, estimated_price, store, due_at);

  update wishlist_items
  set status = 'ready'
  where id = item_id;
end;
$$;
