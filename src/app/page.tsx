import Link from "next/link";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import { programs } from "@/lib/master-data";

const productLoginUrls = {
  "margin-pilot": "https://marginpilot-2jjw.vercel.app/cruscotto",
  "launch-pilot": "https://launchpilot-olive.vercel.app/login",
  "quality-pilot": "https://quality-pilot.vercel.app/login"
};

const productCopy = {
  "margin-pilot": {
    payoff: "Margini sotto controllo",
    detail: "Analizza prezzi, costi, food cost e profittabilità con una lettura semplice e immediata.",
    audience: "Per controllo economico e marginalità"
  },
  "launch-pilot": {
    payoff: "Nuovi progetti più sicuri",
    detail: "Costruisci prefattibilità, scenari, break even e business plan bancabili per aprire o sviluppare un ristorante.",
    audience: "Per fattibilità, finanza e business plan"
  },
  "quality-pilot": {
    payoff: "Qualità e reputazione misurabili",
    detail: "Gestisci audit, questionari clienti, customer journey, recensioni e azioni correttive in modo professionale.",
    audience: "Per qualità, standard e customer experience"
  }
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
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#175cd3]">Pilot Suite</p>
              <h1 className="text-xl font-bold text-[#101828]">Accesso prodotti</h1>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-semibold text-[#123c69] shadow-sm transition hover:border-[#175cd3]"
          >
            <LockKeyhole className="h-4 w-4" />
            Area Master riservata
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-[#175cd3] shadow-sm ring-1 ring-[#d9e2ef]">
              Un unico accesso, strumenti diversi in base al tuo profilo
            </p>
            <h2 className="max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight text-[#07111f] md:text-7xl">
              La suite professionale per far crescere il tuo ristorante con più controllo.
            </h2>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-[#516079]">
              Scegli il prodotto assegnato al tuo profilo e accedi con le tue credenziali.
              Ogni programma è progettato per rendere più semplice decidere, misurare e migliorare.
            </p>
            <div className="mt-8 grid gap-3 text-sm font-semibold text-[#516079] sm:grid-cols-3">
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[#d9e2ef]">Dati più chiari</div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[#d9e2ef]">Decisioni più rapide</div>
              <div className="rounded-2xl bg-white p-4 ring-1 ring-[#d9e2ef]">Controllo professionale</div>
            </div>
          </div>

          <div className="grid gap-4">
            {programs.map((program) => {
              const copy = productCopy[program.slug];
              return (
              <a
                key={program.slug}
                href={productLoginUrls[program.slug]}
                className="group rounded-[28px] border border-[#d9e2ef] bg-white p-6 soft-shadow transition hover:-translate-y-1 hover:border-[#175cd3]"
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-3xl bg-gradient-to-br ${program.accent}`} />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#175cd3]">{copy.audience}</p>
                      <h3 className="text-3xl font-bold tracking-tight text-[#101828]">{program.name}</h3>
                      <p className="mt-2 text-base font-bold text-[#344054]">{copy.payoff}</p>
                      <p className="mt-2 max-w-xl text-sm leading-6 text-[#667085]">{copy.detail}</p>
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
                  <span className="font-semibold text-[#175cd3]">Accedi al programma</span>
                </div>
              </a>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
