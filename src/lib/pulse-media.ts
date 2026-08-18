export type PulseAnimation = "fade" | "float" | "pulse" | "rise" | "still";
export type PulseTextAlign = "left" | "center" | "right";
export type PulseFontFamily = "brand" | "display" | "serif" | "mono";
export type PulseMediaLayout = "single" | "split" | "grid";
export type PulseMediaType = "image" | "video" | "audio" | "gif" | "icon";
export type PulseMediaProvider = "upload" | "unsplash" | "giphy" | "icons8";

export type SanitizedPulseLayer = {
  id: string;
  kind: "text";
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  animation: PulseAnimation;
  align: PulseTextAlign;
  fontFamily: PulseFontFamily;
};

export type PulseMediaItem = {
  id: string;
  type: PulseMediaType;
  url: string;
  provider: PulseMediaProvider;
  cropX: number;
  cropY: number;
  zoom: number;
  alt: string;
  attributionName?: string;
  attributionUrl?: string;
  downloadLocation?: string;
};

export type PulseMediaManifest = {
  layout: PulseMediaLayout;
  items: PulseMediaItem[];
};

export const pulseBackgroundStyles = [
  "solid-pine",
  "solid-sage",
  "solid-sand",
  "solid-gold",
  "gradient-sage-dusk",
  "gradient-pine-light",
  "gradient-sand-glow",
  "gradient-evening"
] as const;

const pulseUploadRules = {
  image: {
    maxSize: 15 * 1024 * 1024,
    mimeToExtension: new Map([
      ["image/jpeg", "jpg"],
      ["image/png", "png"],
      ["image/webp", "webp"],
      ["image/gif", "gif"]
    ])
  },
  video: {
    maxSize: 50 * 1024 * 1024,
    mimeToExtension: new Map([
      ["video/mp4", "mp4"],
      ["video/webm", "webm"]
    ])
  },
  audio: {
    maxSize: 25 * 1024 * 1024,
    mimeToExtension: new Map([
      ["audio/mpeg", "mp3"],
      ["audio/mp4", "m4a"],
      ["audio/wav", "wav"],
      ["audio/ogg", "ogg"]
    ])
  }
} as const;

const animations = new Set<PulseAnimation>(["fade", "float", "pulse", "rise", "still"]);
const alignments = new Set<PulseTextAlign>(["left", "center", "right"]);
const fontFamilies = new Set<PulseFontFamily>(["brand", "display", "serif", "mono"]);
const mediaLayouts = new Set<PulseMediaLayout>(["single", "split", "grid"]);
const mediaTypes = new Set<PulseMediaType>(["image", "video", "audio", "gif", "icon"]);
const mediaProviders = new Set<PulseMediaProvider>(["upload", "unsplash", "giphy", "icons8"]);
const safeMediaHosts = new Set([
  "images.unsplash.com",
  "media.giphy.com",
  "i.giphy.com",
  "media0.giphy.com",
  "media1.giphy.com",
  "media2.giphy.com",
  "media3.giphy.com",
  "media4.giphy.com",
  "img.icons8.com",
  "maxst.icons8.com"
]);

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function clamp(value: unknown, fallback: number, minimum: number, maximum: number) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function cleanId(value: unknown, fallback: string) {
  const id = String(value ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48);
  return id || fallback;
}

function cleanHexColor(value: unknown, fallback = "#ffffff") {
  const color = String(value ?? "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(color) ? color.toLowerCase() : fallback;
}

function cleanHttpUrl(value: unknown, allowedForMedia = false) {
  const raw = String(value ?? "").trim().slice(0, 1200);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return "";
    if (!allowedForMedia) return url.toString();
    if (safeMediaHosts.has(url.hostname) || url.hostname.endsWith(".supabase.co")) return url.toString();
  } catch {
    return "";
  }
  return "";
}

export function sanitizePulseLayers(raw: string, fallbackAnimation: PulseAnimation): SanitizedPulseLayer[] {
  let parsed: unknown = [];
  try {
    parsed = raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];
  const animationFallback = animations.has(fallbackAnimation) ? fallbackAnimation : "fade";

  return parsed.slice(0, 8).flatMap((entry, index) => {
    const item = asRecord(entry);
    const text = String(item.text ?? "").trim().slice(0, 240);
    if (!text || (item.kind !== undefined && item.kind !== "text")) return [];
    const animation = String(item.animation ?? "") as PulseAnimation;
    const align = String(item.align ?? "") as PulseTextAlign;
    const fontFamily = String(item.fontFamily ?? "") as PulseFontFamily;

    return [{
      id: cleanId(item.id, `text-${index + 1}`),
      kind: "text" as const,
      text,
      x: clamp(item.x, 50, 4, 96),
      y: clamp(item.y, 58, 8, 92),
      size: clamp(item.size, 24, 12, 64),
      color: cleanHexColor(item.color),
      rotation: clamp(item.rotation, 0, -18, 18),
      animation: animations.has(animation) ? animation : animationFallback,
      align: alignments.has(align) ? align : "center",
      fontFamily: fontFamilies.has(fontFamily) ? fontFamily : "brand"
    }];
  });
}

