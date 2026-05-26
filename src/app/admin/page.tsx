import { AdminSuite } from "@/components/admin/admin-suite";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin,is_super_admin,status")
    .eq("id", auth.user.id)
    .maybeSingle();

  const canAccessAdmin = profile?.status === "active" && (profile.is_admin === true || profile.is_super_admin === true);

  if (!canAccessAdmin) {
    redirect("/login?error=unauthorized");
  }

  return <AdminSuite />;
}
