-- ============================================================
-- Product adjustments — handmatige aftrekposten
-- ============================================================

create table if not exists public.product_adjustments (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products(id) on delete cascade,
  quantity            integer not null,        -- negatief = aftrek, positief = toevoeging
  reason              text not null,
  created_by_user_id  uuid not null references public.profiles(id) on delete restrict,
  created_at          timestamptz not null default now()
);

-- RLS
alter table public.product_adjustments enable row level security;

create policy "Admins can manage product adjustments"
  on public.product_adjustments for all
  using (public.is_admin());

create policy "Authenticated users can read adjustments"
  on public.product_adjustments for select
  to authenticated
  using (true);
