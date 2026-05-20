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
    return NextResponse.json({ error: "Sessione admin non valida." }, { status: 401 });
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
    .select("id,email,is_admin,status")
    .or(`id.eq.${currentUser.id},email.eq.${currentUser.email ?? ""}`)
    .maybeSingle();

  if (!currentProfile?.is_admin || currentProfile.status !== "active") {
    return NextResponse.json({ error: "Accesso non autorizzato." }, { status: 403 });
  }

  const { data: targetProfile } = await admin.from("profiles").select("email,is_admin").eq("id", userId).maybeSingle();
  if (targetProfile?.is_admin) {
    return NextResponse.json({ error: "Non puoi eliminare un utente master/admin." }, { status: 400 });
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
