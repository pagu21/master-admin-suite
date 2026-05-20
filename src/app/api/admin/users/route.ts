import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { licenseLabel, programName, remainingProjects, type AdminUser, type LicenseType, type ProgramSlug } from "@/lib/master-data";

type CreateUserPayload = {
  fullName: string;
  email: string;
  password: string;
  company?: string;
  city?: string;
  program: ProgramSlug;
  role: "admin" | "consulente" | "ristoratore" | "utente";
  licenseType: LicenseType;
  startDate: string;
  endDate?: string;
  projectsPurchased?: number | null;
  notes?: string;
};

function hasServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function licenseProjects(type: LicenseType, explicitValue?: number | null) {
  if (explicitValue) return explicitValue;
  if (type === "project_pack_1") return 1;
  if (type === "project_pack_3") return 3;
  if (type === "project_pack_5") return 5;
  return null;
}

export async function POST(request: Request) {
  if (!hasServerConfig()) {
    return NextResponse.json(
      { error: "Configurazione Supabase incompleta. Aggiungi SUPABASE_SERVICE_ROLE_KEY su Vercel." },
      { status: 500 }
    );
  }

  const payload = (await request.json().catch(() => null)) as CreateUserPayload | null;
  if (!payload?.email || !payload.password || !payload.fullName || !payload.program || !payload.role || !payload.licenseType) {
    return NextResponse.json({ error: "Dati utente incompleti." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Sessione admin non valida." }, { status: 401 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: currentProfile, error: currentProfileError } = await admin
    .from("profiles")
    .select("id,is_admin,status")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (currentProfileError || !currentProfile?.is_admin || currentProfile.status !== "active") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 });
  }

  const { data: authResult, error: authError } = await admin.auth.admin.createUser({
    email: payload.email,
    password: payload.password,
    email_confirm: true,
    user_metadata: {
      full_name: payload.fullName
    }
  });

  if (authError || !authResult.user) {
    return NextResponse.json({ error: authError?.message || "Creazione utente non riuscita." }, { status: 400 });
  }

  const userId = authResult.user.id;
  const projectsPurchased = licenseProjects(payload.licenseType, payload.projectsPurchased);

  const { data: program, error: programError } = await admin
    .from("programs")
    .select("id,slug")
    .eq("slug", payload.program)
    .maybeSingle();

  if (programError || !program) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: "Programma non trovato nel database centrale." }, { status: 400 });
  }

  const { data: role } = await admin
    .from("roles")
    .select("id")
    .eq("program_id", program.id)
    .eq("code", payload.role)
    .maybeSingle();

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: payload.email,
    full_name: payload.fullName,
    company: payload.company || null,
    city: payload.city || null,
    status: payload.licenseType === "suspended" ? "suspended" : "active",
    is_admin: payload.role === "admin"
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { data: access, error: accessError } = await admin
    .from("user_program_access")
    .insert({
      user_id: userId,
      program_id: program.id,
      role_id: role?.id || null,
      active: payload.licenseType !== "suspended"
    })
    .select("id")
    .single();

  if (accessError || !access) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: accessError?.message || "Accesso programma non creato." }, { status: 400 });
  }

  const { error: licenseError } = await admin.from("licenses").insert({
    user_program_access_id: access.id,
    type: payload.licenseType,
    status: payload.licenseType === "suspended" ? "suspended" : "active",
    start_date: payload.startDate,
    end_date: payload.endDate || null,
    projects_purchased: projectsPurchased,
    projects_used: 0,
    notes: payload.notes || null
  });

  if (licenseError) {
    await admin.auth.admin.deleteUser(userId);
    return NextResponse.json({ error: licenseError.message }, { status: 400 });
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "create_user",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: payload.email,
      program: payload.program,
      role: payload.role,
      licenseType: payload.licenseType
    }
  });

  const createdUser: AdminUser = {
    id: userId,
    name: payload.fullName,
    email: payload.email,
    company: payload.company || "-",
    city: payload.city || "-",
    status: payload.licenseType === "suspended" ? "suspended" : "active",
    lastAccess: "Mai",
    accesses: [
      {
        program: payload.program,
        role: payload.role,
        licenseType: payload.licenseType,
        licenseStatus: payload.licenseType === "suspended" ? "suspended" : "active",
        projectsPurchased: projectsPurchased ?? undefined,
        projectsUsed: 0,
        startDate: payload.startDate,
        endDate: payload.endDate || undefined
      }
    ]
  };

  return NextResponse.json({
    user: createdUser,
    summary: `${createdUser.name} creato per ${programName(payload.program)} con licenza ${licenseLabel(payload.licenseType)}.`,
    remainingProjects: remainingProjects(createdUser.accesses[0])
  });
}
