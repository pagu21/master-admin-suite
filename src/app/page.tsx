import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { programs } from "@/lib/master-data";

const productLoginUrls = {
  "margin-pilot": "https://marginpilot-2jjw.vercel.app/cruscotto",
  "launch-pilot": "https://launchpilot-olive.vercel.app/login",
  "standard-pilot": "https://standardpilot.vercel.app/login"
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#123c69] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#175cd3]">Pilot Ecosystem</p>
              <h1 className="text-xl font-bold text-[#101828]">Master Admin Suite</h1>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-semibold text-[#123c69] shadow-sm transition hover:border-[#175cd3]"
          >
            <LockKeyhole className="h-4 w-4" />
            Accesso riservato
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <h2 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-[#07111f] md:text-7xl">
              Strumenti professionali per decidere, controllare e far crescere il tuo ristorante.
            </h2>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#516079]">
              Accedi ai prodotti Pilot dedicati a marginalità, prefattibilità e standard operativi.
              Ogni area è pensata per rendere il lavoro più chiaro, ordinato e affidabile.
            </p>
          </div>

          <div className="grid gap-4">
            {programs.map((program) => (
              <a
                key={program.slug}
                href={productLoginUrls[program.slug]}
                className="group rounded-[28px] border border-[#d9e2ef] bg-white p-6 soft-shadow transition hover:-translate-y-1 hover:border-[#175cd3]"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${program.accent}`} />
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-[#101828]">{program.name}</h3>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085]">{program.description}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#eef4ff] p-3 text-[#175cd3] transition group-hover:bg-[#175cd3] group-hover:text-white">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-[#edf2f7] pt-4 text-sm">
                  <span className={program.active ? "font-semibold text-[#0f766e]" : "font-semibold text-[#b54708]"}>
                    {program.active ? "Programma attivo" : "In predisposizione"}
                  </span>
                  <span className="font-semibold text-[#175cd3]">Apri area</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
