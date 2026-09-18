-- CO-CO Kitchen shared backend
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.service_slots (
  id text primary key check (id in ('lunch','dinner')),
  is_available boolean not null default true,
  delivery_time text not null,
  cutoff_time time,
  updated_at timestamptz not null default now()
);

insert into public.service_slots (id, is_available, delivery_time, cutoff_time)
values
  ('lunch', true, '12:30 PM', '06:00'),
  ('dinner', true, '07:30 PM', '12:00')
on conflict (id) do nothing;

create table if not exists public.menus (
  id uuid primary key default gen_random_uuid(),
  service_date date not null,
  slot text not null check (slot in ('lunch','dinner')),
  item_name text not null,
  price numeric(10,2) not null check (price >= 0),
  total_quantity integer not null default 0 check (total_quantity >= 0),
  remaining_quantity integer not null default 0 check (remaining_quantity >= 0 and remaining_quantity <= total_quantity),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists menus_date_slot_idx on public.menus(service_date, slot);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text unique not null,
  customer_name text not null,
  customer_mobile text not null,
  delivery_location text,
  delivery_instructions text,
  order_date date not null,
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING','CUSTOMER_MARKED_PAID','VERIFIED','REJECTED')),
  order_status text not null default 'PLACED' check (order_status in ('PLACED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')),
  total_amount numeric(10,2) not null default 0,
  tracking_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_date_idx on public.orders(order_date);
create index if not exists orders_tracking_idx on public.orders(tracking_token);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_id uuid references public.menus(id),
  item_name text not null,
  slot text not null check (slot in ('lunch','dinner')),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  line_total numeric(10,2) generated always as (quantity * unit_price) stored
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null default 'PENDING' check (status in ('PENDING','CUSTOMER_MARKED_PAID','VERIFIED','REJECTED')),
  method text not null default 'UPI',
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Atomic stock reservation: prevents two customers from taking the same last quantity.
create or replace function public.reserve_menu_item(p_menu_id uuid, p_quantity integer)
returns boolean
language plpgsql
security definer
as $$
declare
  changed integer;
begin
  update public.menus
  set remaining_quantity = remaining_quantity - p_quantity,
      updated_at = now()
  where id = p_menu_id
    and is_available = true
    and remaining_quantity >= p_quantity;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

-- Realtime lets customer/admin views receive changes without refresh.
alter table public.service_slots replica identity full;
alter table public.menus replica identity full;
alter table public.orders replica identity full;
alter table public.payments replica identity full;

do $$ begin
  alter publication supabase_realtime add table public.service_slots;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.menus;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.orders;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.payments;
exception when duplicate_object then null;
end $$;

-- Basic RLS. Tighten admin write policies once Supabase Auth roles are configured.
alter table public.service_slots enable row level security;
alter table public.menus enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

drop policy if exists "public read slots" on public.service_slots;
create policy "public read slots" on public.service_slots for select using (true);

drop policy if exists "public read menus" on public.menus;
create policy "public read menus" on public.menus for select using (true);

drop policy if exists "public insert orders" on public.orders;
create policy "public insert orders" on public.orders for insert with check (true);

drop policy if exists "public read order by token" on public.orders;
create policy "public read order by token" on public.orders for select using (true);

drop policy if exists "public insert order items" on public.order_items;
create policy "public insert order items" on public.order_items for insert with check (true);

drop policy if exists "public read order items" on public.order_items;
create policy "public read order items" on public.order_items for select using (true);

drop policy if exists "public insert payments" on public.payments;
create policy "public insert payments" on public.payments for insert with check (true);

drop policy if exists "public read payments" on public.payments;
create policy "public read payments" on public.payments for select using (true);
