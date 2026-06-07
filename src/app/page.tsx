"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, CheckCircle2, ClipboardCheck, Gift, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

const solutions = [
  {
    name: "MarginPilot",
    eyebrow: "Controllo di gestione",
    text: "Misura costi, margini, budget, food cost e redditività con una lettura chiara e operativa.",
    items: ["food cost preventivo", "food cost consuntivo", "margini", "budget", "KPI", "redditività"],
    accent: "bg-[#eef4ff] text-[#175cd3]",
    logo: "/screenshots/marginpilot-brand.png",
    screenshot: "/screenshots/suite-matrice-menu.png"
  },
  {
    name: "LaunchPilot",
    eyebrow: "Nuove aperture",
    text: "Valuta se un progetto è sostenibile prima di investire, con scenari e analisi economico-finanziarie professionali.",
    items: ["sostenibilità economica", "investimenti", "fattibilità economico-finanziaria", "scenari"],
    accent: "bg-[#ecfdf3] text-[#0f766e]",
    logo: "/screenshots/launchpilot-brand.png",
    screenshot: "/screenshots/suite-break-even.png"
  },
  {
    name: "QualityPilot",
    eyebrow: "Qualità operativa",
    text: "Organizza procedure, checklist e standard per rendere il servizio più controllato e costante.",
    items: ["procedure", "checklist", "standard operativi", "qualità del servizio"],
    accent: "bg-[#fff7ed] text-[#b54708]",
    logo: "/screenshots/qualitypilot-brand.png",
    screenshot: "/screenshots/qualitypilot-dashboard.png"
  }
];

function CheckMark({ active }: { active: boolean }) {
  return (
    <span className={`mx-auto grid h-8 w-8 place-items-center rounded-full ${active ? "bg-[#ecfdf3] text-[#067647]" : "bg-[#f2f4f7] text-[#98a2b3]"}`}>
      {active ? <CheckCircle2 className="h-5 w-5" /> : "–"}
    </span>
  );
}

