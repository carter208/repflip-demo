-- ================================================================
-- Repflip MVP — Initial Schema
-- Migration: 001_initial_schema.sql
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor → New query)
-- ================================================================


-- ================================================================
-- EXTENSIONS
-- ================================================================

-- gen_random_uuid() is available by default in Supabase (pgcrypto),
-- but this ensures it exists if running locally.
create extension if not exists "pgcrypto";


-- ================================================================
-- TABLES
-- ================================================================

-- ------------------------------------------------------------
-- 1. businesses
-- user_id links to the Supabase Auth user who owns this record.
-- This is what RLS policies use to scope access.
-- ------------------------------------------------------------
create table public.businesses (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  name              text        not null,
  trade             text        not null,
  email             text        not null,
  phone             text,
  city              text,
  subscription_tier text        not null default 'free',
  stripe_customer_id text,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2. consumers
-- user_id is nullable — it is only populated when a consumer
-- claims their profile via Supabase Auth (phone/email OTP).
-- Until then, rows are created by businesses via service-role API.
-- ------------------------------------------------------------
create table public.consumers (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        references auth.users(id) on delete set null,
  name              text        not null,
  phone             text,
  email             text,
  city              text,
  score             integer     not null default 0,
  tier              text        not null default 'bronze',
  points_balance    integer     not null default 0,
  profile_claimed   boolean     not null default false,
  notification_sent boolean     not null default false,
  created_at        timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 3. reviews
-- One review per business+consumer interaction.
-- star_rating is constrained to 1–5.
-- tags stored as a Postgres text array (e.g. '{"Paid immediately","Showed up on time"}').
-- ------------------------------------------------------------
create table public.reviews (
  id            uuid        primary key default gen_random_uuid(),
  business_id   uuid        not null references public.businesses(id) on delete cascade,
  consumer_id   uuid        not null references public.consumers(id) on delete cascade,
  star_rating   integer     not null check (star_rating between 1 and 5),
  tags          text[]      not null default '{}',
  notes         text,
  created_at    timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 4. subscriptions
-- Tracks Stripe subscription state per business.
-- stripe_subscription_id is unique so webhook handlers can
-- look up the record by Stripe's ID.
-- ------------------------------------------------------------
create table public.subscriptions (
  id                     uuid        primary key default gen_random_uuid(),
  business_id            uuid        not null references public.businesses(id) on delete cascade,
  plan                   text        not null,
  status                 text        not null default 'active',
  stripe_subscription_id text        unique,
  created_at             timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 5. points_transactions
-- Immutable ledger — every points earn/spend is a new row.
-- points can be positive (earned) or negative (spent).
-- ------------------------------------------------------------
create table public.points_transactions (
  id          uuid        primary key default gen_random_uuid(),
  consumer_id uuid        not null references public.consumers(id) on delete cascade,
  points      integer     not null,
  reason      text,
  created_at  timestamptz not null default now()
);


-- ================================================================
-- INDEXES
-- Speeds up the most common lookups: reviews by business/consumer,
-- subscriptions by business, transactions by consumer, auth lookups.
-- ================================================================

create index idx_businesses_user_id         on public.businesses (user_id);
create index idx_consumers_user_id          on public.consumers  (user_id);
create index idx_consumers_phone            on public.consumers  (phone);
create index idx_consumers_email            on public.consumers  (email);
create index idx_reviews_business_id        on public.reviews    (business_id);
create index idx_reviews_consumer_id        on public.reviews    (consumer_id);
create index idx_subscriptions_business_id  on public.subscriptions (business_id);
create index idx_points_tx_consumer_id      on public.points_transactions (consumer_id);


-- ================================================================
-- ROW LEVEL SECURITY
-- Enable RLS on every table, then define explicit policies.
-- Nothing is readable or writable by default once RLS is on.
-- ================================================================

alter table public.businesses          enable row level security;
alter table public.consumers           enable row level security;
alter table public.reviews             enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.points_transactions enable row level security;


-- ----------------------------------------------------------------
-- businesses policies
-- A business user can only see and modify their own row.
-- ----------------------------------------------------------------

create policy "businesses: owner can select"
  on public.businesses
  for select
  using (user_id = auth.uid());

create policy "businesses: owner can insert"
  on public.businesses
  for insert
  with check (user_id = auth.uid());

create policy "businesses: owner can update"
  on public.businesses
  for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "businesses: owner can delete"
  on public.businesses
  for delete
  using (user_id = auth.uid());


-- ----------------------------------------------------------------
-- consumers policies
-- Consumers can read and update their own profile.
-- INSERT is intentionally excluded — consumer rows are created
-- server-side (service-role key) when a business submits a review.
-- ----------------------------------------------------------------

create policy "consumers: owner can select"
  on public.consumers
  for select
  using (user_id = auth.uid());

create policy "consumers: owner can update"
  on public.consumers
  for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ----------------------------------------------------------------
-- reviews policies
-- Businesses can create and manage reviews they authored.
-- Consumers can read reviews written about them.
-- ----------------------------------------------------------------

-- Business: full CRUD on their own reviews
create policy "reviews: business can select own"
  on public.reviews
  for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "reviews: business can insert"
  on public.reviews
  for insert
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "reviews: business can update own"
  on public.reviews
  for update
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  )
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "reviews: business can delete own"
  on public.reviews
  for delete
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

-- Consumer: read-only access to reviews written about them
create policy "reviews: consumer can select own"
  on public.reviews
  for select
  using (
    consumer_id in (
      select id from public.consumers where user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------
-- subscriptions policies
-- Businesses can only read their own subscription.
-- Writes are handled server-side via Stripe webhooks (service role).
-- ----------------------------------------------------------------

create policy "subscriptions: business can select own"
  on public.subscriptions
  for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------
-- points_transactions policies
-- Consumers can only read their own points history.
-- Writes are handled server-side (service role) to protect integrity.
-- ----------------------------------------------------------------

create policy "points_transactions: consumer can select own"
  on public.points_transactions
  for select
  using (
    consumer_id in (
      select id from public.consumers where user_id = auth.uid()
    )
  );
