-- ================================================================
-- Repflip MVP — Database Schema
-- Migration: 002_schema.sql
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → New query → paste → Run
--
-- SAFE TO RE-RUN:
--   Drop guards at the top let you run this on a clean project
--   or after a previous attempt. Tables are dropped in reverse
--   dependency order to avoid FK constraint errors.
-- ================================================================


-- ================================================================
-- CLEAN SLATE (reverse FK order)
-- ================================================================
drop table if exists public.points_transactions cascade;
drop table if exists public.subscriptions       cascade;
drop table if exists public.reviews             cascade;
drop table if exists public.consumers           cascade;
drop table if exists public.businesses          cascade;


-- ================================================================
-- NOTE ON user_id COLUMNS
-- ================================================================
-- Supabase RLS policies use auth.uid() to identify the caller.
-- To scope rows to the right user we need a column that stores
-- the auth.users id for each row.
--
-- • businesses.user_id  — set to auth.uid() when a business signs up.
--   NOT NULL because every business must be tied to an auth account.
--
-- • consumers.user_id   — NULL until the consumer claims their profile
--   via phone/email OTP. Consumer rows are created server-side
--   (service-role key) when a business submits a review, so no
--   auth account exists yet at that point.
--
-- These columns are not in the original UI data model — they are
-- purely for auth/RLS wiring.
-- ================================================================


-- ================================================================
-- 1. BUSINESSES
-- ================================================================
create table public.businesses (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references auth.users(id) on delete cascade,
  name              text        not null,
  trade             text,
  email             text        not null unique,
  phone             text,
  city              text        default 'Treasure Valley',
  subscription_tier text        not null default 'free',
  stripe_customer_id text,
  created_at        timestamptz not null default now()
);
comment on table  public.businesses            is 'Service businesses registered on Repflip.';
comment on column public.businesses.user_id   is 'Supabase Auth user who owns this business account.';
comment on column public.businesses.subscription_tier is 'free | pro | enterprise — mirrors Stripe plan.';


-- ================================================================
-- 2. CONSUMERS
-- ================================================================
create table public.consumers (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        references auth.users(id) on delete set null,
  name                text        not null,
  phone               text        not null unique,
  email               text,
  city                text,
  score               integer     not null default 0,
  tier                text        not null default 'unrated',
  points_balance      integer     not null default 0,
  profile_claimed     boolean     not null default false,
  notification_sent   boolean     not null default false,
  notification_sent_at timestamptz,
  created_at          timestamptz not null default now()
);
comment on table  public.consumers                   is 'Consumers who have been reviewed by at least one business.';
comment on column public.consumers.user_id           is 'Populated when consumer claims their profile via OTP. Null until then.';
comment on column public.consumers.score             is '0–100 reputation score, recalculated after every review.';
comment on column public.consumers.tier              is 'unrated | bronze | silver | gold | platinum.';
comment on column public.consumers.notification_sent is 'True once the first-review notification SMS/email has been sent.';


-- ================================================================
-- 3. REVIEWS
-- ================================================================
create table public.reviews (
  id            uuid        primary key default gen_random_uuid(),
  business_id   uuid        not null references public.businesses(id) on delete cascade,
  consumer_id   uuid        not null references public.consumers(id)  on delete cascade,
  star_rating   integer     not null check (star_rating between 1 and 5),
  tags          text[]      not null default '{}',
  notes         text,
  created_at    timestamptz not null default now()
);
comment on table  public.reviews              is 'Business-submitted reviews of consumer behavior.';
comment on column public.reviews.tags        is 'Behavioral tags e.g. {Paid immediately, Showed up on time}.';
comment on column public.reviews.star_rating is 'Integer 1–5, enforced by CHECK constraint.';


-- ================================================================
-- 4. SUBSCRIPTIONS
-- ================================================================
create table public.subscriptions (
  id                     uuid        primary key default gen_random_uuid(),
  business_id            uuid        not null references public.businesses(id) on delete cascade,
  plan                   text        not null,
  status                 text        not null default 'active',
  stripe_subscription_id text,
  current_period_end     timestamptz,
  created_at             timestamptz not null default now()
);
comment on table  public.subscriptions                        is 'Stripe subscription records per business.';
comment on column public.subscriptions.status               is 'active | past_due | canceled | trialing — kept in sync via Stripe webhook.';
comment on column public.subscriptions.current_period_end   is 'Timestamp of the current billing period end from Stripe.';


-- ================================================================
-- 5. POINTS TRANSACTIONS
-- ================================================================
create table public.points_transactions (
  id          uuid        primary key default gen_random_uuid(),
  consumer_id uuid        not null references public.consumers(id) on delete cascade,
  points      integer     not null,
  reason      text,
  created_at  timestamptz not null default now()
);
comment on table  public.points_transactions        is 'Immutable ledger. Positive = earned, negative = spent.';
comment on column public.points_transactions.reason is 'Human-readable description e.g. "Review received", "Prize draw entry".';


-- ================================================================
-- INDEXES
-- ================================================================
create index idx_businesses_user_id         on public.businesses         (user_id);
create index idx_consumers_user_id          on public.consumers          (user_id);
create index idx_consumers_phone            on public.consumers          (phone);
create index idx_consumers_email            on public.consumers          (email);
create index idx_reviews_business_id        on public.reviews            (business_id);
create index idx_reviews_consumer_id        on public.reviews            (consumer_id);
create index idx_reviews_created_at         on public.reviews            (created_at desc);
create index idx_subscriptions_business_id  on public.subscriptions      (business_id);
create index idx_subscriptions_stripe_id    on public.subscriptions      (stripe_subscription_id);
create index idx_points_tx_consumer_id      on public.points_transactions (consumer_id);
create index idx_points_tx_created_at       on public.points_transactions (created_at desc);


