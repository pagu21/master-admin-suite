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
  permissionProfile?: "completo" | "operativo" | "budget" | "limitato" | "personalizzato";
  marginAccessConfig?: unknown;
  notes?: string;
};

type ProgramAssignmentPayload = {
  enabled: boolean;
  program: ProgramSlug;
  role: "admin" | "consulente" | "ristoratore" | "utente";
  licenseType: LicenseType;
  startDate: string;
  endDate?: string;
  projectsPurchased?: number | null;
  permissionProfile?: "completo" | "operativo" | "budget" | "limitato" | "personalizzato";
  marginAccessConfig?: unknown;
  notes?: string;
};

type MultiProgramPayload = Omit<CreateUserPayload, "program" | "role" | "licenseType" | "startDate" | "endDate" | "projectsPurchased" | "permissionProfile"> & {
  assignments?: ProgramAssignmentPayload[];
};

type RelationOne<T> = T | T[] | null;

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  city: string | null;
  is_admin: boolean | null;
  is_super_admin: boolean | null;
  status: "active" | "suspended" | "deleted";
  last_login_at: string | null;
  user_program_access?: Array<{
    active: boolean;
    programs: RelationOne<{ slug: ProgramSlug }>;
    roles: RelationOne<{ code: "admin" | "consulente" | "ristoratore" | "utente" }>;
    licenses?: Array<{
      type: LicenseType;
      status: "active" | "expired" | "suspended" | "pending";
      start_date: string;
      end_date: string | null;
      projects_purchased: number | null;
      projects_used: number;
      notes: string | null;
      created_at: string;
    }>;
  }>;
};

