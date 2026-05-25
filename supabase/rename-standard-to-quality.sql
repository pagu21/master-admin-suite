update public.programs
set
  name = 'Quality Pilot',
  description = 'Standard operativi e controllo qualità.',
  login_url = 'https://qualitypilot.vercel.app/login'
where slug = 'standard-pilot';

update public.plans
set name = 'Quality Pilot demo'
where code = 'standard-free';
