"use client";

import { useState } from "react";
import Image from "next/image";
import Script from "next/script";
import { ImagePlus, Sparkles, Trash2 } from "lucide-react";
import { saveCommunityPulseMoment } from "@/lib/actions";
import type { CommunityPulseLayer, CommunityPulseMoment } from "@/types/content";

type PulseMomentDesignerProps = {
  moments: CommunityPulseMoment[];
  displayName: string;
};

const animationOptions: Array<{ value: CommunityPulseLayer["animation"]; label: string }> = [
  { value: "fade", label: "Zacht verschijnen" },
  { value: "float", label: "Rustig zweven" },
  { value: "pulse", label: "Hartslag" },
  { value: "rise", label: "Omhoog komen" },
  { value: "still", label: "Stil" }
];
const stripePublishableKey = "pk_live_51T0omDK4ScKc9e3quwBYqevRcgQjxt2yw3mp5ALSRuSxXklyC006bwm8n9qM9W1AdWKqa9uMgiEScxH8pSmU5NCz00TmFc6OFI";
const stripeBuyButtonId = "buy_btn_1Tua2PK4ScKc9e3qb6YfbBfb";
const stripePaymentLink = "https://buy.stripe.com/aFa6oId6R7kob0S54Ed3i00";

function newLayer(text = "Wat raakt je vandaag?"): CommunityPulseLayer {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `layer-${Date.now()}`;
  return {
    id,
    kind: "text",
    text,
    x: 50,
    y: 58,
    size: 24,
    color: "#ffffff",
    rotation: 0,
    animation: "fade"
  };
}

