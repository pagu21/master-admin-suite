import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { licenseLabel, programs as suitePrograms, type LicenseStatus, type LicenseType, type ProgramSlug, type RoleCode } from "@/lib/master-data";

type AccessRow = {
  active: boolean | null;
  programs: { slug: ProgramSlug | null } | { slug: ProgramSlug | null }[] | null;
  roles: { code: RoleCode | null } | { code: RoleCode | null }[] | null;
  licenses?: Array<{
    type: LicenseType | null;
    status: LicenseStatus | null;
    start_date: string | null;
    end_date: string | null;
    projects_purchased: number | null;
    projects_used: number | null;
    created_at: string | null;
  }> | null;
};

type ProgramLicenseInfo = {
  role: RoleCode | null;
  license: NonNullable<AccessRow["licenses"]>[number] | null;
};

function hasSupabaseServerConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function isLicenseUsable(access: AccessRow) {
  if (!access.active) return false;
  const latestLicense = [...(access.licenses ?? [])].sort((left, right) => {
    return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime();
  })[0];

  if (!latestLicense || latestLicense.status !== "active") return false;
  if (!latestLicense.end_date) return true;

  const today = new Date().toISOString().slice(0, 10);
  return latestLicense.end_date >= today;
}

function latestLicense(access: AccessRow) {
  return [...(access.licenses ?? [])].sort((left, right) => {
    return new Date(right.created_at ?? 0).getTime() - new Date(left.created_at ?? 0).getTime();
  })[0] ?? null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Nessuna scadenza";
  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(`${value}T12:00:00`);
  const targetUtc = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((targetUtc - todayUtc) / 86_400_000);
}

function roleLabel(role: RoleCode | null | undefined) {
  const labels: Record<RoleCode, string> = {
    admin: "Master",
    consulente: "Consulente",
    ristoratore: "Ristoratore",
    utente: "Utente",
  };
  return role ? labels[role] : "Ruolo non indicato";
}

function licenseStatusLabel(status: LicenseStatus | null | undefined) {
  const labels: Record<LicenseStatus, string> = {
    active: "Attiva",
    expired: "Scaduta",
    suspended: "Sospesa",
    pending: "In attesa",
  };
  return status ? labels[status] : "Non indicata";
}

