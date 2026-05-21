-- Esegui una sola volta sui progetti Supabase già esistenti.
-- Mantiene il codice tecnico "admin" per compatibilità, ma mostra il profilo come "Master".

update public.roles
set
  name = 'Master',
  description = 'Gestione completa del programma'
where code = 'admin';
