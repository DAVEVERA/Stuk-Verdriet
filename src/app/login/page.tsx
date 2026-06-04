import { signInWithProvider } from "@/lib/actions";
import { PageIntro } from "@/components/ui";

export default function LoginPage() {
  const google = signInWithProvider.bind(null, "google");
  const apple = signInWithProvider.bind(null, "apple");
  return (
    <>
      <PageIntro eyebrow="Account" title="Inloggen">
        <p>Log in om berichten te plaatsen, te reageren, steun te geven of iets te melden.</p>
      </PageIntro>
      <section className="content-band">
        <form className="subtle-actions" action={google}>
          <button className="button" type="submit">
            Inloggen met Google
          </button>
        </form>
        <form className="subtle-actions" action={apple}>
          <button className="button" type="submit">
            Inloggen met Apple
          </button>
        </form>
      </section>
    </>
  );
}
