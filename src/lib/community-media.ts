export const COMMUNITY_IMAGE_MAX_BYTES = 15 * 1024 * 1024;
export const COMMUNITY_MEDIA_BUCKET = "community-profile-media";

export type CommunityMediaKind = "profile-avatar" | "profile-cover" | "feed-image";

const communityMediaKinds = new Set<CommunityMediaKind>(["profile-avatar", "profile-cover", "feed-image"]);
const mimeToExtension = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export function isCommunityMediaKind(value: string): value is CommunityMediaKind {
  return communityMediaKinds.has(value as CommunityMediaKind);
}

export function validateCommunityImageDescriptor(descriptor: {
  name: string;
  type: string;
  size: number;
}): { ok: true; extension: string } | { ok: false; error: "type" | "size" } {
  const expectedExtension = mimeToExtension.get(descriptor.type);
  const extension = descriptor.name.split(".").pop()?.toLowerCase() ?? "";
  const compatibleExtensions = expectedExtension === "jpg" ? new Set(["jpg", "jpeg"]) : new Set([expectedExtension]);
  if (!expectedExtension || !compatibleExtensions.has(extension)) return { ok: false, error: "type" };
  if (!Number.isFinite(descriptor.size) || descriptor.size <= 0 || descriptor.size > COMMUNITY_IMAGE_MAX_BYTES) {
    return { ok: false, error: "size" };
  }
  return { ok: true, extension: expectedExtension };
}

export function communityMediaObjectPath(
  userId: string,
  kind: CommunityMediaKind,
  fileName: string,
  extension: string,
  token: string
) {
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  const safeName = fileName
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70) || "afbeelding";
  const safeExtension = extension.replace(/[^a-z0-9]/g, "").slice(0, 5);
  const safeToken = token.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  return `${safeUserId}/${kind}/${safeToken}-${safeName}.${safeExtension}`;
}

export function isOwnedCommunityMediaPath(userId: string, kind: CommunityMediaKind, path: string) {
  if (!isCommunityMediaKind(kind) || path.includes("..") || path.includes("\\") || path.startsWith("/")) return false;
  const safeUserId = userId.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64);
  const prefix = `${safeUserId}/${kind}/`;
  if (!path.startsWith(prefix)) return false;
  const fileName = path.slice(prefix.length);
  return Boolean(fileName) && !fileName.includes("/") && /^[a-zA-Z0-9_-]+\.(?:jpg|png|webp)$/.test(fileName);
}
