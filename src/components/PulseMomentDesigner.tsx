"use client";

import Image, { type ImageLoaderProps } from "next/image";
import { AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowUp, ImagePlus, Minus, Music, Plus, Search, Trash2, Type, Video } from "lucide-react";
import { type ChangeEvent, type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveCommunityPulseMoment } from "@/lib/actions";
import type { CommunityPulseLayer, CommunityPulseMoment } from "@/types/content";

type PulseMomentDesignerProps = { moments: CommunityPulseMoment[]; displayName: string };
type TextAlignment = "left" | "center" | "right";
type FontChoice = "brand" | "display" | "serif" | "mono";
type EditableTextLayer = CommunityPulseLayer & { align?: TextAlignment; fontFamily?: FontChoice };
type PulseLayout = "single" | "split" | "grid";
type PulseMediaProvider = "unsplash" | "giphy" | "icons8";
type PulseMediaType = "image" | "gif" | "icon" | "video" | "audio";
type PulseMediaSource = "upload" | "existing" | PulseMediaProvider;
type PulseMediaItem = {
  id: string;
  type: PulseMediaType;
  source: PulseMediaSource;
  url: string;
  previewUrl: string;
  alt: string;
  file?: File;
  cropX: number;
  cropY: number;
  zoom: number;
  attribution?: { name: string; url: string; label: string };
  downloadLocation?: string;
  storagePath?: string;
  uploadState?: "uploading" | "ready" | "error";
  uploadProgress?: number;
  uploadError?: string;
};
type ExternalMediaResult = Omit<PulseMediaItem, "source" | "cropX" | "cropY" | "zoom">;
type BackgroundOption = { id: string; label: string; preview: string; color: string };

const MAX_PHOTOS = 4;
const animationOptions: Array<{ value: CommunityPulseLayer["animation"]; label: string }> = [
  { value: "fade", label: "Zacht verschijnen" },
  { value: "float", label: "Rustig zweven" },
  { value: "pulse", label: "Hartslag" },
  { value: "rise", label: "Omhoog komen" },
  { value: "still", label: "Stil" }
];
const backgroundOptions: BackgroundOption[] = [
  { id: "solid-pine", label: "Dennengroen", preview: "#2F4F4F", color: "#2F4F4F" },
  { id: "solid-sage", label: "Saliegroen", preview: "#7A9A7A", color: "#7A9A7A" },
  { id: "solid-sand", label: "Warm zand", preview: "#CBB899", color: "#CBB899" },
  { id: "solid-gold", label: "Goud", preview: "#DAA520", color: "#DAA520" },
  { id: "gradient-sage-dusk", label: "Avondrust", preview: "linear-gradient(145deg, #2F4F4F 0%, #5E7665 48%, #CBB899 100%)", color: "#2F4F4F" },
  { id: "gradient-pine-light", label: "Ochtendlicht", preview: "linear-gradient(155deg, #2F4F4F 0%, #7A9A7A 66%, #F7F3EC 100%)", color: "#2F4F4F" },
  { id: "gradient-sand-glow", label: "Zacht licht", preview: "linear-gradient(150deg, #F7F3EC 0%, #CBB899 64%, #7A9A7A 100%)", color: "#CBB899" },
  { id: "gradient-evening", label: "Schemering", preview: "linear-gradient(160deg, #2F4F4F 0%, #4B665A 48%, #CBB899 88%, #DAA520 120%)", color: "#2F4F4F" }
];
const fontOptions: Array<{ value: FontChoice; label: string }> = [
  { value: "brand", label: "Stuk Verdriet" },
  { value: "display", label: "Handgeschreven" },
  { value: "serif", label: "Boek" },
  { value: "mono", label: "Typemachine" }
];
const providerOptions: Array<{ value: PulseMediaProvider; label: string }> = [
  { value: "unsplash", label: "Unsplash" },
  { value: "giphy", label: "GIPHY" },
  { value: "icons8", label: "Icons8" }
];

