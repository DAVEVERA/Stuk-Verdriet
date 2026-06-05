import { signInWithEmail, signInWithProvider } from "@/lib/actions";
import { PageIntro } from "@/components/ui";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; next?: string; sent?: string }>;
};

function safeNext(value: string | undefined) {
  return value === "/bijsluiter" || value === "/community" ? value : "/community";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeNext(params?.next);
  const google = signInWithProvider.bind(null, "google");
  return (
    <>
      <PageIntro eyebrow="Account" title="Inloggen">
        <p>Log in om te delen, te reageren of te steunen.</p>
      </PageIntro>
      <section className="content-band login-panel">
        {params?.sent ? <p className="notice">Check je inbox voor de loginlink.</p> : null}
        {params?.error ? <p className="notice">Controleer je e-mailadres of probeer het opnieuw.</p> : null}
        <form className="subtle-actions" action={google}>
          <input type="hidden" name="next" value={next} readOnly />
          <button className="button" type="submit">
            Inloggen met Google
          </button>
        </form>
        <form className="form-grid email-login-form" action={signInWithEmail}>
          <input type="hidden" name="next" value={next} readOnly />
          <label>
            E-mailadres
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <button className="button" type="submit">Stuur loginlink</button>
        </form>
      </section>
    </>
  );
}
