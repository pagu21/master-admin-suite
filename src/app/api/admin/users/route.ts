import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { licenseLabel, programName, remainingProjects, type AdminUser, type LicenseType, type ProgramSlug } from "@/lib/master-data";

type CreateUserPayload = {
  mode?: "new" | "existing";
  existingUserId?: string;
  fullName: string;
  email: string;
  password?: string;
  company?: string;
  city?: string;
  program: ProgramSlug;
  role: "admin" | "consulente" | "ristoratore" | "utente";
  licenseType: LicenseType;
  startDate: string;
  endDate?: string;
  projectsPurchased?: number | null;
  permissionProfile?: "completo" | "operativo" | "limitato" | "personalizzato";
  notes?: string;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  city: string | null;
  status: "active" | "suspended" | "deleted";
  last_login_at: string | null;
  user_program_access?: Array<{
    active: boolean;
    programs: { slug: ProgramSlug } | null;
    roles: { code: "admin" | "consulente" | "ristoratore" | "utente" } | null;
    licenses?: Array<{
      type: LicenseType;
      status: "active" | "expired" | "suspended" | "pending";
      start_date: string;
      end_date: string | null;
      projects_purchased: number | null;
      projects_used: number;
    }>;
  }>;
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
    .select("id,email,is_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if (currentProfileError || !currentProfile?.is_admin || currentProfile.status !== "active") {
    return {
      error: NextResponse.json(
        {
          error: `Accesso non autorizzato. Utente sessione: ${currentUser.email ?? currentUser.id}. Profilo admin trovato: ${currentProfile?.email ?? "no"}.`
        },
        { status: 403 }
      )
    };
  }

  return { admin, currentUser };
}

export async function GET() {
  if (!hasServerConfig()) {
    return NextResponse.json({ users: [] });
  }

  const context = await requireAdmin();
  if ("error" in context) return context.error;

  const { data, error } = await context.admin
    .from("profiles")
    .select(`
      id,
      email,
      full_name,
      company,
      city,
      status,
      last_login_at,
      user_program_access (
        active,
        programs ( slug ),
        roles ( code ),
        licenses (
          type,
          status,
          start_date,
          end_date,
          projects_purchased,
          projects_used
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const users: AdminUser[] = ((data ?? []) as ProfileRow[]).map((row) => ({
    id: row.id,
    name: row.full_name || row.email,
    email: row.email,
    company: row.company || "-",
    city: row.city || "-",
    status: row.status === "suspended" ? "suspended" : "active",
    lastAccess: row.last_login_at ? new Date(row.last_login_at).toLocaleString("it-IT") : "Mai",
    accesses: (row.user_program_access ?? [])
      .filter((access) => access.programs?.slug)
      .flatMap((access) => {
        const license = access.licenses?.[0];
        return [{
          program: access.programs!.slug,
          role: access.roles?.code || "utente",
          licenseType: license?.type || "free",
          licenseStatus: license?.status || (access.active ? "active" : "suspended"),
          projectsPurchased: license?.projects_purchased ?? undefined,
          projectsUsed: license?.projects_used ?? 0,
          startDate: license?.start_date || "",
          endDate: license?.end_date || undefined
        }];
      })
  }));

  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  if (!hasServerConfig()) {
    return NextResponse.json(
      { error: "Configurazione Supabase incompleta. Aggiungi SUPABASE_SERVICE_ROLE_KEY su Vercel." },
      { status: 500 }
    );
  }

  const payload = (await request.json().catch(() => null)) as CreateUserPayload | null;
  if (!payload?.email || !payload.fullName || !payload.program || !payload.role || !payload.licenseType) {
    return NextResponse.json({ error: "Dati utente incompleti." }, { status: 400 });
  }

  if ((payload.mode ?? "new") === "new" && !payload.password) {
    return NextResponse.json({ error: "La password iniziale e obbligatoria per un nuovo utente." }, { status: 400 });
  }

  const context = await requireAdmin();
  if ("error" in context) return context.error;
  const { admin, currentUser } = context;

  let userId = payload.existingUserId ?? "";

  if ((payload.mode ?? "new") === "existing") {
    if (!userId) {
      return NextResponse.json({ error: "Seleziona un utente esistente." }, { status: 400 });
    }
  } else {
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

    userId = authResult.user.id;
  }

  const projectsPurchased = licenseProjects(payload.licenseType, payload.projectsPurchased);
  const licenseNotes = [
    payload.notes?.trim(),
    payload.permissionProfile ? `Profilo permessi: ${payload.permissionProfile}` : ""
  ].filter(Boolean).join("\n");

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

  const profilePayload: Record<string, string | boolean | null> = {
    id: userId,
    email: payload.email,
    full_name: payload.fullName,
    company: payload.company || null,
    city: payload.city || null,
    status: payload.licenseType === "suspended" ? "suspended" : "active"
  };

  if ((payload.mode ?? "new") === "new" || payload.role === "admin") {
    profilePayload.is_admin = payload.role === "admin";
  }

  const { error: profileError } = await admin.from("profiles").upsert(profilePayload);

  if (profileError) {
    if ((payload.mode ?? "new") === "new") {
      await admin.auth.admin.deleteUser(userId);
    }
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const { data: access, error: accessError } = await admin
    .from("user_program_access")
    .upsert({
      user_id: userId,
      program_id: program.id,
      role_id: role?.id || null,
      active: payload.licenseType !== "suspended"
    }, { onConflict: "user_id,program_id" })
    .select("id")
    .single();

  if (accessError || !access) {
    if ((payload.mode ?? "new") === "new") {
      await admin.auth.admin.deleteUser(userId);
    }
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
    notes: licenseNotes || null
  });

  if (licenseError) {
    if ((payload.mode ?? "new") === "new") {
      await admin.auth.admin.deleteUser(userId);
    }
    return NextResponse.json({ error: licenseError.message }, { status: 400 });
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: (payload.mode ?? "new") === "existing" ? "assign_program_to_user" : "create_user",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: payload.email,
      program: payload.program,
      role: payload.role,
      licenseType: payload.licenseType,
      permissionProfile: payload.permissionProfile
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
