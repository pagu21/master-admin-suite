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
  UsersRound
} from "lucide-react";

export type ProgramSlug = "margin-pilot" | "launch-pilot" | "standard-pilot";
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
    description: "Prefattibilità economica, business plan e sostenibilità finanziaria.",
    loginUrl: "https://launchpilot-olive.vercel.app/login",
    accent: "from-teal-600 to-emerald-400",
    active: true
  },
  {
    slug: "standard-pilot",
    name: "Quality Pilot",
    description: "Standard operativi, procedure e controllo qualità per la ristorazione.",
    loginUrl: "https://qualitypilot.vercel.app/login",
    accent: "from-amber-500 to-orange-400",
    active: false
  }
];

export const sidebarItems: Array<{ id: string; label: string; icon: LucideIcon }> = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "users", label: "Utenti", icon: UsersRound },
  { id: "profiles", label: "Profili", icon: ShieldCheck },
  { id: "programs", label: "Programmi", icon: Building2 },
  { id: "licenses", label: "Licenze", icon: BadgeCheck },
  { id: "plans", label: "Piani commerciali", icon: ListChecks },
  { id: "payments", label: "Pagamenti", icon: CreditCard },
  { id: "invoices", label: "Fatturazione", icon: FileText },
  { id: "contacts", label: "CRM contatti", icon: BookOpenCheck },
  { id: "settings", label: "Impostazioni", icon: Settings },
  { id: "audit", label: "Audit logs", icon: ShieldCheck }
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
        program: "standard-pilot",
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
  { code: "launch-pack-3", program: "launch-pilot", name: "Launch pacchetto 3 progetti", type: "project_pack_3", price: 249, currency: "EUR", projectLimit: 3, active: true },
  { code: "margin-annual", program: "margin-pilot", name: "Margin annuale", type: "annual_subscription", price: 790, currency: "EUR", projectLimit: null, active: true },
  { code: "standard-free", program: "standard-pilot", name: "Quality demo", type: "free", price: 0, currency: "EUR", projectLimit: 1, active: false }
];

export const demoPayments: Payment[] = [
  { id: "pay-101", user: "Mario Rossi", program: "launch-pilot", amount: 249, currency: "EUR", method: "Bonifico", status: "paid", paidAt: "2026-05-03" },
  { id: "pay-102", user: "Laura Bianchi", program: "launch-pilot", amount: 89, currency: "EUR", method: "Carta futura", status: "pending", paidAt: "2026-05-20" },
  { id: "pay-103", user: "Rossi Food Lab", program: "margin-pilot", amount: 790, currency: "EUR", method: "Bonifico", status: "paid", paidAt: "2026-03-01" }
];

export const demoContacts: Contact[] = [
  { id: "c-1", name: "Elena Neri", email: "elena@nerifood.it", company: "Neri Food", city: "Pisa", interestedProgram: "launch-pilot", status: "interessato" },
  { id: "c-2", name: "Davide Conti", email: "davide@conti.it", company: "Conti Consulting", city: "Roma", interestedProgram: "margin-pilot", status: "contattato" },
  { id: "c-3", name: "Giulia Serra", email: "giulia@serra.it", company: "Serra Lab", city: "Torino", interestedProgram: "standard-pilot", status: "nuovo" }
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
