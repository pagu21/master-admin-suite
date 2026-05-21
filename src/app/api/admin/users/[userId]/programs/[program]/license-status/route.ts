import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LicenseStatus, ProgramSlug } from "@/lib/master-data";

type UpdateLicenseStatusPayload = {
  status?: LicenseStatus;
};

const validStatuses: LicenseStatus[] = ["active", "pending", "expired", "suspended"];
const validPrograms: ProgramSlug[] = ["margin-pilot", "launch-pilot", "standard-pilot"];

function hasServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function createAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return { error: NextResponse.json({ error: "Sessione admin non valida." }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: currentProfile, error: currentProfileError } = await admin
    .from("profiles")
    .select("id,email,is_admin,is_super_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if (currentProfileError || (!currentProfile?.is_admin && !currentProfile?.is_super_admin) || currentProfile.status !== "active") {
    return { error: NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 }) };
  }

  return { admin, currentUser };
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ userId: string; program: string }> }
) {
  if (!hasServerConfig()) {
    return NextResponse.json({ error: "Configurazione Supabase incompleta." }, { status: 500 });
  }

  const payload = (await request.json().catch(() => null)) as UpdateLicenseStatusPayload | null;
  if (!payload?.status || !validStatuses.includes(payload.status)) {
    return NextResponse.json({ error: "Stato licenza non valido." }, { status: 400 });
  }

  const adminContext = await requireAdmin();
  if ("error" in adminContext) return adminContext.error;

  const { userId, program: rawProgram } = await context.params;
  if (!validPrograms.includes(rawProgram as ProgramSlug)) {
    return NextResponse.json({ error: "Programma non valido." }, { status: 400 });
  }

  const program = rawProgram as ProgramSlug;
  const { admin, currentUser } = adminContext;

  const { data: programRow } = await admin
    .from("programs")
    .select("id,slug")
    .eq("slug", program)
    .maybeSingle();

  if (!programRow) {
    return NextResponse.json({ error: "Programma non trovato." }, { status: 404 });
  }

  const { data: access, error: accessError } = await admin
    .from("user_program_access")
    .select("id")
    .eq("user_id", userId)
    .eq("program_id", programRow.id)
    .maybeSingle();

  if (accessError || !access) {
    return NextResponse.json({ error: "Accesso programma non trovato." }, { status: 404 });
  }

  const { data: license, error: licenseError } = await admin
    .from("licenses")
    .select("id")
    .eq("user_program_access_id", access.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (licenseError || !license) {
    return NextResponse.json({ error: "Licenza non trovata." }, { status: 404 });
  }

  const { error: updateLicenseError } = await admin
    .from("licenses")
    .update({ status: payload.status })
    .eq("id", license.id);

  if (updateLicenseError) {
    return NextResponse.json({ error: updateLicenseError.message }, { status: 400 });
  }

  const { error: updateAccessError } = await admin
    .from("user_program_access")
    .update({ active: payload.status === "active" })
    .eq("id", access.id);

  if (updateAccessError) {
    return NextResponse.json({ error: updateAccessError.message }, { status: 400 });
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "update_license_status",
    entity_type: "license",
    entity_id: license.id,
    metadata: {
      user_id: userId,
      program,
      status: payload.status
    }
  });

  return NextResponse.json({ success: true });
}