function ScreenshotLink({
  src,
  alt,
  onOpen,
  className = "",
  imageClassName = ""
}: {
  src: string;
  alt: string;
  onOpen: (image: { src: string; alt: string }) => void;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <button type="button" onClick={() => onOpen({ src, alt })} className={`group relative block w-full overflow-hidden text-left ${className}`} aria-label={`Ingrandisci ${alt}`}>
      <img src={src} alt={alt} className={imageClassName} />
      <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-2 text-xs font-black text-[#123c69] opacity-0 shadow-sm ring-1 ring-[#d9e2ef] transition group-hover:opacity-100 group-focus-visible:opacity-100">
        Ingrandisci
      </span>
    </button>
  );
}

const problems = [
  "Non sai se il tuo locale sta realmente guadagnando.",
  "I costi aumentano ma non sai dove intervenire.",
  "Prendi decisioni basandoti sull'istinto invece che sui numeri.",
  "Vuoi aprire un locale ma non sai se il progetto è sostenibile.",
  "Il personale lavora senza procedure condivise.",
  "Non hai una visione chiara dell'andamento dell'attività."
];

const pricingPlans = [
  {
    name: "Essenziale",
    label: "Per iniziare",
    text: "Accesso a un programma della suite, ideale per chi vuole partire in modo semplice e controllato.",
    features: ["1 programma Pilot", "profilo cliente", "supporto di attivazione", "report base"],
    cta: "Richiedi informazioni"
  },
  {
    name: "Professionale",
    label: "Più scelto",
    text: "Per ristoratori, consulenti ed esperti che vogliono usare più strumenti e gestire analisi complete.",
    features: ["più programmi Pilot", "report professionali", "scenari e simulazioni", "pacchetti LaunchPilot 1, 3 o 5 progetti", "licenze e profili configurabili"],
    cta: "Richiedi una demo"
  },
  {
    name: "Suite",
    label: "Ecosistema completo",
    text: "Per gruppi, consulenti e organizzazioni che vogliono integrare controllo, sviluppo e qualità.",
    features: ["MarginPilot + LaunchPilot + QualityPilot", "profili multipli", "piani commerciali configurabili", "predisposizione pagamenti e fatturazione"],
    cta: "Parla con noi"
  }
];

const audienceCards = [
  {
    title: "Ristoratori indipendenti",
    text: "Controlla costi, margini, budget e performance del tuo locale."
  },
  {
    title: "Consulenti commerciali e della ristorazione",
    text: "Supporta i clienti con strumenti professionali e dati concreti."
  },
  {
    title: "Catene e franchising",
    text: "Standardizza processi, procedure e controllo gestionale."
  }
];

const outcomes = [
  "Comprendere la redditività reale",
  "Controllare Food Cost Preventivo e Food Cost Consuntivo",
  "Migliorare la spesa media per persona",
  "Ridurre sprechi e inefficienze",
  "Pianificare investimenti con maggiore sicurezza",
  "Standardizzare il lavoro del personale",
  "Gestire il ristorante basandosi sui numeri"
];

const methodSteps = [
  {
    action: "APRIRE",
    product: "LaunchPilot",
    text: "Valuta investimenti, sostenibilità, fabbisogno e fattibilità economico-finanziaria prima di partire."
  },
  {
    action: "GESTIRE",
    product: "MarginPilot",
    text: "Controlla margini, food cost, budget, vendite e redditività giorno dopo giorno."
  },
  {
    action: "MIGLIORARE",
    product: "QualityPilot",
    text: "Misura qualità, standard, customer experience e azioni di miglioramento."
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Scegli il modulo",
    text: "Parti dal bisogno principale: controllare i margini, valutare un progetto o migliorare la qualità."
  },
  {
    step: "2",
    title: "Inserisci o importi i dati",
    text: "La piattaforma guida l'utente con passaggi semplici, dati essenziali e controlli chiari."
  },
  {
    step: "3",
    title: "Ottieni indicatori e report",
    text: "Leggi risultati, scenari e report professionali per prendere decisioni più consapevoli."
  }
];

const commercialTools = [
  {
    title: "Piano adatto al tuo utilizzo",
    text: "La Suite può essere configurata in base al tipo di attività, al numero di programmi necessari e al profilo di lavoro: ristoratore, consulente o gruppo.",
    icon: Sparkles
  },
  {
    title: "Promozioni e campagne",
    text: "Struttura pronta per offerte lancio, codici promozionali, prove guidate e condizioni dedicate.",
    icon: Gift
  },
  {
    title: "Licenze flessibili",
    text: "Abbonamenti, pacchetti progetto e accessi multi-programma possono convivere nello stesso ecosistema. LaunchPilot può essere venduto anche in pack da 1, 3 o 5 progetti.",
    icon: ShieldCheck
  }
];

const featureRows = [
  { label: "Food Cost preventivo per ricetta", margin: true, launch: false, quality: false },
  { label: "Food Cost consuntivo da vendite reali", margin: true, launch: false, quality: false },
  { label: "Matrice menu: vincenti, da spingere, da correggere", margin: true, launch: false, quality: false },
  { label: "Prezzi consigliati e prodotti sotto margine", margin: true, launch: false, quality: false },
  { label: "Importazione vendite da gestionali e casse", margin: true, launch: false, quality: false },
  { label: "Budget operativo e obiettivi mensili", margin: true, launch: false, quality: false },
  { label: "RevPASH e produttività dei posti", margin: true, launch: false, quality: false },
  { label: "KPI direzionali", margin: true, launch: true, quality: true },
  { label: "Fattibilità economico-finanziaria", margin: false, launch: true, quality: false },
  { label: "Break Even e soglia minima di sicurezza", margin: true, launch: true, quality: false },
  { label: "Simulazioni e scenari", margin: true, launch: true, quality: true },
  { label: "Procedure operative", margin: false, launch: false, quality: true },
  { label: "Checklist", margin: false, launch: false, quality: true },
  { label: "Standard operativi", margin: false, launch: false, quality: true },
  { label: "Audit qualità", margin: false, launch: false, quality: true }
];

const moduleFunctions = [
  {
    name: "MarginPilot",
    text: "Per capire se il locale sta guadagnando davvero e dove intervenire sui margini.",
    items: [
      "cruscotto rapido del locale",
      "scheda prodotto e ricette",
      "food cost preventivo e consuntivo",
      "matrice menu",
      "budget operativo",
      "break even point",
      "RevPASH",
      "importazione vendite guidata",
      "KPI e report di controllo"
    ]
  },
  {
    name: "LaunchPilot",
    text: "Per valutare se una nuova apertura o un progetto di sviluppo sono sostenibili.",
    items: [
      "anagrafica locale e format",
      "investimenti guidati",
      "ammortamenti e finanziamenti",
      "fabbisogno finanziario iniziale",
      "ricavi, costi e scenari",
      "smart break even point",
      "what if",
      "business plan economico-finanziario",
      "report per consulenti e ristoratori"
    ]
  },
  {
    name: "QualityPilot",
    text: "Per controllare qualità, esperienza cliente e standard operativi in modo semplice.",
    items: [
      "creazione questionari",
      "somministrazione a clienti o auditor",
      "risultati per categoria",
      "customer journey",
      "Quality Index",
      "report A4",
      "confronto punti vendita",
      "archivio risposte",
      "indicatori per reputazione e miglioramento"
    ]
  }
];

const faqs = [
  {
    question: "Serve esperienza di controllo di gestione?",
    answer: "No. La piattaforma è pensata per rendere i numeri comprensibili anche a chi non usa abitualmente strumenti tecnici."
  },
  {
    question: "Posso usarlo con il mio consulente?",
    answer: "Sì. Suite Pilot può essere usata dal ristoratore e dal consulente, con profili e accessi separati."
  },
  {
    question: "È adatto alle pizzerie?",
    answer: "Sì. I moduli sono adatti a ristoranti, pizzerie, bar, bistrot e attività food con esigenze di controllo e sviluppo."
  },
  {
    question: "È adatto ai ristoranti stagionali?",
    answer: "Sì. LaunchPilot e MarginPilot prevedono logiche utili anche per aperture stagionali, periodi ridotti e giornate di chiusura variabili."
  },
  {
    question: "Può essere utilizzato da catene e franchising?",
    answer: "Sì. QualityPilot è pensato anche per standard, audit, questionari e confronto tra più punti vendita."
  },
  {
    question: "Come viene fornita l'assistenza?",
    answer: "L'attivazione può essere accompagnata da una demo guidata e da supporto operativo in base al piano scelto."
  }
];

const roadmap = [
  "Import automatico dai gestionali",
  "Import fatture XML",
  "Analisi AI avanzate",
  "Dashboard evolute",
  "Benchmark di settore"
];

export default function Home() {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101828]">
      <header className="sticky top-0 z-30 border-b border-[#d9e2ef]/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123c69] text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-black tracking-tight text-[#101828]">Suite Pilot</p>
              <p className="text-xs font-semibold text-[#667085]">Ristorazione moderna</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-bold text-[#516079] md:flex">
            <a href="#soluzioni" className="hover:text-[#175cd3]">Soluzioni</a>
            <a href="#funzionalita" className="hover:text-[#175cd3]">Funzionalità</a>
            <a href="#perche" className="hover:text-[#175cd3]">Perché diverso</a>
            <a href="#prezzi" className="hover:text-[#175cd3]">Prezzi</a>
            <a href="#contatto" className="hover:text-[#175cd3]">Contattaci</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/programmi" className="hidden rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-bold text-[#123c69] shadow-sm transition hover:border-[#175cd3] sm:inline-flex">
              Area clienti
            </Link>
            <a href="#contatto" className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#175cd3]">
              Contattaci
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:pb-24 lg:pt-24">
        <div>
          <p className="inline-flex rounded-full border border-[#d9e2ef] bg-white px-4 py-2 text-sm font-bold text-[#175cd3] shadow-sm">
            Suite Pilot
          </p>
          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.03] tracking-tight text-[#07111f] md:text-7xl">
            Trasforma i numeri del tuo ristorante in decisioni migliori
          </h1>
          <p className="mt-6 max-w-2xl text-xl leading-8 text-[#516079]">
            Controllo di gestione, budget, fattibilità economico-finanziaria e standard operativi in un'unica piattaforma progettata per ristoratori e consulenti.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#contatto" className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-6 py-3 text-base font-bold text-white shadow-sm transition hover:bg-[#175cd3]">
              Richiedi una Demo
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link href="/programmi" className="inline-flex items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-6 py-3 text-base font-bold text-[#123c69] shadow-sm transition hover:border-[#175cd3]">
              <LockKeyhole className="h-5 w-5" />
              Area clienti
            </Link>
          </div>
        </div>

        <div className="rounded-[34px] border border-[#d9e2ef] bg-white p-3 soft-shadow">
          <div className="overflow-hidden rounded-[28px] border border-[#edf2f7] bg-[#f8fafc]">
            <ScreenshotLink
              src="/screenshots/suite-hero-locale-10-secondi.png"
              alt="Dashboard reale MarginPilot Il tuo locale in 10 secondi"
              onOpen={setPreviewImage}
              imageClassName="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">A chi si rivolge</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Una piattaforma per chi vuole decidere meglio</h2>
        </div>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {audienceCards.map((card) => (
            <article key={card.title} className="rounded-[30px] border border-[#d9e2ef] bg-white p-7 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef4ff] text-[#175cd3]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-2xl font-black">{card.title}</h3>
              <p className="mt-3 text-base leading-7 text-[#667085]">{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[34px] border border-[#d9e2ef] bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Il metodo Suite Pilot</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Aprire, gestire, migliorare</h2>
            <p className="mt-4 text-lg leading-8 text-[#516079]">
              Suite Pilot accompagna il ristoratore durante tutto il ciclo di vita dell'attività: dalla progettazione iniziale alla gestione quotidiana fino al miglioramento continuo.
            </p>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {methodSteps.map((step, index) => (
              <div key={step.product} className="relative rounded-[28px] border border-[#d9e2ef] bg-[#f8fafc] p-7">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#667085] ring-1 ring-[#d9e2ef]">{step.action}</span>
                <h3 className="mt-5 text-3xl font-black text-[#123c69]">{step.product}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#667085]">{step.text}</p>
                {index < methodSteps.length - 1 ? (
                  <div className="absolute -bottom-5 left-1/2 hidden h-10 w-10 -translate-x-1/2 place-items-center rounded-full bg-white text-[#175cd3] shadow-sm ring-1 ring-[#d9e2ef] lg:-right-7 lg:bottom-auto lg:left-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0 lg:grid">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Cosa ottieni</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Più controllo. Più consapevolezza. Decisioni migliori.</h2>
          </div>
          <div className="grid gap-3">
            {outcomes.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#d9e2ef] bg-white p-4 text-base font-bold text-[#344054] shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#067647]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="rounded-[34px] border border-[#d9e2ef] bg-white p-8 shadow-sm md:p-10">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Come funziona</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Dal dato alla decisione, senza complicazioni</h2>
            <p className="mt-4 text-lg leading-8 text-[#516079]">
              Suite Pilot è pensata per far arrivare l'utente rapidamente al punto: capire, correggere, decidere.
            </p>
          </div>
          <div className="mt-9 grid gap-5 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div key={item.step} className="rounded-[28px] border border-[#d9e2ef] bg-[#f8fafc] p-7">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#123c69] text-lg font-black text-white">{item.step}</span>
                <h3 className="mt-5 text-2xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#667085]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="soluzioni" className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Soluzioni</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Una suite completa per gestire il ristorante</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {solutions.map((solution) => (
            <article key={solution.name} className="rounded-[30px] border border-[#d9e2ef] bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${solution.accent}`}>{solution.eyebrow}</span>
                <img src={solution.logo} alt={`Logo ${solution.name}`} className="h-8 max-w-[150px] object-contain" />
              </div>
              <h3 className="mt-5 text-3xl font-black">{solution.name}</h3>
              <p className="mt-3 text-base leading-7 text-[#516079]">{solution.text}</p>
              <div className="mt-6 overflow-hidden rounded-3xl border border-[#d9e2ef] bg-[#f8fafc]">
                <ScreenshotLink src={solution.screenshot} alt={`Schermata reale ${solution.name}`} onOpen={setPreviewImage} imageClassName="h-56 w-full object-cover object-left-top" />
              </div>
              <div className="mt-6 grid gap-3">
                {solution.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-bold text-[#344054]">
                    <CheckCircle2 className="h-4 w-4 text-[#175cd3]" />
                    {item}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            {
              title: "Matrice Menu",
              text: "Capisci quali prodotti proteggere, quali spingere e quali correggere.",
              image: "/screenshots/suite-matrice-menu.png"
            },
            {
              title: "Budget e Obiettivi",
              text: "Trasforma lo storico in obiettivi leggibili e controllabili.",
              image: "/screenshots/suite-budget-obiettivi.png"
            },
            {
              title: "Break Even Point",
              text: "Vedi quanto devi incassare per non perdere e dove intervenire.",
              image: "/screenshots/suite-break-even.png"
            },
            {
              title: "Scenari previsionali",
              text: "Confronta ipotesi prudenti, realistiche e ottimistiche con dati calcolati dal programma.",
              image: "/screenshots/launchpilot-scenari-previsionali.png"
            },
            {
              title: "QualityPilot",
              text: "Controlla qualità, esperienza cliente, risposte e report in modo semplice.",
              image: "/screenshots/qualitypilot-results.png"
            },
            {
              title: "Report qualità",
              text: "Leggi risultati per categoria, radar, punti critici e confronto tra sedi.",
              image: "/screenshots/qualitypilot-category-report.png"
            }
          ].map((item) => (
            <div key={item.title} className="overflow-hidden rounded-[30px] border border-[#d9e2ef] bg-white shadow-sm">
              <div className="h-56 overflow-hidden bg-[#f8fafc]">
                <ScreenshotLink src={item.image} alt={`Screenshot reale ${item.title}`} onOpen={setPreviewImage} imageClassName="h-full w-full object-cover object-left-top" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-black">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="funzionalita" className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Funzionalità</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Tre moduli integrati, tre obiettivi diversi</h2>
          <p className="mt-4 text-lg leading-8 text-[#516079]">
            La tabella aiuta a capire subito quale programma usare: MarginPilot lavora sui margini reali e sulle vendite, LaunchPilot sulla fattibilità del progetto, QualityPilot sulla qualità operativa e sull’esperienza cliente.
          </p>
        </div>
        <div className="mt-10 overflow-hidden rounded-[30px] border border-[#d9e2ef] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="w-[42%] px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-[#667085]">Funzione</th>
                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-[#175cd3]">MarginPilot</th>
                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-[#0f766e]">LaunchPilot</th>
                  <th className="px-5 py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-[#b54708]">QualityPilot</th>
                </tr>
              </thead>
              <tbody>
                {featureRows.map((row) => (
                  <tr key={row.label} className="border-t border-[#e4eaf3]">
                    <td className="px-5 py-4 text-sm font-bold text-[#344054]">{row.label}</td>
                    <td className="px-5 py-4 text-center"><CheckMark active={row.margin} /></td>
                    <td className="px-5 py-4 text-center"><CheckMark active={row.launch} /></td>
                    <td className="px-5 py-4 text-center"><CheckMark active={row.quality} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-6 grid gap-4">
          {moduleFunctions.map((module) => (
            <details key={module.name} className="group rounded-[26px] border border-[#d9e2ef] bg-white p-5 shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black">{module.name}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-[#667085]">{module.text}</p>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-black text-[#175cd3] group-open:bg-[#123c69] group-open:text-white">
                  Apri
                </span>
              </summary>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {module.items.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm font-bold text-[#344054] ring-1 ring-[#e4eaf3]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#175cd3]" />
                    {item}
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Problemi reali</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">I problemi che Suite Pilot aiuta a risolvere</h2>
          </div>
          <div className="grid gap-3">
            {problems.map((problem) => (
              <div key={problem} className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-4 text-base font-bold text-[#344054]">
                {problem}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="prezzi" className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Prezzi</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Piani, promozioni e licenze sempre sotto controllo</h2>
            <p className="mt-4 text-lg leading-8 text-[#516079]">
              Suite Pilot può essere attivata con formule diverse in base al profilo: ristoratore, consulente, gruppo o attività con più punti vendita. Ogni accesso mostra solo i programmi, le funzioni e le licenze previste.
            </p>
          </div>
          <Link href="/registrazione" className="inline-flex w-fit items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-5 py-3 text-sm font-bold text-[#123c69] shadow-sm">
            Richiedi attivazione
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article key={plan.name} className="rounded-[30px] border border-[#d9e2ef] bg-white p-7 shadow-sm">
              <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[#175cd3]">{plan.label}</span>
              <h3 className="mt-5 text-3xl font-black">{plan.name}</h3>
              <p className="mt-3 min-h-[84px] text-base leading-7 text-[#516079]">{plan.text}</p>
              <div className="mt-6 grid gap-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm font-bold text-[#344054]">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#175cd3]" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <a href={`mailto:info@guidipaolo.it?subject=${encodeURIComponent(`Informazioni piano ${plan.name} Suite Pilot`)}`} className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#123c69] px-5 py-3 text-sm font-black text-white transition hover:bg-[#175cd3]">
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {commercialTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <div key={tool.title} className="rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-6">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#175cd3] shadow-sm ring-1 ring-[#d9e2ef]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-black">{tool.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#667085]">{tool.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="perche" className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[34px] border border-[#d9e2ef] bg-white p-8 soft-shadow md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Perché Suite Pilot è diverso</p>
          <p className="mt-4 max-w-4xl text-2xl font-bold leading-9 text-[#101828]">
            Suite Pilot nasce da oltre vent'anni di consulenza, formazione universitaria e affiancamento operativo a ristoranti, hotel e pubblici esercizi.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              ["Esperienza reale", "Strumenti costruiti su problemi concreti, non su teoria astratta."],
              ["Metodo costruito sul campo", "Dati, procedure e controllo diventano azioni semplici da applicare."],
              ["Pensato per ristoratori", "Linguaggio chiaro, interfacce ordinate e decisioni comprensibili."]
            ].map(([title, text]) => (
              <div key={title} className="rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-6">
                <ClipboardCheck className="h-5 w-5 text-[#175cd3]" />
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#667085]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contatto" className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-6 rounded-[34px] border border-[#d9e2ef] bg-white p-6 shadow-sm lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div className="rounded-[28px] bg-[#eef4ff] p-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Ti contattiamo noi</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Vuoi capire quale modulo serve davvero?</h2>
            <p className="mt-4 text-lg leading-8 text-[#516079]">
              Lascia i tuoi dati: ti ricontattiamo per capire esigenza, tipo di attività e soluzione più adatta. Nessun listino complicato, prima capiamo cosa serve.
            </p>
            <div className="mt-7 grid gap-3 text-sm font-bold text-[#344054]">
              <span className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-[#175cd3]" /> demo guidata</span>
              <span className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-[#175cd3]" /> valutazione programma più adatto</span>
              <span className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-[#175cd3]" /> eventuale promozione o pacchetto dedicato</span>
            </div>
          </div>
          <form action="mailto:info@guidipaolo.it" method="post" encType="text/plain" className="grid gap-4 rounded-[28px] border border-[#d9e2ef] bg-[#f8fafc] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Nome
                <input name="nome" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Il tuo nome" />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Email
                <input name="email" type="email" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="nome@email.it" />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Attività
                <input name="attivita" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Ristorante, hotel, consulenza..." />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Profilo
                <select name="profilo" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]">
                  <option>Sono un ristoratore</option>
                  <option>Sono un consulente</option>
                  <option>Gestisco più locali</option>
                  <option>Voglio una demo</option>
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Interesse
                <select name="interesse" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]">
                  <option>Vorrei capire quale modulo scegliere</option>
                  <option>MarginPilot</option>
                  <option>LaunchPilot</option>
                  <option>QualityPilot</option>
                  <option>Tutta la Suite Pilot</option>
                  <option>Piani e condizioni disponibili</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Quando preferisci essere contattato
                <select name="orario" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]">
                  <option>Mattina</option>
                  <option>Pomeriggio</option>
                  <option>Indifferente</option>
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-black text-[#344054]">
              Messaggio
              <textarea name="messaggio" rows={4} className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Scrivi cosa vorresti migliorare o quale programma ti interessa." />
            </label>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#123c69] px-6 py-3 text-base font-black text-white transition hover:bg-[#175cd3]">
              Invia richiesta
              <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-xs font-semibold leading-5 text-[#667085]">
              I dati saranno usati solo per ricontattarti in merito alla richiesta e proporti il profilo, la licenza e il programma più adatti alla tua attività.
            </p>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">FAQ</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Domande frequenti</h2>
            <p className="mt-4 text-lg leading-8 text-[#516079]">
              Risposte semplici per capire se Suite Pilot è adatto alla tua attività.
            </p>
          </div>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-black text-[#101828]">
                  {faq.question}
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-black text-[#175cd3] group-open:bg-[#123c69] group-open:text-white">Apri</span>
                </summary>
                <p className="mt-4 text-base font-semibold leading-7 text-[#667085]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-[34px] border border-[#d9e2ef] bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Roadmap</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">In continua evoluzione</h2>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#516079]">
            La suite è pensata per crescere in modo progressivo, senza perdere semplicità d'uso.
          </p>
          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {roadmap.map((item) => (
              <div key={item} className="rounded-2xl bg-[#f8fafc] p-4 text-sm font-black leading-6 text-[#344054] ring-1 ring-[#d9e2ef]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <div className="rounded-[34px] bg-[#123c69] p-8 text-white md:p-12">
          <h2 className="max-w-3xl text-4xl font-black tracking-tight md:text-5xl">Vuoi vedere Suite Pilot in azione?</h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#d1e0ff]">
            Richiedi una dimostrazione e scopri come migliorare il controllo della tua attività.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="mailto:info@guidipaolo.it?subject=Richiesta%20demo%20Suite%20Pilot" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-black text-[#123c69]">
              Richiedi una Demo
              <ArrowRight className="h-5 w-5" />
            </a>
            <Link href="/programmi" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-black text-white">
              Area clienti
            </Link>
            <Link href="/registrazione" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-base font-black text-white">
              Richiedi attivazione
            </Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-[#d9e2ef] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-base font-black text-[#101828]">Suite Pilot</p>
            <p className="mt-1 text-sm font-semibold text-[#667085]">Controllo, sviluppo e qualità per la ristorazione.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-[#516079]">
            <Link href="/programmi" className="hover:text-[#175cd3]">Area clienti</Link>
            <Link href="/registrazione" className="hover:text-[#175cd3]">Registrazione</Link>
            <a href="#contatto" className="hover:text-[#175cd3]">Contattaci</a>
            <Link href="/privacy" className="hover:text-[#175cd3]">Privacy Policy</Link>
            <Link href="/login" className="text-[#98a2b3] hover:text-[#175cd3]">Area riservata</Link>
          </div>
        </div>
      </footer>
      {previewImage ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#07111f]/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Anteprima screenshot">
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[30px] border border-white/20 bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#e4eaf3] px-5 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#175cd3]">Anteprima</p>
                <h2 className="text-lg font-black text-[#101828]">{previewImage.alt}</h2>
              </div>
              <button type="button" onClick={() => setPreviewImage(null)} className="rounded-full border border-[#c7d7ee] bg-white px-5 py-2 text-sm font-black text-[#123c69] shadow-sm transition hover:border-[#175cd3]">
                Chiudi
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto bg-[#f8fafc] p-4">
              <img src={previewImage.src} alt={previewImage.alt} className="mx-auto h-auto max-w-full rounded-2xl border border-[#d9e2ef] bg-white shadow-sm" />
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
