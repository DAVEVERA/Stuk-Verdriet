"use client";

import Link from "next/link";

export default function AppError({
  retry
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "2rem" }}>
      <section style={{ width: "min(100%, 34rem)", textAlign: "center" }} aria-labelledby="app-error-title">
        <p className="eyebrow">Stuk Verdriet</p>
        <h1 id="app-error-title">Er ging iets mis</h1>
        <p>Vernieuw dit onderdeel en probeer het opnieuw. Blijft het gebeuren, ga dan terug naar de startpagina.</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem" }}>
          <button className="button" type="button" onClick={() => retry()}>
            Opnieuw proberen
          </button>
          <Link className="text-link" href="/">
            Naar de startpagina
          </Link>
        </div>
      </section>
    </main>
  );
}
