"use client";

import { useMemo, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import {
  dashboardStats,
  demoAuditLogs,
  demoContacts,
  demoPayments,
  demoPlans,
  demoUsers,
  euro,
  licenseLabel,
  moneyIcon,
  programName,
  programs,
  remainingProjects,
  sidebarItems,
  type AdminUser,
  type ProgramSlug
} from "@/lib/master-data";

const MoneyIcon = moneyIcon;

const statusClasses: Record<string, string> = {
  active: "bg-[#ecfdf3] text-[#067647] border-[#abefc6]",
  paid: "bg-[#ecfdf3] text-[#067647] border-[#abefc6]",
  pending: "bg-[#fffaeb] text-[#b54708] border-[#fedf89]",
  expired: "bg-[#fff7ed] text-[#b54708] border-[#fedf89]",
  suspended: "bg-[#fef3f2] text-[#b42318] border-[#fecdca]",
  failed: "bg-[#fef3f2] text-[#b42318] border-[#fecdca]",
  refunded: "bg-[#eef4ff] text-[#175cd3] border-[#b2ccff]",
  nuovo: "bg-[#eef4ff] text-[#175cd3] border-[#b2ccff]",
  contattato: "bg-[#f9fafb] text-[#344054] border-[#d0d5dd]",
  interessato: "bg-[#ecfdf3] text-[#067647] border-[#abefc6]",
  cliente: "bg-[#ecfdf3] text-[#067647] border-[#abefc6]",
  non_interessato: "bg-[#fef3f2] text-[#b42318] border-[#fecdca]"
};

export function AdminSuite() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [programFilter, setProgramFilter] = useState<ProgramSlug | "all">("all");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredUsers = useMemo(() => {
    return demoUsers.filter((user) => {
      const byQuery = [user.name, user.email, user.company, user.city].join(" ").toLowerCase().includes(query.toLowerCase());
      const byProgram = programFilter === "all" || user.accesses.some((access) => access.program === programFilter);
      const byLicense = licenseFilter === "all" || user.accesses.some((access) => access.licenseStatus === licenseFilter);
      return byQuery && byProgram && byLicense;
    });
  }, [programFilter, licenseFilter, query]);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#d9e2ef] bg-white px-5 py-6 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#123c69] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#175cd3]">Master</p>
            <h1 className="text-lg font-bold">Admin Suite</h1>
          </div>
        </div>
        <nav className="grid gap-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active ? "bg-[#123c69] text-white" : "text-[#516079] hover:bg-[#eef4ff] hover:text-[#175cd3]"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-[#d9e2ef] bg-white/90 px-6 py-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#667085]">Pannello amministrativo centrale</p>
              <h2 className="text-2xl font-bold tracking-tight">Gestione ecosistema Pilot</h2>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="hidden rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-semibold text-[#123c69] md:inline-flex"
              >
                Pagina prodotti
              </a>
              <button className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-4 py-2 text-sm font-bold text-white">
                <UserPlus className="h-4 w-4" />
                Crea utente
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-6 py-7">
          <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
          {activeSection === "dashboard" && <DashboardSection />}
          {activeSection === "users" && (
            <UsersSection
              users={filteredUsers}
              query={query}
              setQuery={setQuery}
              programFilter={programFilter}
              setProgramFilter={setProgramFilter}
              licenseFilter={licenseFilter}
              setLicenseFilter={setLicenseFilter}
            />
          )}
          {activeSection === "programs" && <ProgramsSection />}
          {activeSection === "licenses" && <LicensesSection users={demoUsers} />}
          {activeSection === "plans" && <PlansSection />}
          {activeSection === "payments" && <PaymentsSection />}
          {activeSection === "invoices" && <InvoicesSection />}
          {activeSection === "contacts" && <ContactsSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "audit" && <AuditSection />}
        </div>
      </section>
    </main>
  );
}

