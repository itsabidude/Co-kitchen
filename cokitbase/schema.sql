-- CO-CO Kitchen shared Cokitbase backend
-- Run this SQL in the connected Cokitbase/Supabase SQL environment.

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

-- Atomic stock reservation.
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

-- Secure customer order creation.
-- Validates service availability, cutoff, item availability, price from the
-- server-side menu, and reserves stock atomically before creating the order.
create or replace function public.create_customer_order(
  p_customer_name text,
  p_customer_mobile text,
  p_order_date date,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
  v_order_code text;
  v_tracking_token uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_menu public.menus%rowtype;
  v_qty integer;
  v_slot public.service_slots%rowtype;
begin
  if trim(coalesce(p_customer_name,'')) = '' then raise exception 'Customer name is required'; end if;
  if p_customer_mobile !~ '^[0-9]{10}$' then raise exception 'Valid 10-digit mobile number is required'; end if;
  if p_order_date <> current_date then raise exception 'Orders can only be placed for today'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items)=0 then raise exception 'At least one item is required'; end if;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item->>'quantity')::integer;
    if v_qty is null or v_qty <= 0 then raise exception 'Invalid quantity'; end if;

    select * into v_menu from public.menus where id=(v_item->>'menu_id')::uuid for update;
    if not found then raise exception 'Menu item not found'; end if;

    select * into v_slot from public.service_slots where id=v_menu.slot;
    if not v_slot.is_available then raise exception '% service is currently closed', initcap(v_menu.slot); end if;
    if v_slot.cutoff_time is not null and localtime >= v_slot.cutoff_time then raise exception '% ordering cutoff has passed', initcap(v_menu.slot); end if;
    if not v_menu.is_available or v_menu.remaining_quantity < v_qty then raise exception '% is unavailable or has insufficient stock', v_menu.item_name; end if;

    update public.menus set remaining_quantity=remaining_quantity-v_qty, updated_at=now() where id=v_menu.id;
    v_total := v_total + (v_menu.price * v_qty);
  end loop;

  v_order_code := '#CK' || lpad((floor(random()*9000)+1000)::int::text,4,'0');
  while exists(select 1 from public.orders where order_code=v_order_code) loop
    v_order_code := '#CK' || lpad((floor(random()*9000)+1000)::int::text,4,'0');
  end loop;

  insert into public.orders(order_code,customer_name,customer_mobile,order_date,total_amount)
  values(v_order_code,trim(p_customer_name),p_customer_mobile,p_order_date,v_total)
  returning id,tracking_token into v_order_id,v_tracking_token;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_menu from public.menus where id=(v_item->>'menu_id')::uuid;
    insert into public.order_items(order_id,menu_id,item_name,slot,quantity,unit_price)
    values(v_order_id,v_menu.id,v_menu.item_name,v_menu.slot,(v_item->>'quantity')::integer,v_menu.price);
  end loop;

  insert into public.payments(order_id,status,method) values(v_order_id,'PENDING','UPI');

  return jsonb_build_object(
    'id',v_order_id,'order_code',v_order_code,'tracking_token',v_tracking_token,
    'customer_name',trim(p_customer_name),'customer_mobile',p_customer_mobile,
    'order_date',p_order_date,'total_amount',v_total,'payment_status','PENDING','order_status','PLACED'
  );
end;
$$;

grant execute on function public.create_customer_order(text,text,date,jsonb) to anon, authenticated;

-- Customer can only read its own order using the tracking token.
drop policy if exists "public read order by token" on public.orders;
create policy "customer reads own order by token" on public.orders
for select using (
  tracking_token::text = coalesce(current_setting('request.headers', true)::jsonb->>'x-order-token','')
);

drop policy if exists "public read order items" on public.order_items;
create policy "customer reads own order items" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id=order_items.order_id
      and o.tracking_token::text = coalesce(current_setting('request.headers', true)::jsonb->>'x-order-token','')
  )
);

drop policy if exists "public read payments" on public.payments;
create policy "customer reads own payment" on public.payments
for select using (
  exists (
    select 1 from public.orders o
    where o.id=payments.order_id
      and o.tracking_token::text = coalesce(current_setting('request.headers', true)::jsonb->>'x-order-token','')
  )
);

-- Customer only submits "payment completed" through a controlled RPC.
create or replace function public.mark_payment_completed(p_tracking_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_order_id uuid;
begin
  select id into v_order_id from public.orders where tracking_token=p_tracking_token;
  if not found then raise exception 'Order not found'; end if;
  update public.orders set payment_status='CUSTOMER_MARKED_PAID',updated_at=now() where id=v_order_id;
  update public.payments set status='CUSTOMER_MARKED_PAID',updated_at=now() where order_id=v_order_id;
  return true;
end;
$$;
grant execute on function public.mark_payment_completed(uuid) to anon, authenticated;

-- Realtime updates for the customer and admin portals.
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

-- Basic RLS. Tighten admin write policies before production deployment.
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
