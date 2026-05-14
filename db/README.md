# db/ — Supabase schema + seed data

## Layout

```
db/
├── migrations/
│   └── 0001_initial.sql    # Tables: clients, brand_profiles, monthly_intakes,
│                           # campaigns, campaign_assets, leads. Per CLAUDE.md §6.
└── seed/
    ├── aditis-kitchen.sql
    └── aditis-spice-depot.sql
```

## Apply migrations

Once we wire Supabase to Railway, migrations run via `supabase db push`.

For local dev today:

```bash
psql "$DATABASE_URL" -f db/migrations/0001_initial.sql
psql "$DATABASE_URL" -f db/seed/aditis-kitchen.sql
psql "$DATABASE_URL" -f db/seed/aditis-spice-depot.sql
```

## Conventions

- All FKs root to `clients.id` (cascade on delete).
- Timestamps as `timestamptz` with `default now()`; `updated_at` maintained by trigger.
- Soft-delete via `deleted_at` (nullable) — no hard DELETE on production tables.
- JSONB for flexible blobs (brand_profile, payload, locations).
- Row-level security ON; service role only in v1 (backend is the sole writer).
- Enums for status / channel fields (Postgres-native, type-safe).

## Why not Drizzle / Prisma yet

CLAUDE.md §11: no premature abstractions. Three migrations is fine without
an ORM. We add Drizzle when there's a query the raw SQL client can't
express cleanly (typically around the 5th-6th migration).

## Where Meta tokens live

`clients.meta_page_access_token` (per-client, long-lived).
Refreshed by a weekly background job that pings `/me` and re-OAuths on 401.
The api/src/services/meta/ client reads per-client tokens at dispatch
time once Supabase is wired — until then it falls back to `.env`.
