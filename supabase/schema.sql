-- Master Admin Suite - Supabase schema
-- Eseguire nel SQL editor Supabase del progetto centrale.

create extension if not exists "pgcrypto";

do $$ begin
  create type public.profile_status as enum ('active', 'suspended', 'deleted');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.license_type as enum (
    'monthly_subscription',
    'annual_subscription',
    'project_pack_1',
    'project_pack_3',
    'project_pack_5',
    'free',
    'suspended'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.license_status as enum ('active', 'expired', 'suspended', 'pending');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum ('paid', 'pending', 'failed', 'refunded');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.invoice_status as enum ('draft', 'issued', 'paid', 'overdue', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.contact_status as enum ('nuovo', 'contattato', 'interessato', 'cliente', 'sospeso', 'non_interessato');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  company text,
  phone text,
  city text,
  status public.profile_status not null default 'active',
  is_admin boolean not null default false,
  is_super_admin boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  description text,
  login_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references public.programs(id) on delete cascade,
  code text not null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  unique(program_id, code)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.programs(id) on delete cascade,
  code text not null unique,
  name text not null,
  license_type public.license_type not null,
  price numeric(12, 2) not null default 0,
  currency text not null default 'EUR',
  project_limit integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_program_access (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  role_id uuid references public.roles(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, program_id)
);

create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  user_program_access_id uuid not null references public.user_program_access(id) on delete cascade,
  plan_id uuid references public.plans(id) on delete set null,
  type public.license_type not null,
  status public.license_status not null default 'pending',
  start_date date not null default current_date,
  end_date date,
  projects_purchased integer,
  projects_used integer not null default 0,
  projects_remaining integer generated always as (
    case
      when projects_purchased is null then null
      else greatest(projects_purchased - projects_used, 0)
    end
  ) stored,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (projects_purchased is null or projects_purchased >= 0),
  check (projects_used >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  license_id uuid references public.licenses(id) on delete set null,
  amount numeric(12, 2) not null,
  currency text not null default 'EUR',
  method text,
  status public.payment_status not null default 'pending',
  transaction_reference text,
  paid_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  profile_id uuid references public.profiles(id) on delete set null,
  program_id uuid references public.programs(id) on delete set null,
  amount numeric(12, 2) not null,
  vat_amount numeric(12, 2) not null default 0,
  status public.invoice_status not null default 'draft',
  issued_at date,
  paid_at date,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  email text not null,
  phone text,
  company text,
  city text,
  interested_program_id uuid references public.programs(id) on delete set null,
  status public.contact_status not null default 'nuovo',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  program_id uuid not null references public.programs(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  external_project_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists programs_slug_idx on public.programs(slug);
create index if not exists roles_program_id_idx on public.roles(program_id);
create index if not exists access_user_program_idx on public.user_program_access(user_id, program_id);
create index if not exists licenses_access_status_idx on public.licenses(user_program_access_id, status);
create index if not exists payments_profile_status_idx on public.payments(profile_id, status);
create index if not exists invoices_profile_status_idx on public.invoices(profile_id, status);
create index if not exists contacts_status_idx on public.contacts(status);
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists projects_owner_program_idx on public.projects(owner_id, program_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles_updated_at on public.profiles;
create trigger touch_profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();

drop trigger if exists touch_programs_updated_at on public.programs;
create trigger touch_programs_updated_at before update on public.programs for each row execute function public.touch_updated_at();

drop trigger if exists touch_plans_updated_at on public.plans;
create trigger touch_plans_updated_at before update on public.plans for each row execute function public.touch_updated_at();

drop trigger if exists touch_access_updated_at on public.user_program_access;
create trigger touch_access_updated_at before update on public.user_program_access for each row execute function public.touch_updated_at();

drop trigger if exists touch_licenses_updated_at on public.licenses;
create trigger touch_licenses_updated_at before update on public.licenses for each row execute function public.touch_updated_at();

drop trigger if exists touch_projects_updated_at on public.projects;
create trigger touch_projects_updated_at before update on public.projects for each row execute function public.touch_updated_at();

create or replace function public.current_user_is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and (p.is_admin = true or p.is_super_admin = true)
      and p.status = 'active'
  );
$$;

create or replace function public.has_valid_program_access(program_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_program_access upa
    join public.programs pr on pr.id = upa.program_id
    join public.licenses l on l.user_program_access_id = upa.id
    where upa.user_id = auth.uid()
      and pr.slug = program_slug
      and pr.active = true
      and upa.active = true
      and l.status = 'active'
      and l.type <> 'suspended'
      and (l.end_date is null or l.end_date >= current_date)
  );
$$;

create or replace function public.can_create_project(program_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_program_access upa
    join public.programs pr on pr.id = upa.program_id
    join public.licenses l on l.user_program_access_id = upa.id
    where upa.user_id = auth.uid()
      and pr.slug = program_slug
      and public.has_valid_program_access(program_slug)
      and (
        l.projects_purchased is null
        or l.projects_used < l.projects_purchased
      )
  );
$$;

alter table public.profiles enable row level security;
alter table public.programs enable row level security;
alter table public.roles enable row level security;
alter table public.user_program_access enable row level security;
alter table public.licenses enable row level security;
alter table public.plans enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.contacts enable row level security;
alter table public.audit_logs enable row level security;
alter table public.projects enable row level security;

drop policy if exists "profiles admin manage all" on public.profiles;
drop policy if exists "profiles users read own" on public.profiles;
drop policy if exists "programs public read active" on public.programs;
drop policy if exists "programs admin manage" on public.programs;
drop policy if exists "roles admin manage" on public.roles;
drop policy if exists "roles users read assigned" on public.roles;
drop policy if exists "access admin manage" on public.user_program_access;
drop policy if exists "access users read own" on public.user_program_access;
drop policy if exists "licenses admin manage" on public.licenses;
drop policy if exists "licenses users read own" on public.licenses;
drop policy if exists "plans public read active" on public.plans;
drop policy if exists "plans admin manage" on public.plans;
drop policy if exists "payments admin manage" on public.payments;
drop policy if exists "payments users read own" on public.payments;
drop policy if exists "invoices admin manage" on public.invoices;
drop policy if exists "invoices users read own" on public.invoices;
drop policy if exists "contacts public insert" on public.contacts;
drop policy if exists "contacts admin manage" on public.contacts;
drop policy if exists "audit admin read" on public.audit_logs;
drop policy if exists "audit admin insert" on public.audit_logs;
drop policy if exists "projects admin manage" on public.projects;
drop policy if exists "projects users read own" on public.projects;
drop policy if exists "projects users insert if license allows" on public.projects;

create policy "profiles admin manage all" on public.profiles for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "profiles users read own" on public.profiles for select to authenticated using (id = auth.uid());

create policy "programs public read active" on public.programs for select to anon, authenticated using (active = true or public.current_user_is_admin());
create policy "programs admin manage" on public.programs for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "roles admin manage" on public.roles for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "roles users read assigned" on public.roles for select to authenticated using (true);

create policy "access admin manage" on public.user_program_access for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "access users read own" on public.user_program_access for select to authenticated using (user_id = auth.uid());

create policy "licenses admin manage" on public.licenses for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "licenses users read own" on public.licenses for select to authenticated using (
  exists (
    select 1 from public.user_program_access upa
    where upa.id = licenses.user_program_access_id
      and upa.user_id = auth.uid()
  )
);

create policy "plans public read active" on public.plans for select to anon, authenticated using (active = true or public.current_user_is_admin());
create policy "plans admin manage" on public.plans for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "payments admin manage" on public.payments for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "payments users read own" on public.payments for select to authenticated using (profile_id = auth.uid());

create policy "invoices admin manage" on public.invoices for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "invoices users read own" on public.invoices for select to authenticated using (profile_id = auth.uid());

create policy "contacts public insert" on public.contacts for insert to anon, authenticated with check (true);
create policy "contacts admin manage" on public.contacts for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy "audit admin read" on public.audit_logs for select to authenticated using (public.current_user_is_admin());
create policy "audit admin insert" on public.audit_logs for insert to authenticated with check (public.current_user_is_admin());

create policy "projects admin manage" on public.projects for all to authenticated using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy "projects users read own" on public.projects for select to authenticated using (owner_id = auth.uid());
create policy "projects users insert if license allows" on public.projects for insert to authenticated with check (
  owner_id = auth.uid()
  and exists (
    select 1 from public.programs p
    where p.id = projects.program_id
      and public.can_create_project(p.slug)
  )
);

grant usage on schema public to anon, authenticated, service_role;
grant select on public.programs, public.plans to anon;
grant insert on public.contacts to anon;
grant select, insert, update, delete on
  public.profiles,
  public.programs,
  public.roles,
  public.user_program_access,
  public.licenses,
  public.plans,
  public.payments,
  public.invoices,
  public.contacts,
  public.audit_logs,
  public.projects
to authenticated;
grant select, insert, update, delete on
  public.profiles,
  public.programs,
  public.roles,
  public.user_program_access,
  public.licenses,
  public.plans,
  public.payments,
  public.invoices,
  public.contacts,
  public.audit_logs,
  public.projects
to service_role;

insert into public.programs (name, slug, description, login_url, active)
values
  ('Margin Pilot', 'margin-pilot', 'Controllo marginalità, prezzi e profittabilità.', 'http://127.0.0.1:3002/login', true),
  ('Launch Pilot', 'launch-pilot', 'Prefattibilità, business plan e sostenibilità finanziaria.', 'http://127.0.0.1:3003/login', true),
  ('Standard Pilot', 'standard-pilot', 'Standard operativi e procedure.', 'http://127.0.0.1:3005/login', false)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  login_url = excluded.login_url,
  active = excluded.active;

insert into public.roles (program_id, code, name, description)
select p.id, role_code, role_name, role_description
from public.programs p
cross join (
  values
    ('admin', 'Admin', 'Amministrazione programma'),
    ('consulente', 'Consulente', 'Gestione più clienti e progetti'),
    ('ristoratore', 'Ristoratore', 'Gestione dei propri progetti'),
    ('utente', 'Utente', 'Accesso operativo standard')
) as r(role_code, role_name, role_description)
on conflict (program_id, code) do nothing;

insert into public.plans (program_id, code, name, license_type, price, currency, project_limit, active)
select p.id, s.code, s.plan_name, s.license_type::public.license_type, s.price, 'EUR', s.project_limit, s.active
from public.programs p
join (
  values
    ('launch-pilot', 'launch-monthly', 'Launch Pilot mensile', 'monthly_subscription', 89.00, null, true),
    ('launch-pilot', 'launch-annual', 'Launch Pilot annuale', 'annual_subscription', 890.00, null, true),
    ('launch-pilot', 'launch-pack-1', 'Launch Pilot 1 progetto', 'project_pack_1', 99.00, 1, true),
    ('launch-pilot', 'launch-pack-3', 'Launch Pilot 3 progetti', 'project_pack_3', 249.00, 3, true),
    ('launch-pilot', 'launch-pack-5', 'Launch Pilot 5 progetti', 'project_pack_5', 390.00, 5, true),
    ('margin-pilot', 'margin-annual', 'Margin Pilot annuale', 'annual_subscription', 790.00, null, true),
    ('standard-pilot', 'standard-free', 'Standard Pilot demo', 'free', 0.00, 1, false)
) as s(program_slug, code, plan_name, license_type, price, project_limit, active)
on p.slug = s.program_slug
on conflict (code) do update set
  name = excluded.name,
  license_type = excluded.license_type,
  price = excluded.price,
  project_limit = excluded.project_limit,
  active = excluded.active;
