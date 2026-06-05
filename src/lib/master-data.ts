import {
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  ListChecks,
  LucideIcon,
  Settings,
  ShieldCheck,
  UserPlus,
  UsersRound
} from "lucide-react";

export type ProgramSlug = "margin-pilot" | "launch-pilot" | "quality-pilot";
export type RoleCode = "admin" | "consulente" | "ristoratore" | "utente";
export type LicenseType =
  | "monthly_subscription"
  | "annual_subscription"
  | "project_pack_1"
  | "project_pack_3"
  | "project_pack_5"
  | "free"
  | "suspended";
export type LicenseStatus = "active" | "expired" | "suspended" | "pending";

export type Program = {
  slug: ProgramSlug;
  name: string;
  description: string;
  loginUrl: string;
  accent: string;
  active: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  status: "active" | "suspended";
  lastAccess: string;
  accesses: Array<{
    program: ProgramSlug;
    role: RoleCode;
    licenseType: LicenseType;
    licenseStatus: LicenseStatus;
    projectsPurchased?: number;
    projectsUsed?: number;
    startDate: string;
    endDate?: string;
    notes?: string;
    createdAt?: string;
  }>;
};

export type Plan = {
  code: string;
  program: ProgramSlug;
  name: string;
  type: LicenseType;
  price: number;
  currency: "EUR";
  projectLimit: number | null;
  active: boolean;
};

export type Payment = {
  id: string;
  user: string;
  program: ProgramSlug;
  amount: number;
  currency: "EUR";
  method: string;
  status: "paid" | "pending" | "failed" | "refunded";
  paidAt: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  company: string;
  city: string;
  interestedProgram: ProgramSlug;
  status: "nuovo" | "contattato" | "interessato" | "cliente" | "sospeso" | "non_interessato";
};

export type RegistrationRequest = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  programs: string[];
  profile: string;
  license: string;
  notes: string;
  privacyAccepted: boolean;
  dataAccepted: boolean;
  contractAccepted: boolean;
  marketingAccepted: boolean;
  status: "nuovo" | "contattato" | "cliente" | "non_interessato";
  createdAt: string;
};

export type MailingContactRole = "ristoratore" | "consulente" | "franchisor" | "fornitore" | "altro";
export type MailingContactProgram = "MarginPilot" | "LaunchPilot" | "QualityPilot" | "Master Admin Suite" | "Altro";
export type MailingContactStatus = "lead" | "prova_gratuita" | "cliente_attivo" | "ex_cliente" | "da_ricontattare" | "non_interessato";
export type MailingContactSource = "inserimento_manuale" | "import_csv" | "sito_web" | "evento" | "consulenza" | "altro";

export type MailingContact = {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  azienda_ristorante: string;
  ruolo: MailingContactRole;
  programma_interessato: MailingContactProgram;
  stato: MailingContactStatus;
  consenso_marketing: boolean;
  fonte_contatto: MailingContactSource;
  tag: string;
  note: string;
  brevo_contact_id: string;
  mailchimp_contact_id: string;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  event: string;
  actor: string;
  target: string;
  createdAt: string;
};

export const programs: Program[] = [
  {
    slug: "margin-pilot",
    name: "Margin Pilot",
    description: "Controllo marginalità, prezzi e profittabilità per attività food.",
    loginUrl: "https://marginpilot-2jjw.vercel.app/cruscotto",
    accent: "from-blue-600 to-sky-400",
    active: true
  },
  {
    slug: "launch-pilot",
    name: "Launch Pilot",
    description: "Prefattibilità economico-finanziaria, investimenti e sostenibilità del progetto.",
    loginUrl: "https://launchpilot-olive.vercel.app/login",
    accent: "from-teal-600 to-emerald-400",
    active: true
  },
  {
    slug: "quality-pilot",
    name: "Quality Pilot",
    description: "Audit, customer experience, reputazione e qualità operativa per ristoranti e gruppi hospitality.",
    loginUrl: "https://quality-pilot.vercel.app/login",
    accent: "from-amber-500 to-orange-400",
    active: true
  }
];

