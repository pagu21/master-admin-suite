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
  Clipboard,
  KeyRound,
  LockKeyhole,
  LogOut,
  Mail,
  MoreHorizontal,
  Plus,
  Eye,
  EyeOff,
  Printer,
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
  sidebarItems,
  type AdminUser,
  type LicenseStatus,
  type LicenseType,
  type ProgramSlug
} from "@/lib/master-data";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

const MoneyIcon = moneyIcon;

type MarginAccessProfile = "completo" | "operativo" | "limitato" | "personalizzato";

type MarginPermissionKey =
  | "dashboard"
  | "sales"
  | "costs"
  | "suppliers"
  | "products"
  | "recipes"
  | "salePrices"
  | "margins"
  | "analytics"
  | "budget"
  | "settings"
  | "reports"
  | "admin";

type MarginAccessConfig = {
  profile: MarginAccessProfile;
  readOnly: boolean;
  permissions: Record<MarginPermissionKey, boolean>;
};

const marginAccessProfileLabels: Record<MarginAccessProfile, string> = {
  completo: "Completo",
  operativo: "Operativo",
  limitato: "Limitato",
  personalizzato: "Personalizzato"
};

const marginPermissionLabels: Record<MarginPermissionKey, { label: string; description: string }> = {
  dashboard: { label: "Cruscotto", description: "Sintesi operativa iniziale e indicatori principali." },
  sales: { label: "Venduto e coperti", description: "Fatturato, coperti, grafici venduto e sale operative." },
  costs: { label: "Costi", description: "Gestione costi, struttura costi e dati economici." },
  suppliers: { label: "Fornitori e fatture", description: "Fatture, prodotti acquistati, storico ingredienti e sconti." },
  products: { label: "Prodotti", description: "Menu, food, beverage, categorie, varianti e gestione basi." },
  recipes: { label: "Schede prodotto e ricette", description: "Ricette, ingredienti, basi e composizione prodotto." },
  salePrices: { label: "Prezzi vendita", description: "Visibilita e modifica dei prezzi di vendita." },
  margins: { label: "Margini e food cost", description: "Costo ricetta, margini, food cost e prezzi di equilibrio." },
  analytics: { label: "Analisi economiche", description: "Riepiloghi, break even, menu pricing e analisi food cost." },
  budget: { label: "Budget", description: "Budget operativo, piano mensile, grafici e stampa budget." },
  settings: { label: "Configurazione locale", description: "Info locale, sale, capienze e parametri operativi." },
  reports: { label: "Report e stampe", description: "Pagine di stampa ed esportazione report." },
  admin: { label: "Amministrazione accessi", description: "Gestione utenti, profili e permessi. Solo master." }
};

const marginPermissionKeys = Object.keys(marginPermissionLabels) as MarginPermissionKey[];

const marginPermissionToneByKey: Record<MarginPermissionKey, "brand" | "emerald" | "sky" | "amber" | "slate"> = {
  dashboard: "brand",
  sales: "brand",
  costs: "emerald",
  suppliers: "emerald",
  products: "sky",
  recipes: "sky",
  salePrices: "sky",
  margins: "amber",
  analytics: "amber",
  budget: "amber",
  settings: "slate",
  reports: "slate",
  admin: "slate"
};

const marginPermissionToneClasses: Record<"brand" | "emerald" | "sky" | "amber" | "slate", { enabled: string; disabled: string; checkbox: string; chip: string }> = {
  brand: {
    enabled: "border-[#b2ccff] bg-[#eef4ff] text-[#123c69]",
    disabled: "border-[#d9e2ef] bg-white text-[#516079]",
    checkbox: "accent-[#175cd3]",
    chip: "bg-[#eef4ff] text-[#175cd3]"
  },
  emerald: {
    enabled: "border-emerald-200 bg-emerald-50 text-emerald-800",
    disabled: "border-[#d9e2ef] bg-white text-[#516079]",
    checkbox: "accent-emerald-600",
    chip: "bg-emerald-50 text-emerald-700"
  },
  sky: {
    enabled: "border-sky-200 bg-sky-50 text-sky-800",
    disabled: "border-[#d9e2ef] bg-white text-[#516079]",
    checkbox: "accent-sky-600",
    chip: "bg-sky-50 text-sky-700"
  },
  amber: {
    enabled: "border-amber-200 bg-amber-50 text-amber-800",
    disabled: "border-[#d9e2ef] bg-white text-[#516079]",
    checkbox: "accent-amber-600",
    chip: "bg-amber-50 text-amber-700"
  },
  slate: {
    enabled: "border-slate-300 bg-slate-100 text-slate-800",
    disabled: "border-[#d9e2ef] bg-white text-[#516079]",
    checkbox: "accent-slate-600",
    chip: "bg-slate-100 text-slate-700"
  }
};

