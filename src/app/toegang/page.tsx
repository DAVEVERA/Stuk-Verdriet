import Link from "next/link";
import Image from "next/image";
import { safeProtectedNext } from "@/lib/route-password";

type AccessPageProps = {
  searchParams?: Promise<{ next?: string; error?: string }>;
};

export const metadata = {
  title: "Toegang",
  robots: {
    index: false,
    follow: false
  }
};

export default async function AccessPage({ searchParams }: AccessPageProps) {
  const params = (await searchParams) ?? {};
  const next = safeProtectedNext(params.next ?? "/community");
  const isShop = next === "/shop" || next.startsWith("/shop/");
  const communityError = params.error === "rate-limited"
    ? "Er zijn te veel inlogpogingen. Wacht tien minuten en probeer het opnieuw."
    : params.error === "missing-secret"
      ? "De beveiligde login is in deze omgeving nog niet geconfigureerd."
      : "Gebruikersnaam of wachtwoord klopt niet. Probeer het opnieuw.";

  if (!isShop) {
    return (
      <section className="admin-access-page" aria-labelledby="community-access-title">
        <div className="admin-access-panel">
          <p className="eyebrow">Stuk Verdriet community</p>
          <h1 id="community-access-title">Communityomgeving</h1>
          <p>
            Log direct in met een toegestaan beheeraccount. Persoonlijk aanmelden doe je daarna binnen SNAAR.
          </p>

          <form className="admin-magic-link-form" action="/api/local-admin-login" method="post">
            <input type="hidden" name="next" value={next} readOnly />
            <label>
              Gebruikersnaam
              <input name="username" autoComplete="username" required placeholder="susan of daniela" autoFocus />
            </label>
            <label>
              Wachtwoord
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className="button" type="submit">Inloggen</button>
          </form>

          {params.error ? (
            <p className="notice" role="alert">{communityError}</p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div className="login-under-construction">
      <div className="login-uc-content">
        <p className="eyebrow">Shop</p>
        <h1>Shop afgeschermd</h1>
        <p>Deze pagina is tijdelijk alleen bereikbaar met het gedeelde wachtwoord.</p>

        <form className="local-admin-login-form" action="/api/route-access" method="post">
          <input type="hidden" name="next" value={next} readOnly />
          <label>
            Wachtwoord
            <input name="password" type="password" autoComplete="current-password" required autoFocus />
          </label>
          <button className="button" type="submit">Verder</button>
          {params.error ? <p className="notice" role="alert">Dat wachtwoord klopt niet.</p> : null}
        </form>

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

        <Link href="/" className="login-uc-back">
          Terug naar Stuk Verdriet
        </Link>
      </div>
    </div>
  );
}
