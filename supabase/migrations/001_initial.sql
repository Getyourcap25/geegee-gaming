-- ============================================================
-- GeeGee Gaming × Incluzio — Initial Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text unique not null,
  full_name    text,
  organization text,
  role         text not null default 'client' check (role in ('admin', 'client')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- products
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text unique not null,
  inventory_total integer not null default 1,
  notes           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- districts
create table if not exists public.districts (
  id         uuid primary key default gen_random_uuid(),
  name       text unique not null,
  sort_order integer not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- requests
create table if not exists public.requests (
  id                   uuid primary key default gen_random_uuid(),
  reference_code       text unique not null,
  product_id           uuid not null references public.products(id) on delete restrict,
  quantity             integer not null default 1,
  district_id          uuid not null references public.districts(id) on delete restrict,
  location             text not null,
  requested_by_name    text not null,
  requested_by_email   text not null,
  requested_by_phone   text,
  organization         text,
  preferred_date       date not null,
  end_date             date not null,
  status               text not null default 'pending'
                         check (status in ('pending','approved','scheduled','completed','cancelled')),
  notes                text,
  internal_notes       text,
  created_by_user_id   uuid not null references public.profiles(id) on delete restrict,
  assigned_to_user_id  uuid references public.profiles(id) on delete set null,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint end_date_gte_preferred_date check (end_date >= preferred_date)
);

-- ============================================================
-- REFERENCE CODE SEQUENCE
-- ============================================================

create sequence if not exists public.request_reference_seq start 1001;

create or replace function public.generate_reference_code()
returns trigger
language plpgsql
as $$
begin
  if new.reference_code is null or new.reference_code = '' then
    new.reference_code := 'REQ-' || nextval('public.request_reference_seq')::text;
  end if;
  return new;
end;
$$;

drop trigger if exists set_reference_code on public.requests;
create trigger set_reference_code
  before insert on public.requests
  for each row execute function public.generate_reference_code();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_products on public.products;
create trigger set_updated_at_products
  before update on public.products
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_requests on public.requests;
create trigger set_updated_at_requests
  before update on public.requests
  for each row execute function public.set_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE ON AUTH SIGNUP
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, organization, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'organization', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.products  enable row level security;
alter table public.districts enable row level security;
alter table public.requests  enable row level security;

-- Helper: is current user an admin?
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---- profiles ----
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---- products ----
create policy "Authenticated users can read active products"
  on public.products for select
  to authenticated
  using (is_active = true);

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- ---- districts ----
create policy "Authenticated users can read active districts"
  on public.districts for select
  to authenticated
  using (is_active = true);

create policy "Admins can manage districts"
  on public.districts for all
  using (public.is_admin());

-- ---- requests ----
create policy "Clients can read own requests"
  on public.requests for select
  using (
    created_by_user_id = auth.uid()
    or public.is_admin()
  );

create policy "Clients can insert own requests"
  on public.requests for insert
  with check (created_by_user_id = auth.uid());

create policy "Admins can update any request"
  on public.requests for update
  using (public.is_admin());

create policy "Admins can delete any request"
  on public.requests for delete
  using (public.is_admin());

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.products (name, slug, inventory_total, notes) values
  ('Estreet Gamez',  'estreet-gamez',  4,  null),
  ('Active Gamer',   'active-gamer',   20, null),
  ('Esoccer League', 'esoccer-league', 1,  'Bestaat uit 4 speldagen')
on conflict (slug) do nothing;

insert into public.districts (name, sort_order) values
  ('Bospolder-Tussendijken', 1),
  ('Middelland',             2),
  ('Nieuwe Westen',          3),
  ('Spangen',                4),
  ('Oud-Mathenesse',         5),
  ('Witte Dorp',             6),
  ('Schiemond',              7),
  ('Lloydkwartier',          8),
  ('Delfshaven (overig)',    9)
on conflict (name) do nothing;
