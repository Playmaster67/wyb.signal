-- =============================================================================
-- WYB Signal — Supabase Schema
-- Cole no SQL Editor do Supabase e execute.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Clients (raiz do multi-tenant — cada operador é um client)
-- ---------------------------------------------------------------------------
create table if not exists clients (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  ingest_secret  text not null unique,  -- segredo do webhook GTM SS por cliente
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles (auth.users ↔ clients)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  client_id  uuid not null references clients(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Influencers
-- ---------------------------------------------------------------------------
create table if not exists influencers (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references clients(id),
  name       text not null,
  country    text,
  utm_id     text not null,            -- código opaco de 6 chars, ex: "a3k9f2"
  status     text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  unique (client_id, utm_id)
);

-- ---------------------------------------------------------------------------
-- Affiliate Links
-- ---------------------------------------------------------------------------
create table if not exists affiliate_links (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references clients(id),
  influencer_id uuid not null references influencers(id),
  utm_inf       text not null,          -- = influencer.utm_id (desnormalizado)
  base_url      text not null,
  full_url      text not null,          -- base_url + ?utm_inf=ID
  label         text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events (IMUTÁVEL — sem UPDATE/DELETE)
-- ---------------------------------------------------------------------------
create table if not exists events (
  id                uuid primary key default gen_random_uuid(),
  client_id         uuid not null references clients(id),
  event_type        text not null check (event_type in ('lead', 'ftd', 'redeposit')),
  user_id           text not null,
  utm_inf           text,               -- null = orgânico / sem atribuição
  influencer_id     uuid references influencers(id),  -- null = orgânico
  value_brl         numeric(14,2) not null default 0,
  value_original    numeric(14,2),      -- cold storage, nunca exibido na UI
  currency_original text,               -- cold storage
  deposit_number    integer check (deposit_number > 0),  -- apenas redeposit
  event_ts          timestamptz not null,   -- timestamp do dataLayer (GTM)
  received_at       timestamptz not null default now()
);

-- Dedup: mesmo client/user/tipo/momento = duplicata, ignorar silenciosamente
create unique index if not exists idx_events_dedup
  on events (client_id, user_id, event_type, event_ts);

-- ---------------------------------------------------------------------------
-- Export Logs (auditoria de exportações)
-- ---------------------------------------------------------------------------
create table if not exists export_logs (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references clients(id),
  exported_at timestamptz not null default now(),
  filters     jsonb not null default '{}',
  row_count   integer not null,
  format      text not null check (format in ('csv', 'xlsx'))
);

-- ---------------------------------------------------------------------------
-- Indexes de performance
-- ---------------------------------------------------------------------------
create index if not exists idx_events_client_ts      on events (client_id, event_ts desc);
create index if not exists idx_events_client_type    on events (client_id, event_type, event_ts desc);
create index if not exists idx_events_influencer     on events (influencer_id, event_ts desc);
create index if not exists idx_events_utm            on events (utm_inf);
create index if not exists idx_events_user           on events (client_id, user_id);
create index if not exists idx_influencers_client    on influencers (client_id, status);
create index if not exists idx_links_client          on affiliate_links (client_id, active);
create index if not exists idx_profiles_client       on profiles (client_id);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table clients         enable row level security;
alter table profiles        enable row level security;
alter table influencers     enable row level security;
alter table affiliate_links enable row level security;
alter table events          enable row level security;
alter table export_logs     enable row level security;

-- Helper: retorna o client_id do usuário autenticado
create or replace function get_my_client_id()
returns uuid
language sql stable security definer
as $$
  select client_id from profiles where id = auth.uid()
$$;

-- Clients: usuário vê apenas o próprio client
drop policy if exists "clients_select" on clients;
create policy "clients_select" on clients
  for select using (id = get_my_client_id());

-- Profiles: usuário vê apenas o próprio perfil
drop policy if exists "profiles_select" on profiles;
create policy "profiles_select" on profiles
  for select using (id = auth.uid());

-- Influencers
drop policy if exists "influencers_select" on influencers;
create policy "influencers_select" on influencers
  for select using (client_id = get_my_client_id());

drop policy if exists "influencers_insert" on influencers;
create policy "influencers_insert" on influencers
  for insert with check (client_id = get_my_client_id());

drop policy if exists "influencers_update" on influencers;
create policy "influencers_update" on influencers
  for update using (client_id = get_my_client_id());
  -- Sem DELETE — soft delete via status

-- Affiliate links
drop policy if exists "links_select" on affiliate_links;
create policy "links_select" on affiliate_links
  for select using (client_id = get_my_client_id());

drop policy if exists "links_insert" on affiliate_links;
create policy "links_insert" on affiliate_links
  for insert with check (client_id = get_my_client_id());

drop policy if exists "links_update" on affiliate_links;
create policy "links_update" on affiliate_links
  for update using (client_id = get_my_client_id());

-- Events: usuários leem, ingestão usa service_role (bypassa RLS)
drop policy if exists "events_select" on events;
create policy "events_select" on events
  for select using (client_id = get_my_client_id());
  -- Sem insert/update/delete para usuários autenticados

-- Export logs
drop policy if exists "export_logs_select" on export_logs;
create policy "export_logs_select" on export_logs
  for select using (client_id = get_my_client_id());

drop policy if exists "export_logs_insert" on export_logs;
create policy "export_logs_insert" on export_logs
  for insert with check (client_id = get_my_client_id());

-- ---------------------------------------------------------------------------
-- Seed inicial: criar o primeiro client
-- Substitua 'dios.bet' e o segredo antes de executar.
-- ---------------------------------------------------------------------------
-- insert into clients (name, ingest_secret)
-- values ('dios.bet', 'wyb_' || encode(gen_random_bytes(24), 'base64'));
--
-- Depois rode:
-- select id, name, ingest_secret from clients;
-- Guarde o id e o ingest_secret — você vai precisar dos dois.
