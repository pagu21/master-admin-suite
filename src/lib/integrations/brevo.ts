// Predisposizione futura per Brevo.
// Non inserire API key nel codice e non inviare email da qui in questa fase.
// Quando l'integrazione sara attivata, usare variabili ambiente lato server.

export type BrevoContactPayload = {
  email: string;
  nome?: string;
  cognome?: string;
  telefono?: string;
  azienda?: string;
  tag?: string;
  consensoMarketing: boolean;
};

export async function syncContactToBrevo(_contact: BrevoContactPayload) {
  throw new Error("Integrazione Brevo non ancora attiva.");
}