async function signOutFromPrograms() {
  "use server";

  if (!hasSupabaseServerConfig()) {
    redirect("/programmi");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/programmi");
}

export default async function ProgramsPage() {
  const supabase = hasSupabaseServerConfig() ? await createSupabaseServerClient() : null;
  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let userLabel = "";
  let isGlobalMaster = false;
  const enabledPrograms = new Set<ProgramSlug>();
  const programLicenses = new Map<ProgramSlug, ProgramLicenseInfo>();

  if (user && supabase) {
    const [{ data: profile }, { data: accesses }] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name,email,is_admin,is_super_admin,status")
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("user_program_access")
        .select("active, programs ( slug ), roles ( code ), licenses ( type, status, start_date, end_date, projects_purchased, projects_used, created_at )")
        .eq("user_id", user.id),
    ]);

    userLabel = profile?.full_name || profile?.email || user.email || "";
    isGlobalMaster = profile?.status === "active" && (profile?.is_admin === true || profile?.is_super_admin === true);

    if (isGlobalMaster) {
      suitePrograms.forEach((program) => {
        enabledPrograms.add(program.slug);
        programLicenses.set(program.slug, {
          role: "admin",
          license: null,
        });
      });
    } else {
      ((accesses ?? []) as AccessRow[]).forEach((access) => {
        const program = firstRelation(access.programs);
        if (program?.slug) {
          const canOpen = isLicenseUsable(access);
          if (canOpen) {
            enabledPrograms.add(program.slug);
          }
          programLicenses.set(program.slug, {
            role: firstRelation(access.roles)?.code ?? null,
            license: latestLicense(access),
          });
        }
      });
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101828]">
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-black text-[#123c69] shadow-sm transition hover:border-[#175cd3]">
          <ArrowLeft className="h-4 w-4" />
          Torna alla landing
        </Link>

        <div className="mt-8 rounded-[34px] border border-[#d9e2ef] bg-white p-8 shadow-sm md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Area clienti</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Scegli il programma da aprire</h1>
              <p className="mt-4 text-lg font-semibold leading-8 text-[#667085]">
                Ogni accesso viene riconosciuto in base al profilo e alla licenza assegnata. Da qui puoi aprire solo i programmi attivi per il tuo account.
              </p>
              {userLabel ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <p className="inline-flex rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-black text-[#175cd3]">
                    Accesso riconosciuto: {userLabel}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4ff] text-[#175cd3]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              {userLabel ? (
                <form action={signOutFromPrograms}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#175cd3]"
                  >
                    <LogOut className="h-4 w-4" />
                    Cambia utenza
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {suitePrograms.map((product) => {
            const canOpen = Boolean(user && enabledPrograms.has(product.slug));
            const licenseInfo = programLicenses.get(product.slug);
            const license = licenseInfo?.license ?? null;
            const missingDays = daysUntil(license?.end_date);
            const showLicenseDetails = Boolean(userLabel && !isGlobalMaster && licenseInfo);
            const hasProjectLimit = typeof license?.projects_purchased === "number" && license.projects_purchased > 0;
            const card = (
              <div className="grid gap-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className={`h-20 w-20 rounded-[28px] bg-gradient-to-br ${product.accent}`} />
                    <div>
                      <h2 className="text-3xl font-black tracking-tight md:text-4xl">{product.name}</h2>
                      <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#667085]">{product.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-[#e4eaf3] pt-5 md:min-w-[260px] md:border-l md:border-t-0 md:pl-8 md:pt-0">
                    <span className={canOpen ? "text-sm font-black text-[#067647]" : "text-sm font-black text-[#b54708]"}>
                      {canOpen ? "Licenza attiva" : user ? "Licenza non attiva" : "Accesso richiesto"}
                    </span>
                    <span className={"grid h-14 w-14 place-items-center rounded-full transition " + (canOpen ? "bg-[#eef4ff] text-[#175cd3] group-hover:bg-[#175cd3] group-hover:text-white" : "bg-amber-50 text-amber-700")}>
                      {canOpen ? <ArrowRight className="h-6 w-6" /> : <LockKeyhole className="h-5 w-5" />}
                    </span>
                  </div>
                </div>
                {showLicenseDetails ? (
                  <dl className="grid gap-3 rounded-2xl border border-[#e4eaf3] bg-[#f8fafc] p-4 text-sm font-semibold text-[#667085] md:grid-cols-4">
                    <div>
                      <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#52627a]">Licenza</dt>
                      <dd className="mt-1 text-[#101828]">{license?.type ? licenseLabel(license.type) : "Non assegnata"}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#52627a]">Ruolo</dt>
                      <dd className="mt-1 text-[#101828]">{roleLabel(licenseInfo?.role)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#52627a]">Scadenza</dt>
                      <dd className="mt-1 text-[#101828]">{formatDate(license?.end_date)}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#52627a]">Giorni mancanti</dt>
                      <dd className="mt-1 text-[#101828]">
                        {missingDays === null
                            ? "Illimitato"
                            : missingDays >= 0
                              ? `${missingDays} giorni`
                              : `Scaduta da ${Math.abs(missingDays)} giorni`}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#52627a]">Stato</dt>
                      <dd className="mt-1 text-[#101828]">{licenseStatusLabel(license?.status)}</dd>
                    </div>
                    {hasProjectLimit ? (
                      <div>
                        <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-[#52627a]">Progetti</dt>
                        <dd className="mt-1 text-[#101828]">{license?.projects_used ?? 0}/{license.projects_purchased}</dd>
                      </div>
                    ) : null}
                  </dl>
                ) : null}
              </div>
            );

            return canOpen ? (
              <a key={product.name} href={product.loginUrl} className="group rounded-[32px] border border-[#d9e2ef] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#175cd3] hover:shadow-lg md:p-8">
                {card}
              </a>
            ) : (
              <div key={product.name} className="rounded-[32px] border border-amber-200 bg-white p-6 shadow-sm md:p-8">
                {card}
                <div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                  Questo programma non risulta attivo sul tuo profilo. Puoi richiederne l&apos;attivazione, una demo o l&apos;estensione della licenza.
                  <div className="mt-3 flex flex-wrap gap-2">
                    <a href={product.loginUrl} className="inline-flex items-center gap-2 rounded-full border border-[#123c69] bg-white px-4 py-2 text-[#123c69] transition hover:bg-[#eef4ff]">
                      Accedi se già cliente
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <Link href={`/registrazione?programma=${product.slug}`} className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-4 py-2 text-white">
                      Richiedi attivazione
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-[28px] border border-[#d9e2ef] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Non sai quale programma usare?</h2>
            <p className="mt-2 text-base font-semibold leading-7 text-[#667085]">
              Se hai dubbi, torna alla landing e usa il modulo “Ti contattiamo noi”: ti aiuteremo a capire quale soluzione è più adatta al tuo profilo e alla tua attività.
            </p>
            <Link href="/#contatto" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#123c69] px-5 py-3 text-sm font-black text-white transition hover:bg-[#175cd3]">
              Vai al contatto
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-[28px] border border-[#d9e2ef] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Non hai ancora un accesso?</h2>
          <p className="mt-2 text-base font-semibold leading-7 text-[#667085]">
            Richiedi l&apos;attivazione scegliendo programmi, profilo e licenza. Gli accessi saranno abilitati dopo la verifica.
          </p>
          <Link href="/registrazione" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#123c69] px-5 py-3 text-sm font-black text-white transition hover:bg-[#175cd3]">
            Richiedi registrazione
            <ArrowRight className="h-4 w-4" />
          </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
