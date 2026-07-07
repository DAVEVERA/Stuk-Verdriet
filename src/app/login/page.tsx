import { signInWithEmail } from "@/lib/actions";
import { PageIntro } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; missing?: string; next?: string; sent?: string }>;
};

function safeNext(value: string | undefined) {
  if (!value) return "/community";
  return value === "/bijsluiter" || value === "/community" || value.startsWith("/community/") ? value : "/community";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = safeNext(params?.next);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  return (
    <>
      <PageIntro eyebrow="Account" title="Inloggen">
        <p>Log in om je verhaal te delen, steun te geven, te reageren en handige tips of links toe te voegen.</p>
      </PageIntro>
      <section className="content-band login-panel">
        {user ? (
          <div className="notice">
            Je bent ingelogd als {user.email}. <a href={next}>Ga verder naar de community</a>.
          </div>
        ) : null}
        {params?.sent ? <p className="notice">Check je inbox voor de loginlink. Open de link op ditzelfde apparaat of in dezelfde browser.</p> : null}
        {params?.missing === "supabase" ? <p className="notice">Supabase is nog niet geconfigureerd. Controleer de environment variables.</p> : null}
        {params?.error ? <p className="notice">Inloggen lukte niet. Controleer je e-mailadres.</p> : null}
        <form className="form-grid email-login-form" action={signInWithEmail}>
          <input type="hidden" name="next" value={next} readOnly />
          <label>
            E-mailadres
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <button className="button" type="submit">Stuur loginlink</button>
        </form>
        <p className="login-helper-text">
          Je account wordt alleen gebruikt voor communityfuncties zoals posten, reageren, steunen en moderatie. Je kunt
          zichtbaar posten met je voornaam, volledige naam of anoniem.
        </p>
      </section>
    </>
  );
}
