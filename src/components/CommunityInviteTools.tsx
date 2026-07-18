"use client";

import { useMemo, useState } from "react";
import { Copy, Mail, MessageCircle, Share2 } from "lucide-react";

type CommunityInviteToolsProps = {
  inviteUrl?: string;
};

export function CommunityInviteTools({ inviteUrl = "https://stuk-verdriet-community.vercel.app/community" }: CommunityInviteToolsProps) {
  const [feedback, setFeedback] = useState("");
  const message = "Ik wil je uitnodigen voor SNAAR, de community van Stuk Verdriet. Hier kun je rustig meelezen, reageren of verbinding maken.";
  const encodedMessage = encodeURIComponent(`${message}\n\n${inviteUrl}`);
  const mailHref = `mailto:?subject=${encodeURIComponent("Uitnodiging voor SNAAR")}&body=${encodedMessage}`;
  const whatsAppHref = `https://wa.me/?text=${encodedMessage}`;
  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  const shortUrl = useMemo(() => inviteUrl.replace(/^https?:\/\//, ""), [inviteUrl]);

  async function shareInvite() {
    setFeedback("");
    if (canShare) {
      try {
        await navigator.share({
          title: "SNAAR community",
          text: message,
          url: inviteUrl
        });
        setFeedback("Uitnodiging geopend.");
        return;
      } catch {
        setFeedback("Delen is afgebroken.");
        return;
      }
    }
    await copyInvite();
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(`${message}\n\n${inviteUrl}`);
      setFeedback("Uitnodiging gekopieerd.");
    } catch {
      setFeedback("Kopieren lukte niet. Gebruik e-mail of WhatsApp.");
    }
  }

  return (
    <section className="community-invite-tools" aria-label="Mensen uitnodigen">
      <div>
        <h3>Iemand uitnodigen</h3>
        <p>Nodig iemand buiten SNAAR uit via je eigen e-mail, WhatsApp of deelmenu.</p>
        <span>{shortUrl}</span>
      </div>
      <div className="community-invite-actions">
        <button type="button" onClick={shareInvite}>
          <Share2 size={17} aria-hidden /> Delen
        </button>
        <button type="button" onClick={copyInvite}>
          <Copy size={17} aria-hidden /> Kopieer link
        </button>
        <a href={mailHref}>
          <Mail size={17} aria-hidden /> E-mail
        </a>
        <a href={whatsAppHref} target="_blank" rel="noreferrer">
          <MessageCircle size={17} aria-hidden /> WhatsApp
        </a>
      </div>
      {feedback ? <p className="community-invite-feedback" role="status">{feedback}</p> : null}
    </section>
  );
}
