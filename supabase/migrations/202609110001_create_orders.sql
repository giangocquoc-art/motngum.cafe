create table if not exists public.orders (
  id text primary key,
  status text not null default 'received' check (status in (
    'received', 'awaiting_payment', 'payment_submitted', 'confirmed',
    'in_progress', 'completed', 'cancelled'
  )),
  name text not null,
  email text not null,
  phone text not null default '',
  package_id text not null check (package_id in ('start', 'launch', 'grow')),
  domain text not null default '',
  note text not null default '',
  payment_reference text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
revoke all on table public.orders from anon, authenticated;
