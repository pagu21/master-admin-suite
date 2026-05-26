update public.programs
set
  name = 'Quality Pilot',
  slug = 'quality-pilot',
  description = 'Quality intelligence, audit e controllo esperienza cliente.',
  login_url = 'https://quality-pilot.vercel.app/login'
where slug = 'standard-pilot';

update public.plans
set
  program_id = (select id from public.programs where slug = 'quality-pilot'),
  code = 'quality-free',
  name = 'Quality Pilot demo',
  active = true
where code = 'standard-free';