function uniqueId(prefix: string) {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)); }
function newTextLayer(text = ""): EditableTextLayer {
  return { id: uniqueId("text"), kind: "text", text, x: 50, y: 50, size: 26, color: "#ffffff", rotation: 0, animation: "fade", align: "center", fontFamily: "brand" };
}
function isPhoto(item: PulseMediaItem) { return item.type === "image" || item.type === "gif" || item.type === "icon"; }
function fontClass(font: FontChoice | undefined) { return `is-font-${font ?? "brand"}`; }
function passthroughImageLoader({ src }: ImageLoaderProps) { return src; }
function backgroundFor(id: string) { return backgroundOptions.find((option) => option.id === id) ?? backgroundOptions[0]; }
function existingMedia(moment: CommunityPulseMoment | null): PulseMediaItem[] {
  if (moment?.media_manifest?.items.length) {
    return moment.media_manifest.items.map((item) => ({
      id: item.id,
      type: item.type,
      source: item.provider,
      url: item.url,
      previewUrl: item.url,
      alt: item.alt,
      cropX: item.cropX,
      cropY: item.cropY,
      zoom: item.zoom,
      attribution: item.attributionUrl ? {
        name: item.attributionName ?? item.provider,
        url: item.attributionUrl,
        label: item.provider === "giphy" ? "Powered by GIPHY" : item.provider === "icons8" ? "Icons8" : item.attributionName || "Unsplash"
      } : undefined,
      downloadLocation: item.downloadLocation,
      uploadState: "ready"
    }));
  }
  if (!moment?.image_url) return [];
  return [{ id: `existing-${moment.id}`, type: "image", source: "existing", url: moment.image_url, previewUrl: moment.image_url, alt: `Afbeelding bij ${moment.title || "moment"}`, cropX: 50, cropY: 50, zoom: 1 }];
}
function mediaManifest(layout: PulseLayout, media: PulseMediaItem[]) {
  return {
    version: 1,
    layout,
    items: media.map((item, index) => ({
      id: item.id,
      type: item.type,
      provider: item.source === "existing" ? "upload" : item.source,
      origin: item.source,
      order: index,
      url: item.url || null,
      fileName: item.file?.name,
      uploadIndex: item.source === "upload" ? media.slice(0, index + 1).filter((entry) => entry.source === "upload" && entry.type === item.type).length - 1 : undefined,
      cropX: item.cropX,
      cropY: item.cropY,
      zoom: item.zoom,
      alt: item.alt,
      attributionName: item.attribution?.name,
      attributionUrl: item.attribution?.url,
      downloadLocation: item.downloadLocation,
      storagePath: item.storagePath
    }))
  };
}
function normalizeExternalResults(payload: unknown, provider: PulseMediaProvider): ExternalMediaResult[] {
  if (!payload || typeof payload !== "object") return [];
  const results = (payload as { results?: unknown }).results;
  if (!Array.isArray(results)) return [];
  return results.flatMap((raw, index) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const url = typeof item.url === "string" ? item.url : "";
    if (!url || !/^https:\/\//i.test(url)) return [];
    const previewUrl = typeof item.previewUrl === "string" && /^https:\/\//i.test(item.previewUrl) ? item.previewUrl : url;
    const attribution = item.attribution && typeof item.attribution === "object" ? item.attribution as Record<string, unknown> : {};
    const fallback = provider === "giphy" ? "Powered by GIPHY" : provider === "icons8" ? "Icons8" : "Unsplash";
    return [{
      id: typeof item.id === "string" ? item.id : `${provider}-${index}`,
      type: item.type === "gif" || item.type === "icon" ? item.type : "image",
      url,
      previewUrl,
      alt: typeof item.alt === "string" ? item.alt : `Media van ${fallback}`,
      attribution: {
        name: typeof attribution.name === "string" ? attribution.name : fallback,
        url: typeof attribution.url === "string" && /^https:\/\//i.test(attribution.url) ? attribution.url : url,
        label: typeof attribution.label === "string" ? attribution.label : fallback
      },
      downloadLocation: typeof item.downloadLocation === "string" ? item.downloadLocation : undefined
    }];
  });
}

function PulseSubmitButton({ blocked }: { blocked: boolean }) {
  const { pending } = useFormStatus();
  return <button className="community-panel-button pulse-submit-button" type="submit" disabled={pending || blocked} aria-disabled={pending || blocked}>{pending ? "Moment wordt opgeslagen..." : blocked ? "Wacht op je media" : "Moment bewaren"}</button>;
}