export function derivePulseTitle(
  requestedTitle: string,
  body: string,
  layers: Array<Pick<SanitizedPulseLayer, "text">>,
  hasMedia: boolean
) {
  const explicitTitle = requestedTitle.trim().slice(0, 120);
  if (explicitTitle) return explicitTitle;
  const firstText = layers.find((layer) => layer.text.trim())?.text.trim();
  if (firstText) return firstText.slice(0, 120);
  const firstBodyLine = body.split(/\r?\n/).find((line) => line.trim())?.trim();
  if (firstBodyLine) return firstBodyLine.slice(0, 120);
  return hasMedia ? "Nieuw moment" : "Nieuw moment";
}

export function sanitizePulseMediaManifest(raw: string): PulseMediaManifest {
  let parsed: unknown = {};
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    return { layout: "single", items: [] };
  }

  const source = asRecord(parsed);
  const requestedLayout = String(source.layout ?? "single") as PulseMediaLayout;
  const layout = mediaLayouts.has(requestedLayout) ? requestedLayout : "single";
  const entries = Array.isArray(source.items) ? source.items : [];

  const items = entries.slice(0, 8).flatMap((entry, index) => {
    const item = asRecord(entry);
    const type = String(item.type ?? "image") as PulseMediaType;
    const provider = String(item.provider ?? "upload") as PulseMediaProvider;
    const url = cleanHttpUrl(item.url, true);
    if (!mediaTypes.has(type) || !mediaProviders.has(provider) || !url) return [];

    const attributionUrl = cleanHttpUrl(item.attributionUrl);
    const downloadLocation = cleanHttpUrl(item.downloadLocation);
    return [{
      id: cleanId(item.id, `media-${index + 1}`),
      type,
      url,
      provider,
      cropX: clamp(item.cropX, 50, 0, 100),
      cropY: clamp(item.cropY, 50, 0, 100),
      zoom: clamp(item.zoom, 1, 1, 3),
      alt: String(item.alt ?? "").trim().slice(0, 180),
      ...(item.attributionName ? { attributionName: String(item.attributionName).trim().slice(0, 120) } : {}),
      ...(attributionUrl ? { attributionUrl } : {}),
      ...(downloadLocation ? { downloadLocation } : {})
    }];
  });

  return { layout: items.length <= 1 ? "single" : layout, items };
}

export function sanitizePulseBackgroundStyle(value: string) {
  const style = value.trim();
  return (pulseBackgroundStyles as readonly string[]).includes(style) ? style : "solid-pine";
}

export function isPulseComposerSchemaError(error: { code?: string | null; message?: string | null } | null | undefined) {
  if (!error || !["PGRST204", "42703"].includes(String(error.code ?? ""))) return false;
  const message = String(error.message ?? "").toLowerCase();
  return message.includes("media_manifest") || message.includes("background_style");
}

export function isMissingPulseMediaBucketError(error: { message?: string | null; status?: number | string | null } | null | undefined) {
  if (!error) return false;
  return String(error.message ?? "").toLowerCase().includes("bucket not found");
}

export function canUseLegacyPulseImageBucket(descriptor: { type: string; size: number; kind: PulseUploadKind }) {
  return descriptor.kind === "image"
    && descriptor.size <= 5 * 1024 * 1024
    && ["image/jpeg", "image/png", "image/webp"].includes(descriptor.type);
}

export type PulseUploadKind = keyof typeof pulseUploadRules;

export function validatePulseUploadDescriptor(descriptor: {
  name: string;
  type: string;
  size: number;
  kind: PulseUploadKind;
}): { ok: true; extension: string } | { ok: false; error: "type" | "size" } {
  const rule = pulseUploadRules[descriptor.kind];
  const extension = descriptor.name.split(".").pop()?.toLowerCase() ?? "";
  const expectedExtension = rule.mimeToExtension.get(descriptor.type as never);
  const compatibleExtensions = expectedExtension === "jpg"
    ? new Set(["jpg", "jpeg"])
    : expectedExtension === "m4a"
      ? new Set(["m4a", "mp4"])
      : new Set(expectedExtension ? [expectedExtension] : []);
  if (!expectedExtension || !compatibleExtensions.has(extension)) return { ok: false, error: "type" };
  if (!Number.isFinite(descriptor.size) || descriptor.size <= 0 || descriptor.size > rule.maxSize) {
    return { ok: false, error: "size" };
  }
  return { ok: true, extension: expectedExtension };
}

export function pulseUploadObjectPath(userId: string, fileName: string, extension: string, token: string) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  const baseName = fileName
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "media";
  const safeToken = token.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  const safeExtension = extension.replace(/[^a-z0-9]/g, "").slice(0, 5);
  return `${safeUserId}/aan-de-pols/${safeToken}-${baseName}.${safeExtension}`;
}
