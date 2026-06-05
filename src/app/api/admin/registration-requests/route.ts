import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { RegistrationRequest } from "@/lib/master-data";

type ContactRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  phone: string | null;
  company: string | null;
  city: string | null;
  status: RegistrationRequest["status"];
  notes: string | null;
  created_at: string;
};

function hasServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: NextResponse.json({ error: "Sessione master non valida." }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: currentProfile } = await admin
    .from("profiles")
    .select("id,email,is_admin,is_super_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if ((!currentProfile?.is_admin && !currentProfile?.is_super_admin) || currentProfile?.status !== "active") {
    return { error: NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 }) };
  }

  return { admin, currentUser };
}

function parseMetadata(notes: string | null) {
  try {
    const parsed = JSON.parse(notes || "{}") as {
      type?: string;
      programs?: string[];
      profile?: string;
      license?: string;
      notes?: string;
      privacyAccepted?: boolean;
      dataAccepted?: boolean;
      contractAccepted?: boolean;
      marketingAccepted?: boolean;
    };
    return parsed;
  } catch {
    return {};
  }
}

function mapContact(row: ContactRow): RegistrationRequest | null {
  const metadata = parseMetadata(row.notes);
  if (metadata.type !== "richiesta_registrazione") return null;

  return {
    id: row.id,
    fullName: [row.first_name, row.last_name].filter(Boolean).join(" ") || row.email,
    email: row.email,
    phone: row.phone || "",
    company: row.company || "",
    city: row.city || "",
    programs: metadata.programs || [],
    profile: metadata.profile || "-",
    license: metadata.license || "-",
    notes: metadata.notes || "",
    privacyAccepted: Boolean(metadata.privacyAccepted),
    dataAccepted: Boolean(metadata.dataAccepted),
    contractAccepted: Boolean(metadata.contractAccepted),
    marketingAccepted: Boolean(metadata.marketingAccepted),
    status: row.status || "nuovo",
    createdAt: row.created_at
  };
}

export async function GET() {
  if (!hasServerConfig()) {
    return NextResponse.json({ requests: [] });
  }

  const context = await requireAdmin();
  if ("error" in context) return context.error;

  const { data, error } = await context.admin
    .from("contacts")
    .select("id,first_name,last_name,email,phone,company,city,status,notes,created_at")
    .ilike("notes", "%richiesta_registrazione%")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const requests = ((data ?? []) as ContactRow[]).map(mapContact).filter(Boolean) as RegistrationRequest[];
  return NextResponse.json({ requests });
}

export async function PUT(request: Request) {
  if (!hasServerConfig()) {
    return NextResponse.json({ error: "Configurazione Supabase incompleta." }, { status: 500 });
  }

  const payload = (await request.json().catch(() => null)) as { id?: string; status?: RegistrationRequest["status"] } | null;
  if (!payload?.id || !payload.status) {
    return NextResponse.json({ error: "Dati mancanti." }, { status: 400 });
  }

  const context = await requireAdmin();
  if ("error" in context) return context.error;

  const { error } = await context.admin.from("contacts").update({ status: payload.status }).eq("id", payload.id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await context.admin.from("audit_logs").insert({
    actor_id: context.currentUser.id,
    action: "registration_request_status_update",
    entity_type: "contact",
    entity_id: payload.id,
    metadata: { status: payload.status }
  });

  return NextResponse.json({ ok: true });
}
