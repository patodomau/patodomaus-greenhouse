-- Patodomau's Greenhouse schema.
-- Intended for the same Postgres/Neon infrastructure used by Padaria, while
-- keeping Greenhouse data isolated under its own schema.

create schema if not exists greenhouse;

create extension if not exists pgcrypto;

create table if not exists greenhouse.plant_varieties (
  graphic_id integer not null,
  label text not null,
  name text not null,
  source_text text not null,
  origin text not null,
  origin_rank integer not null,
  origin_tone text not null,
  seed_hue text not null,
  special_hue text,
  image_path text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key (graphic_id, label)
);

create table if not exists greenhouse.plant_inventory_snapshots (
  id uuid primary key default gen_random_uuid(),
  captured_at timestamptz not null default now(),
  source_journal text,
  source_csv text,
  note text
);

create table if not exists greenhouse.plant_inventory_entries (
  snapshot_id uuid not null references greenhouse.plant_inventory_snapshots(id) on delete cascade,
  serial text not null,
  container_serial text,
  run_number integer,
  graphic_id integer not null,
  label text not null,
  quantity integer not null default 1,
  primary key (snapshot_id, serial),
  foreign key (graphic_id, label) references greenhouse.plant_varieties(graphic_id, label)
);

create index if not exists plant_inventory_entries_lookup_idx
  on greenhouse.plant_inventory_entries (graphic_id, label);

create table if not exists greenhouse.plant_discovery_queue (
  id bigserial primary key,
  graphic_id integer not null,
  label text,
  source text not null default 'manual',
  status text not null default 'new',
  note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint plant_discovery_queue_status_check
    check (status in ('new', 'classified', 'ignored'))
);

create unique index if not exists plant_discovery_queue_unique_idx
  on greenhouse.plant_discovery_queue (graphic_id, coalesce(label, ''));

create or replace view greenhouse.plant_collection_current as
with latest_snapshot as (
  select id
  from greenhouse.plant_inventory_snapshots
  order by captured_at desc, id desc
  limit 1
)
select
  entry.graphic_id,
  entry.label,
  variety.name,
  variety.source_text,
  variety.origin,
  variety.origin_rank,
  variety.origin_tone,
  variety.seed_hue,
  variety.special_hue,
  variety.image_path,
  sum(entry.quantity)::integer as quantity,
  count(distinct entry.container_serial)::integer as containers
from greenhouse.plant_inventory_entries entry
join latest_snapshot on latest_snapshot.id = entry.snapshot_id
join greenhouse.plant_varieties variety
  on variety.graphic_id = entry.graphic_id
  and variety.label = entry.label
group by
  entry.graphic_id,
  entry.label,
  variety.name,
  variety.source_text,
  variety.origin,
  variety.origin_rank,
  variety.origin_tone,
  variety.seed_hue,
  variety.special_hue,
  variety.image_path;