function firstRelation<T>(value: RelationOne<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

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

const DEMO_LICENSE_DAYS = 15;

function addDaysIso(date: string, days: number) {
  const base = new Date(`${date || new Date().toISOString().slice(0, 10)}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;
  base.setDate(base.getDate() + days);
  return base.toISOString().slice(0, 10);
}

function resolveEndDate(assignment: { licenseType: LicenseType; startDate: string; endDate?: string }) {
  if (assignment.endDate) return assignment.endDate;
  if (assignment.licenseType === "free") return addDaysIso(assignment.startDate, DEMO_LICENSE_DAYS);
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
    return { error: NextResponse.json({ error: "Sessione master non valida." }, { status: 401 }) };
  }

  const admin = createAdminClient();
  const { data: currentProfile, error: currentProfileError } = await admin
    .from("profiles")
    .select("id,email,is_admin,is_super_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if (currentProfileError || (!currentProfile?.is_admin && !currentProfile?.is_super_admin) || currentProfile.status !== "active") {
    return {
      error: NextResponse.json(
        {
          error: `Accesso non autorizzato. Utente sessione: ${currentUser.email ?? currentUser.id}. Profilo master trovato: ${currentProfile?.email ?? "no"}.`
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
      is_admin,
      is_super_admin,
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
          projects_used,
          notes,
          created_at
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const users: AdminUser[] = ((data ?? []) as unknown as ProfileRow[]).map((row) => ({
    id: row.id,
    name: row.full_name || row.email,
    email: row.email,
    company: row.company || "-",
    city: row.city || "-",
    isAdmin: Boolean(row.is_admin),
    isSuperAdmin: Boolean(row.is_super_admin),
    status: row.status === "suspended" ? "suspended" : "active",
    lastAccess: row.last_login_at ? new Date(row.last_login_at).toLocaleString("it-IT") : "Mai",
    accesses: (row.user_program_access ?? [])
      .flatMap((access) => {
        const program = firstRelation(access.programs);
        const role = firstRelation(access.roles);
        if (!program?.slug) return [];
        const license = [...(access.licenses ?? [])].sort((left, right) => {
          return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
        })[0];
        return [{
          program: program.slug,
          role: role?.code || "utente",
          licenseType: license?.type || "free",
          licenseStatus: license?.status || (access.active ? "active" : "suspended"),
          projectsPurchased: license?.projects_purchased ?? undefined,
          projectsUsed: license?.projects_used ?? 0,
          startDate: license?.start_date || "",
          endDate: license?.end_date || undefined,
          notes: license?.notes || undefined,
          createdAt: license?.created_at
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

  const payload = (await request.json().catch(() => null)) as MultiProgramPayload | null;
  const assignments = (payload?.assignments?.length ? payload.assignments : payload && "program" in payload ? [{
    enabled: true,
    program: (payload as CreateUserPayload).program,
    role: (payload as CreateUserPayload).role,
    licenseType: (payload as CreateUserPayload).licenseType,
    startDate: (payload as CreateUserPayload).startDate,
    endDate: (payload as CreateUserPayload).endDate,
    projectsPurchased: (payload as CreateUserPayload).projectsPurchased,
    permissionProfile: (payload as CreateUserPayload).permissionProfile,
    marginAccessConfig: (payload as CreateUserPayload).marginAccessConfig,
    notes: payload.notes
  }] : []).filter((assignment) => assignment.enabled);

  if (!payload?.email || !payload.fullName || assignments.length === 0) {
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

  const hasAdminRole = assignments.some((assignment) => assignment.role === "admin");
  const hasSuspendedOnly = assignments.every((assignment) => assignment.licenseType === "suspended");

  const profilePayload: Record<string, string | boolean | null> = {
    id: userId,
    email: payload.email,
    full_name: payload.fullName,
    company: payload.company || null,
    city: payload.city || null,
    status: hasSuspendedOnly ? "suspended" : "active"
  };

  if ((payload.mode ?? "new") === "new" || hasAdminRole) {
    profilePayload.is_admin = hasAdminRole;
  }

  const { error: profileError } = await admin.from("profiles").upsert(profilePayload);

  if (profileError) {
    if ((payload.mode ?? "new") === "new") {
      await admin.auth.admin.deleteUser(userId);
    }
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  const createdAccesses: AdminUser["accesses"] = [];

  for (const assignment of assignments) {
    const projectsPurchased = licenseProjects(assignment.licenseType, assignment.projectsPurchased);
    const endDate = resolveEndDate(assignment);
    const licenseNotes = [
      assignment.notes?.trim(),
      assignment.permissionProfile ? `Profilo permessi: ${assignment.permissionProfile}` : "",
      assignment.program === "margin-pilot" && assignment.marginAccessConfig
        ? `[MARGINPILOT_ACCESS_CONFIG]${JSON.stringify(assignment.marginAccessConfig)}`
        : ""
    ].filter(Boolean).join("\n");

    const { data: program, error: programError } = await admin
      .from("programs")
      .select("id,slug")
      .eq("slug", assignment.program)
      .maybeSingle();

    if (programError || !program) {
      if ((payload.mode ?? "new") === "new") {
        await admin.auth.admin.deleteUser(userId);
      }
      return NextResponse.json({ error: `Programma non trovato: ${assignment.program}` }, { status: 400 });
    }

    const { data: role } = await admin
      .from("roles")
      .select("id")
      .eq("program_id", program.id)
      .eq("code", assignment.role)
      .maybeSingle();

    const { data: access, error: accessError } = await admin
      .from("user_program_access")
      .upsert({
        user_id: userId,
        program_id: program.id,
        role_id: role?.id || null,
        active: assignment.licenseType !== "suspended"
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
      type: assignment.licenseType,
      status: assignment.licenseType === "suspended" ? "suspended" : "active",
      start_date: assignment.startDate,
      end_date: endDate,
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

    createdAccesses.push({
      program: assignment.program,
      role: assignment.role,
      licenseType: assignment.licenseType,
      licenseStatus: assignment.licenseType === "suspended" ? "suspended" : "active",
      projectsPurchased: projectsPurchased ?? undefined,
      projectsUsed: 0,
      startDate: assignment.startDate,
      endDate: endDate || undefined
    });
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: (payload.mode ?? "new") === "existing" ? "assign_program_to_user" : "create_user",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: payload.email,
      assignments
    }
  });

  const createdUser: AdminUser = {
    id: userId,
    name: payload.fullName,
    email: payload.email,
    company: payload.company || "-",
    city: payload.city || "-",
    status: hasSuspendedOnly ? "suspended" : "active",
    lastAccess: "Mai",
    accesses: createdAccesses
  };

  return NextResponse.json({
    user: createdUser,
    summary: `${createdUser.name} aggiornato per ${createdAccesses.map((access) => programName(access.program)).join(", ")}.`,
    remainingProjects: createdUser.accesses.map((access) => ({
      program: access.program,
      license: licenseLabel(access.licenseType),
      remaining: remainingProjects(access)
    }))
  });
}
