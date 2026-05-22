# Template email Supabase

## Recupero password

Oggetto consigliato:

```text
Reimposta la tua password
```

Template:

- `recovery-password-it.html`

Il link di recupero usa la variabile Supabase:

```text
{{ .ConfirmationURL }}
```

Percorso Supabase:

1. Authentication
2. Email Templates
3. Reset password
4. Incollare l'HTML del file `recovery-password-it.html`
5. Salvare

