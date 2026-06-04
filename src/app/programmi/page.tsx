import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

const products = [
  {
    name: "Margin Pilot",
    description: "Controllo marginalità, prezzi, vendite, food cost, budget e redditività.",
    url: "https://marginpilot-2jjw.vercel.app/cruscotto",
    accent: "from-blue-600 to-sky-400",
    status: "Programma attivo"
  },
  {
    name: "Launch Pilot",
    description: "Prefattibilità economico-finanziaria, investimenti, scenari e sostenibilità del progetto.",
    url: "https://launchpilot-olive.vercel.app/login",
    accent: "from-teal-600 to-emerald-400",
    status: "Programma attivo"
  },
  {
    name: "Quality Pilot",
    description: "Questionari, audit, customer experience, qualità operativa e report per punti vendita.",
    url: "https://quality-pilot.vercel.app/login",
    accent: "from-amber-500 to-orange-400",
    status: "Programma attivo"
  }
];

export default function ProgramsPage() {
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
                Ogni accesso viene riconosciuto in base al profilo e alla licenza assegnata. Se hai più programmi attivi, puoi entrare in quello che ti serve.
              </p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#eef4ff] text-[#175cd3]">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5">
          {products.map((product) => (
            <a key={product.name} href={product.url} className="group rounded-[32px] border border-[#d9e2ef] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#175cd3] hover:shadow-lg md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-5 md:flex-row md:items-center">
                  <div className={`h-20 w-20 rounded-[28px] bg-gradient-to-br ${product.accent}`} />
                  <div>
                    <h2 className="text-3xl font-black tracking-tight md:text-4xl">{product.name}</h2>
                    <p className="mt-2 max-w-3xl text-base font-semibold leading-7 text-[#667085]">{product.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-[#e4eaf3] pt-5 md:min-w-[260px] md:border-l md:border-t-0 md:pl-8 md:pt-0">
                  <span className="text-sm font-black text-[#067647]">{product.status}</span>
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-[#eef4ff] text-[#175cd3] transition group-hover:bg-[#175cd3] group-hover:text-white">
                    <ArrowRight className="h-6 w-6" />
                  </span>
                </div>
              </div>
            </a>
          ))}
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
            Richiedi l'attivazione scegliendo programmi, profilo e licenza. Gli accessi saranno abilitati dopo la verifica.
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
