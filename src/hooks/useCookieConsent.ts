"use client";

import { useSyncExternalStore } from "react";

export type ConsentChoice = "necessary" | "all";
export type ConsentSnapshot = ConsentChoice | "unset" | "pending";

export const cookieConsentStorageKey = "stukverdriet-cookie-consent";
export const cookieConsentChangeEvent = "stukverdriet-cookie-consent-change";

function getConsentSnapshot(): ConsentSnapshot {
  const stored = window.localStorage.getItem(cookieConsentStorageKey);
  if (stored === "necessary" || stored === "all") return stored;
  return "unset";
}

function getServerConsentSnapshot(): ConsentSnapshot {
  return "pending";
}

function subscribeToConsentChanges(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(cookieConsentChangeEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(cookieConsentChangeEvent, callback);
  };
}

export function useCookieConsent() {
  return useSyncExternalStore(subscribeToConsentChanges, getConsentSnapshot, getServerConsentSnapshot);
}

export function saveCookieConsent(nextChoice: ConsentChoice) {
  window.localStorage.setItem(cookieConsentStorageKey, nextChoice);
  window.dispatchEvent(new Event(cookieConsentChangeEvent));
}
