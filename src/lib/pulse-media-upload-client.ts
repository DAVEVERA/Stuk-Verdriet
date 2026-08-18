"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Upload } from "tus-js-client";
import type { PulseUploadKind } from "./pulse-media";

const standardUploadLimit = 6 * 1024 * 1024;
const resumableChunkSize = 6 * 1024 * 1024;

type UploadTokenResponse = {
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
  kind: PulseUploadKind;
  contentType: string;
  message?: string;
};

export function shouldUsePulseResumableUpload(size: number) {
  return Number.isFinite(size) && size > standardUploadLimit;
}

export function pulseResumableEndpoint(supabaseUrl: string) {
  try {
    const url = new URL(supabaseUrl);
    const match = url.hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i);
    if (!match) return null;
    return `https://${match[1]}.storage.supabase.co/storage/v1/upload/resumable`;
  } catch {
    return null;
  }
}

export function pulseUploadKindForFile(file: Pick<File, "type">): PulseUploadKind | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
}

async function requestUploadToken(file: File, kind: PulseUploadKind) {
  const response = await fetch("/api/community/pulse/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size, kind })
  });
  const result = await response.json().catch(() => null) as UploadTokenResponse | null;
  if (!response.ok || !result?.token || !result.path || !result.publicUrl) {
    throw new Error(result?.message || "Media-upload kon niet worden gestart.");
  }
  return result;
}

async function standardSignedUpload(file: File, upload: UploadTokenResponse) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error("Media-upload is niet geconfigureerd.");
  const client = createBrowserClient(supabaseUrl, supabaseKey);
  const { error } = await client.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });
  if (error) throw new Error("Media-upload is mislukt. Probeer het opnieuw.");
}

async function resumableSignedUpload(
  file: File,
  upload: UploadTokenResponse,
  onProgress?: (percentage: number) => void
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const endpoint = supabaseUrl ? pulseResumableEndpoint(supabaseUrl) : null;
  if (!endpoint || !supabaseUrl || !supabaseKey) throw new Error("Media-upload is niet geconfigureerd.");

  const client = createBrowserClient(supabaseUrl, supabaseKey);
  const { data: { session } } = await client.auth.getSession();
  const authorization = session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${supabaseKey}`;

  await new Promise<void>((resolve, reject) => {
    const tusUpload = new Upload(file, {
      endpoint,
      headers: {
        apikey: supabaseKey,
        authorization,
        "x-signature": upload.token
      },
      metadata: {
        bucketName: upload.bucket,
        objectName: upload.path,
        contentType: file.type,
        cacheControl: "31536000"
      },
      chunkSize: resumableChunkSize,
      retryDelays: [0, 3_000, 5_000, 10_000, 20_000],
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      onError: () => reject(new Error("Media-upload is onderbroken. Probeer het opnieuw.")),
      onProgress: (bytesUploaded, bytesTotal) => {
        if (bytesTotal > 0) onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => resolve()
    });

    void tusUpload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads[0]) tusUpload.resumeFromPreviousUpload(previousUploads[0]);
      tusUpload.start();
    }).catch(() => tusUpload.start());
  });
}

export async function uploadPulseMediaFile(file: File, onProgress?: (percentage: number) => void) {
  const kind = pulseUploadKindForFile(file);
  if (!kind) throw new Error("Dit mediatype wordt niet ondersteund.");
  const upload = await requestUploadToken(file, kind);
  onProgress?.(0);
  if (shouldUsePulseResumableUpload(file.size)) {
    await resumableSignedUpload(file, upload, onProgress);
  } else {
    await standardSignedUpload(file, upload);
  }
  onProgress?.(100);
  return { url: upload.publicUrl, kind, path: upload.path };
}
