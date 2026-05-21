import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sessione non valida." }, { status: 401 });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .or(`id.eq.${user.id},email.eq.${user.email ?? ""}`);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
