import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  COMMUNITY_MEDIA_BUCKET,
  communityMediaObjectPath,
  isCommunityMediaKind,
  validateCommunityImageDescriptor
} from "@/lib/community-media";
import { assertSameOriginRequest, consumeRateLimit, requestIpAddress } from "@/lib/request-guard";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  if (!(await assertSameOriginRequest())) {
    return NextResponse.json({ error: "invalid-origin", message: "Deze uploadaanvraag is niet geldig." }, { status: 403 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
  if (!user) {
    return NextResponse.json({ error: "unauthenticated", message: "Log opnieuw in om een afbeelding toe te voegen." }, { status: 401 });
  }

  const ip = await requestIpAddress();
  if (!consumeRateLimit(`community-media-upload:${user.id}:${ip}`, 10 * 60_000, 30)) {
    return NextResponse.json({ error: "rate-limited", message: "Je hebt te veel uploads gestart. Probeer het later opnieuw." }, { status: 429 });
  }

  const body = await request.json().catch(() => null) as {
    name?: unknown;
    type?: unknown;
    size?: unknown;
    kind?: unknown;
  } | null;
  const kind = String(body?.kind ?? "");
  if (!isCommunityMediaKind(kind)) {
    return NextResponse.json({ error: "type", message: "Deze soort upload wordt niet ondersteund." }, { status: 400 });
  }
  const descriptor = {
    name: String(body?.name ?? "").slice(0, 180),
    type: String(body?.type ?? "").slice(0, 100),
    size: Number(body?.size)
  };
  const validation = validateCommunityImageDescriptor(descriptor);
  if (!validation.ok) {
    return NextResponse.json({
      error: validation.error,
      message: validation.error === "size"
        ? "Kies een afbeelding van maximaal 15 MB."
        : "Kies een JPG-, PNG- of WebP-afbeelding."
    }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "storage", message: "De upload is tijdelijk niet beschikbaar." }, { status: 503 });
  }
  const path = communityMediaObjectPath(user.id, kind, descriptor.name, validation.extension, randomUUID());
  const { data, error } = await admin.storage.from(COMMUNITY_MEDIA_BUCKET).createSignedUploadUrl(path, { upsert: false });
  if (error || !data?.token) {
    console.warn("Could not create community media upload token", {
      userId: user.id,
      kind,
      storageCode: error?.name ?? "missing-token"
    });
    return NextResponse.json({ error: "storage", message: "De upload kon niet worden gestart." }, { status: 503 });
  }
  const { data: publicData } = admin.storage.from(COMMUNITY_MEDIA_BUCKET).getPublicUrl(path);
  return NextResponse.json({
    bucket: COMMUNITY_MEDIA_BUCKET,
    path,
    token: data.token,
    publicUrl: publicData.publicUrl,
    contentType: descriptor.type
  }, { headers: { "cache-control": "no-store" } });
}
