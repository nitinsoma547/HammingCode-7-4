-- Initial Supabase schema for The Business.
-- Implements CLAUDE.md §6 minimum-viable tables.
--
-- Conventions:
--   - All tables have created_at, updated_at as timestamptz with default now()
--   - Soft-delete via deleted_at (nullable) rather than DELETE
--   - All FKs root to clients.id
--   - JSONB columns for flexible blobs (brand_profile, payload)
--   - text[] for short string arrays (tone_keywords, languages, etc.)
--   - Use Postgres-native uuid generation, not client-side
--   - Row-level security enabled with service-role only for v1
--     (backend is the only writer; clients don't read directly)

set search_path = public;

-- ============================================================================
-- clients
-- ============================================================================

create type client_status as enum ('trial', 'active', 'paused', 'churned');

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,                    -- e.g. "aditis-kitchen", "chefscape-leesburg"
  business_name text not null,
  owner_name text not null,
  phone text not null,                          -- E.164 preferred
  whatsapp text,                                -- if different from phone
  email text,
  address text,
  city text not null,
  state text not null default 'VA',
  gbp_url text,
  fb_handle text,
  fb_page_id text,                              -- Meta Page ID, numeric string
  ig_handle text,
  ig_user_id text,                              -- Instagram Business Account ID
  meta_page_access_token text,                  -- long-lived; rotated via background job
  meta_token_expires_at timestamptz,
  status client_status not null default 'trial',
  stripe_customer_id text,
  stripe_subscription_id text,
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index clients_status_idx on clients (status) where deleted_at is null;
create unique index clients_slug_uniq on clients (slug) where deleted_at is null;

-- ============================================================================
-- brand_profiles
-- One row per client. Updated quarterly or on operator request.
-- ============================================================================

create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  cuisine_or_category text not null,
  primary_community text not null,              -- south-indian-kerala | pan-south-asian | etc.
  tone_keywords text[] not null default '{}',
  signature_items jsonb not null default '[]'::jsonb,   -- [{name, why_signature, price?}]
  languages text[] not null default '{English}',
  cultural_hooks text[] not null default '{}',
  do_not_say text[] not null default '{}',
  visual_palette jsonb not null,                -- {primary, accent, neutral, ink, notes}
  locations jsonb not null default '[]'::jsonb, -- [{label, address, phone, hours, mapsUrl}]
  channels_in_scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index brand_profiles_client_uniq on brand_profiles (client_id);

-- ============================================================================
-- monthly_intakes
-- Operator captures owner's monthly input + WhatsApp photos. One row per
-- (client, month).
-- ============================================================================

create table if not exists monthly_intakes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  month text not null,                          -- 'YYYY-MM'
  promotions jsonb not null default '[]'::jsonb,
  events jsonb not null default '[]'::jsonb,
  photo_urls text[] not null default '{}',      -- supabase storage URLs
  notes text,
  submitted_at timestamptz not null default now()
);

create unique index monthly_intakes_client_month_uniq on monthly_intakes (client_id, month);

-- ============================================================================
-- campaigns
-- One row per (client, month). Tracks generation + dispatch state + cost.
-- ============================================================================

create type campaign_status as enum ('draft', 'scheduled', 'sent', 'partial', 'failed');

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  month text not null,                          -- 'YYYY-MM'
  status campaign_status not null default 'draft',
  generated_at timestamptz,
  scheduled_at timestamptz,
  model_used text not null default 'claude-haiku-4-5-20251001',
  total_cost_cents integer not null default 0,  -- inference + FAL.AI + email + Outstand-if-used
  generator_run_id text,                        -- correlation id for retries
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index campaigns_client_month_uniq on campaigns (client_id, month);
create index campaigns_status_idx on campaigns (status);

-- ============================================================================
-- campaign_assets
-- One row per asset emitted by the agent team (social post, GBP post,
-- email, Reel, flyer, review response). Captures the JSON payload AND
-- the dispatch result.
-- ============================================================================

create type asset_channel as enum (
  'fb',
  'ig',
  'gbp',
  'email',
  'whatsapp',
  'reel',
  'flyer',
  'review_response',
  'story'
);

create type asset_status as enum (
  'draft',
  'voice_review_pending',
  'approved',
  'scheduled',
  'posted',
  'manual_required',
  'failed',
  'expired'
);

create table if not exists campaign_assets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  slot_id text not null,                        -- e.g. '2026-05-03-signature-dosa'
  channel asset_channel not null,
  status asset_status not null default 'draft',
  payload jsonb not null,                       -- the full JSON shape per channel
  media_urls text[] not null default '{}',
  scheduled_for timestamptz,
  posted_at timestamptz,
  outstand_id text,                             -- legacy field, unused in v1 (no third-party scheduler)
  meta_post_id text,                            -- the FB or IG post id returned by Graph API
  resend_id text,
  fal_job_id text,
  cost_cents integer not null default 0,
  voice_review_verdict text,                    -- 'pass' | 'fail'
  voice_review_notes text,
  operator_approved_at timestamptz,
  operator_approved_by text,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index campaign_assets_campaign_idx on campaign_assets (campaign_id);
create index campaign_assets_client_status_idx on campaign_assets (client_id, status);
create unique index campaign_assets_slot_uniq on campaign_assets (campaign_id, slot_id, channel);

-- ============================================================================
-- leads
-- From the scrapers/. Operator-driven outreach.
-- ============================================================================

create type lead_status as enum (
  'new',
  'contacted',
  'meeting_scheduled',
  'pitched',
  'won',
  'lost',
  'no_response',
  'unqualified'
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  place_id text not null,                       -- Google Places place_id
  name text not null,
  category text,
  address text,
  city text,
  state text default 'VA',
  zip text,
  rating real,
  review_count integer,
  has_website boolean,
  has_gbp_posts_last_30d boolean,
  fb_handle text,
  ig_handle text,
  ig_last_post_days_ago integer,
  ig_followers_bucket text,                     -- '0-200' | '200-500' | '500-2000' | '2000+'
  score integer not null,
  score_breakdown jsonb not null default '{}'::jsonb,
  outreach_script text,
  owner_name_guess text,
  best_outreach_channel text,                   -- 'in-person' | 'whatsapp' | 'ig-dm'
  status lead_status not null default 'new',
  notes text,
  contacted_at timestamptz,
  last_visited_at timestamptz,
  converted_client_id uuid references clients(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index leads_place_id_uniq on leads (place_id);
create index leads_status_score_idx on leads (status, score desc);

-- ============================================================================
-- updated_at triggers
-- ============================================================================

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger clients_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger brand_profiles_updated_at before update on brand_profiles
  for each row execute function set_updated_at();
create trigger campaigns_updated_at before update on campaigns
  for each row execute function set_updated_at();
create trigger campaign_assets_updated_at before update on campaign_assets
  for each row execute function set_updated_at();
create trigger leads_updated_at before update on leads
  for each row execute function set_updated_at();

-- ============================================================================
-- Row-level security
-- v1: service role only (backend writes). No client-side reads.
-- When we add a client-facing dashboard later, add policies per table.
-- ============================================================================

alter table clients enable row level security;
alter table brand_profiles enable row level security;
alter table monthly_intakes enable row level security;
alter table campaigns enable row level security;
alter table campaign_assets enable row level security;
alter table leads enable row level security;
