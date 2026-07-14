import Link from "next/link";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; next?: string; sent?: string; missing?: string }>;
};

const errorMessages: Record<string, string> = {
  "local-admin": "Controleer de lokale admingegevens.",
  "local-disabled": "Lokale admin-login is alleen beschikbaar in development.",
  oauth: "Inloggen via Google lukte niet.",
  email: "Vul een geldig e-mailadres in.",
  "email-login": "De magic link kon niet worden verzonden.",
  callback: "De loginlink kon niet worden verwerkt.",
  "missing-supabase": "Supabase is nog niet geconfigureerd voor deze omgeving."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const next = params.next ?? "/admin";
  const error = params.error ?? params.missing;

  return (
    <div className="login-under-construction">
      <div className="login-uc-content">
        <h1>Beheer login</h1>
        <p>Log lokaal in om het adminportaal te bekijken en de beheerflow te controleren.</p>

        <form className="local-admin-login-form" action="/api/local-admin-login" method="post">
          <input type="hidden" name="next" value={next} readOnly />
          <label>
            Gebruiker
            <input name="username" autoComplete="username" required />
          </label>
          <label>
            Wachtwoord
            <input name="password" type="password" autoComplete="current-password" required />
          </label>
          <button className="button" type="submit">Inloggen</button>
          {error ? <p className="notice">{errorMessages[error] ?? "Inloggen lukte niet."}</p> : null}
          {params.sent ? <p className="notice">Magic link verzonden. Controleer je inbox.</p> : null}
        </form>

        <div className="login-uc-socials">
          <a
            href="https://www.instagram.com/stukverdrietdepodcast/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-link"
            aria-label="Volg Stuk Verdriet op Instagram"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.057-1.645.069-4.849.069-3.204 0-3.584-.012-4.849-.069-3.259-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.322a1.44 1.44 0 11.002 2.881 1.44 1.44 0 01-.002-2.881z"/>
            </svg>
          </a>
          <a
            href="https://www.tiktok.com/@stuk.verdriet"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-link"
            aria-label="Volg Stuk Verdriet op TikTok"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.66 .3 2.89 2.89 0 015.66-.3V9.54a4.84 4.84 0 003.77 4.25v-3.1a9.86 9.86 0 01-1.1-.53v3.1z"/>
            </svg>
          </a>
        </div>

        <Link href="/" className="login-uc-back">Terug naar Stuk Verdriet</Link>
      </div>
    </div>
  );
}
