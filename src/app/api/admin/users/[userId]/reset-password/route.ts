import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function hasServerConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function adminClient() {
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

  const admin = adminClient();
  const { data: currentProfile } = await admin
    .from("profiles")
    .select("id,email,is_admin,is_super_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if ((!currentProfile?.is_admin && !currentProfile?.is_super_admin) || currentProfile.status !== "active") {
    return { error: NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 }) };
  }

  return { admin, currentUser };
}

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  if (!hasServerConfig()) {
    return NextResponse.json({ error: "Configurazione Supabase incompleta." }, { status: 500 });
  }

  const { userId } = await context.params;
  const adminContext = await requireAdmin();
  if ("error" in adminContext) return adminContext.error;

  const { admin, currentUser } = adminContext;
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("email,full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profileError || !profile?.email) {
    return NextResponse.json({ error: "Utente non trovato." }, { status: 404 });
  }

  const origin = new URL(request.url).origin;
  const publicClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { error } = await publicClient.auth.resetPasswordForEmail(profile.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await admin.from("audit_logs").insert({
    actor_id: currentUser.id,
    action: "reset_password_email",
    entity_type: "profile",
    entity_id: userId,
    metadata: {
      email: profile.email
    }
  });

  return NextResponse.json({ message: `Email di recupero inviata a ${profile.email}.` });
}