const allMarginPermissions = (value: boolean): Record<MarginPermissionKey, boolean> => ({
  dashboard: value,
  sales: value,
  costs: value,
  suppliers: value,
  products: value,
  recipes: value,
  salePrices: value,
  margins: value,
  analytics: value,
  budget: value,
  settings: value,
  reports: value,
  admin: false
});

function presetMarginAccessConfig(profile: MarginAccessProfile): MarginAccessConfig {
  if (profile === "completo") {
    return { profile, readOnly: false, permissions: allMarginPermissions(true) };
  }
  if (profile === "operativo") {
    return {
      profile,
      readOnly: false,
      permissions: {
        ...allMarginPermissions(false),
        dashboard: true,
        sales: true,
        products: true,
        settings: true,
        reports: true
      }
    };
  }
  if (profile === "limitato") {
    return {
      profile,
      readOnly: true,
      permissions: {
        ...allMarginPermissions(false),
        dashboard: true,
        sales: true,
        reports: true
      }
    };
  }
  return {
    profile,
    readOnly: false,
    permissions: {
      ...allMarginPermissions(false),
      dashboard: true
    }
  };
}

function normalizeMarginAccessConfig(config: MarginAccessConfig): MarginAccessConfig {
  const base = config.profile === "personalizzato" ? presetMarginAccessConfig("personalizzato") : presetMarginAccessConfig(config.profile);
  const permissions = { ...base.permissions, ...config.permissions };

  if (!permissions.products) {
    permissions.recipes = false;
    permissions.salePrices = false;
    permissions.margins = false;
  }
  if (!permissions.recipes) permissions.margins = false;
  if (!permissions.costs) permissions.suppliers = false;
  permissions.admin = false;

  return { profile: config.profile, readOnly: Boolean(config.readOnly), permissions };
}

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
  const [showEmails, setShowEmails] = useState(false);
  const [credentialsUser, setCredentialsUser] = useState<AdminUser | null>(null);
  const [detailsUser, setDetailsUser] = useState<AdminUser | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

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

  async function reloadUsers() {
    const updatedResponse = await fetch("/api/admin/users", { cache: "no-store" });
    const updatedResult = (await updatedResponse.json().catch(() => null)) as { users?: AdminUser[] } | null;
    if (updatedResponse.ok && updatedResult?.users) {
      setUsers(updatedResult.users);
      return true;
    }
    return false;
  }

  async function handleUpdateUser(payload: CreateUserPayload) {
    setCreateUserMessage("");
    const userId = payload.existingUserId;
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        assignments: payload.assignments.map((assignment) => ({
          ...assignment,
          projectsPurchased: assignment.licenseType.startsWith("project_pack") ? assignment.projectsPurchased : null
        }))
      })
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setCreateUserMessage(result?.error || "Utente non aggiornato.");
      return;
    }

    await reloadUsers();
    setEditingUser(null);
    setActiveSection("users");
  }

  async function handleUpdateLicenseStatus(user: AdminUser, access: AdminUser["accesses"][number], status: LicenseStatus) {
    const response = await fetch(`/api/admin/users/${user.id}/programs/${access.program}/license-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      window.alert(result?.error || "Stato licenza non aggiornato.");
      return;
    }

    await reloadUsers();
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

  async function handleResetPassword(user: AdminUser) {
    const confirmed = window.confirm(`Inviare a ${user.email} una email per reimpostare la password?`);
    if (!confirmed) return;

    const response = await fetch(`/api/admin/users/${user.id}/reset-password`, { method: "POST" });
    const result = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;
    if (!response.ok) {
      window.alert(result?.error || "Email di recupero non inviata.");
      return;
    }
    window.alert(result?.message || "Email di recupero password inviata.");
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
              onResetPassword={handleResetPassword}
              onShowCredentials={setCredentialsUser}
              onShowDetails={setDetailsUser}
              onEditUser={setEditingUser}
              showEmails={showEmails}
              setShowEmails={setShowEmails}
            />
          )}
          {activeSection === "programs" && <ProgramsSection />}
          {activeSection === "licenses" && <LicensesSection users={users} onUpdateStatus={handleUpdateLicenseStatus} onEditUser={setEditingUser} />}
          {activeSection === "plans" && <PlansSection />}
          {activeSection === "payments" && <PaymentsSection users={users} onEditUser={setEditingUser} />}
          {activeSection === "invoices" && <InvoicesSection />}
          {activeSection === "contacts" && <ContactsSection users={users} />}
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
      {credentialsUser && <CredentialsModal user={credentialsUser} onClose={() => setCredentialsUser(null)} onResetPassword={handleResetPassword} />}
      {detailsUser && <UserDetailsModal user={detailsUser} onClose={() => setDetailsUser(null)} />}
      {editingUser && (
        <CreateUserModal
          message={createUserMessage}
          users={users}
          initialUser={editingUser}
          onClose={() => {
            setEditingUser(null);
            setCreateUserMessage("");
          }}
          onSubmit={handleUpdateUser}
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
  onDeleteUser,
  onResetPassword,
  onShowCredentials,
  onShowDetails,
  onEditUser,
  showEmails,
  setShowEmails
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
  onResetPassword: (user: AdminUser) => void;
  onShowCredentials: (user: AdminUser) => void;
  onShowDetails: (user: AdminUser) => void;
  onEditUser: (user: AdminUser) => void;
  showEmails: boolean;
  setShowEmails: (value: boolean) => void;
}) {
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const usersWithoutPrograms = users.filter((user) => user.accesses.length === 0).length;
  const suspendedUsers = users.filter((user) => user.status === "suspended" || user.accesses.some((access) => access.licenseStatus === "suspended")).length;
  const neverLoggedUsers = users.filter((user) => user.lastAccess === "Mai").length;

  return (
    <Panel title="Gestione utenti" action="Nuovo utente" onAction={onCreateUser}>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <AdminAlertCard label="Senza programma" value={usersWithoutPrograms} tone={usersWithoutPrograms > 0 ? "amber" : "green"} />
        <AdminAlertCard label="Accessi sospesi" value={suspendedUsers} tone={suspendedUsers > 0 ? "red" : "green"} />
        <AdminAlertCard label="Mai entrati" value={neverLoggedUsers} tone={neverLoggedUsers > 0 ? "blue" : "green"} />
      </div>
      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_220px_220px_auto_auto]">
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
        <button
          type="button"
          onClick={() => setShowEmails(!showEmails)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d0d5dd] bg-white px-4 py-3 text-sm font-bold text-[#344054] hover:border-[#175cd3] hover:text-[#175cd3]"
        >
          {showEmails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showEmails ? "Nascondi email" : "Mostra email"}
        </button>
        <button
          type="button"
          onClick={() => setIsPrintOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#b2ccff] bg-[#eef4ff] px-4 py-3 text-sm font-bold text-[#175cd3] hover:border-[#175cd3]"
        >
          <Printer className="h-4 w-4" />
          Stampa clienti
        </button>
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
                  <p className="text-sm text-[#667085]">{showEmails ? user.email : maskEmail(user.email)}</p>
                  <p className="text-xs text-[#98a2b3]">{user.company} · {user.city}</p>
                </div>
              </Td>
              <Td>
                <div className="grid gap-2">
                  {user.accesses.map((access) => (
                    <div key={`${user.id}-${access.program}`} className="rounded-xl bg-[#f8fafc] px-3 py-2 text-sm">
                      <span className="font-bold">{programName(access.program)}</span>
                      <span className="text-[#667085]"> · {access.role} · {licenseLabel(access.licenseType)}</span>
                    </div>
                  ))}
                </div>
              </Td>
              <Td><Badge value={user.status} label={user.status === "active" ? "Attivo" : "Sospeso"} /></Td>
              <Td><span className="numeric text-sm font-semibold">{user.lastAccess}</span></Td>
              <Td>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onEditUser(user)}
                    className="rounded-xl border border-[#b2ccff] bg-[#eef4ff] px-3 py-2 text-xs font-bold text-[#175cd3] hover:bg-[#dbeafe]"
                  >
                    Modifica
                  </button>
                  <IconButton label="Reset password" icon={RotateCcw} onClick={() => onResetPassword(user)} />
                  <IconButton label="Credenziali" icon={KeyRound} onClick={() => onShowCredentials(user)} />
                  <IconButton label="Dettagli" icon={MoreHorizontal} onClick={() => onShowDetails(user)} />
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
      {isPrintOpen && <ClientListPrintModal users={users} onClose={() => setIsPrintOpen(false)} />}
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
              <Badge value={program.active ? "active" : "pending"} label={program.active ? "Attivo" : "Non attivo"} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LicensesSection({
  users,
  onUpdateStatus,
  onEditUser
}: {
  users: AdminUser[];
  onUpdateStatus: (user: AdminUser, access: AdminUser["accesses"][number], status: LicenseStatus) => void;
  onEditUser: (user: AdminUser) => void;
}) {
  return (
    <Panel title="Gestione licenze">
      <div className="mb-4 rounded-2xl border border-[#b2ccff] bg-[#eef4ff] px-4 py-3 text-sm leading-6 text-[#123c69]">
        Puoi cambiare rapidamente lo stato della licenza direttamente dalla tabella. Per modificare piano, date, ruolo o permessi apri la scheda utente.
      </div>
      <Table>
        <thead>
          <tr>
            <Th>Utente</Th>
            <Th>Programma</Th>
            <Th>Tipo licenza</Th>
            <Th>Validità</Th>
            <Th>Progetti</Th>
            <Th>Stato</Th>
            <Th>Azioni</Th>
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
                <Td>
                  <select
                    value={access.licenseStatus}
                    onChange={(event) => onUpdateStatus(user, access, event.target.value as LicenseStatus)}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none ${statusClasses[access.licenseStatus] || "border-[#d0d5dd] bg-white text-[#344054]"}`}
                  >
                    <option value="active">Attiva</option>
                    <option value="pending">In attesa</option>
                    <option value="expired">Scaduta</option>
                    <option value="suspended">Sospesa</option>
                  </select>
                </Td>
                <Td>
                  <button
                    type="button"
                    onClick={() => onEditUser(user)}
                    className="rounded-xl border border-[#b2ccff] bg-white px-3 py-2 text-xs font-bold text-[#175cd3] hover:bg-[#eef4ff]"
                  >
                    Apri scheda
                  </button>
                </Td>
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

function PaymentsSection({ users, onEditUser }: { users: AdminUser[]; onEditUser: (user: AdminUser) => void }) {
  function findPaymentUser(paymentUser: string) {
    const normalized = paymentUser.toLowerCase();
    return users.find((user) => {
      return (
        user.name.toLowerCase() === normalized ||
        user.company.toLowerCase() === normalized ||
        user.email.toLowerCase() === normalized
      );
    });
  }

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
            <Th>Azioni</Th>
          </tr>
        </thead>
        <tbody>
          {demoPayments.map((payment) => {
            const user = findPaymentUser(payment.user);
            return (
              <tr key={payment.id}>
                <Td>{payment.user}</Td>
                <Td>{programName(payment.program)}</Td>
                <Td className="numeric font-bold">{euro(payment.amount)}</Td>
                <Td>{payment.method}</Td>
                <Td>{payment.paidAt}</Td>
                <Td><Badge value={payment.status} label={payment.status} /></Td>
                <Td>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => onEditUser(user)}
                      className="rounded-xl border border-[#b2ccff] bg-white px-3 py-2 text-xs font-bold text-[#175cd3] hover:bg-[#eef4ff]"
                    >
                      Apri scheda
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#98a2b3]">Cliente non collegato</span>
                  )}
                </Td>
              </tr>
            );
          })}
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

