import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });
  const hasConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!hasConfig) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const isAdminArea = request.nextUrl.pathname.startsWith("/admin");
  const isAdminApi = request.nextUrl.pathname.startsWith("/api/admin");

  if (isAdminArea || isAdminApi) {
    if (!user) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin,is_super_admin,status")
      .eq("id", user.id)
      .maybeSingle();

    const canAccessAdmin = !profileError
      && profile?.status === "active"
      && (profile.is_admin === true || profile.is_super_admin === true);

    if (!canAccessAdmin) {
      if (isAdminApi) {
        return NextResponse.json({ error: "Accesso non autorizzato" }, { status: 403 });
      }
      const url = new URL("/login", request.url);
      url.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"]
};
