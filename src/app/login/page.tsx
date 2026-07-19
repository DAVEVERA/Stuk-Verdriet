import Link from "next/link";
import Image from "next/image";
import { signInWithEmail } from "@/lib/actions";

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
  const next = params.next ?? "/community";
  const error = params.error ?? params.missing;
  const isAdminLogin = next === "/admin";
  const isShopLogin = next === "/shop";
  const googleLoginHref = `/auth/google?next=${encodeURIComponent(next)}`;

  return (
    <div className="login-under-construction">
      <div className="login-uc-content">
        <p className="eyebrow">{isAdminLogin ? "Beheer" : isShopLogin ? "Shop" : "SNAAR"}</p>
        <h1>{isAdminLogin ? "Beheer login" : isShopLogin ? "Log in voor de shop" : "Log in op SNAAR"}</h1>
        <p>
          {isAdminLogin
            ? "Log lokaal in om het adminportaal te bekijken en de beheerflow te controleren."
            : isShopLogin
              ? "De shop staat nog afgeschermd. Log in om deze pagina te bekijken."
            : "Lees verhalen zonder account. Log in als je wilt reageren, steun geven of zelf iets wilt delen."}
        </p>

        {isAdminLogin ? (
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
          </form>
        ) : (
          <div className="community-login-options">
            <Link className="button" href={googleLoginHref}>Verder met Google</Link>
            <form className="local-admin-login-form" action={signInWithEmail}>
              <input type="hidden" name="next" value={next} readOnly />
              <label>
                E-mailadres
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <button className="text-link" type="submit">Stuur magic link</button>
            </form>
            {process.env.NODE_ENV === "development" ? (
              <form className="local-admin-login-form" action="/api/dev/magic-link" method="post">
                <input type="hidden" name="next" value={next} readOnly />
                <label>
                  Dev demo e-mail
                  <input name="email" type="email" defaultValue="demo@stukverdriet.test" required />
                </label>
                <button className="button" type="submit">Dev login zonder e-mail</button>
              </form>
            ) : null}
            {error ? <p className="notice">{errorMessages[error] ?? "Inloggen lukte niet."}</p> : null}
            {params.sent ? <p className="notice">Magic link verzonden. Controleer je inbox.</p> : null}
          </div>
        )}

        <div className="login-uc-socials">
          <a
            href="https://www.instagram.com/stukverdrietdepodcast/"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-link"
            aria-label="Volg Stuk Verdriet op Instagram"
          >
            <Image src="/img/instagram.png" alt="" width={24} height={24} />
          </a>
          <a
            href="https://www.facebook.com/stukverdriet"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-link"
            aria-label="Volg Stuk Verdriet op Facebook"
          >
            <Image src="/img/facebook.png" alt="" width={24} height={24} />
          </a>
          <a
            href="https://www.tiktok.com/@stuk.verdriet"
            target="_blank"
            rel="noopener noreferrer"
            className="social-circle-link"
            aria-label="Volg Stuk Verdriet op TikTok"
          >
            <Image src="/img/tik-tok.png" alt="" width={24} height={24} />
          </a>
        </div>

        <Link href={next === "/admin" ? "/" : next} className="login-uc-back">
          Terug naar {next === "/admin" ? "Stuk Verdriet" : isShopLogin ? "Shop" : "SNAAR"}
        </Link>
      </div>
    </div>
  );
}
