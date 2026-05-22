"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, LockKeyhole, X } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_MASTER_ADMIN_URL || window.location.origin).replace(/\/$/, "");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (!hasSupabaseBrowserConfig()) {
      setMessage("Accesso non disponibile: la piattaforma non risulta ancora collegata al sistema di autenticazione.");
      setLoading(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }
    await fetch("/api/auth/track-login", { method: "POST" }).catch(() => undefined);
    window.location.href = "/admin";
  }

  async function sendPasswordRecovery() {
    setMessage("");
    if (!email) {
      setMessage("Inserisci prima la tua email nel campo sopra.");
      return;
    }
    if (!hasSupabaseBrowserConfig()) {
      setMessage("Configurazione Supabase non presente.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appBaseUrl()}/reset-password`
    });
    setLoading(false);

    setMessage(error ? error.message : "Email di recupero password inviata, se l'indirizzo e registrato.");
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] px-6">
      <div className="w-full max-w-md rounded-[28px] border border-[#d9e2ef] bg-white p-8 soft-shadow">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#516079]">
          <ArrowLeft className="h-4 w-4" />
          Prodotti
        </Link>
        <div className="mb-7">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#123c69] text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101828]">Accesso riservato</h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Benvenuto nella piattaforma di controllo dei prodotti Pilot. Da qui gestisci accessi,
            licenze e clienti con un ambiente riservato, ordinato e professionale.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-[#344054]">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-2xl border border-[#d0d5dd] px-4 py-3 outline-none transition focus:border-[#175cd3] focus:ring-4 focus:ring-[#dbeafe]"
              type="email"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#344054]">
            Password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-[#d0d5dd] px-4 py-3 outline-none transition focus:border-[#175cd3] focus:ring-4 focus:ring-[#dbeafe]"
              type="password"
              required
            />
          </label>
          {message && <p className="rounded-2xl bg-[#fff7ed] px-4 py-3 text-sm font-medium text-[#b54708]">{message}</p>}
          <button
            className="rounded-2xl bg-[#123c69] px-5 py-3 font-bold text-white transition hover:bg-[#175cd3] disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Accesso in corso..." : "Entra nel pannello"}
          </button>
          <button
            type="button"
            onClick={() => setRecoveryOpen(!recoveryOpen)}
            className="text-center text-sm font-semibold text-[#175cd3]"
          >
            Non ricordi email o password?
          </button>
          {recoveryOpen && (
            <div className="relative rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-4 pr-12 text-sm leading-6 text-[#516079]">
              <button
                type="button"
                aria-label="Chiudi recupero password"
                onClick={() => setRecoveryOpen(false)}
                className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white text-[#344054] ring-1 ring-[#d0d5dd] transition hover:bg-[#eef4ff] hover:text-[#175cd3]"
              >
                <X className="h-4 w-4" />
              </button>
              <p>
                Se ricordi l&apos;email, puoi ricevere un link per impostare una nuova password.
              </p>
              <button
                type="button"
                onClick={sendPasswordRecovery}
                className="mt-3 rounded-xl bg-white px-4 py-2 font-bold text-[#123c69] ring-1 ring-[#c7d7ee]"
              >
                Invia recupero password
              </button>
              <p className="mt-3">
                Se non ricordi l&apos;email di accesso, chiedi all&apos;amministratore di verificare la tua scheda cliente nel Master Admin.
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
