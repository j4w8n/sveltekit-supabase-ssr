-- YOND Gym signup funnel — hackathon schema (no Supabase Auth)
--
-- Design notes:
--   * No auth.users. Visitors are identified by a client-generated `visitor_token`
--     (UUID stored in localStorage/cookie). No passwords, no sessions.
--   * PostHog owns analytics (event stream, device/geo/UTM, funnel drop-off). We
--     only keep `posthog_distinct_id` to correlate a DB record back to PostHog.
--   * hackathon_cart is the resumable funnel state (the transactional source of
--     truth). One active cart per visitor.
--   * Writes happen server-side with the service key; RLS stays closed except for
--     the public catalog (plans, studios).
--
-- Convention follows public.hackathon_fitness_studio:
--   hackathon_ prefix, singular, text + CHECK constraints (no enums), uuid PKs.

-- ---------------------------------------------------------------------------
-- Plans (Core / Plus / Pro) — public catalog
-- ---------------------------------------------------------------------------
create table if not exists public.hackathon_plan (
  id                   uuid primary key default gen_random_uuid(),
  code                 text not null unique
                         check (code = any (array['core','plus','pro'])),
  name                 text not null,
  tagline              text null,
  price_monthly_cents  integer not null,          -- list price per 4 weeks
  annual_price_cents   integer not null,          -- discounted (annual term)
  features             text[] not null default '{}',
  sort_order           integer not null default 0,
  is_active            boolean not null default true,
  created_at           timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Promo codes — validated at checkout (never exposed to anon)
-- ---------------------------------------------------------------------------
create table if not exists public.hackathon_promo_code (
  code              text primary key,
  discount_percent  integer not null check (discount_percent between 1 and 100),
  is_active         boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Cart — resumable funnel state, one active per visitor
-- ---------------------------------------------------------------------------
create table if not exists public.hackathon_cart (
  id                   uuid primary key default gen_random_uuid(),

  -- anonymous, device-level identity (no auth)
  visitor_token        uuid not null,             -- client-generated, stable per device
  posthog_distinct_id  text null,                 -- correlate with PostHog analytics

  -- lifecycle
  status               text not null default 'active'
                         check (status = any (array['active','abandoned','completed'])),
  current_step         text not null default 'studio'
                         check (current_step = any (
                           array['studio','plan','profile','verify','payment','done'])),

  -- selections (filled progressively; all nullable)
  studio_id            uuid null references public.hackathon_fitness_studio (id),
  plan_id              uuid null references public.hackathon_plan (id),
  billing_term         text null
                         check (billing_term is null or billing_term = any (
                           array['month','year','month_23'])),
  pay_upfront          boolean not null default false,
  personal_training    boolean not null default false,   -- the pt=1 add-on
  promo_code           text null references public.hackathon_promo_code (code),

  -- soft identity, captured at the profile step
  contact_channel      text null
                         check (contact_channel is null or contact_channel = any (
                           array['email','phone'])),
  contact_value        text null,
  first_name           text null,
  last_name            text null,

  -- checkout
  payment_method       text null
                         check (payment_method is null or payment_method = any (
                           array['card','sepa','paypal','klarna'])),
  price_cents          integer null,               -- computed total at checkout

  -- timestamps
  started_at           timestamptz not null default now(),
  last_activity_at     timestamptz not null default now(),  -- drives abandonment
  completed_at         timestamptz null,
  membership_id        uuid null                    -- set on conversion (FK added below)
);

-- One active cart per device
create unique index if not exists uq_hackathon_cart_active_visitor
  on public.hackathon_cart (visitor_token)
  where status = 'active';

create index if not exists idx_hackathon_cart_visitor on public.hackathon_cart (visitor_token);
create index if not exists idx_hackathon_cart_last_activity on public.hackathon_cart (last_activity_at)
  where status = 'active';

-- ---------------------------------------------------------------------------
-- Membership — the conversion record (references the cart it came from)
-- ---------------------------------------------------------------------------
create table if not exists public.hackathon_membership (
  id                   uuid primary key default gen_random_uuid(),
  cart_id              uuid not null unique references public.hackathon_cart (id),
  visitor_token        uuid not null,
  posthog_distinct_id  text null,

  studio_id            uuid not null references public.hackathon_fitness_studio (id),
  plan_id              uuid not null references public.hackathon_plan (id),
  billing_term         text not null default 'month'
                         check (billing_term = any (array['month','year','month_23'])),
  pay_upfront          boolean not null default false,
  personal_training    boolean not null default false,

  -- contact captured inline (no user account)
  contact_channel      text null,
  contact_value        text null,
  first_name           text null,
  last_name            text null,

  payment_method       text null
                         check (payment_method is null or payment_method = any (
                           array['card','sepa','paypal','klarna'])),
  promo_code           text null references public.hackathon_promo_code (code),
  status               text not null default 'active'
                         check (status = any (array['active','paused','cancelled'])),
  price_cents          integer null,
  accepted_terms       boolean not null default false,
  created_at           timestamptz not null default now()
);

-- Close the cart -> membership link now that the table exists
alter table public.hackathon_cart
  add constraint hackathon_cart_membership_id_fkey
  foreign key (membership_id) references public.hackathon_membership (id);

-- ---------------------------------------------------------------------------
-- Row-Level Security
--   Public read: catalog (plans, studios) so the funnel renders pre-conversion.
--   Everything else: no anon policies -> only the service key (server routes)
--   can read/write. RLS is enabled so the anon/publishable key is denied.
-- ---------------------------------------------------------------------------
alter table public.hackathon_plan enable row level security;
create policy "plans are public" on public.hackathon_plan
  for select using (true);

alter table public.hackathon_fitness_studio enable row level security;
create policy "studios are public" on public.hackathon_fitness_studio
  for select using (true);

alter table public.hackathon_promo_code  enable row level security;  -- no anon policy
alter table public.hackathon_cart         enable row level security;  -- no anon policy
alter table public.hackathon_membership   enable row level security;  -- no anon policy

-- Promo validation without exposing the table (callable via RPC if desired)
create or replace function public.validate_promo_code(p_code text)
returns integer                                    -- discount_percent, or null if invalid
language sql
security definer set search_path = ''
as $$
  select discount_percent
  from public.hackathon_promo_code
  where code = upper(p_code) and is_active = true;
$$;
