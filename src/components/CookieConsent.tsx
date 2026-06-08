"use client";

import { useState, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { Cookie, Settings, ShieldCheck, X } from "lucide-react";

type CookieConsentProps = {
  gaId?: string;
};

type ConsentChoice = "necessary" | "all";
type ConsentSnapshot = ConsentChoice | "unset" | "pending";

const storageKey = "stukverdriet-cookie-consent";
const consentChangeEvent = "stukverdriet-cookie-consent-change";

function getConsentSnapshot(): ConsentSnapshot {
  const stored = window.localStorage.getItem(storageKey);
  if (stored === "necessary" || stored === "all") return stored;
  return "unset";
}

function getServerConsentSnapshot(): ConsentSnapshot {
  return "pending";
}

function subscribeToConsentChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(consentChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(consentChangeEvent, callback);
  };
}

export function CookieConsent({ gaId }: CookieConsentProps) {
  const storedChoice = useSyncExternalStore(subscribeToConsentChanges, getConsentSnapshot, getServerConsentSnapshot);
  const [showDetails, setShowDetails] = useState(false);
  const choice = storedChoice === "necessary" || storedChoice === "all" ? storedChoice : null;
  const isReady = storedChoice !== "pending";

  function saveChoice(nextChoice: ConsentChoice) {
    window.localStorage.setItem(storageKey, nextChoice);
    window.dispatchEvent(new Event(consentChangeEvent));
  }

  const canLoadAnalytics = choice === "all" && Boolean(gaId);

  return (
    <>
      {canLoadAnalytics ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}

      {isReady && !choice ? (
        <section className="cookie-consent" aria-labelledby="cookie-consent-title" role="dialog" aria-modal="false">
          <div className="cookie-consent-card">
            <div className="cookie-consent-icon" aria-hidden>
              <Cookie size={24} />
            </div>
            <div className="cookie-consent-copy">
              <p className="eyebrow">Cookiekeuze</p>
              <h2 id="cookie-consent-title">We gebruiken alleen wat juridisch nodig of toegestaan is.</h2>
              <p>
                Noodzakelijke cookies houden de website veilig en werkend. Voor statistieken, embeds en vergelijkbare
                niet-noodzakelijke technieken vragen we toestemming.
              </p>

              {showDetails ? (
                <div className="cookie-legal-reasons">
                  <div>
                    <ShieldCheck size={18} aria-hidden />
                    <p>
                      <strong>Noodzakelijk:</strong> technische werking, beveiliging, login, formulieren en je
                      cookievoorkeur. Juridische basis: noodzakelijke dienst en gerechtvaardigd belang.
                    </p>
                  </div>
                  <div>
                    <Settings size={18} aria-hidden />
                    <p>
                      <strong>Niet-noodzakelijk:</strong> statistieken, externe embeds of marketingtechnieken. Juridische
                      basis: toestemming, die je altijd kunt intrekken.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="cookie-consent-links">
                <Link href="/cookies">Cookieverklaring</Link>
                <Link href="/privacy">Privacyverklaring</Link>
              </div>
            </div>
            <div className="cookie-consent-actions">
              <button className="button" type="button" onClick={() => saveChoice("all")}>
                Alles accepteren
              </button>
              <button className="cookie-secondary-button" type="button" onClick={() => saveChoice("necessary")}>
                Alleen noodzakelijk
              </button>
              <button className="cookie-text-button" type="button" onClick={() => setShowDetails((current) => !current)}>
                {showDetails ? "Minder uitleg" : "Juridische redenen"}
              </button>
            </div>
            <button className="cookie-close-button" type="button" onClick={() => saveChoice("necessary")} aria-label="Cookiemelding sluiten">
              <X size={18} aria-hidden />
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
