"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { createSupabaseBrowserClient, hasSupabaseBrowserConfig } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function prepareRecoverySession() {
      if (!hasSupabaseBrowserConfig()) {
        setMessage("Configurazione Supabase non presente.");
        setReady(true);
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const code = new URLSearchParams(window.location.search).get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("Link di recupero non valido o scaduto. Richiedi una nuova email di recupero.");
          setReady(true);
          return;
        }
        window.history.replaceState(null, "", "/reset-password");
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage("Apri questa pagina dal link ricevuto via email. Se il link è scaduto, richiedi un nuovo recupero password.");
      } else {
        setHasRecoverySession(true);
      }
      setReady(true);
    }

    prepareRecoverySession();
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 8) {
      setMessage("La password deve avere almeno 8 caratteri.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Le due password non coincidono.");
      return;
    }

    if (!hasSupabaseBrowserConfig()) {
      setMessage("Configurazione Supabase non presente.");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setLoading(false);
      setMessage(error.message);
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    setCompleted(true);
    setHasRecoverySession(false);
    setPassword("");
    setConfirmPassword("");
    setMessage("Password aggiornata correttamente. Per sicurezza la sessione di recupero è stata chiusa: ora puoi entrare dal login.");
    window.setTimeout(() => {
      window.location.href = "/login";
    }, 2200);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f8fb] px-6">
      <div className="w-full max-w-md rounded-[28px] border border-[#d9e2ef] bg-white p-8 soft-shadow">
        <Link href="/login" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-[#516079]">
          <ArrowLeft className="h-4 w-4" />
          Torna al login
        </Link>
        <div className="mb-7">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#123c69] text-white">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#101828]">Nuova password</h1>
          <p className="mt-2 text-sm leading-6 text-[#667085]">
            Questa pagina serve solo a impostare una nuova password. Dopo il salvataggio verrai riportato al login.
          </p>
        </div>
        <form className="grid gap-4" onSubmit={onSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-[#344054]">
            Nuova password
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-2xl border border-[#d0d5dd] px-4 py-3 outline-none transition focus:border-[#175cd3] focus:ring-4 focus:ring-[#dbeafe]"
              type="password"
              minLength={8}
              disabled={completed}
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[#344054]">
            Conferma password
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-2xl border border-[#d0d5dd] px-4 py-3 outline-none transition focus:border-[#175cd3] focus:ring-4 focus:ring-[#dbeafe]"
              type="password"
              minLength={8}
              disabled={completed}
              required
            />
          </label>
          {message && <p className={`rounded-2xl px-4 py-3 text-sm font-medium ${completed ? "bg-[#ecfdf3] text-[#067647]" : "bg-[#eef4ff] text-[#175cd3]"}`}>{message}</p>}
          <button className="rounded-2xl bg-[#123c69] px-5 py-3 font-bold text-white transition hover:bg-[#175cd3] disabled:opacity-60" disabled={loading || !ready || !hasRecoverySession || completed}>
            {loading ? "Aggiornamento..." : completed ? "Password aggiornata" : ready ? "Aggiorna password" : "Verifica link..."}
          </button>
        </form>
      </div>
    </main>
  );
}