function ContactsSection({ users }: { users: AdminUser[] }) {
  const [mailingFilter, setMailingFilter] = useState<"all" | "clients" | "contacts">("all");
  const [copyMessage, setCopyMessage] = useState("");
  const mailingEntries = [
    ...users.map((user) => ({
      id: `user-${user.id}`,
      type: "Cliente",
      name: user.name,
      email: user.email,
      company: user.company,
      city: user.city,
      program: user.accesses.map((access) => programName(access.program)).join(", ") || "-",
      status: user.status === "active" ? "cliente" : "sospeso"
    })),
    ...demoContacts.map((contact) => ({
      id: `contact-${contact.id}`,
      type: "Contatto",
      name: contact.name,
      email: contact.email,
      company: contact.company,
      city: contact.city,
      program: programName(contact.interestedProgram),
      status: contact.status
    }))
  ].filter((entry) => {
    if (mailingFilter === "clients") return entry.type === "Cliente";
    if (mailingFilter === "contacts") return entry.type === "Contatto";
    return true;
  });

  async function copyMailingList() {
    const emails = Array.from(new Set(mailingEntries.map((entry) => entry.email).filter(Boolean)));
    await navigator.clipboard.writeText(emails.join("; ")).catch(() => undefined);
    setCopyMessage(`${emails.length} email copiate.`);
    window.setTimeout(() => setCopyMessage(""), 2500);
  }

  return (
    <Panel title="CRM / contatti" action="Nuovo contatto">
      <div className="mb-5 grid gap-4 lg:grid-cols-[1fr_260px_auto]">
        <div className="rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#123c69] text-white">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Mailing list</h3>
              <p className="mt-1 text-sm leading-6 text-[#667085]">
                Usa questa lista per comunicazioni commerciali, rinnovi, aggiornamenti prodotto e contatti non ancora clienti.
              </p>
            </div>
          </div>
        </div>
        <select
          value={mailingFilter}
          onChange={(event) => setMailingFilter(event.target.value as "all" | "clients" | "contacts")}
          className="rounded-2xl border border-[#d0d5dd] bg-white px-4 py-3 text-sm font-semibold"
        >
          <option value="all">Clienti e contatti</option>
          <option value="clients">Solo clienti</option>
          <option value="contacts">Solo non clienti</option>
        </select>
        <button
          type="button"
          onClick={copyMailingList}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#123c69] px-5 py-3 text-sm font-bold text-white"
        >
          <Clipboard className="h-4 w-4" />
          Copia email
        </button>
      </div>
      {copyMessage && <p className="mb-4 rounded-2xl bg-[#ecfdf3] px-4 py-3 text-sm font-bold text-[#067647]">{copyMessage}</p>}
      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Tipo</Th>
            <Th>Azienda</Th>
            <Th>Città</Th>
            <Th>Programma</Th>
            <Th>Stato</Th>
          </tr>
        </thead>
        <tbody>
          {mailingEntries.map((contact) => (
            <tr key={contact.id}>
              <Td>
                <p className="font-bold">{contact.name}</p>
                <p className="text-sm text-[#667085]">{contact.email}</p>
              </Td>
              <Td>{contact.type}</Td>
              <Td>{contact.company}</Td>
              <Td>{contact.city}</Td>
              <Td>{contact.program}</Td>
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

function AdminAlertCard({ label, value, tone }: { label: string; value: number; tone: "green" | "amber" | "red" | "blue" }) {
  const classes = {
    green: "border-[#abefc6] bg-[#ecfdf3] text-[#067647]",
    amber: "border-[#fedf89] bg-[#fffaeb] text-[#b54708]",
    red: "border-[#fecdca] bg-[#fef3f2] text-[#b42318]",
    blue: "border-[#b2ccff] bg-[#eef4ff] text-[#175cd3]"
  };

  return (
    <div className={`rounded-2xl border px-4 py-3 ${classes[tone]}`}>
      <p className="text-xs font-bold uppercase tracking-[0.08em] opacity-80">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}${"*".repeat(Math.max(3, name.length - visible.length))}@${domain}`;
}

function licenseStatusLabel(status: LicenseStatus) {
  const labels: Record<LicenseStatus, string> = {
    active: "Attiva",
    pending: "In attesa",
    expired: "Scaduta",
    suspended: "Sospesa"
  };
  return labels[status];
}

function IconButton({ label, icon: Icon, onClick }: { label: string; icon: ComponentType<{ className?: string }>; onClick?: () => void }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="grid h-9 w-9 place-items-center rounded-xl border border-[#d9e2ef] bg-white text-[#516079] hover:border-[#175cd3] hover:text-[#175cd3]"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function CredentialsModal({ user, onClose, onResetPassword }: { user: AdminUser; onClose: () => void; onResetPassword: (user: AdminUser) => void }) {
  async function copyEmail() {
    await navigator.clipboard.writeText(user.email).catch(() => undefined);
    window.alert("Email copiata.");
  }

  return (
    <ModalShell title="Credenziali utente" onClose={onClose}>
      <div className="grid gap-4">
        <div className="rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-5">
          <p className="text-sm font-semibold text-[#667085]">Email di accesso</p>
          <p className="mt-2 break-all text-xl font-bold text-[#101828]">{user.email}</p>
          <p className="mt-3 text-sm leading-6 text-[#667085]">
            La password non può essere visualizzata per sicurezza. Puoi inviare una email di recupero password al cliente.
          </p>
        </div>
        <div className="grid gap-2">
          {user.accesses.map((access) => (
            <div key={`${user.id}-${access.program}`} className="rounded-2xl border border-[#edf2f7] bg-white p-4">
              <p className="font-bold">{programName(access.program)}</p>
              <p className="mt-1 text-sm text-[#667085]">{access.role} · {licenseLabel(access.licenseType)} · {access.licenseStatus}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={copyEmail} className="rounded-2xl border border-[#d0d5dd] px-5 py-3 font-bold text-[#344054]">
            Copia email
          </button>
          <button type="button" onClick={() => onResetPassword(user)} className="rounded-2xl bg-[#123c69] px-5 py-3 font-bold text-white">
            Invia recupero password
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function UserDetailsModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  return (
    <ModalShell title="Dettagli cliente" onClose={onClose}>
      <div className="grid gap-4">
        <div className="rounded-3xl border border-[#d9e2ef] bg-white p-5">
          <h3 className="text-xl font-bold">{user.name}</h3>
          <p className="mt-1 break-all text-sm text-[#667085]">{user.email}</p>
          <p className="mt-3 text-sm text-[#667085]">{user.company} · {user.city}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge value={user.status} label={user.status === "active" ? "Attivo" : "Sospeso"} />
            <span className="rounded-full border border-[#d0d5dd] px-3 py-1 text-xs font-bold text-[#516079]">Ultimo accesso: {user.lastAccess}</span>
          </div>
        </div>
        <div className="grid gap-3">
          {user.accesses.map((access) => (
            <div key={`${user.id}-${access.program}`} className="rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-lg font-bold">{programName(access.program)}</h4>
                <Badge value={access.licenseStatus} label={access.licenseStatus} />
              </div>
              <div className="mt-3 grid gap-2 text-sm text-[#516079] md:grid-cols-2">
                <p><span className="font-bold text-[#344054]">Ruolo:</span> {access.role}</p>
                <p><span className="font-bold text-[#344054]">Licenza:</span> {licenseLabel(access.licenseType)}</p>
                <p><span className="font-bold text-[#344054]">Inizio:</span> {access.startDate || "-"}</p>
                <p><span className="font-bold text-[#344054]">Fine:</span> {access.endDate || "Nessuna scadenza"}</p>
                <p><span className="font-bold text-[#344054]">Progetti:</span> {access.projectsPurchased ? `${access.projectsUsed}/${access.projectsPurchased}` : "Illimitati"}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

function ClientListPrintModal({ users, onClose }: { users: AdminUser[]; onClose: () => void }) {
  return (
    <ModalShell title="Anteprima stampa clienti" onClose={onClose} wide>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .client-print-area,
          .client-print-area * {
            visibility: visible;
          }
          .client-print-area {
            position: absolute;
            inset: 0;
            width: 100%;
            background: white;
            padding: 18mm;
          }
          .client-print-controls {
            display: none !important;
          }
        }
      `}</style>
      <div className="client-print-area rounded-3xl border border-[#d9e2ef] bg-white p-5">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-[#d9e2ef] pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#175cd3]">Master Admin Suite</p>
            <h3 className="mt-1 text-2xl font-black text-[#101828]">Elenco clienti</h3>
            <p className="mt-1 text-sm text-[#667085]">Stampa sintetica con dati principali, programmi, licenze e ultimo accesso.</p>
          </div>
          <p className="numeric text-sm font-bold text-[#516079]">{new Date().toLocaleDateString("it-IT")}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left text-xs">
            <thead>
              <tr>
                <th className="border-b border-[#d9e2ef] bg-[#f8fafc] px-3 py-2 font-bold uppercase text-[#516079]">Cliente</th>
                <th className="border-b border-[#d9e2ef] bg-[#f8fafc] px-3 py-2 font-bold uppercase text-[#516079]">Email</th>
                <th className="border-b border-[#d9e2ef] bg-[#f8fafc] px-3 py-2 font-bold uppercase text-[#516079]">Azienda / città</th>
                <th className="border-b border-[#d9e2ef] bg-[#f8fafc] px-3 py-2 font-bold uppercase text-[#516079]">Programmi</th>
                <th className="border-b border-[#d9e2ef] bg-[#f8fafc] px-3 py-2 font-bold uppercase text-[#516079]">Stato</th>
                <th className="border-b border-[#d9e2ef] bg-[#f8fafc] px-3 py-2 font-bold uppercase text-[#516079]">Ultimo accesso</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border-b border-[#edf2f7] px-3 py-3 font-bold">{user.name}</td>
                  <td className="border-b border-[#edf2f7] px-3 py-3">{user.email}</td>
                  <td className="border-b border-[#edf2f7] px-3 py-3">{user.company} · {user.city}</td>
                  <td className="border-b border-[#edf2f7] px-3 py-3">
                    {user.accesses.length
                      ? user.accesses.map((access) => `${programName(access.program)}: ${access.role}, ${licenseLabel(access.licenseType)}, ${licenseStatusLabel(access.licenseStatus)}`).join(" | ")
                      : "Nessun programma assegnato"}
                  </td>
                  <td className="border-b border-[#edf2f7] px-3 py-3">{user.status === "active" ? "Attivo" : "Sospeso"}</td>
                  <td className="border-b border-[#edf2f7] px-3 py-3">{user.lastAccess}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="client-print-controls mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-2xl border border-[#d0d5dd] px-5 py-3 font-bold text-[#344054]">
          Chiudi
        </button>
        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-[#123c69] px-5 py-3 font-bold text-white">
          <Printer className="h-4 w-4" />
          Stampa
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#101828]/45 px-4 py-8 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-[28px] bg-white p-6 soft-shadow ${wide ? "max-w-6xl" : "max-w-2xl"}`}>
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f4f7] text-[#516079]">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function MarginAccessConfigurator({ config, onChange }: { config: MarginAccessConfig; onChange: (config: MarginAccessConfig) => void }) {
  const normalized = normalizeMarginAccessConfig(config);

  function updateProfile(profile: MarginAccessProfile) {
    onChange(profile === "personalizzato" ? normalizeMarginAccessConfig({ ...normalized, profile }) : presetMarginAccessConfig(profile));
  }

  function updateReadOnly(readOnly: boolean) {
    onChange(normalizeMarginAccessConfig({ ...normalized, readOnly }));
  }

  function updatePermission(key: MarginPermissionKey, value: boolean) {
    onChange(
      normalizeMarginAccessConfig({
        ...normalized,
        profile: "personalizzato",
        permissions: {
          ...normalized.permissions,
          [key]: value
        }
      })
    );
  }

  return (
    <div className="rounded-3xl border border-[#c7d7ee] bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#175cd3]">Profilazione Margin Pilot</p>
          <p className="mt-1 text-sm leading-6 text-[#667085]">
            Scegli cosa il cliente puo vedere o modificare. Questa e la stessa logica della vecchia pagina master di Margin Pilot.
          </p>
        </div>
        <label className="inline-flex items-center gap-2 rounded-2xl border border-[#fedf89] bg-[#fffaeb] px-3 py-2 text-xs font-bold text-[#b54708]">
          <input
            type="checkbox"
            checked={normalized.readOnly}
            onChange={(event) => updateReadOnly(event.target.checked)}
            className="h-4 w-4"
          />
          Solo lettura
        </label>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(marginAccessProfileLabels) as MarginAccessProfile[]).map((profile) => (
          <button
            key={profile}
            type="button"
            onClick={() => updateProfile(profile)}
            className={`rounded-2xl border px-3 py-2 text-left text-sm transition ${
              normalized.profile === profile
                ? "border-[#175cd3] bg-[#eef4ff] text-[#123c69]"
                : "border-[#d9e2ef] bg-white text-[#516079] hover:border-[#175cd3]"
            }`}
          >
            <span className="font-bold">{marginAccessProfileLabels[profile]}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {marginPermissionKeys.map((key) => {
          const meta = marginPermissionLabels[key];
          const tone = marginPermissionToneByKey[key];
          const toneClasses = marginPermissionToneClasses[tone];
          const checked = normalized.permissions[key];
          return (
            <label
              key={key}
              className={`flex gap-3 rounded-2xl border px-3 py-2.5 transition ${
                checked ? toneClasses.enabled : `${toneClasses.disabled} hover:border-[#175cd3]`
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => updatePermission(key, event.target.checked)}
                className={`mt-1 h-4 w-4 shrink-0 ${toneClasses.checkbox}`}
              />
              <span>
                <span className="flex flex-wrap items-center gap-2 text-sm font-bold">
                  {meta.label}
                  <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${toneClasses.chip}`}>
                    {tone === "brand" ? "operativo" : tone === "emerald" ? "costi" : tone === "sky" ? "prodotto" : tone === "amber" ? "analisi" : "sistema"}
                  </span>
                </span>
                <span className="mt-0.5 block text-xs leading-5 opacity-75">{meta.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </div>
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
  permissionProfile: MarginAccessProfile;
  marginAccessConfig: MarginAccessConfig;
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
    permissionProfile: "completo",
    marginAccessConfig: presetMarginAccessConfig("completo")
  },
  {
    enabled: true,
    program: "launch-pilot",
    role: "ristoratore",
    licenseType: "project_pack_1",
    startDate: todayIso(),
    endDate: "",
    projectsPurchased: 1,
    permissionProfile: "completo",
    marginAccessConfig: presetMarginAccessConfig("completo")
  },
  {
    enabled: false,
    program: "standard-pilot",
    role: "utente",
    licenseType: "free",
    startDate: todayIso(),
    endDate: "",
    projectsPurchased: null,
    permissionProfile: "completo",
    marginAccessConfig: presetMarginAccessConfig("completo")
  }
];

function marginAccessConfigFromNotes(notes?: string) {
  const marker = "[MARGINPILOT_ACCESS_CONFIG]";
  const index = notes?.indexOf(marker) ?? -1;
  if (!notes || index < 0) return presetMarginAccessConfig("completo");
  const raw = notes.slice(index + marker.length).trim();
  try {
    const parsed = JSON.parse(raw) as MarginAccessConfig;
    return normalizeMarginAccessConfig(parsed);
  } catch {
    return presetMarginAccessConfig("completo");
  }
}

function assignmentsFromUser(user?: AdminUser | null): ProgramAssignmentForm[] {
  const assignments = defaultAssignments();
  if (!user) return assignments;

  return assignments.map((assignment) => {
    const access = user.accesses.find((item) => item.program === assignment.program);
    if (!access) return { ...assignment, enabled: false };
    const marginAccessConfig = assignment.program === "margin-pilot"
      ? marginAccessConfigFromNotes(access.notes)
      : assignment.marginAccessConfig;
    return {
      ...assignment,
      enabled: access.licenseStatus !== "suspended",
      role: access.role,
      licenseType: access.licenseType,
      startDate: access.startDate || todayIso(),
      endDate: access.endDate || "",
      projectsPurchased: access.projectsPurchased ?? assignment.projectsPurchased,
      permissionProfile: marginAccessConfig.profile,
      marginAccessConfig
    };
  });
}

function masterSecondaryAssignments(): ProgramAssignmentForm[] {
  return defaultAssignments().map((assignment) => ({
    ...assignment,
    enabled: true,
    role: "admin",
    licenseType: assignment.program === "standard-pilot" ? "free" : "annual_subscription",
    projectsPurchased: null,
    permissionProfile: "completo",
    marginAccessConfig: presetMarginAccessConfig("completo")
  }));
}

function CreateUserModal({
  message,
  users,
  initialUser,
  onClose,
  onSubmit
}: {
  message: string;
  users: AdminUser[];
  initialUser?: AdminUser | null;
  onClose: () => void;
  onSubmit: (payload: CreateUserPayload) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(initialUser);
  const [form, setForm] = useState<CreateUserPayload>({
    mode: initialUser ? "existing" : "new",
    existingUserId: initialUser?.id ?? "",
    fullName: initialUser?.name ?? "",
    email: initialUser?.email ?? "",
    password: "",
    company: initialUser?.company === "-" ? "" : initialUser?.company ?? "",
    city: initialUser?.city === "-" ? "" : initialUser?.city ?? "",
    assignments: assignmentsFromUser(initialUser),
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
        if (key === "permissionProfile") {
          next.marginAccessConfig = presetMarginAccessConfig(value as MarginAccessProfile);
        }
        return next;
      })
    }));
  }

  function updateMarginAccessConfig(program: ProgramSlug, config: MarginAccessConfig) {
    setForm((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.program === program
          ? {
              ...assignment,
              permissionProfile: config.profile,
              marginAccessConfig: normalizeMarginAccessConfig(config)
            }
          : assignment
      )
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
      assignments: mode === "existing" ? assignmentsFromUser(firstExisting) : defaultAssignments()
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
      city: selected?.city ?? "",
      assignments: assignmentsFromUser(selected)
    }));
  }

  function applySecondaryMasterPreset() {
    setForm((current) => ({
      ...current,
      assignments: masterSecondaryAssignments(),
      notes: [
        current.notes.trim(),
        "Profilo master secondario: può creare e cancellare utenti non master, gestire licenze e accedere a tutti i programmi Pilot."
      ].filter(Boolean).join("\n")
    }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    await onSubmit({
      ...form,
      assignments: form.assignments
        .filter((assignment) => isEditing || assignment.enabled)
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
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{isEditing ? "Modifica utente" : "Crea nuovo utente"}</h2>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              {isEditing
                ? "Aggiorna dati, programmi, ruoli, licenze e permessi dal database centrale."
                : "Assegna programma, ruolo e licenza. Le regole di accesso vengono salvate nel database centrale."}
            </p>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[#f2f4f7] text-[#516079]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="grid gap-5" onSubmit={submit}>
          {!isEditing && (
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
          )}

          {form.mode === "existing" && !isEditing && (
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
              <input required disabled={form.mode === "existing" && !isEditing} value={form.fullName} onChange={(event) => update("fullName", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
            <Field label="Email">
              <input required disabled={form.mode === "existing" && !isEditing} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
            {form.mode === "new" && !isEditing && (
              <Field label="Password iniziale">
                <input required type="password" minLength={8} value={form.password} onChange={(event) => update("password", event.target.value)} className="input" />
              </Field>
            )}
            <Field label="Azienda">
              <input disabled={form.mode === "existing" && !isEditing} value={form.company} onChange={(event) => update("company", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
            <Field label="Città">
              <input disabled={form.mode === "existing" && !isEditing} value={form.city} onChange={(event) => update("city", event.target.value)} className="input disabled:bg-[#f2f4f7]" />
            </Field>
          </div>
          <div className="grid gap-4">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-[#101828]">Programmi da attivare</h3>
                  <p className="mt-1 text-sm text-[#667085]">Lo stesso utente può entrare in più programmi con ruoli e licenze diverse.</p>
                </div>
                <button
                  type="button"
                  onClick={applySecondaryMasterPreset}
                  className="rounded-2xl border border-[#b2ccff] bg-white px-4 py-2 text-sm font-bold text-[#175cd3] hover:bg-[#eef4ff]"
                >
                  Imposta master secondario
                </button>
              </div>
              <div className="mt-3 rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] px-4 py-3 text-sm leading-6 text-[#516079]">
                Il master secondario gestisce gli utenti dal Master Admin, può eliminare clienti non master e riceve accesso admin a Margin Pilot, Launch Pilot e Standard Pilot.
              </div>
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
                        <div className="md:col-span-2">
                          <MarginAccessConfigurator
                            config={assignment.marginAccessConfig}
                            onChange={(config) => updateMarginAccessConfig(assignment.program, config)}
                          />
                        </div>
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
              {loading ? "Salvataggio..." : isEditing ? "Salva modifiche" : "Crea utente"}
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