-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================
-- Service role key bypasses ALL policies automatically — no extra
-- policy needed. Use the service role key only in server-side API
-- routes (never in the browser).
-- ================================================================

alter table public.businesses          enable row level security;
alter table public.consumers           enable row level security;
alter table public.reviews             enable row level security;
alter table public.subscriptions       enable row level security;
alter table public.points_transactions enable row level security;


-- ----------------------------------------------------------------
-- businesses
-- A business user can only see and modify their own row.
-- ----------------------------------------------------------------
create policy "businesses: owner select"
  on public.businesses for select
  using (user_id = auth.uid());

create policy "businesses: owner insert"
  on public.businesses for insert
  with check (user_id = auth.uid());

create policy "businesses: owner update"
  on public.businesses for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "businesses: owner delete"
  on public.businesses for delete
  using (user_id = auth.uid());


-- ----------------------------------------------------------------
-- consumers
-- Consumers can read their own row once they claim their profile.
-- No INSERT policy — rows are created by server-side API routes
-- using the service role key when a business submits their first review.
-- ----------------------------------------------------------------
create policy "consumers: owner select"
  on public.consumers for select
  using (user_id = auth.uid());

create policy "consumers: owner update"
  on public.consumers for update
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());


-- ----------------------------------------------------------------
-- reviews
-- Businesses can insert reviews and read the ones they created.
-- Consumers can read reviews written about them (for transparency).
-- ----------------------------------------------------------------
create policy "reviews: business insert"
  on public.reviews for insert
  with check (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "reviews: business select own"
  on public.reviews for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "reviews: business update own"
  on public.reviews for update
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

create policy "reviews: business delete own"
  on public.reviews for delete
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );

create policy "reviews: consumer select own"
  on public.reviews for select
  using (
    consumer_id in (
      select id from public.consumers where user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------
-- subscriptions
-- Businesses can only read their own subscription row.
-- All writes come from Stripe webhook handlers using service role.
-- ----------------------------------------------------------------
create policy "subscriptions: business select own"
  on public.subscriptions for select
  using (
    business_id in (
      select id from public.businesses where user_id = auth.uid()
    )
  );


-- ----------------------------------------------------------------
-- points_transactions
-- Consumers can only read their own ledger rows.
-- All writes use service role (prevents self-inflation of points).
-- ----------------------------------------------------------------
create policy "points_transactions: consumer select own"
  on public.points_transactions for select
  using (
    consumer_id in (
      select id from public.consumers where user_id = auth.uid()
    )
  );


-- ================================================================
-- SCORE RECALCULATION FUNCTION + TRIGGER
-- ================================================================
-- Automatically updates consumers.score, consumers.tier, and
-- consumers.points_balance after every INSERT into reviews.
-- Keeps score logic in one place — no need to recalculate in app code.
-- ================================================================

create or replace function public.recalculate_consumer_score()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review_count  integer;
  v_avg_rating    numeric;
  v_new_score     integer;
  v_new_tier      text;
  v_points_earned integer;
begin
  -- Aggregate all reviews for this consumer
  select
    count(*),
    avg(star_rating)
  into v_review_count, v_avg_rating
  from public.reviews
  where consumer_id = new.consumer_id;

  -- Score = average star rating mapped to 0–100
  -- 5 stars → 100, 4 → 80, 3 → 60, 2 → 40, 1 → 20
  -- Weighted slightly lower with fewer reviews (Bayesian-style dampening
  -- toward 60 until 5+ reviews give full confidence).
  v_new_score := round(
    case
      when v_review_count < 5
        then (v_avg_rating * 20 * v_review_count + 60 * (5 - v_review_count)) / 5
      else
        v_avg_rating * 20
    end
  );

  -- Clamp to 0–100
  v_new_score := greatest(0, least(100, v_new_score));

  -- Derive tier from score
  v_new_tier := case
    when v_review_count = 0 then 'unrated'
    when v_new_score >= 90  then 'platinum'
    when v_new_score >= 75  then 'gold'
    when v_new_score >= 55  then 'silver'
    else                         'bronze'
  end;

  -- Points earned for this review: 10 × star_rating
  v_points_earned := new.star_rating * 10;

  -- Update consumer record
  update public.consumers
  set
    score          = v_new_score,
    tier           = v_new_tier,
    points_balance = points_balance + v_points_earned
  where id = new.consumer_id;

  -- Record the points transaction
  insert into public.points_transactions (consumer_id, points, reason)
  values (
    new.consumer_id,
    v_points_earned,
    'Review received (' || new.star_rating || ' stars)'
  );

  return new;
end;
$$;

-- Attach trigger — fires after each new review row is inserted
create trigger trg_review_inserted
  after insert on public.reviews
  for each row
  execute function public.recalculate_consumer_score();


-- ================================================================
-- DONE
-- ================================================================
-- Verify with:
--   select tablename from pg_tables where schemaname = 'public';
--   select policyname, tablename from pg_policies where schemaname = 'public';
-- ================================================================