export const sidebarItems: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Inizio", icon: LayoutDashboard },
  { id: "registration-requests", label: "Richieste accesso", icon: UserPlus },
  { id: "users", label: "Clienti e utenti", icon: UsersRound },
  { id: "profiles", label: "Profili e ruoli", icon: ShieldCheck },
  { id: "programs", label: "Programmi", icon: Building2 },
  { id: "licenses", label: "Licenze", icon: BadgeCheck },
  { id: "plans", label: "Piani vendita", icon: ListChecks },
  { id: "payments", label: "Pagamenti", icon: CreditCard },
  { id: "invoices", label: "Fatturazione", icon: FileText },
  { id: "contacts", label: "Mailing List", icon: BookOpenCheck },
  { id: "settings", label: "Impostazioni", icon: Settings },
  { id: "audit", label: "Registro attività", icon: ShieldCheck }
];

export const demoUsers: AdminUser[] = [
  {
    id: "u-001",
    name: "Mario Rossi",
    email: "mario.rossi@example.it",
    company: "Rossi Food Lab",
    city: "Firenze",
    status: "active",
    lastAccess: "2026-05-20 09:42",
    accesses: [
      {
        program: "launch-pilot",
        role: "consulente",
        licenseType: "project_pack_5",
        licenseStatus: "active",
        projectsPurchased: 5,
        projectsUsed: 2,
        startDate: "2026-05-01"
      },
      {
        program: "margin-pilot",
        role: "utente",
        licenseType: "annual_subscription",
        licenseStatus: "active",
        startDate: "2026-03-01",
        endDate: "2027-02-28"
      }
    ]
  },
  {
    id: "u-002",
    name: "Laura Bianchi",
    email: "laura.bianchi@example.it",
    company: "Bistrot Aurora",
    city: "Lucca",
    status: "active",
    lastAccess: "2026-05-19 18:15",
    accesses: [
      {
        program: "launch-pilot",
        role: "ristoratore",
        licenseType: "monthly_subscription",
        licenseStatus: "active",
        startDate: "2026-05-01",
        endDate: "2026-05-31"
      }
    ]
  },
  {
    id: "u-003",
    name: "Studio Verdi",
    email: "master@studioverdi.it",
    company: "Studio Verdi",
    city: "Milano",
    status: "suspended",
    lastAccess: "2026-04-28 11:08",
    accesses: [
      {
        program: "quality-pilot",
        role: "admin",
        licenseType: "suspended",
        licenseStatus: "suspended",
        startDate: "2026-02-01"
      }
    ]
  }
];

export const demoPlans: Plan[] = [
  { code: "launch-monthly", program: "launch-pilot", name: "Launch mensile", type: "monthly_subscription", price: 89, currency: "EUR", projectLimit: null, active: true },
  { code: "launch-pack-1", program: "launch-pilot", name: "Launch pacchetto 1 progetto", type: "project_pack_1", price: 99, currency: "EUR", projectLimit: 1, active: true },
  { code: "launch-pack-3", program: "launch-pilot", name: "Launch pacchetto 3 progetti", type: "project_pack_3", price: 249, currency: "EUR", projectLimit: 3, active: true },
  { code: "launch-pack-5", program: "launch-pilot", name: "Launch pacchetto 5 progetti", type: "project_pack_5", price: 390, currency: "EUR", projectLimit: 5, active: true },
  { code: "margin-annual", program: "margin-pilot", name: "Margin annuale", type: "annual_subscription", price: 790, currency: "EUR", projectLimit: null, active: true },
  { code: "quality-free", program: "quality-pilot", name: "Quality demo", type: "free", price: 0, currency: "EUR", projectLimit: 1, active: true }
];

export const demoPayments: Payment[] = [
  { id: "pay-101", user: "Mario Rossi", program: "launch-pilot", amount: 249, currency: "EUR", method: "Bonifico", status: "paid", paidAt: "2026-05-03" },
  { id: "pay-102", user: "Laura Bianchi", program: "launch-pilot", amount: 89, currency: "EUR", method: "Carta futura", status: "pending", paidAt: "2026-05-20" },
  { id: "pay-103", user: "Rossi Food Lab", program: "margin-pilot", amount: 790, currency: "EUR", method: "Bonifico", status: "paid", paidAt: "2026-03-01" }
];

