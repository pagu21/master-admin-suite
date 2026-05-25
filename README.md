# Master Admin Suite

Pannello amministrativo centrale indipendente per l'ecosistema Pilot:

- Margin Pilot
- Launch Pilot
- Quality Pilot

Il progetto gestisce utenti, programmi, ruoli, licenze, piani commerciali, pagamenti, fatturazione, CRM e audit logs. I software restano separati e consultano Supabase per verificare accessi e licenze.

## Struttura

```text
MasterAdminSuite/
  src/app/
    page.tsx                 # Homepage pubblica prodotti
    login/page.tsx           # Login riservato
    admin/page.tsx           # Pannello amministrativo
    globals.css
  src/components/admin/
    admin-suite.tsx          # UI amministrativa
  src/lib/
    master-data.ts           # Tipi, dati demo e helper
    supabase/
      client.ts
      server.ts
  supabase/
    schema.sql               # Database, RLS, grant, funzioni, seed
```

## Variabili ambiente

Copia `.env.example` in `.env.local` e configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MARGIN_PILOT_LOGIN=
NEXT_PUBLIC_LAUNCH_PILOT_LOGIN=
NEXT_PUBLIC_QUALITY_PILOT_LOGIN=
```

## Installazione

```bash
npm install
npm run dev
```

Il progetto parte su:

```text
http://127.0.0.1:3004/
```

## Supabase

1. Crea un progetto Supabase dedicato al Master Admin.
2. Apri SQL Editor.
3. Esegui `supabase/schema.sql`.
4. Crea l'utente amministratore con Supabase Auth.
5. Imposta `profiles.is_admin = true` per l'utente admin.

## Collegamento con gli altri software

Margin Pilot, Launch Pilot e Quality Pilot dovranno leggere:

- `programs`
- `user_program_access`
- `licenses`
- `projects`
- funzione `has_valid_program_access(program_slug)`
- funzione `can_create_project(program_slug)`

In Launch Pilot, quando l'utente crea un progetto, va verificato `can_create_project('launch-pilot')`.
Per licenze a pacchetto, dopo la creazione va incrementato `licenses.projects_used`.

## Deploy Vercel

1. Crea repository Git.
2. Collega il progetto a Vercel.
3. Inserisci le env variables.
4. Deploy.

Il pannello admin è protetto da middleware Supabase Auth. Le policy RLS impediscono accessi non autorizzati lato database.
