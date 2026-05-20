alter table public.profiles
  add column if not exists is_super_admin boolean not null default false;

insert into public.profiles (id, email, full_name, is_admin, is_super_admin, status)
select id, email, coalesce(raw_user_meta_data->>'full_name', email), true, true, 'active'
from auth.users
where lower(email) = lower('guidipaolo2@gmail.com')
on conflict (id) do update set
  is_admin = true,
  is_super_admin = true,
  status = 'active',
  email = excluded.email,
  full_name = excluded.full_name;

with master_user as (
  select id from public.profiles where lower(email) = lower('guidipaolo2@gmail.com')
),
admin_roles as (
  select distinct on (program_id) program_id, id as role_id
  from public.roles
  where code in ('admin', 'master')
  order by program_id, case when code = 'admin' then 0 else 1 end
),
upsert_access as (
  insert into public.user_program_access (user_id, program_id, role_id, active)
  select master_user.id, programs.id, admin_roles.role_id, true
  from master_user
  cross join public.programs
  left join admin_roles on admin_roles.program_id = programs.id
  on conflict (user_id, program_id) do update set
    role_id = excluded.role_id,
    active = true
  returning id
)
insert into public.licenses (
  user_program_access_id,
  type,
  status,
  start_date,
  end_date,
  projects_purchased,
  projects_used,
  notes
)
select id, 'free', 'active', current_date, null, null, 0, 'Licenza master globale'
from upsert_access
on conflict do nothing;