function MobileNav({ activeSection, setActiveSection }: { activeSection: string; setActiveSection: (value: string) => void }) {
  return (
    <div className="mb-6 overflow-x-auto lg:hidden">
      <div className="flex min-w-max gap-2">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              activeSection === item.id ? "bg-[#123c69] text-white" : "bg-white text-[#516079]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DashboardSection() {
  const cards = [
    { label: "Utenti totali", value: dashboardStats.users, icon: UserPlus, tone: "bg-[#eef4ff] text-[#175cd3]" },
    { label: "Licenze attive", value: dashboardStats.activeLicenses, icon: BadgeCheck, tone: "bg-[#ecfdf3] text-[#067647]" },
    { label: "Licenze bloccate", value: dashboardStats.expiredLicenses, icon: AlertCircle, tone: "bg-[#fff7ed] text-[#b54708]" },
    { label: "Incassi registrati", value: euro(dashboardStats.recentPayments), icon: MoneyIcon, tone: "bg-[#f0f9ff] text-[#026aa2]" }
  ];

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-[24px] border border-[#d9e2ef] bg-white p-5 soft-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#667085]">{card.label}</p>
                  <p className="numeric mt-3 text-3xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className={`rounded-2xl p-3 ${card.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Programmi collegati" action="Gestisci programmi">
          <div className="grid gap-3">
            {programs.map((program) => (
              <div key={program.slug} className="flex items-center justify-between rounded-2xl border border-[#edf2f7] p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${program.accent}`} />
                  <div>
                    <p className="font-bold">{program.name}</p>
                    <p className="text-sm text-[#667085]">{program.description}</p>
                  </div>
                </div>
                <Badge value={program.active ? "active" : "pending"} label={program.active ? "Attivo" : "In preparazione"} />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Ultime attività" action="Audit completo">
          <div className="grid gap-3">
            {demoAuditLogs.map((log) => (
              <div key={log.id} className="rounded-2xl bg-[#f8fafc] p-4">
                <p className="font-semibold">{log.event}</p>
                <p className="mt-1 text-sm text-[#667085]">
                  {log.actor} → {log.target}
                </p>
                <p className="mt-2 text-xs font-semibold text-[#175cd3]">{log.createdAt}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function UsersSection({
  users,
  query,
  setQuery,
  programFilter,
  setProgramFilter,
  licenseFilter,
  setLicenseFilter
}: {
  users: AdminUser[];
  query: string;
  setQuery: (value: string) => void;
  programFilter: ProgramSlug | "all";
  setProgramFilter: (value: ProgramSlug | "all") => void;
  licenseFilter: string;
  setLicenseFilter: (value: string) => void;
}) {
  return (
    <Panel title="Gestione utenti" action="Nuovo utente">
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_220px]">
        <label className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#98a2b3]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cerca nome, email, azienda o città"
            className="w-full rounded-2xl border border-[#d0d5dd] bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#175cd3]"
          />
        </label>
        <select
          value={programFilter}
          onChange={(event) => setProgramFilter(event.target.value as ProgramSlug | "all")}
          className="rounded-2xl border border-[#d0d5dd] bg-white px-4 py-3 text-sm font-semibold"
        >
          <option value="all">Tutti i programmi</option>
          {programs.map((program) => (
            <option key={program.slug} value={program.slug}>
              {program.name}
            </option>
          ))}
        </select>
        <select
          value={licenseFilter}
          onChange={(event) => setLicenseFilter(event.target.value)}
          className="rounded-2xl border border-[#d0d5dd] bg-white px-4 py-3 text-sm font-semibold"
        >
          <option value="all">Tutte le licenze</option>
          <option value="active">Attive</option>
          <option value="expired">Scadute</option>
          <option value="suspended">Sospese</option>
        </select>
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Utente</Th>
            <Th>Programmi e ruoli</Th>
            <Th>Stato</Th>
            <Th>Ultimo accesso</Th>
            <Th>Azioni</Th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <Td>
                <div>
                  <p className="font-bold">{user.name}</p>
                  <p className="text-sm text-[#667085]">{user.email}</p>
                  <p className="text-xs text-[#98a2b3]">{user.company} · {user.city}</p>
                </div>
              </Td>
              <Td>
                <div className="grid gap-2">
                  {user.accesses.map((access) => (
                    <div key={`${user.id}-${access.program}`} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-sm">
                      <span className="font-bold">{programName(access.program)}</span>
                      <span className="text-[#667085]"> · {access.role} · {licenseLabel(access.licenseType)}</span>
                      {remainingProjects(access) !== null && (
                        <span className="ml-2 font-semibold text-[#175cd3]">{remainingProjects(access)} progetti residui</span>
                      )}
                    </div>
                  ))}
                </div>
              </Td>
              <Td><Badge value={user.status} label={user.status === "active" ? "Attivo" : "Sospeso"} /></Td>
              <Td><span className="numeric text-sm font-semibold">{user.lastAccess}</span></Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <IconButton label="Reset password" icon={RotateCcw} />
                  <IconButton label="Credenziali" icon={KeyRound} />
                  <IconButton label="Altro" icon={MoreHorizontal} />
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}

function ProgramsSection() {
  return (
    <Panel title="Gestione programmi" action="Aggiungi programma">
      <div className="grid gap-4 md:grid-cols-3">
        {programs.map((program) => (
          <div key={program.slug} className="rounded-[24px] border border-[#d9e2ef] bg-white p-5">
            <div className={`mb-5 h-16 rounded-3xl bg-gradient-to-br ${program.accent}`} />
            <h3 className="text-2xl font-bold">{program.name}</h3>
            <p className="mt-2 min-h-16 text-sm leading-6 text-[#667085]">{program.description}</p>
            <div className="mt-5 grid gap-2 text-sm">
              <p><span className="font-semibold">Slug:</span> {program.slug}</p>
              <p><span className="font-semibold">Login:</span> {program.loginUrl}</p>
              <Badge value={program.active ? "active" : "pending"} label={program.active ? "Attivo" : "Non attivo"} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LicensesSection({ users }: { users: AdminUser[] }) {
  return (
    <Panel title="Gestione licenze" action="Nuova licenza">
      <Table>
        <thead>
          <tr>
            <Th>Utente</Th>
            <Th>Programma</Th>
            <Th>Tipo licenza</Th>
            <Th>Validità</Th>
            <Th>Progetti</Th>
            <Th>Stato</Th>
          </tr>
        </thead>
        <tbody>
          {users.flatMap((user) =>
            user.accesses.map((access) => (
              <tr key={`${user.id}-${access.program}`}>
                <Td>{user.name}</Td>
                <Td>{programName(access.program)}</Td>
                <Td>{licenseLabel(access.licenseType)}</Td>
                <Td>
                  <span className="numeric text-sm">{access.startDate}{access.endDate ? ` → ${access.endDate}` : ""}</span>
                </Td>
                <Td>
                  {access.projectsPurchased ? `${access.projectsUsed || 0}/${access.projectsPurchased} usati` : "Illimitati"}
                </Td>
                <Td><Badge value={access.licenseStatus} label={access.licenseStatus} /></Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Panel>
  );
}

function PlansSection() {
  return (
    <Panel title="Piani commerciali" action="Nuovo piano">
      <Table>
        <thead>
          <tr>
            <Th>Piano</Th>
            <Th>Programma</Th>
            <Th>Tipo</Th>
            <Th>Prezzo</Th>
            <Th>Limite progetti</Th>
            <Th>Stato</Th>
          </tr>
        </thead>
        <tbody>
          {demoPlans.map((plan) => (
            <tr key={plan.code}>
              <Td><span className="font-bold">{plan.name}</span></Td>
              <Td>{programName(plan.program)}</Td>
              <Td>{licenseLabel(plan.type)}</Td>
              <Td className="numeric">{euro(plan.price)}</Td>
              <Td>{plan.projectLimit ?? "Illimitati"}</Td>
              <Td><Badge value={plan.active ? "active" : "pending"} label={plan.active ? "Attivo" : "Non attivo"} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}

function PaymentsSection() {
  return (
    <Panel title="Pagamenti" action="Registra pagamento">
      <Table>
        <thead>
          <tr>
            <Th>Utente</Th>
            <Th>Programma</Th>
            <Th>Importo</Th>
            <Th>Metodo</Th>
            <Th>Data</Th>
            <Th>Stato</Th>
          </tr>
        </thead>
        <tbody>
          {demoPayments.map((payment) => (
            <tr key={payment.id}>
              <Td>{payment.user}</Td>
              <Td>{programName(payment.program)}</Td>
              <Td className="numeric font-bold">{euro(payment.amount)}</Td>
              <Td>{payment.method}</Td>
              <Td>{payment.paidAt}</Td>
              <Td><Badge value={payment.status} label={payment.status} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}

function InvoicesSection() {
  return (
    <Panel title="Fatturazione" action="Nuova fattura">
      <div className="rounded-2xl border border-dashed border-[#b2ccff] bg-[#eef4ff] p-5">
        <h3 className="font-bold text-[#123c69]">Predisposizione pronta</h3>
        <p className="mt-2 text-sm leading-6 text-[#516079]">
          La struttura database include numero fattura, utente, programma, imponibile, IVA, stato,
          data emissione, data pagamento e futuro PDF. L’integrazione automatica potrà essere collegata a Stripe, PayPal o gestionale fiscale.
        </p>
      </div>
    </Panel>
  );
}

function ContactsSection() {
  return (
    <Panel title="CRM / contatti" action="Nuovo contatto">
      <Table>
        <thead>
          <tr>
            <Th>Contatto</Th>
            <Th>Azienda</Th>
            <Th>Città</Th>
            <Th>Programma</Th>
            <Th>Stato</Th>
          </tr>
        </thead>
        <tbody>
          {demoContacts.map((contact) => (
            <tr key={contact.id}>
              <Td>
                <p className="font-bold">{contact.name}</p>
                <p className="text-sm text-[#667085]">{contact.email}</p>
              </Td>
              <Td>{contact.company}</Td>
              <Td>{contact.city}</Td>
              <Td>{programName(contact.interestedProgram)}</Td>
              <Td><Badge value={contact.status} label={contact.status.replace("_", " ")} /></Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}

function SettingsSection() {
  const settings = [
    { title: "Supabase Auth", text: "Accesso amministrativo protetto con controllo ruolo admin.", icon: LockKeyhole },
    { title: "Stripe futuro", text: "Database e pagamenti sono già predisposti per collegare Stripe.", icon: CircleDollarSign },
    { title: "Regole progetto", text: "Launch Pilot può bloccare nuovi progetti quando il pacchetto è esaurito.", icon: CheckCircle2 },
    { title: "Scadenze", text: "Licenze a tempo controllate con data inizio, data fine e stato.", icon: CalendarClock }
  ];
  return (
    <Panel title="Impostazioni sistema" action="Salva impostazioni">
      <div className="grid gap-4 md:grid-cols-2">
        {settings.map((setting) => {
          const Icon = setting.icon;
          return (
            <div key={setting.title} className="rounded-3xl border border-[#d9e2ef] bg-white p-5">
              <Icon className="h-5 w-5 text-[#175cd3]" />
              <h3 className="mt-4 text-lg font-bold">{setting.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#667085]">{setting.text}</p>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function AuditSection() {
  return (
    <Panel title="Audit logs" action="Esporta log">
      <Table>
        <thead>
          <tr>
            <Th>Evento</Th>
            <Th>Autore</Th>
            <Th>Oggetto</Th>
            <Th>Data</Th>
          </tr>
        </thead>
        <tbody>
          {demoAuditLogs.map((log) => (
            <tr key={log.id}>
              <Td><span className="font-bold">{log.event}</span></Td>
              <Td>{log.actor}</Td>
              <Td>{log.target}</Td>
              <Td className="numeric">{log.createdAt}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Panel>
  );
}

function Panel({ title, action, children }: { title: string; action?: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-[#d9e2ef] bg-white p-5 soft-shadow md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {action && (
          <button className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-4 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" />
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#d9e2ef]">
      <table className="min-w-[900px] w-full border-collapse bg-white text-left text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th className="bg-[#f8fafc] px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-[#516079]">{children}</th>;
}

function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-t border-[#edf2f7] px-4 py-4 align-top ${className}`}>{children}</td>;
}

function Badge({ value, label }: { value: string; label: string }) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[value] || "bg-[#f9fafb] text-[#344054] border-[#d0d5dd]"}`}>
      {label}
    </span>
  );
}

function IconButton({ label, icon: Icon }: { label: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <button title={label} className="grid h-9 w-9 place-items-center rounded-xl border border-[#d9e2ef] bg-white text-[#516079] hover:border-[#175cd3] hover:text-[#175cd3]">
      <Icon className="h-4 w-4" />
    </button>
  );
}
