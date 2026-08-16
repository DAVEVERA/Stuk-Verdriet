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
  const next = safeProtectedNext(params.next ?? "/shop");

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
