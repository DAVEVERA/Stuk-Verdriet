"use client";

import { useEffect, useState } from "react";
import {
  deleteCommunityPushSubscription,
  saveCommunityPushSubscription,
  updateCommunityPushSoundPreference
} from "@/lib/actions";

type Status = "idle" | "checking" | "unsupported" | "off" | "on" | "denied" | "error";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

/**
 * Push on/off + sound on/off toggle for the community profile settings.
 * Registers /sw.js on mount so the toggle can subscribe immediately when
 * pressed, without a separate "enable notifications" step first.
 */
export function PushNotificationSettings({
  vapidPublicKey,
  initialSoundEnabled = true
}: {
  vapidPublicKey: string | null;
  initialSoundEnabled?: boolean;
}) {
  const [status, setStatus] = useState<Status>("checking");
  const [soundEnabled, setSoundEnabled] = useState(initialSoundEnabled);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window) || !vapidPublicKey) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        const existing = await registration.pushManager.getSubscription();
        if (cancelled) return;
        if (Notification.permission === "denied") {
          setStatus("denied");
        } else {
          setStatus(existing ? "on" : "off");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [vapidPublicKey]);

  async function enable() {
    if (!vapidPublicKey) return;
    setStatus("checking");
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "off");
        return;
      }
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });
      const json = subscription.toJSON();
      const result = await saveCommunityPushSubscription({
        endpoint: json.endpoint!,
        keys: { p256dh: json.keys!.p256dh!, auth: json.keys!.auth! }
      });
      if (!result.ok) {
        setStatus("error");
        setMessage("Meldingen inschakelen lukte niet. Probeer het later opnieuw.");
        return;
      }
      setStatus("on");
    } catch {
      setStatus("error");
      setMessage("Meldingen inschakelen lukte niet. Probeer het later opnieuw.");
    }
  }

  async function disable() {
    setStatus("checking");
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const endpoint = subscription.endpoint;
        await subscription.unsubscribe();
        await deleteCommunityPushSubscription(endpoint);
      }
      setStatus("off");
    } catch {
      setStatus("error");
      setMessage("Meldingen uitschakelen lukte niet. Probeer het later opnieuw.");
    }
  }

  async function toggleSound(checked: boolean) {
    setSoundEnabled(checked);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await updateCommunityPushSoundPreference(subscription.endpoint, checked);
    } catch {
      // Sound preference is a nice-to-have; a failed save here shouldn't block the UI.
    }
  }

  if (status === "unsupported") {
    return (
      <p className="community-push-hint">
        Pushmeldingen worden niet ondersteund in deze browser.
      </p>
    );
  }

  return (
    <div className="community-push-settings">
      <label className="community-checkbox-row">
        <input
          type="checkbox"
          checked={status === "on"}
          disabled={status === "checking" || status === "denied"}
          onChange={(event) => (event.target.checked ? enable() : disable())}
        />
        Stuur mij pushmeldingen voor nieuwe verbindingen, berichten en reacties.
      </label>
      <label className="community-checkbox-row">
        <input
          type="checkbox"
          checked={soundEnabled}
          disabled={status !== "on"}
          onChange={(event) => toggleSound(event.target.checked)}
        />
        Geluid bij meldingen.
      </label>
      {status === "denied" ? (
        <p className="community-push-hint">
          Meldingen staan uit in je browser. Zet ze aan bij de site-instellingen om dit in te schakelen.
        </p>
      ) : null}
      {message ? <p className="community-push-hint">{message}</p> : null}
    </div>
  );
}