export const demoContacts: Contact[] = [
  { id: "c-1", name: "Elena Neri", email: "elena@nerifood.it", company: "Neri Food", city: "Pisa", interestedProgram: "launch-pilot", status: "interessato" },
  { id: "c-2", name: "Davide Conti", email: "davide@conti.it", company: "Conti Consulting", city: "Roma", interestedProgram: "margin-pilot", status: "contattato" },
  { id: "c-3", name: "Giulia Serra", email: "giulia@serra.it", company: "Serra Lab", city: "Torino", interestedProgram: "quality-pilot", status: "nuovo" }
];

export const demoRegistrationRequests: RegistrationRequest[] = [
  {
    id: "rr-001",
    fullName: "Elena Neri",
    email: "elena@nerifood.it",
    phone: "+39 333 000000",
    company: "Neri Food",
    city: "Pisa",
    programs: ["LaunchPilot", "MarginPilot"],
    profile: "Ristoratore",
    license: "Demo",
    notes: "Vorrei capire quale programma attivare per una nuova apertura.",
    privacyAccepted: true,
    dataAccepted: true,
    contractAccepted: true,
    marketingAccepted: false,
    status: "nuovo",
    createdAt: "2026-06-05"
  }
];

export const demoMailingContacts: MailingContact[] = [
  {
    id: "ml-001",
    nome: "Elena",
    cognome: "Neri",
    email: "elena@nerifood.it",
    telefono: "+39 050 000000",
    azienda_ristorante: "Neri Food",
    ruolo: "ristoratore",
    programma_interessato: "LaunchPilot",
    stato: "lead",
    consenso_marketing: false,
    fonte_contatto: "consulenza",
    tag: "apertura ristorante, demo richiesta",
    note: "Interessata a prefattibilità e analisi economico-finanziaria.",
    brevo_contact_id: "",
    mailchimp_contact_id: "",
    created_at: "2026-05-20",
    updated_at: "2026-05-20"
  },
  {
    id: "ml-002",
    nome: "Davide",
    cognome: "Conti",
    email: "davide@conti.it",
    telefono: "",
    azienda_ristorante: "Conti Consulting",
    ruolo: "consulente",
    programma_interessato: "MarginPilot",
    stato: "da_ricontattare",
    consenso_marketing: true,
    fonte_contatto: "evento",
    tag: "consulente, food cost",
    note: "Richiede materiale per clienti horeca.",
    brevo_contact_id: "",
    mailchimp_contact_id: "",
    created_at: "2026-05-18",
    updated_at: "2026-05-19"
  }
];

export const demoAuditLogs: AuditLog[] = [
  { id: "log-1", event: "Licenza Launch Pilot aggiornata", actor: "master@pilot.local", target: "Mario Rossi", createdAt: "2026-05-20 10:05" },
  { id: "log-2", event: "Nuovo contatto CRM inserito", actor: "master@pilot.local", target: "Elena Neri", createdAt: "2026-05-20 09:58" },
  { id: "log-3", event: "Accesso programma verificato", actor: "system", target: "Laura Bianchi", createdAt: "2026-05-19 18:15" }
];

export function programName(slug: ProgramSlug) {
  return programs.find((program) => program.slug === slug)?.name || slug;
}

export function licenseLabel(type: LicenseType) {
  const labels: Record<LicenseType, string> = {
    monthly_subscription: "Abbonamento mensile",
    annual_subscription: "Abbonamento annuale",
    project_pack_1: "Pacchetto 1 progetto",
    project_pack_3: "Pacchetto 3 progetti",
    project_pack_5: "Pacchetto 5 progetti",
    free: "Licenza gratuita",
    suspended: "Licenza sospesa"
  };
  return labels[type];
}

export function remainingProjects(access: AdminUser["accesses"][number]) {
  if (!access.projectsPurchased) return null;
  return Math.max(access.projectsPurchased - (access.projectsUsed || 0), 0);
}

export function euro(value: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(value);
}

export const dashboardStats = {
  users: demoUsers.length,
  activeLicenses: demoUsers.flatMap((user) => user.accesses).filter((access) => access.licenseStatus === "active").length,
  expiredLicenses: demoUsers.flatMap((user) => user.accesses).filter((access) => access.licenseStatus === "expired" || access.licenseStatus === "suspended").length,
  activePrograms: programs.filter((program) => program.active).length,
  recentPayments: demoPayments.filter((payment) => payment.status === "paid").reduce((sum, payment) => sum + payment.amount, 0)
};

export const moneyIcon = Banknote;