export function PulseMomentDesigner({ moments, displayName }: PulseMomentDesignerProps) {
  const [selectedId, setSelectedId] = useState("");
  const selectedMoment = moments.find((moment) => moment.id === selectedId) ?? null;
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [backgroundStyle, setBackgroundStyle] = useState("solid-pine");
  const [animation, setAnimation] = useState<CommunityPulseLayer["animation"]>("fade");
  const [visibility, setVisibility] = useState<CommunityPulseMoment["visibility"]>("connections");
  const [status, setStatus] = useState<CommunityPulseMoment["status"]>("published");
  const [layers, setLayers] = useState<EditableTextLayer[]>([]);
  const [selectedTextId, setSelectedTextId] = useState("");
  const [media, setMedia] = useState<PulseMediaItem[]>([]);
  const [selectedMediaId, setSelectedMediaId] = useState("");
  const [layout, setLayout] = useState<PulseLayout>("single");
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [videoInputKey, setVideoInputKey] = useState(0);
  const [audioInputKey, setAudioInputKey] = useState(0);
  const [provider, setProvider] = useState<PulseMediaProvider>("unsplash");
  const [mediaQuery, setMediaQuery] = useState("");
  const [externalResults, setExternalResults] = useState<ExternalMediaResult[]>([]);
  const [searchState, setSearchState] = useState<"idle" | "loading" | "ready" | "unavailable" | "error">("idle");
  const [searchMessage, setSearchMessage] = useState("");
  const canvasRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<PulseMediaItem[]>([]);
  const textDragRef = useRef<{ id: string; pointerId: number; startX: number; startY: number; x: number; y: number } | null>(null);
  const cropPointersRef = useRef(new Map<number, { x: number; y: number }>());
  const cropGestureRef = useRef<{ itemId: string; startX: number; startY: number; cropX: number; cropY: number; distance: number; zoom: number } | null>(null);

  useEffect(() => { mediaRef.current = media; }, [media]);
  useEffect(() => () => {
    mediaRef.current.forEach((item) => { if (item.source === "upload" && item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl); });
  }, []);

  const chosenBackground = backgroundFor(backgroundStyle);
  const selectedMedia = media.find((item) => item.id === selectedMediaId) ?? null;
  const selectedText = layers.find((layer) => layer.id === selectedTextId) ?? null;
  const photoCount = media.filter(isPhoto).length;
  const hasIncompleteUpload = media.some((item) => item.source === "upload" && item.uploadState !== "ready");
  const visualMedia = media.filter((item) => item.type !== "audio");
  const visibleMedia = useMemo(() => {
    const count = layout === "single" ? 1 : layout === "split" ? 2 : 4;
    const visible = visualMedia.slice(0, count);
    if (selectedMedia && selectedMedia.type !== "audio" && !visible.some((item) => item.id === selectedMedia.id)) return [...visible.slice(0, Math.max(0, count - 1)), selectedMedia];
    return visible;
  }, [layout, selectedMedia, visualMedia]);

  function revokeUploads(items: PulseMediaItem[]) { items.forEach((item) => { if (item.source === "upload" && item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl); }); }
  function loadMoment(momentId: string) {
    const moment = moments.find((item) => item.id === momentId) ?? null;
    revokeUploads(media);
    const nextMedia = existingMedia(moment);
    const nextLayers = (moment?.layers ?? []).map((layer) => ({ ...layer, align: (layer as EditableTextLayer).align ?? "center", fontFamily: (layer as EditableTextLayer).fontFamily ?? "brand" }));
    const matchingBackground = backgroundOptions.find((option) => option.color.toLowerCase() === moment?.background_color?.toLowerCase());
    setSelectedId(momentId);
    setTitle(moment?.title ?? ""); setBody(moment?.body ?? ""); setBackgroundStyle(moment?.background_style ?? matchingBackground?.id ?? "solid-pine");
    setAnimation(moment?.animation ?? "fade"); setVisibility(moment?.visibility ?? "connections"); setStatus(moment?.status ?? "published");
    setLayers(nextLayers); setSelectedTextId(nextLayers.find((layer) => layer.kind === "text")?.id ?? "");
    setMedia(nextMedia); setSelectedMediaId(nextMedia[0]?.id ?? ""); setLayout(moment?.media_manifest?.layout ?? "single");
    setPhotoInputKey((value) => value + 1); setVideoInputKey((value) => value + 1); setAudioInputKey((value) => value + 1);
  }
  function updateLayer(id: string, patch: Partial<EditableTextLayer>) { setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, ...patch } : layer)); }
  function updateMedia(id: string, patch: Partial<PulseMediaItem>) { setMedia((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item)); }
  async function uploadLocalMedia(id: string, file: File) {
    try {
      const { uploadPulseMediaFile } = await import("@/lib/pulse-media-upload-client");
      const result = await uploadPulseMediaFile(file, (percentage) => updateMedia(id, { uploadProgress: percentage }));
      updateMedia(id, { url: result.url, storagePath: result.path, uploadState: "ready", uploadProgress: 100, uploadError: undefined, file: undefined });
    } catch (error) {
      updateMedia(id, { uploadState: "error", uploadError: error instanceof Error ? error.message : "Media-upload is mislukt." });
    }
  }
  function addPhotoFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("image/"));
    const accepted = files.slice(0, Math.max(0, MAX_PHOTOS - photoCount));
    if (!accepted.length) return;
    const additions: PulseMediaItem[] = accepted.map((file) => ({ id: uniqueId("photo"), type: file.type === "image/gif" ? "gif" : "image", source: "upload", url: "", previewUrl: URL.createObjectURL(file), alt: file.name.replace(/\.[^.]+$/, "") || "Eigen foto", file, cropX: 50, cropY: 50, zoom: 1, uploadState: "uploading", uploadProgress: 0 }));
    const nextMedia = [...media, ...additions];
    setMedia(nextMedia); setSelectedMediaId(additions[0]?.id ?? selectedMediaId);
    event.currentTarget.value = "";
    additions.forEach((item) => { if (item.file) void uploadLocalMedia(item.id, item.file); });
  }
  function addSingleFile(event: ChangeEvent<HTMLInputElement>, type: "video" | "audio") {
    const file = event.target.files?.[0];
    if (!file) return;
    const previous = media.find((item) => item.type === type);
    if (previous?.source === "upload" && previous.previewUrl.startsWith("blob:")) URL.revokeObjectURL(previous.previewUrl);
    const next: PulseMediaItem = { id: uniqueId(type), type, source: "upload", url: "", previewUrl: URL.createObjectURL(file), alt: file.name, file, cropX: 50, cropY: 50, zoom: 1, uploadState: "uploading", uploadProgress: 0 };
    setMedia((current) => [...current.filter((item) => item.type !== type), next]); setSelectedMediaId(next.id);
    event.currentTarget.value = "";
    void uploadLocalMedia(next.id, file);
  }
  function removeMedia(id: string) {
    const removed = media.find((item) => item.id === id);
    if (removed?.source === "upload" && removed.previewUrl.startsWith("blob:")) URL.revokeObjectURL(removed.previewUrl);
    const nextMedia = media.filter((item) => item.id !== id);
    setMedia(nextMedia);
    if (removed?.type === "video") setVideoInputKey((value) => value + 1);
    if (removed?.type === "audio") setAudioInputKey((value) => value + 1);
    if (selectedMediaId === id) setSelectedMediaId(nextMedia.find(isPhoto)?.id ?? nextMedia[0]?.id ?? "");
  }
  function moveMedia(id: string, direction: -1 | 1) {
    setMedia((current) => {
      const index = current.findIndex((item) => item.id === id); const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const next = [...current]; [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function searchFreeMedia() {
    const query = mediaQuery.trim();
    if (!query) { setSearchState("error"); setSearchMessage("Vul eerst een zoekterm in."); return; }
    setSearchState("loading"); setSearchMessage("Media zoeken..."); setExternalResults([]);
    try {
      const response = await fetch(`/api/community/pulse/media?provider=${provider}&q=${encodeURIComponent(query)}`, { method: "GET", headers: { Accept: "application/json" } });
      const payload = await response.json() as { configured?: boolean; message?: string };
      if (response.status === 503 || payload.configured === false) {
        setSearchState("unavailable"); setSearchMessage(payload.message || "Deze mediabron is nog niet geconfigureerd."); return;
      }
      if (!response.ok) { setSearchState("error"); setSearchMessage(payload.message || "Zoeken lukt nu niet. Probeer het later opnieuw."); return; }
      const results = normalizeExternalResults(payload, provider);
      setExternalResults(results); setSearchState("ready"); setSearchMessage(results.length ? `${results.length} resultaten gevonden.` : "Geen resultaten gevonden.");
    } catch {
      setSearchState("error"); setSearchMessage("Zoeken lukt nu niet. Controleer je verbinding en probeer opnieuw.");
    }
  }
  function selectExternalMedia(result: ExternalMediaResult) {
    if (photoCount >= MAX_PHOTOS) { setSearchState("error"); setSearchMessage(`Je kunt maximaal ${MAX_PHOTOS} foto's of illustraties gebruiken.`); return; }
    const item: PulseMediaItem = { ...result, id: `${provider}-${result.id}-${uniqueId("media")}`, source: provider, cropX: 50, cropY: 50, zoom: 1 };
    setMedia((current) => [...current, item]); setSelectedMediaId(item.id); setSearchMessage(`${result.attribution?.label ?? "Media"} toegevoegd.`);
    if (provider === "unsplash" && result.downloadLocation) {
      void fetch("/api/community/pulse/media", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ downloadLocation: result.downloadLocation }) }).catch(() => undefined);
    }
  }
  function startTextDrag(event: ReactPointerEvent<HTMLButtonElement>, layer: EditableTextLayer) {
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setSelectedTextId(layer.id);
    textDragRef.current = { id: layer.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, x: layer.x, y: layer.y };
  }
  function moveTextDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = textDragRef.current; const canvas = canvasRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !canvas) return;
    event.preventDefault(); const rect = canvas.getBoundingClientRect();
    updateLayer(drag.id, { x: clamp(drag.x + ((event.clientX - drag.startX) / rect.width) * 100, 4, 96), y: clamp(drag.y + ((event.clientY - drag.startY) / rect.height) * 100, 4, 96) });
  }
  function endTextDrag(event: ReactPointerEvent<HTMLButtonElement>) { if (textDragRef.current?.pointerId === event.pointerId) textDragRef.current = null; }
  function pointerDistance(points: Array<{ x: number; y: number }>) { return points.length < 2 ? 0 : Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y); }
  function startCropGesture(event: ReactPointerEvent<HTMLDivElement>, item: PulseMediaItem) {
    if (!isPhoto(item)) return;
    event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId);
    cropPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...cropPointersRef.current.values()];
    cropGestureRef.current = { itemId: item.id, startX: points[0].x, startY: points[0].y, cropX: item.cropX, cropY: item.cropY, distance: pointerDistance(points), zoom: item.zoom };
    setSelectedMediaId(item.id);
  }
  function moveCropGesture(event: ReactPointerEvent<HTMLDivElement>, item: PulseMediaItem) {
    if (!cropPointersRef.current.has(event.pointerId) || !cropGestureRef.current) return;
    event.preventDefault(); cropPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...cropPointersRef.current.values()]; const gesture = cropGestureRef.current;
    if (points.length >= 2 && gesture.distance > 0) { updateMedia(item.id, { zoom: clamp(gesture.zoom * (pointerDistance(points) / gesture.distance), 1, 3) }); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    updateMedia(item.id, { cropX: clamp(gesture.cropX - ((event.clientX - gesture.startX) / rect.width) * 100 / item.zoom, 0, 100), cropY: clamp(gesture.cropY - ((event.clientY - gesture.startY) / rect.height) * 100 / item.zoom, 0, 100) });
  }
  function endCropGesture(event: ReactPointerEvent<HTMLDivElement>, item: PulseMediaItem) {
    cropPointersRef.current.delete(event.pointerId); const remaining = [...cropPointersRef.current.values()];
    cropGestureRef.current = remaining.length ? { itemId: item.id, startX: remaining[0].x, startY: remaining[0].y, cropX: item.cropX, cropY: item.cropY, distance: pointerDistance(remaining), zoom: item.zoom } : null;
  }

  return (
    <div className="pulse-designer">
      <section className="pulse-composer-stage-panel" aria-label="Voorbeeld van je moment">
        <div ref={canvasRef} className={`pulse-designer-preview is-layout-${layout}`} style={{ background: chosenBackground.preview }}>
          <div className={`pulse-media-canvas has-${visibleMedia.length}-items`}>
            {visibleMedia.map((item) => (
              <div className={`pulse-media-frame${selectedMediaId === item.id ? " is-selected" : ""}`} key={item.id}
                onPointerDown={(event) => startCropGesture(event, item)} onPointerMove={(event) => moveCropGesture(event, item)}
                onPointerUp={(event) => endCropGesture(event, item)} onPointerCancel={(event) => endCropGesture(event, item)}>
                {item.type === "video" ? <video src={item.previewUrl} muted playsInline loop autoPlay aria-label={item.alt} /> : (
                  <Image loader={passthroughImageLoader} unoptimized src={item.previewUrl} alt={item.alt} width={540} height={960}
                    sizes="(min-width: 1024px) 360px, calc(100vw - 48px)" style={{ objectPosition: `${item.cropX}% ${item.cropY}%`, transform: `scale(${item.zoom})` }} />
                )}
              </div>
            ))}
          </div>
          <div className={`pulse-story-canvas animation-${animation}`}>
            {layers.filter((layer) => layer.kind === "text").map((layer) => (
              <button key={layer.id} type="button" className={`pulse-story-layer animation-${layer.animation} ${fontClass(layer.fontFamily)}${selectedTextId === layer.id ? " is-selected" : ""}`}
                style={{ color: layer.color, fontSize: `${layer.size}px`, left: `${layer.x}%`, top: `${layer.y}%`, textAlign: layer.align ?? "center", transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)` }}
                aria-label={`Verplaats tekst: ${layer.text || "zonder inhoud"}`} onPointerDown={(event) => startTextDrag(event, layer)} onPointerMove={moveTextDrag} onPointerUp={endTextDrag} onPointerCancel={endTextDrag}>
                {layer.text || "Typ je tekst"}
              </button>
            ))}
          </div>
          <div className="pulse-story-footer"><strong>{displayName}</strong></div>
        </div>
        <p className="pulse-stage-hint">{selectedMedia && isPhoto(selectedMedia) ? "Sleep de geselecteerde foto om de uitsnede te bepalen. Knijp met twee vingers om te zoomen." : selectedText ? "Sleep de geselecteerde tekst naar de juiste plek." : "Je moment blijft rustig en verticaal in 9:16-formaat."}</p>
        {selectedMedia?.attribution ? <p className="pulse-selected-attribution">Bron: <a href={selectedMedia.attribution.url} target="_blank" rel="noreferrer sponsored">{selectedMedia.attribution.label}</a></p> : null}
      </section>

      <form className="pulse-designer-form" action={saveCommunityPulseMoment}>
        <input type="hidden" name="return_to" value="/community/profiel?tab=pulse" readOnly />
        <input type="hidden" name="moment_id" value={selectedMoment?.id ?? ""} readOnly />
        <input type="hidden" name="existing_image_url" value={selectedMoment?.image_url ?? ""} readOnly />
        <input type="hidden" name="layers_json" value={JSON.stringify(layers)} readOnly />
        <input type="hidden" name="media_manifest_json" value={JSON.stringify(mediaManifest(layout, media))} readOnly />
        <input type="hidden" name="background_style" value={backgroundStyle} readOnly />
        <input type="hidden" name="background_color" value={chosenBackground.color} readOnly />

        {moments.length ? <label className="pulse-field">Bewerk bestaand moment<select value={selectedId} onChange={(event) => loadMoment(event.target.value)}><option value="">Nieuw moment maken</option>{moments.map((moment) => <option key={moment.id} value={moment.id}>{moment.title || "Moment zonder titel"}</option>)}</select></label> : null}
        <fieldset className="pulse-control-group">
          <legend>Vertel alleen wat je wilt</legend>
          <div className="pulse-form-grid">
            <label className="pulse-field">Titel <span>(optioneel)</span><input name="title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="Geef je moment een naam" /></label>
            <label className="pulse-field">Beschrijving <span>(optioneel)</span><textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} rows={3} placeholder="Schrijf iets bij je moment, als je dat wilt." /></label>
          </div>
        </fieldset>

        <fieldset className="pulse-control-group">
          <legend>Foto, video of geluid</legend>
          <p className="pulse-group-copy">Kies maximaal vier foto&apos;s of illustraties. Bestanden verschijnen meteen in je voorbeeld.</p>
          <div className="pulse-upload-grid">
            <label className="pulse-file-button"><ImagePlus size={19} aria-hidden="true" /> Foto&apos;s kiezen<input key={photoInputKey} className="sr-only" name="pulse_images" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple onChange={addPhotoFiles} disabled={photoCount >= MAX_PHOTOS} /></label>
            <label className="pulse-file-button"><Video size={19} aria-hidden="true" /> Video kiezen<input key={videoInputKey} className="sr-only" name="pulse_video" type="file" accept="video/mp4,video/webm" onChange={(event) => addSingleFile(event, "video")} /></label>
            <label className="pulse-file-button"><Music size={19} aria-hidden="true" /> Audio kiezen<input key={audioInputKey} className="sr-only" name="pulse_audio" type="file" accept="audio/mpeg,audio/mp4,audio/ogg,audio/wav" onChange={(event) => addSingleFile(event, "audio")} /></label>
          </div>
          <span className="pulse-file-count" aria-live="polite">{photoCount} van {MAX_PHOTOS} foto&apos;s gekozen</span>
          <span className="pulse-file-count">Per foto maximaal 15 MB · video 50 MB · audio 25 MB</span>
          {media.length ? (
            <ul className="pulse-media-list" aria-label="Gekozen media">
              {media.map((item, index) => (
                <li className={selectedMediaId === item.id ? "is-selected" : undefined} key={item.id}>
                  <button className="pulse-media-select" type="button" onClick={() => setSelectedMediaId(item.id)} aria-pressed={selectedMediaId === item.id}>
                    {item.type === "audio" ? <Music size={22} aria-hidden="true" /> : item.type === "video" ? <Video size={22} aria-hidden="true" /> : <Image loader={passthroughImageLoader} unoptimized src={item.previewUrl} alt="" width={56} height={56} />}
                    <span>{item.alt}</span>
                  </button>
                  {item.type === "audio" ? <audio controls preload="metadata" src={item.previewUrl}>Je browser ondersteunt geen audiovoorbeeld.</audio> : null}
                  <div className="pulse-media-actions">
                    <button type="button" onClick={() => moveMedia(item.id, -1)} disabled={index === 0} aria-label={`${item.alt} eerder zetten`}><ArrowUp size={18} /></button>
                    <button type="button" onClick={() => moveMedia(item.id, 1)} disabled={index === media.length - 1} aria-label={`${item.alt} later zetten`}><ArrowDown size={18} /></button>
                    <button type="button" onClick={() => removeMedia(item.id)} aria-label={`${item.alt} verwijderen`}><Trash2 size={18} /></button>
                  </div>
                  {item.uploadState === "uploading" ? <div className="pulse-upload-progress" role="status"><span>Uploaden: {item.uploadProgress ?? 0}%</span><progress max="100" value={item.uploadProgress ?? 0}>{item.uploadProgress ?? 0}%</progress></div> : null}
                  {item.uploadState === "error" ? <div className="pulse-upload-error" role="alert"><span>{item.uploadError || "Media-upload is mislukt."}</span>{item.file ? <button type="button" onClick={() => { updateMedia(item.id, { uploadState: "uploading", uploadProgress: 0, uploadError: undefined }); void uploadLocalMedia(item.id, item.file as File); }}>Opnieuw proberen</button> : null}</div> : null}
                  {item.attribution ? <a className="pulse-media-attribution" href={item.attribution.url} target="_blank" rel="noreferrer sponsored">{item.attribution.label}</a> : null}
                </li>
              ))}
            </ul>
          ) : null}
          <div className="pulse-layout-control" role="group" aria-label="Indeling van de foto’s">
            {(["single", "split", "grid"] as const).map((value) => <button type="button" key={value} className={layout === value ? "is-active" : undefined} onClick={() => setLayout(value)} aria-pressed={layout === value}>{value === "single" ? "Eén beeld" : value === "split" ? "Gesplitst" : "Raster"}</button>)}
          </div>
          {selectedMedia && isPhoto(selectedMedia) ? (
            <div className="pulse-crop-controls" aria-label={`Uitsnede van ${selectedMedia.alt}`}>
              <div className="pulse-control-heading"><strong>Uitsnede</strong><button type="button" onClick={() => updateMedia(selectedMedia.id, { cropX: 50, cropY: 50, zoom: 1 })}>Herstellen</button></div>
              <label className="pulse-range-field">Horizontale positie<input type="range" min="0" max="100" value={selectedMedia.cropX} onChange={(event) => updateMedia(selectedMedia.id, { cropX: Number(event.target.value) })} /></label>
              <label className="pulse-range-field">Verticale positie<input type="range" min="0" max="100" value={selectedMedia.cropY} onChange={(event) => updateMedia(selectedMedia.id, { cropY: Number(event.target.value) })} /></label>
              <div className="pulse-zoom-control">
                <button type="button" onClick={() => updateMedia(selectedMedia.id, { zoom: clamp(selectedMedia.zoom - 0.1, 1, 3) })} aria-label="Uitzoomen"><Minus size={18} /></button>
                <label>Zoom<input type="range" min="1" max="3" step="0.05" value={selectedMedia.zoom} onChange={(event) => updateMedia(selectedMedia.id, { zoom: Number(event.target.value) })} /></label>
                <button type="button" onClick={() => updateMedia(selectedMedia.id, { zoom: clamp(selectedMedia.zoom + 0.1, 1, 3) })} aria-label="Inzoomen"><Plus size={18} /></button>
              </div>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="pulse-control-group pulse-free-media">
          <legend>Gratis media</legend>
          <p className="pulse-group-copy">Zoek beelden die je met de getoonde bronvermelding kunt gebruiken.</p>
          <div className="pulse-provider-tabs" role="tablist" aria-label="Mediabron">
            {providerOptions.map((option) => <button key={option.value} type="button" role="tab" aria-selected={provider === option.value} className={provider === option.value ? "is-active" : undefined} onClick={() => { setProvider(option.value); setExternalResults([]); setSearchState("idle"); setSearchMessage(""); }}>{option.label}</button>)}
          </div>
          <div className="pulse-media-search" role="search">
            <label className="sr-only" htmlFor="pulse-media-query">Zoek gratis media</label>
            <input id="pulse-media-query" value={mediaQuery} onChange={(event) => setMediaQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void searchFreeMedia(); } }} maxLength={80} placeholder={`Zoek bij ${providerOptions.find((item) => item.value === provider)?.label}`} />
            <button type="button" onClick={() => void searchFreeMedia()} disabled={searchState === "loading"}><Search size={18} /> Zoeken</button>
          </div>
          <p className={`pulse-search-status is-${searchState}`} role={searchState === "error" || searchState === "unavailable" ? "alert" : "status"} aria-live="polite">{searchMessage}</p>
          {externalResults.length ? (
            <ul className="pulse-search-results">
              {externalResults.map((result) => <li key={result.id}>
                <Image loader={passthroughImageLoader} unoptimized src={result.previewUrl} alt={result.alt} width={180} height={180} sizes="140px" />
                <button type="button" onClick={() => selectExternalMedia(result)} disabled={photoCount >= MAX_PHOTOS}><Plus size={18} /> Toevoegen</button>
                {result.attribution ? <a href={result.attribution.url} target="_blank" rel="noreferrer sponsored">{result.attribution.label}</a> : null}
              </li>)}
            </ul>
          ) : null}
        </fieldset>

        <fieldset className="pulse-control-group">
          <legend>Tekst in beeld</legend>
          <div className="pulse-control-heading">
            <p className="pulse-group-copy">Tekst is niet verplicht. Je kunt elk tekstblok direct in het voorbeeld verslepen.</p>
            <button className="pulse-add-text" type="button" onClick={() => { const layer = newTextLayer(); setLayers((current) => [...current, layer].slice(0, 8)); setSelectedTextId(layer.id); }} disabled={layers.filter((layer) => layer.kind === "text").length >= 8}><Type size={18} /> Voeg tekst toe</button>
          </div>
          {layers.filter((layer) => layer.kind === "text").map((layer, index) => (
            <article className={`pulse-text-editor${selectedTextId === layer.id ? " is-selected" : ""}`} key={layer.id}>
              <div className="pulse-control-heading"><strong>Tekst {index + 1}</strong><button type="button" onClick={() => { setLayers((current) => current.filter((item) => item.id !== layer.id)); if (selectedTextId === layer.id) setSelectedTextId(""); }}><Trash2 size={17} /> Verwijderen</button></div>
              <label className="pulse-field">Tekst<textarea value={layer.text ?? ""} onFocus={() => setSelectedTextId(layer.id)} onChange={(event) => updateLayer(layer.id, { text: event.target.value.slice(0, 160) })} rows={2} maxLength={160} placeholder="Typ wat je wilt laten zien" /></label>
              <div className="pulse-text-style-grid">
                <label className="pulse-field">Lettertype<select value={layer.fontFamily ?? "brand"} onChange={(event) => updateLayer(layer.id, { fontFamily: event.target.value as FontChoice })}>{fontOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                <label className="pulse-field">Tekstkleur<span className="pulse-color-input"><input type="color" value={layer.color} onChange={(event) => updateLayer(layer.id, { color: event.target.value })} /><span>{layer.color}</span></span></label>
              </div>
              <div className="pulse-align-control" role="group" aria-label={`Uitlijning tekst ${index + 1}`}>
                {([["left", "Links", AlignLeft], ["center", "Midden", AlignCenter], ["right", "Rechts", AlignRight]] as const).map(([value, label, Icon]) => <button type="button" key={value} className={(layer.align ?? "center") === value ? "is-active" : undefined} aria-pressed={(layer.align ?? "center") === value} onClick={() => updateLayer(layer.id, { align: value })}><Icon size={18} /> {label}</button>)}
              </div>
              <label className="pulse-range-field">Lettergrootte<input type="range" min="12" max="56" value={layer.size} onChange={(event) => updateLayer(layer.id, { size: Number(event.target.value) })} /></label>
              <div className="pulse-position-grid">
                <label className="pulse-range-field">Horizontale positie<input type="range" min="4" max="96" value={layer.x} onChange={(event) => updateLayer(layer.id, { x: Number(event.target.value) })} /></label>
                <label className="pulse-range-field">Verticale positie<input type="range" min="4" max="96" value={layer.y} onChange={(event) => updateLayer(layer.id, { y: Number(event.target.value) })} /></label>
              </div>
              <label className="pulse-field">Beweging<select value={layer.animation} onChange={(event) => updateLayer(layer.id, { animation: event.target.value as CommunityPulseLayer["animation"] })}>{animationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            </article>
          ))}
        </fieldset>

        <fieldset className="pulse-control-group">
          <legend>Achtergrond en delen</legend>
          <div className="pulse-background-options" role="group" aria-label="Achtergrond kiezen">
            {backgroundOptions.map((option) => <button type="button" key={option.id} className={backgroundStyle === option.id ? "is-active" : undefined} aria-pressed={backgroundStyle === option.id} onClick={() => setBackgroundStyle(option.id)}><span style={{ background: option.preview }} aria-hidden="true" />{option.label}</button>)}
          </div>
          <div className="pulse-form-grid">
            <label className="pulse-field">Beweging van het moment<select name="animation" value={animation} onChange={(event) => setAnimation(event.target.value as CommunityPulseLayer["animation"])}>{animationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
            <label className="pulse-field">Zichtbaarheid<select name="visibility" value={visibility} onChange={(event) => setVisibility(event.target.value as CommunityPulseMoment["visibility"])}><option value="connections">Alleen verbindingen</option><option value="community">Hele community</option><option value="private">Alleen ik</option></select></label>
            <label className="pulse-field">Status<select name="status" value={status} onChange={(event) => setStatus(event.target.value as CommunityPulseMoment["status"])}><option value="published">Plaatsen</option><option value="draft">Bewaren als concept</option></select></label>
          </div>
        </fieldset>
        {hasIncompleteUpload ? <p className="pulse-upload-blocker" role="status">Wacht tot alle media zijn geüpload of verwijder een mislukte upload.</p> : null}
        <PulseSubmitButton blocked={hasIncompleteUpload} />
      </form>
    </div>
  );
}
