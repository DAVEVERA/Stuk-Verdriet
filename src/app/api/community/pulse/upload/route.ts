import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  canUseLegacyPulseImageBucket,
  isMissingPulseMediaBucketError,
  pulseUploadObjectPath,
  validatePulseUploadDescriptor,
  type PulseUploadKind
} from "@/lib/pulse-media";
import { assertSameOriginRequest, consumeRateLimit, requestIpAddress } from "@/lib/request-guard";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

const uploadKinds = new Set<PulseUploadKind>(["image", "video", "audio"]);
const bucket = "community-pulse-media";
const legacyImageBucket = "community-profile-media";

export async function POST(request: Request) {
  if (!(await assertSameOriginRequest())) {
    return NextResponse.json({ error: "invalid-origin", message: "Deze uploadaanvraag is niet geldig." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!user) {
    return NextResponse.json({ error: "unauthenticated", message: "Log opnieuw in om media toe te voegen." }, { status: 401 });
  }

  const ip = await requestIpAddress();
  if (!consumeRateLimit(`pulse-upload:${user.id}:${ip}`, 10 * 60_000, 20)) {
    return NextResponse.json({ error: "rate-limited", message: "Je hebt te veel uploads gestart. Probeer het later opnieuw." }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as {
    name?: unknown;
    type?: unknown;
    size?: unknown;
    kind?: unknown;
  } | null;
  const kind = String(body?.kind ?? "") as PulseUploadKind;
  if (!uploadKinds.has(kind)) {
    return NextResponse.json({ error: "type", message: "Dit mediatype wordt niet ondersteund." }, { status: 400 });
  }

  const descriptor = {
    name: String(body?.name ?? "").slice(0, 180),
    type: String(body?.type ?? "").slice(0, 100),
    size: Number(body?.size),
    kind
  };
  const validation = validatePulseUploadDescriptor(descriptor);
  if (!validation.ok) {
    return NextResponse.json({
      error: validation.error,
      message: validation.error === "size" ? "Dit bestand is te groot." : "Dit bestandsformaat wordt niet ondersteund."
    }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "storage", message: "Media-upload is tijdelijk niet beschikbaar." }, { status: 503 });
  }

  const path = pulseUploadObjectPath(user.id, descriptor.name, validation.extension, randomUUID());
  let targetBucket = bucket;
  let signedUpload = await admin.storage.from(targetBucket).createSignedUploadUrl(path, { upsert: false });
  if (isMissingPulseMediaBucketError(signedUpload.error) && canUseLegacyPulseImageBucket(descriptor)) {
    targetBucket = legacyImageBucket;
    signedUpload = await admin.storage.from(targetBucket).createSignedUploadUrl(path, { upsert: false });
  }
  const { data, error } = signedUpload;
  if (error || !data?.token) {
    console.warn("Could not create Pulse media upload token", { userId: user.id, kind, storageCode: error?.name ?? "missing-token" });
    return NextResponse.json({ error: "storage", message: "Media-upload kon niet worden gestart." }, { status: 503 });
  }

  const { data: publicData } = admin.storage.from(targetBucket).getPublicUrl(path);
  return NextResponse.json({
    bucket: targetBucket,
    path,
    token: data.token,
    publicUrl: publicData.publicUrl,
    kind,
    contentType: descriptor.type
  }, { headers: { "cache-control": "no-store" } });
}
