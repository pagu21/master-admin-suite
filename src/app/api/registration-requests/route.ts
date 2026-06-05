import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RegistrationRequestPayload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  programs?: string[];
  profile?: string;
  license?: string;
  notes?: string;
  privacyAccepted?: boolean;
  dataAccepted?: boolean;
  contractAccepted?: boolean;
  marketingAccepted?: boolean;
};

function hasServerConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

function cleanText(value?: string) {
  return (value ?? "").trim();
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as RegistrationRequestPayload | null;

  const firstName = cleanText(payload?.firstName);
  const lastName = cleanText(payload?.lastName);
  const email = cleanText(payload?.email).toLowerCase();
  const company = cleanText(payload?.company);
  const programs = Array.isArray(payload?.programs) ? payload.programs.filter(Boolean) : [];

  if (!firstName || !lastName || !email || !company || programs.length === 0) {
    return NextResponse.json({ error: "Compila nome, cognome, email, azienda e almeno un programma." }, { status: 400 });
  }

  if (!isEmail(email)) {
    return NextResponse.json({ error: "Inserisci una email valida." }, { status: 400 });
  }

  if (!payload?.privacyAccepted || !payload?.dataAccepted || !payload?.contractAccepted) {
    return NextResponse.json({ error: "Per inviare la richiesta devi accettare privacy, trattamento dati e documentazione contrattuale." }, { status: 400 });
  }

  if (!hasServerConfig()) {
    return NextResponse.json({ error: "Registrazione non disponibile: configurazione Supabase incompleta." }, { status: 500 });
  }

  const admin = createAdminClient();
  const metadata = {
    type: "richiesta_registrazione",
    programs,
    profile: cleanText(payload.profile),
    license: cleanText(payload.license),
    notes: cleanText(payload.notes),
    privacyAccepted: Boolean(payload.privacyAccepted),
    dataAccepted: Boolean(payload.dataAccepted),
    contractAccepted: Boolean(payload.contractAccepted),
    marketingAccepted: Boolean(payload.marketingAccepted)
  };

  const { data: firstProgram } = await admin.from("programs").select("id").eq("name", programs[0]).maybeSingle();

  const { error } = await admin.from("contacts").insert({
    first_name: firstName,
    last_name: lastName,
    email,
    phone: cleanText(payload.phone),
    company,
    city: cleanText(payload.city),
    interested_program_id: firstProgram?.id ?? null,
    status: "nuovo",
    notes: JSON.stringify(metadata)
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (payload.marketingAccepted) {
    await admin.from("mailing_contacts").upsert(
      {
        nome: firstName,
        cognome: lastName,
        email,
        telefono: cleanText(payload.phone),
        azienda_ristorante: company,
        ruolo: cleanText(payload.profile).toLowerCase().includes("consulente") ? "consulente" : "ristoratore",
        programma_interessato: programs[0] || "Altro",
        stato: "lead",
        consenso_marketing: true,
        fonte_contatto: "sito_web",
        tag: programs.join(", "),
        note: cleanText(payload.notes)
      },
      { onConflict: "email" }
    );
  }

  return NextResponse.json({ ok: true });
}