export function PulseMomentDesigner({ moments, displayName }: PulseMomentDesignerProps) {
  const [selectedId, setSelectedId] = useState("");
  const selectedMoment = moments.find((moment) => moment.id === selectedId) ?? null;
  const [title, setTitle] = useState(selectedMoment?.title ?? "");
  const [body, setBody] = useState(selectedMoment?.body ?? "");
  const [backgroundColor, setBackgroundColor] = useState(selectedMoment?.background_color ?? "#2f4b3a");
  const [animation, setAnimation] = useState<CommunityPulseLayer["animation"]>(selectedMoment?.animation ?? "fade");
  const [visibility, setVisibility] = useState(selectedMoment?.visibility ?? "connections");
  const [status, setStatus] = useState(selectedMoment?.status ?? "published");
  const [aiAssist, setAiAssist] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [layers, setLayers] = useState<CommunityPulseLayer[]>(selectedMoment?.layers?.length ? selectedMoment.layers : [newLayer()]);

  function loadMoment(momentId: string) {
    const moment = moments.find((item) => item.id === momentId) ?? null;
    setSelectedId(momentId);
    setTitle(moment?.title ?? "");
    setBody(moment?.body ?? "");
    setBackgroundColor(moment?.background_color ?? "#2f4b3a");
    setAnimation(moment?.animation ?? "fade");
    setVisibility(moment?.visibility ?? "connections");
    setStatus(moment?.status ?? "published");
    setAiAssist(false);
    setLayers(moment?.layers?.length ? moment.layers : [newLayer()]);
  }

  function updateLayer(id: string, patch: Partial<CommunityPulseLayer>) {
    setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, ...patch } : layer));
  }

  const previewText = layers.find((layer) => layer.kind === "text")?.text || body || title || "Even stilstaan bij wat er vanbinnen speelt.";

  return (
    <div className="pulse-designer">
      <div className="pulse-designer-preview" style={{ backgroundColor }}>
        {selectedMoment?.image_url ? <Image src={selectedMoment.image_url} alt="" fill sizes="280px" /> : null}
        <div className={`pulse-story-canvas animation-${animation}`}>
          {layers.map((layer) => (
            <span
              key={layer.id}
              className={`pulse-story-layer animation-${layer.animation}`}
              style={{
                color: layer.color,
                fontSize: `${layer.size}px`,
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`
              }}
            >
              {layer.text}
            </span>
          ))}
        </div>
        <div className="pulse-story-footer">
          <strong>{displayName}</strong>
          <span>{previewText}</span>
        </div>
      </div>

      <form className="pulse-designer-form" action={saveCommunityPulseMoment} encType="multipart/form-data">
        <input type="hidden" name="return_to" value="/community/profiel?tab=pulse" readOnly />
        <input type="hidden" name="moment_id" value={selectedMoment?.id ?? ""} readOnly />
        <input type="hidden" name="existing_image_url" value={selectedMoment?.image_url ?? ""} readOnly />
        <input type="hidden" name="layers_json" value={JSON.stringify(layers)} readOnly />
        <input type="hidden" name="ai_generation_id" value={selectedMoment?.ai_generation_id ?? ""} readOnly />

        {moments.length ? (
          <label>
            Bewerk bestaand moment
            <select value={selectedId} onChange={(event) => loadMoment(event.target.value)}>
              <option value="">Nieuw moment plaatsen</option>
              {moments.map((moment) => <option key={moment.id} value={moment.id}>{moment.title}</option>)}
            </select>
          </label>
        ) : null}

        <div className="community-profile-field-grid">
          <label>Titel<input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required placeholder="Aan de Pols" /></label>
          <label>Afbeelding toevoegen<input name="pulse_image" type="file" accept="image/png,image/jpeg,image/webp" /></label>
        </div>
        <label>Tekst toevoegen<textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} rows={4} placeholder="Deel een kort moment, een gedachte of iets dat je niet alleen wilt dragen." /></label>

        <div className="pulse-layer-editor">
          <div className="pulse-layer-editor-head">
            <h3>Lagen</h3>
            <button type="button" onClick={() => setLayers((current) => [...current, newLayer(body || title || undefined)].slice(0, 8))}><ImagePlus size={16} /> Tekstlaag</button>
          </div>
          {layers.map((layer, index) => (
            <div className="pulse-layer-row" key={layer.id}>
              <label>Tekst laag {index + 1}<input value={layer.text ?? ""} onChange={(event) => updateLayer(layer.id, { text: event.target.value.slice(0, 160) })} /></label>
              <label>Grootte<input type="range" min="12" max="56" value={layer.size} onChange={(event) => updateLayer(layer.id, { size: Number(event.target.value) })} /></label>
              <label>X<input type="range" min="0" max="100" value={layer.x} onChange={(event) => updateLayer(layer.id, { x: Number(event.target.value) })} /></label>
              <label>Y<input type="range" min="0" max="100" value={layer.y} onChange={(event) => updateLayer(layer.id, { y: Number(event.target.value) })} /></label>
              <label>Kleur<input type="color" value={layer.color} onChange={(event) => updateLayer(layer.id, { color: event.target.value })} /></label>
              <label>Animatie<select value={layer.animation} onChange={(event) => updateLayer(layer.id, { animation: event.target.value as CommunityPulseLayer["animation"] })}>{animationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
              <button className="text-link" type="button" onClick={() => setLayers((current) => current.filter((item) => item.id !== layer.id))}><Trash2 size={15} /> Laag verwijderen</button>
            </div>
          ))}
        </div>

        <div className="community-profile-field-grid">
          <label>Achtergrondkleur<input name="background_color" type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} /></label>
          <label>Animatie<select name="animation" value={animation} onChange={(event) => setAnimation(event.target.value as CommunityPulseLayer["animation"])}>{animationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label>Zichtbaarheid<select name="visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as typeof visibility)}><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option><option value="private">Alleen ik</option></select></label>
          <label>Status<select name="status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="published">Plaatsen</option><option value="draft">Bewaren als concept</option></select></label>
        </div>

        <section className="pulse-ai-box">
          <label className="community-checkbox-row"><input name="ai_assist" type="checkbox" checked={aiAssist} onChange={(event) => setAiAssist(event.target.checked)} />Laat AI dit moment vormgeven voor EUR 1,99</label>
          <p>Voor EUR 1,99 kan dit moment als verticale Facebook Reel-render worden uitgewerkt. Bewaar eerst de aanvraag, rond daarna de microbetaling af in Stripe.</p>
          <textarea name="ai_prompt" rows={3} disabled={!aiAssist} placeholder="Beschrijf de sfeer, kleuren en wat dit moment mag dragen." />
          {aiAssist ? (
            <div className="pulse-payment-card">
              <div>
                <strong>AI-render verticaal</strong>
                <span>Formaat voor stories/reels, voorbereid voor Gemini Flash-rendering op basis van jouw prompt.</span>
              </div>
              <button type="button" onClick={() => setPaymentOpen((open) => !open)}>
                {paymentOpen ? "Betaling sluiten" : "Koop render EUR 1,99"}
              </button>
              {paymentOpen ? (
                <div className="pulse-payment-popout" role="dialog" aria-label="Stripe betaling voor AI-render">
                  <Script src="https://js.stripe.com/v3/buy-button.js" strategy="lazyOnload" />
                  <div
                    className="pulse-stripe-button"
                    dangerouslySetInnerHTML={{
                      __html: `<stripe-buy-button buy-button-id="${stripeBuyButtonId}" publishable-key="${stripePublishableKey}"></stripe-buy-button>`
                    }}
                  />
                  <a href={stripePaymentLink} target="_blank" rel="noreferrer">Open Stripe betaling in nieuw venster</a>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        <button className="community-panel-button" type="submit"><Sparkles size={17} /> {aiAssist ? "AI-aanvraag bewaren" : "Nieuw moment plaatsen"}</button>
      </form>
    </div>
  );
}
