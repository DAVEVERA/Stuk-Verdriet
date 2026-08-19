import { PageIntro } from "@/components/ui";
import { requestDataDeletion } from "@/lib/privacy-actions";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Afmelden of gegevens verwijderen",
  robots: {
    index: false,
    follow: false
  }
};

type AfmeldenPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AfmeldenPage({ searchParams }: AfmeldenPageProps) {
  const params = (await searchParams) ?? {};
  const status = Array.isArray(params.status) ? params.status[0] : params.status ?? null;

  if (status === "done") {
    return (
      <PageIntro eyebrow="Privacy" title="Afmelden">
        <p>
          Als dit adres bij ons bekend was, hebben we het verwijderd. Je ontvangt geen
          berichten meer van ons.
        </p>
        <p>Wil je je later opnieuw aanmelden? Dat kan altijd via onze website.</p>
      </PageIntro>
    );
  }

  const errorMessage =
    status === "rate-limited"
      ? "Er zijn te veel verzoeken vanaf deze plek. Probeer het over een paar minuten opnieuw."
      : status === "invalid"
        ? "Vul een geldig e-mailadres in."
        : null;

  return (
    <>
      <PageIntro eyebrow="Privacy" title="Afmelden of gegevens verwijderen">
        <p>
          Wil je geen berichten meer ontvangen? Vul hieronder je e-mailadres in. We
          verwijderen het adres dan volledig uit onze lijsten. Je hoeft verder niets te doen.
        </p>
      </PageIntro>
      <section className="afmelden-section">
        <form className="afmelden-form" action={requestDataDeletion}>
          <label>
            E-mailadres
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <button className="button" type="submit">Verwijder mijn gegevens</button>
          {errorMessage ? <p className="signup-feedback">{errorMessage}</p> : null}
        </form>
      </section>
    </>
  );
}
