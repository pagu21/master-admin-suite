import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LicenseType, ProgramSlug, RoleCode } from "@/lib/master-data";

type ProgramAssignmentPayload = {
  enabled: boolean;
  program: ProgramSlug;
  role: RoleCode;
  licenseType: LicenseType;
  startDate: string;
  endDate?: string;
  projectsPurchased?: number | null;
  permissionProfile?: "completo" | "operativo" | "budget" | "limitato" | "personalizzato";
  marginAccessConfig?: unknown;
};

type UpdateUserPayload = {
  fullName: string;
  email: string;
  company?: string;
  city?: string;
  assignments: ProgramAssignmentPayload[];
  notes?: string;
};

function hasServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export async function DELETE(_request: Request, context: { params: Promise<{ userId: string }> }) {
  if (!hasServerConfig()) {
    return NextResponse.json({ error: "Configurazione Supabase incompleta." }, { status: 500 });
  }

  const { userId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Sessione master non valida." }, { status: 401 });
  }

  if (currentUser.id === userId) {
    return NextResponse.json({ error: "Non puoi eliminare l'utente con cui sei collegato." }, { status: 400 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: currentProfile } = await admin
    .from("profiles")
    .select("id,email,is_admin,is_super_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if ((!currentProfile?.is_admin && !currentProfile?.is_super_admin) || currentProfile.status !== "active") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 });
  }

  const { data: targetProfile } = await admin.from("profiles").select("email,is_admin,is_super_admin").eq("id", userId).maybeSingle();
  if (targetProfile?.is_super_admin) {
    return NextResponse.json({ error: "Non puoi eliminare un Super Master." }, { status: 400 });
  }

  if (targetProfile?.is_admin && !currentProfile.is_super_admin) {
    return NextResponse.json({ error: "Solo il Super Master può eliminare un Master Secondario." }, { status: 403 });
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "delete_user",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: targetProfile?.email ?? null
    }
  });

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

function licenseProjects(type: LicenseType, explicitValue?: number | null) {
  if (explicitValue) return explicitValue;
  if (type === "project_pack_1") return 1;
  if (type === "project_pack_3") return 3;
  if (type === "project_pack_5") return 5;
  return null;
}

export async function PUT(request: Request, context: { params: Promise<{ userId: string }> }) {
  if (!hasServerConfig()) {
    return NextResponse.json({ error: "Configurazione Supabase incompleta." }, { status: 500 });
  }

  const { userId } = await context.params;
  const payload = (await request.json().catch(() => null)) as UpdateUserPayload | null;
  if (!payload?.email || !payload.fullName || !Array.isArray(payload.assignments)) {
    return NextResponse.json({ error: "Dati utente incompleti." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user: currentUser }
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Sessione master non valida." }, { status: 401 });
  }

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data: currentProfile } = await admin
    .from("profiles")
    .select("id,email,is_admin,is_super_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if ((!currentProfile?.is_admin && !currentProfile?.is_super_admin) || currentProfile.status !== "active") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 });
  }

  const enabledAssignments = payload.assignments.filter((assignment) => assignment.enabled);
  const hasAdminRole = enabledAssignments.some((assignment) => assignment.role === "admin");
  const hasSuspendedOnly = enabledAssignments.length > 0 && enabledAssignments.every((assignment) => assignment.licenseType === "suspended");

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    email: payload.email,
    user_metadata: { full_name: payload.fullName }
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 400 });
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: payload.email,
    full_name: payload.fullName,
    company: payload.company || null,
    city: payload.city || null,
    status: hasSuspendedOnly ? "suspended" : "active",
    is_admin: hasAdminRole
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  for (const assignment of payload.assignments) {
    const { data: program } = await admin
      .from("programs")
      .select("id,slug")
      .eq("slug", assignment.program)
      .maybeSingle();
    if (!program) continue;

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
        active: assignment.enabled && assignment.licenseType !== "suspended"
      }, { onConflict: "user_id,program_id" })
      .select("id")
      .single();

    if (accessError || !access) {
      return NextResponse.json({ error: accessError?.message || "Accesso programma non aggiornato." }, { status: 400 });
    }

    if (!assignment.enabled) continue;

    const licenseNotes = [
      payload.notes?.trim(),
      assignment.permissionProfile ? `Profilo permessi: ${assignment.permissionProfile}` : "",
      assignment.program === "margin-pilot" && assignment.marginAccessConfig
        ? `[MARGINPILOT_ACCESS_CONFIG]${JSON.stringify(assignment.marginAccessConfig)}`
        : ""
    ].filter(Boolean).join("\n");

    const { error: licenseError } = await admin.from("licenses").insert({
      user_program_access_id: access.id,
      type: assignment.licenseType,
      status: assignment.licenseType === "suspended" ? "suspended" : "active",
      start_date: assignment.startDate,
      end_date: assignment.endDate || null,
      projects_purchased: licenseProjects(assignment.licenseType, assignment.projectsPurchased),
      projects_used: 0,
      notes: licenseNotes || null
    });

    if (licenseError) {
      return NextResponse.json({ error: licenseError.message }, { status: 400 });
    }
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "update_user",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: payload.email,
      assignments: payload.assignments
    }
  });

  return NextResponse.json({ success: true });
}
