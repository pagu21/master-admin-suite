"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

const programs = [
  {
    id: "marginpilot",
    name: "MarginPilot",
    description: "Controllo margini, vendite, food cost, budget e redditività."
  },
  {
    id: "launchpilot",
    name: "LaunchPilot",
    description: "Prefattibilità economico-finanziaria, investimenti, scenari e sostenibilità."
  },
  {
    id: "qualitypilot",
    name: "QualityPilot",
    description: "Questionari, qualità operativa, customer experience e report per punti vendita."
  }
];

const profileOptions = [
  "Ristoratore",
  "Consulente",
  "Gruppo / più punti vendita",
  "Franchising",
  "Hotel con ristorazione",
  "Altro profilo"
];

const licenseOptions = [
  "Demo",
  "Abbonamento mensile",
  "Abbonamento annuale",
  "LaunchPilot pack 1 progetto",
  "LaunchPilot pack 3 progetti",
  "LaunchPilot pack 5 progetti",
  "Suite completa",
  "Da valutare insieme"
];

export default function RegistrationPage() {
  const [selectedPrograms, setSelectedPrograms] = useState<string[]>(["marginpilot"]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedContract, setAcceptedContract] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);
  const [acceptedMarketing, setAcceptedMarketing] = useState(false);

  const selectedProgramNames = useMemo(
    () => programs.filter((program) => selectedPrograms.includes(program.id)).map((program) => program.name).join(", "),
    [selectedPrograms]
  );

  function toggleProgram(programId: string) {
    setSelectedPrograms((current) => {
      if (current.includes(programId)) {
        return current.length === 1 ? current : current.filter((id) => id !== programId);
      }

      return [...current, programId];
    });
  }

  const canSubmit = selectedPrograms.length > 0 && acceptedPrivacy && acceptedContract && acceptedData;

  async function submitRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    const formData = new FormData(event.currentTarget);
    setSubmitting(true);
    setMessage("");

    const response = await fetch("/api/registration-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: String(formData.get("nome") || ""),
        lastName: String(formData.get("cognome") || ""),
        email: String(formData.get("email") || ""),
        phone: String(formData.get("telefono") || ""),
        company: String(formData.get("azienda") || ""),
        city: String(formData.get("citta") || ""),
        programs: programs.filter((program) => selectedPrograms.includes(program.id)).map((program) => program.name),
        profile: String(formData.get("profilo") || ""),
        license: String(formData.get("licenza") || ""),
        notes: String(formData.get("note") || ""),
        privacyAccepted: acceptedPrivacy,
        dataAccepted: acceptedData,
        contractAccepted: acceptedContract,
        marketingAccepted: acceptedMarketing
      })
    });

    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    setSubmitting(false);

    if (!response.ok) {
      setMessage(result?.error || "Richiesta non inviata. Controlla i dati e riprova.");
      return;
    }

    event.currentTarget.reset();
    setSelectedPrograms(["marginpilot"]);
    setAcceptedPrivacy(false);
    setAcceptedData(false);
    setAcceptedContract(false);
    setAcceptedMarketing(false);
    setMessage("Richiesta inviata correttamente. Ti ricontatteremo per confermare profilo, licenza e accessi.");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101828]">
      <section className="mx-auto max-w-6xl px-6 py-10 md:py-16">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-black text-[#123c69] shadow-sm transition hover:border-[#175cd3]">
          <ArrowLeft className="h-4 w-4" />
          Torna alla landing
        </Link>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="rounded-[34px] border border-[#d9e2ef] bg-white p-8 shadow-sm">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4ff] text-[#175cd3]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <p className="mt-7 text-sm font-black uppercase tracking-[0.18em] text-[#175cd3]">Richiesta di attivazione</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Scegli programmi, profilo e licenza</h1>
            <p className="mt-5 text-base font-semibold leading-8 text-[#667085]">
              Compila la richiesta: verifichiamo il profilo più adatto e poi abilitiamo gli accessi corretti. La registrazione non attiva automaticamente licenze o funzioni protette.
            </p>
            <div className="mt-7 grid gap-3">
              {[
                "Ogni utente vede solo i programmi abilitati.",
                "Le licenze possono essere singole, a tempo o a pacchetto.",
                "I consensi privacy e contrattuali vengono raccolti prima dell'attivazione."
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm font-bold leading-6 text-[#344054] ring-1 ring-[#e4eaf3]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#067647]" />
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[26px] border border-[#c7d7ee] bg-[#f8fbff] p-5">
              <h2 className="text-lg font-black text-[#123c69]">Hai dubbi su cosa scegliere?</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">
                Se non sai quale programma, profilo o licenza indicare, puoi inviare comunque la richiesta o contattarci: ti aiutiamo a scegliere la soluzione più adatta.
              </p>
              <a href="mailto:info@guidipaolo.it?subject=Dubbi%20registrazione%20Suite%20Pilot" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-[#123c69] ring-1 ring-[#c7d7ee] transition hover:ring-[#175cd3]">
                Contattaci
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </aside>

          <form onSubmit={submitRequest} className="rounded-[34px] border border-[#d9e2ef] bg-white p-6 shadow-sm md:p-8">
            <input type="hidden" name="programmi_selezionati" value={selectedProgramNames} />
            <input type="hidden" name="consenso_marketing" value={acceptedMarketing ? "si" : "no"} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Nome
                <input required name="nome" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Nome" />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Cognome
                <input required name="cognome" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Cognome" />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Email
                <input required type="email" name="email" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="nome@email.it" />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Telefono
                <input name="telefono" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="+39..." />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Azienda / attività
                <input required name="azienda" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Nome locale o società" />
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Città
                <input name="citta" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Città" />
              </label>
            </div>

            <div className="mt-7">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#175cd3]">Programmi richiesti</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">Puoi scegliere uno o più programmi. L'accesso finale dipenderà dal profilo e dalla licenza confermata.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {programs.map((program) => {
                  const active = selectedPrograms.includes(program.id);

                  return (
                    <button key={program.id} type="button" onClick={() => toggleProgram(program.id)} className={`rounded-3xl border p-5 text-left transition ${active ? "border-[#175cd3] bg-[#eef4ff] shadow-sm" : "border-[#d9e2ef] bg-white hover:border-[#175cd3]"}`}>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.12em] ${active ? "bg-[#175cd3] text-white" : "bg-[#f2f4f7] text-[#667085]"}`}>
                        {active ? "Selezionato" : "Seleziona"}
                      </span>
                      <h2 className="mt-4 text-xl font-black">{program.name}</h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-[#667085]">{program.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Profilo di utilizzo
                <select required name="profilo" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]">
                  {profileOptions.map((profile) => (
                    <option key={profile}>{profile}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-[#344054]">
                Licenza desiderata
                <select required name="licenza" className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]">
                  {licenseOptions.map((license) => (
                    <option key={license}>{license}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="mt-5 grid gap-2 text-sm font-black text-[#344054]">
              Note o richiesta specifica
              <textarea name="note" rows={4} className="rounded-2xl border border-[#c7d7ee] bg-white px-4 py-3 text-base font-semibold outline-none transition focus:border-[#175cd3]" placeholder="Esempio: vorrei una demo, ho più locali, mi interessa LaunchPilot pack 3 progetti..." />
            </label>

            <div className="mt-7 rounded-[26px] border border-[#d9e2ef] bg-[#f8fafc] p-5">
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#175cd3]">Consensi richiesti</p>
              <div className="mt-4 grid gap-3">
                <label className="flex items-start gap-3 text-sm font-bold leading-6 text-[#344054]">
                  <input required type="checkbox" checked={acceptedPrivacy} onChange={(event) => setAcceptedPrivacy(event.target.checked)} className="mt-1 h-4 w-4 rounded border-[#c7d7ee]" />
                  <span>Ho letto l'informativa privacy e autorizzo il trattamento dei dati per la gestione della richiesta. <Link href="/privacy" className="text-[#175cd3] underline">Leggi privacy</Link></span>
                </label>
                <label className="flex items-start gap-3 text-sm font-bold leading-6 text-[#344054]">
                  <input required type="checkbox" checked={acceptedData} onChange={(event) => setAcceptedData(event.target.checked)} className="mt-1 h-4 w-4 rounded border-[#c7d7ee]" />
                  <span>Accetto che i dati inseriti siano utilizzati per valutare profilo, programmi richiesti e licenza più adatta.</span>
                </label>
                <label className="flex items-start gap-3 text-sm font-bold leading-6 text-[#344054]">
                  <input required type="checkbox" checked={acceptedContract} onChange={(event) => setAcceptedContract(event.target.checked)} className="mt-1 h-4 w-4 rounded border-[#c7d7ee]" />
                  <span>Accetto la documentazione contrattuale e commerciale che mi sarà sottoposta prima dell'attivazione definitiva del servizio.</span>
                </label>
                <label className="flex items-start gap-3 text-sm font-bold leading-6 text-[#344054]">
                  <input type="checkbox" checked={acceptedMarketing} onChange={(event) => setAcceptedMarketing(event.target.checked)} className="mt-1 h-4 w-4 rounded border-[#c7d7ee]" />
                  <span>Acconsento a ricevere comunicazioni commerciali, promozioni e aggiornamenti sui programmi Suite Pilot. Facoltativo.</span>
                </label>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-semibold leading-5 text-[#667085]">
                La richiesta viene inviata per verifica. Gli accessi vengono abilitati solo dopo conferma del profilo e della licenza.
              </p>
              <button type="submit" disabled={!canSubmit || submitting} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#123c69] px-6 py-3 text-base font-black text-white transition hover:bg-[#175cd3] disabled:cursor-not-allowed disabled:bg-[#98a2b3]">
                {submitting ? "Invio..." : "Invia richiesta"}
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
            {message ? (
              <div className={`mt-5 rounded-2xl border p-4 text-sm font-bold leading-6 ${message.includes("correttamente") ? "border-[#abefc6] bg-[#ecfdf3] text-[#067647]" : "border-[#fecdca] bg-[#fef3f2] text-[#b42318]"}`}>
                {message}
              </div>
            ) : null}
          </form>
        </div>
      </section>
    </main>
  );
}
