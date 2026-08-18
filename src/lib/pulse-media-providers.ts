export type PulseMediaProviderName = "unsplash" | "giphy" | "icons8";

export type PulseProviderResult = {
  id: string;
  type: "image" | "gif" | "icon";
  url: string;
  previewUrl: string;
  alt: string;
  attribution: {
    name: string;
    url: string;
    label: string;
  };
  downloadLocation?: string;
};

type ProviderEnvironment = Partial<Record<"UNSPLASH_ACCESS_KEY" | "GIPHY_API_KEY" | "ICONS8_API_KEY", string>>;

export type PulseProviderRequest = {
  url: string;
  headers: Record<string, string>;
};

export function buildUnsplashDownloadRequest(downloadLocation: string, accessKey: string): PulseProviderRequest | null {
  const key = accessKey.trim();
  if (!key) return null;
  try {
    const url = new URL(downloadLocation);
    if (url.protocol !== "https:" || url.hostname !== "api.unsplash.com") return null;
    if (!/^\/photos\/[^/]+\/download$/.test(url.pathname)) return null;
    return {
      url: url.toString(),
      headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" }
    };
  } catch {
    return null;
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function nestedRecord(parent: Record<string, unknown>, key: string) {
  return asRecord(parent[key]);
}

function safeHttpsUrl(value: unknown) {
  const raw = String(value ?? "").trim();
  try {
    const url = new URL(raw);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function boundedQuery(value: string) {
  return value.trim().replace(/\s+/g, " ").slice(0, 50);
}

function withUtm(raw: string, source: string) {
  const url = safeHttpsUrl(raw);
  if (!url) return "";
  const parsed = new URL(url);
  parsed.searchParams.set("utm_source", "stuk_verdriet");
  parsed.searchParams.set("utm_medium", source);
  return parsed.toString();
}

export function buildPulseProviderRequest(
  provider: PulseMediaProviderName,
  rawQuery: string,
  environment: ProviderEnvironment
): PulseProviderRequest | null {
  const query = boundedQuery(rawQuery);
  if (!query) return null;

  if (provider === "unsplash") {
    const key = environment.UNSPLASH_ACCESS_KEY?.trim();
    if (!key) return null;
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("per_page", "12");
    url.searchParams.set("orientation", "portrait");
    url.searchParams.set("content_filter", "high");
    return { url: url.toString(), headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" } };
  }

  if (provider === "giphy") {
    const key = environment.GIPHY_API_KEY?.trim();
    if (!key) return null;
    const url = new URL("https://api.giphy.com/v1/gifs/search");
    url.searchParams.set("api_key", key);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", "12");
    url.searchParams.set("rating", "g");
    url.searchParams.set("lang", "nl");
    url.searchParams.set("remove_low_contrast", "true");
    return { url: url.toString(), headers: {} };
  }

  const key = environment.ICONS8_API_KEY?.trim();
  if (!key) return null;
  const url = new URL("https://api-icons.icons8.com/api/iconsets/v5/search");
  url.searchParams.set("term", query);
  url.searchParams.set("amount", "12");
  url.searchParams.set("platform", "emoji");
  url.searchParams.set("language", "en");
  url.searchParams.set("allowExplicit", "false");
  return { url: url.toString(), headers: { "Api-Key": key } };
}

export function mapUnsplashResults(payload: unknown): PulseProviderResult[] {
  const source = asRecord(payload);
  const results = Array.isArray(source.results) ? source.results : [];
  return results.slice(0, 12).flatMap((entry) => {
    const item = asRecord(entry);
    const urls = nestedRecord(item, "urls");
    const links = nestedRecord(item, "links");
    const user = nestedRecord(item, "user");
    const userLinks = nestedRecord(user, "links");
    const url = safeHttpsUrl(urls.regular);
    const previewUrl = safeHttpsUrl(urls.small) || url;
    const photographerUrl = withUtm(String(userLinks.html ?? links.html ?? ""), "referral");
    const downloadLocation = safeHttpsUrl(links.download_location);
    if (!url || !previewUrl) return [];
    return [{
      id: String(item.id ?? "").slice(0, 80),
      type: "image" as const,
      url,
      previewUrl,
      alt: String(item.alt_description ?? item.description ?? "Foto van Unsplash").trim().slice(0, 180),
      attribution: {
        name: String(user.name ?? "Unsplash-fotograaf").trim().slice(0, 120),
        url: photographerUrl,
        label: "Unsplash"
      },
      ...(downloadLocation ? { downloadLocation } : {})
    }];
  });
}

export function mapGiphyResults(payload: unknown): PulseProviderResult[] {
  const source = asRecord(payload);
  const results = Array.isArray(source.data) ? source.data : [];
  return results.slice(0, 12).flatMap((entry) => {
    const item = asRecord(entry);
    const images = nestedRecord(item, "images");
    const fixedWidth = nestedRecord(images, "fixed_width");
    const small = nestedRecord(images, "fixed_width_small");
    const original = nestedRecord(images, "original");
    const url = safeHttpsUrl(fixedWidth.url) || safeHttpsUrl(original.url);
    const previewUrl = safeHttpsUrl(small.url) || url;
    if (!url || !previewUrl) return [];
    return [{
      id: String(item.id ?? "").slice(0, 80),
      type: "gif" as const,
      url,
      previewUrl,
      alt: String(item.title ?? "GIF").trim().slice(0, 180),
      attribution: {
        name: "GIPHY",
        url: "https://giphy.com/",
        label: "Powered by GIPHY"
      }
    }];
  });
}

export function mapIcons8Results(payload: unknown): PulseProviderResult[] {
  const source = asRecord(payload);
  const results = Array.isArray(source.icons) ? source.icons : [];
  return results.slice(0, 12).flatMap((entry) => {
    const item = asRecord(entry);
    const previewUrl = safeHttpsUrl(item.previewUrl);
    if (!previewUrl) return [];
    return [{
      id: String(item.id ?? item.commonName ?? "").slice(0, 80),
      type: "icon" as const,
      url: previewUrl,
      previewUrl,
      alt: String(item.name ?? item.commonName ?? "Emoticon").trim().slice(0, 180),
      attribution: {
        name: "Icons8",
        url: "https://icons8.com/icons/set/emoji",
        label: "Icons8"
      }
    }];
  });
}
