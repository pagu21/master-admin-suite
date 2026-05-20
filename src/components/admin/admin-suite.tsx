"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ComponentType, FormEvent, ReactNode } from "react";
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  KeyRound,
  LockKeyhole,
  LogOut,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
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
  type LicenseType,
  type ProgramSlug
} from "@/lib/master-data";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

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
  const [users, setUsers] = useState<AdminUser[]>(demoUsers);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [createUserMessage, setCreateUserMessage] = useState("");
  const [programFilter, setProgramFilter] = useState<ProgramSlug | "all">("all");
  const [licenseFilter, setLicenseFilter] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadUsers() {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const result = (await response.json().catch(() => null)) as { users?: AdminUser[] } | null;
      if (!ignore && response.ok && result?.users) {
        setUsers(result.users);
      }
    }
    loadUsers().catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const byQuery = [user.name, user.email, user.company, user.city].join(" ").toLowerCase().includes(query.toLowerCase());
      const byProgram = programFilter === "all" || user.accesses.some((access) => access.program === programFilter);
      const byLicense = licenseFilter === "all" || user.accesses.some((access) => access.licenseStatus === licenseFilter);
      return byQuery && byProgram && byLicense;
    });
  }, [programFilter, licenseFilter, query, users]);

  async function handleCreateUser(payload: CreateUserPayload) {
    setCreateUserMessage("");
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = (await response.json().catch(() => null)) as { user?: AdminUser; error?: string } | null;

    if (!response.ok || !result?.user) {
      setCreateUserMessage(result?.error || "Utente non creato. Controlla configurazione Supabase e riprova.");
      return;
    }

    const updatedResponse = await fetch("/api/admin/users", { cache: "no-store" });
    const updatedResult = (await updatedResponse.json().catch(() => null)) as { users?: AdminUser[] } | null;
    if (updatedResponse.ok && updatedResult?.users) {
      setUsers(updatedResult.users);
    } else {
      setUsers((current) => [result.user as AdminUser, ...current.filter((user) => user.id !== result.user?.id)]);
    }
    setIsCreateUserOpen(false);
    setActiveSection("users");
  }

  async function handleDeleteUser(user: AdminUser) {
    const confirmed = window.confirm(`Eliminare definitivamente ${user.name}?\n\nL'utente verra rimosso da Supabase Auth e dal Master Admin.`);
    if (!confirmed) return;

    const response = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      window.alert(result?.error || "Utente non eliminato.");
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== user.id));
  }

  async function handleLogout() {
    if (hasSupabaseBrowserConfig()) {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut();
    }
    window.location.href = "/login";
  }

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
              <Link
                href="/"
                className="hidden rounded-full border border-[#c7d7ee] bg-white px-4 py-2 text-sm font-semibold text-[#123c69] md:inline-flex"
              >
                Pagina prodotti
              </Link>
              <button
                onClick={() => setIsCreateUserOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-4 py-2 text-sm font-bold text-white"
              >
                <UserPlus className="h-4 w-4" />
                Crea utente
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-[#d0d5dd] bg-white px-4 py-2 text-sm font-bold text-[#344054]"
              >
                <LogOut className="h-4 w-4" />
                Esci
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
              onCreateUser={() => setIsCreateUserOpen(true)}
              onDeleteUser={handleDeleteUser}
            />
          )}
          {activeSection === "programs" && <ProgramsSection />}
          {activeSection === "licenses" && <LicensesSection users={users} />}
          {activeSection === "plans" && <PlansSection />}
          {activeSection === "payments" && <PaymentsSection />}
          {activeSection === "invoices" && <InvoicesSection />}
          {activeSection === "contacts" && <ContactsSection />}
          {activeSection === "settings" && <SettingsSection />}
          {activeSection === "audit" && <AuditSection />}
        </div>
      </section>
      {isCreateUserOpen && (
        <CreateUserModal
          message={createUserMessage}
          users={users}
          onClose={() => {
            setIsCreateUserOpen(false);
            setCreateUserMessage("");
          }}
          onSubmit={handleCreateUser}
        />
      )}
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
  setLicenseFilter,
  onCreateUser,
  onDeleteUser
}: {
  users: AdminUser[];
  query: string;
  setQuery: (value: string) => void;
  programFilter: ProgramSlug | "all";
  setProgramFilter: (value: ProgramSlug | "all") => void;
  licenseFilter: string;
  setLicenseFilter: (value: string) => void;
  onCreateUser: () => void;
  onDeleteUser: (user: AdminUser) => void;
}) {
  return (
    <Panel title="Gestione utenti" action="Nuovo utente" onAction={onCreateUser}>
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
                  <button
                    onClick={() => onDeleteUser(user)}
                    className="rounded-xl border border-[#fecdca] bg-[#fef3f2] px-3 py-2 text-xs font-bold text-[#b42318] hover:bg-[#fee4e2]"
                  >
                    Elimina
                  </button>
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

function Panel({ title, action, onAction, children }: { title: string; action?: string; onAction?: () => void; children: ReactNode }) {
  return (
    <section className="rounded-[28px] border border-[#d9e2ef] bg-white p-5 soft-shadow md:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {action && (
          <button onClick={onAction} className="inline-flex items-center gap-2 rounded-full bg-[#123c69] px-4 py-2 text-sm font-bold text-white">
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

type CreateUserPayload = {
  mode: "new" | "existing";
  existingUserId: string;
  fullName: string;
  email: string;
  password: string;
  company: string;
  city: string;
  assignments: ProgramAssignmentForm[];
  notes: string;
};

type ProgramAssignmentForm = {
  enabled: boolean;
  program: ProgramSlug;
  role: "admin" | "consulente" | "ristoratore" | "utente";
  licenseType: LicenseType;
  startDate: string;
  endDate: string;
  projectsPurchased: number | null;
  permissionProfile: "completo" | "operativo" | "limitato" | "personalizzato";
};

const todayIso = () => new Date().toISOString().slice(0, 10);

const defaultAssignments = (): ProgramAssignmentForm[] => [
  {
    enabled: false,
    program: "margin-pilot",
    role: "utente",
    licenseType: "annual_subscription",
    startDate: todayIso(),
    endDate: "",
    projectsPurchased: null,
    permissionProfile: "completo"
  },
  {
    enabled: true,
    program: "launch-pilot",
    role: "ristoratore",
    licenseType: "project_pack_1",
    startDate: todayIso(),
    endDate: "",
    projectsPurchased: 1,
    permissionProfile: "completo"
  },
  {
    enabled: false,
    program: "standard-pilot",
    role: "utente",
    licenseType: "free",
    startDate: todayIso(),
    endDate: "",
    projectsPurchased: null,
    permissionProfile: "completo"
  }
];

function CreateUserModal({
  message,
  users,
  onClose,
  onSubmit
}: {
  message: string;
  users: AdminUser[];
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<CreateUserPayload>({
    mode: "new",
    existingUserId: "",
    fullName: "",
    email: "",
    password: "",
    company: "",
    city: "",
    assignments: defaultAssignments(),
    notes: ""
  });

  const roleOptionsFor = (program: ProgramSlug) =>
    program === "margin-pilot"
      ? [
          { value: "utente", label: "Cliente" },
          { value: "consulente", label: "Operatore" },
          { value: "admin", label: "Master" }
        ]
      : program === "launch-pilot"
        ? [
            { value: "ristoratore", label: "Ristoratore" },
            { value: "consulente", label: "Consulente" },
            { value: "admin", label: "Admin" }
          ]
        : [
            { value: "utente", label: "Utente" },
            { value: "consulente", label: "Operatore" },
            { value: "admin", label: "Admin" }
          ];

  function update<K extends keyof CreateUserPayload>(key: K, value: CreateUserPayload[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateAssignment<K extends keyof ProgramAssignmentForm>(program: ProgramSlug, key: K, value: ProgramAssignmentForm[K]) {
    setForm((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) => {
        if (assignment.program !== program) return assignment;
        const next = { ...assignment, [key]: value };
        if (key === "licenseType") {
          next.projectsPurchased = String(value).startsWith("project_pack")
            ? value === "project_pack_5"
              ? 5
              : value === "project_pack_3"
                ? 3
                : 1
            : null;
        }
        return next;
      })
    }));
  }

  function updateMode(mode: "new" | "existing") {
    const firstExisting = users[0];
    setForm((current) => ({
      ...current,
      mode,
      existingUserId: mode === "existing" ? firstExisting?.id ?? "" : "",
      fullName: mode === "existing" ? firstExisting?.name ?? "" : "",
      email: mode === "existing" ? firstExisting?.email ?? "" : "",
      company: mode === "existing" ? firstExisting?.company ?? "" : "",
      city: mode === "existing" ? firstExisting?.city ?? "" : "",
      password: mode === "existing" ? "" : current.password,
      assignments: defaultAssignments()
    }));
  }

  function updateExistingUser(userId: string) {
    const selected = users.find((user) => user.id === userId);
    setForm((current) => ({
      ...current,
      existingUserId: userId,
      fullName: selected?.name ?? "",
      email: selected?.email ?? "",
      company: selected?.company ?? "",
      city: selected?.city ?? ""
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await onSubmit({
      ...form,
      assignments: form.assignments
        .filter((assignment) => assignment.enabled)
        .map((assignment) => ({
          ...assignment,
          projectsPurchased: assignment.licenseType.startsWith("project_pack") ? assignment.projectsPurchased : null
        }))
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#07111f]/45 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-[28px] border border-[#d9e2ef] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-[#175cd3]">Master Admin Suite</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Crea nuovo utente</h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Assegna programma, ruolo e licenza. Le regole di accesso vengono salvate nel database centrale.
            </p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f4f7] text-[#516079]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-3 rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => updateMode("new")}
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${form.mode === "new" ? "bg-[#123c69] text-white" : "bg-white text-[#344054]"}`}
            >
              Nuovo utente
            </button>
            <button
              type="button"
              onClick={() => updateMode("existing")}
              className={`rounded-2xl px-4 py-3 text-sm font-bold ${form.mode === "existing" ? "bg-[#123c69] text-white" : "bg-white text-[#344054]"}`}
            >
              Utente esistente
            </button>
          </div>

          {form.mode === "existing" && (
            <Field label="Scegli utente esistente">
              <select value={form.existingUserId} onChange={(event) => updateExistingUser(event.target.value)} className="input" required>
                <option value="">Seleziona utente</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>{user.name} - {user.email}</option>
                ))}
              </select>
            </Field>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome completo">
              <input required disabled={form.mode === "existing"} value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
            <Field label="Email">
              <input required disabled={form.mode === "existing"} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
            {form.mode === "new" && (
              <Field label="Password iniziale">
                <input required type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} className="input" />
              </Field>
            )}
            <Field label="Azienda">
              <input disabled={form.mode === "existing"} value={form.company} onChange={(event) => update("company", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
            <Field label="Città">
              <input disabled={form.mode === "existing"} value={form.city} onChange={(event) => update("city", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
          </div>
          <div className="grid gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#101828]">Programmi da attivare</h3>
              <p className="mt-1 text-sm text-[#667085]">Lo stesso utente può entrare in più programmi con ruoli e licenze diverse.</p>
            </div>
            {form.assignments.map((assignment) => {
              const program = programs.find((item) => item.slug === assignment.program)!;
              const isProjectPack = assignment.licenseType.startsWith("project_pack");
              return (
                <div key={assignment.program} className={`rounded-3xl border p-4 ${assignment.enabled ? "border-[#175cd3] bg-[#eef4ff]" : "border-[#d9e2ef] bg-white"}`}>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={assignment.enabled}
                        onChange={(event) => updateAssignment(assignment.program, "enabled", event.target.checked)}
                        className="h-5 w-5"
                      />
                      <span className="text-lg font-bold">{program.name}</span>
                    </label>
                    <span className="text-sm font-semibold text-[#667085]">{assignment.enabled ? "Attivo per questo utente" : "Non assegnato"}</span>
                  </div>
                  {assignment.enabled && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Ruolo">
                        <select value={assignment.role} onChange={(event) => updateAssignment(assignment.program, "role", event.target.value as ProgramAssignmentForm["role"])} className="input">
                          {roleOptionsFor(assignment.program).map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </Field>
                      {assignment.program === "margin-pilot" && (
                        <Field label="Profilo Margin Pilot">
                          <select
                            value={assignment.permissionProfile}
                            onChange={(event) => updateAssignment(assignment.program, "permissionProfile", event.target.value as ProgramAssignmentForm["permissionProfile"])}
                            className="input"
                          >
                            <option value="completo">Completo - tutte le funzioni operative</option>
                            <option value="operativo">Operativo - dati principali, prodotti e report</option>
                            <option value="limitato">Limitato - sola lettura essenziale</option>
                            <option value="personalizzato">Personalizzato - da configurare in dettaglio</option>
                          </select>
                        </Field>
                      )}
                      <Field label="Tipo licenza">
                        <select value={assignment.licenseType} onChange={(event) => updateAssignment(assignment.program, "licenseType", event.target.value as LicenseType)} className="input">
                          <option value="monthly_subscription">Abbonamento mensile</option>
                          <option value="annual_subscription">Abbonamento annuale</option>
                          <option value="project_pack_1">Pacchetto 1 progetto</option>
                          <option value="project_pack_3">Pacchetto 3 progetti</option>
                          <option value="project_pack_5">Pacchetto 5 progetti</option>
                          <option value="free">Licenza gratuita</option>
                          <option value="suspended">Licenza sospesa</option>
                        </select>
                      </Field>
                      <Field label="Data inizio">
                        <input required type="date" value={assignment.startDate} onChange={(event) => updateAssignment(assignment.program, "startDate", event.target.value)} className="input" />
                      </Field>
                      <Field label="Data fine">
                        <input type="date" value={assignment.endDate} onChange={(event) => updateAssignment(assignment.program, "endDate", event.target.value)} className="input" />
                      </Field>
                      {isProjectPack && (
                        <Field label="Progetti acquistati">
                          <input
                            type="number"
                            min={1}
                            value={assignment.projectsPurchased ?? 1}
                            onChange={(event) => updateAssignment(assignment.program, "projectsPurchased", Number(event.target.value))}
                            className="input"
                          />
                        </Field>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Field label="Note amministrative">
            <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className="input min-h-24 resize-y" />
          </Field>
          {message && <p className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm font-semibold text-[#b54708]">{message}</p>}
          <div className="flex flex-wrap justify-end gap-3 border-t border-[#edf2f7] pt-5">
            <button type="button" onClick={onClose} className="rounded-2xl border border-[#d0d5dd] px-5 py-3 font-bold text-[#344054]">
              Annulla
            </button>
            <button disabled={loading} className="rounded-2xl bg-[#123c69] px-5 py-3 font-bold text-white disabled:opacity-60">
              {loading ? "Creazione..." : "Crea utente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-[#344054]">
      {label}
      {children}
    </label>
  );
}
