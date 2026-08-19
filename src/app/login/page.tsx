import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inloggen",
  robots: {
    index: false,
    follow: false
  }
};

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; next?: string; missing?: string }>;
};

const errorMessages: Record<string, string> = {
  "local-admin": "Controleer de gebruikersnaam en het wachtwoord.",
  oauth: "Inloggen via Google lukte niet.",
  callback: "De loginlink kon niet worden verwerkt.",
  "missing-supabase": "De inlogservice is nog niet geconfigureerd voor deze omgeving.",
  "missing-secret": "De beveiligde login is in deze omgeving nog niet geconfigureerd.",
  "rate-limited": "Er zijn te veel inlogpogingen. Wacht tien minuten en probeer het opnieuw."
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
            ? "Log in met Google of een toegestaan lokaal beheeraccount."
            : isShopLogin
              ? "De shop staat nog afgeschermd. Log in om deze pagina te bekijken."
            : "Lees verhalen zonder account. Log in als je wilt reageren, steun geven of zelf iets wilt delen."}
        </p>

        {isAdminLogin ? (
          <div className="community-login-options">
            <Link className="button" href={googleLoginHref} prefetch={false}>Verder met Google</Link>
            <form className="local-admin-login-form" action="/api/local-admin-login" method="post">
              <input type="hidden" name="next" value={next} readOnly />
              <label>
                Gebruikersnaam
                <input name="username" autoComplete="username" placeholder="susan of daniela" required />
              </label>
              <label>
                Wachtwoord
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
              <button className="button" type="submit">Inloggen</button>
            </form>
            {error ? <p className="notice">{errorMessages[error] ?? "Inloggen lukte niet."}</p> : null}
          </div>
        ) : (
          <div className="community-login-options">
            <Link className="button" href={googleLoginHref} prefetch={false}>Verder met Google</Link>
            {error ? <p className="notice">{errorMessages[error] ?? "Inloggen lukte niet."}</p> : null}
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
