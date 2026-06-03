import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const sections = [
  {
    title: "1. Titolare del trattamento",
    body: [
      "Il Titolare del trattamento dei dati personali e:",
      "[DENOMINAZIONE TITOLARE DA INSERIRE]",
      "Sede legale: [INDIRIZZO DA INSERIRE]",
      "Email: [EMAIL DA INSERIRE]",
      "PEC: [PEC DA INSERIRE]",
      "Partita IVA: [PARTITA IVA DA INSERIRE]"
    ]
  },
  {
    title: "2. Premessa",
    body: [
      "La presente informativa descrive le modalita di raccolta, utilizzo, conservazione e protezione dei dati personali trattati attraverso la piattaforma Suite Pilot.",
      "Suite Pilot e una piattaforma software destinata a ristoratori, consulenti e operatori del settore della ristorazione per finalita di controllo di gestione, business planning, standardizzazione dei processi e miglioramento delle performance aziendali."
    ]
  },
  {
    title: "3. Tipologie di dati trattati",
    body: [
      "La piattaforma puo raccogliere e trattare dati identificativi, dati di accesso, dati aziendali e altri dati inseriti volontariamente dall'utente.",
      "Dati identificativi: nome, cognome, ragione sociale, indirizzo email, numero di telefono.",
      "Dati di accesso: username, password cifrate, log di accesso, indirizzi IP.",
      "Dati aziendali: dati economici, dati di vendita, dati di budget, dati di controllo di gestione e dati inseriti volontariamente dall'utente.",
      "Altri dati: [EVENTUALI ALTRE CATEGORIE DA INSERIRE]."
    ]
  },
  {
    title: "4. Finalita del trattamento",
    body: [
      "I dati vengono trattati per consentire l'accesso alla piattaforma, erogare i servizi richiesti, fornire assistenza tecnica, migliorare il funzionamento del software, adempiere ad obblighi di legge, gestire richieste di informazioni e demo, garantire la sicurezza della piattaforma.",
      "I dati possono inoltre essere utilizzati per inviare comunicazioni informative, operative, amministrative e commerciali relative a Suite Pilot, aggiornamenti della piattaforma, nuove funzionalita, nuovi servizi, eventi, webinar, iniziative formative, offerte commerciali e promozionali."
    ]
  },
  {
    title: "5. Comunicazioni via email",
    body: [
      "L'utente autorizza il Titolare a utilizzare l'indirizzo email fornito durante registrazione, richiesta informazioni, richiesta demo o utilizzo della piattaforma.",
      "Le comunicazioni possono includere notifiche operative, comunicazioni amministrative, assistenza tecnica, aggiornamenti software, nuove funzionalita, contenuti informativi e formativi, webinar, eventi, offerte commerciali e attivita promozionali.",
      "L'utente potra revocare in qualsiasi momento il consenso alle comunicazioni promozionali utilizzando il link di disiscrizione presente nelle email oppure contattando il Titolare.",
      "Durante registrazione e richiesta demo potra essere prevista una casella di consenso separata per comunicazioni commerciali e marketing."
    ]
  },
  {
    title: "6. Base giuridica del trattamento",
    body: [
      "Il trattamento si basa su esecuzione di un contratto, adempimento di obblighi legali, consenso dell'interessato ove richiesto e legittimo interesse del Titolare."
    ]
  },
  {
    title: "7. Conservazione dei dati",
    body: [
      "I dati saranno conservati per il tempo necessario all'erogazione dei servizi e comunque per il periodo richiesto dagli obblighi normativi applicabili.",
      "Periodo indicativo: [PERIODO DI CONSERVAZIONE DA DEFINIRE]."
    ]
  },
  {
    title: "8. Hosting e fornitori tecnologici",
    body: [
      "La piattaforma puo utilizzare servizi di terze parti. A titolo esemplificativo: Vercel, Supabase, Stripe se attivato, Google Analytics se attivato.",
      "L'elenco aggiornato dei fornitori potra essere richiesto al Titolare."
    ]
  },
  {
    title: "9. Trasferimento dei dati",
    body: [
      "I dati potrebbero essere trattati all'interno dell'Unione Europea o in Paesi terzi nel rispetto del Regolamento UE 2016/679 e delle garanzie previste dalla normativa applicabile."
    ]
  },
  {
    title: "10. Sicurezza",
    body: [
      "Suite Pilot adotta misure tecniche e organizzative adeguate per garantire riservatezza, integrita, disponibilita e protezione dei dati trattati."
    ]
  },
  {
    title: "11. Diritti dell'interessato",
    body: [
      "L'interessato puo esercitare in qualsiasi momento i diritti previsti dagli articoli 15-22 del GDPR.",
      "In particolare puo richiedere accesso ai dati, rettifica, cancellazione, limitazione del trattamento, portabilita e opposizione al trattamento.",
      "Le richieste possono essere inviate a: [EMAIL PRIVACY DA INSERIRE]."
    ]
  },
  {
    title: "12. Reclamo all'autorita garante",
    body: [
      "L'interessato ha diritto di proporre reclamo al Garante per la Protezione dei Dati Personali."
    ]
  },
  {
    title: "13. Modifiche all'informativa",
    body: [
      "Il Titolare si riserva il diritto di modificare la presente informativa in qualsiasi momento.",
      "Le modifiche saranno pubblicate su questa pagina con indicazione della data di aggiornamento."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101828]">
      <section className="mx-auto max-w-5xl px-6 py-10 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-black text-[#123c69] shadow-sm transition hover:border-[#175cd3]">
          <ArrowLeft className="h-4 w-4" />
          Torna alla landing
        </Link>

        <div className="mt-8 rounded-[34px] border border-[#d9e2ef] bg-white p-7 shadow-sm md:p-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Suite Pilot</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Privacy Policy</h1>
              <p className="mt-4 text-base font-semibold leading-7 text-[#667085]">Ultimo aggiornamento: 3 giugno 2026</p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4ff] text-[#175cd3]">
              <ShieldCheck className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-5">
            <p className="text-sm font-semibold leading-7 text-[#516079]">
              Le informazioni presenti in questa pagina sono predisposte come base informativa e devono essere completate con i dati del Titolare del trattamento e verificate da un professionista abilitato.
            </p>
          </div>

          <div className="mt-8 grid gap-5">
            {sections.map((section) => (
              <section key={section.title} className="rounded-3xl border border-[#e4eaf3] bg-white p-5">
                <h2 className="text-xl font-black text-[#101828]">{section.title}</h2>
                <div className="mt-4 grid gap-3">
                  {section.body.map((paragraph) => (
                    <p key={paragraph} className="text-base font-semibold leading-8 text-[#516079]">{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-8 rounded-3xl border border-[#d9e2ef] bg-[#eef4ff] p-6">
            <h2 className="text-xl font-black text-[#101828]">Contatti privacy</h2>
            <div className="mt-4 grid gap-2 text-base font-semibold leading-7 text-[#516079]">
              <p>Titolare del trattamento: [DA COMPLETARE]</p>
              <p>Email: [DA COMPLETARE]</p>
              <p>Telefono: [DA COMPLETARE]</p>
              <p>Indirizzo: [DA COMPLETARE]</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
