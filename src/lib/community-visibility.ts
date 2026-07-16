const communityHosts = new Set([
  "stuk-verdriet-community.vercel.app"
]);

export function isCommunityStandaloneBuild() {
  return process.env.NEXT_PUBLIC_COMMUNITY_STANDALONE === "1";
}

export function isCommunityHost(hostname: string) {
  const normalized = hostname.toLowerCase();
  return communityHosts.has(normalized) || normalized.startsWith("stuk-verdriet-community-");
}

export function shouldExposeCommunity(hostname?: string | null) {
  if (isCommunityStandaloneBuild()) return true;
  if (!hostname) return false;
  return isCommunityHost(hostname);
}
