"use client";

import { createBrowserClient } from "@supabase/ssr";
import { Upload } from "tus-js-client";
import type { CommunityMediaKind } from "./community-media";

const standardUploadLimit = 6 * 1024 * 1024;
const resumableChunkSize = 6 * 1024 * 1024;

type UploadTokenResponse = {
  bucket: string;
  path: string;
  token: string;
  publicUrl: string;
  contentType: string;
  message?: string;
};

async function requestUploadToken(file: File, kind: CommunityMediaKind) {
  const response = await fetch("/api/community/media/upload", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, size: file.size, kind })
  });
  const result = await response.json().catch(() => null) as UploadTokenResponse | null;
  if (!response.ok || !result?.token || !result.path || !result.publicUrl) {
    throw new Error(result?.message || "De upload kon niet worden gestart.");
  }
  return result;
}

function uploadConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("De upload is niet geconfigureerd.");
  return { url, key };
}

async function standardSignedUpload(file: File, upload: UploadTokenResponse) {
  const { url, key } = uploadConfiguration();
  const client = createBrowserClient(url, key);
  const { error } = await client.storage.from(upload.bucket).uploadToSignedUrl(upload.path, upload.token, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false
  });
  if (error) throw new Error("De upload is mislukt. Probeer het opnieuw.");
}

async function resumableSignedUpload(file: File, upload: UploadTokenResponse, onProgress?: (value: number) => void) {
  const { url, key } = uploadConfiguration();
  const project = new URL(url).hostname.match(/^([a-z0-9-]+)\.supabase\.co$/i)?.[1];
  if (!project) throw new Error("De upload is niet geconfigureerd.");
  const client = createBrowserClient(url, key);
  const { data: { session } } = await client.auth.getSession();
  const authorization = session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${key}`;

  await new Promise<void>((resolve, reject) => {
    const tusUpload = new Upload(file, {
      endpoint: `https://${project}.storage.supabase.co/storage/v1/upload/resumable`,
      headers: { apikey: key, authorization, "x-signature": upload.token },
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
      onError: () => reject(new Error("De upload is onderbroken. Probeer het opnieuw.")),
      onProgress: (uploaded, total) => total > 0 && onProgress?.(Math.round((uploaded / total) * 100)),
      onSuccess: () => resolve()
    });
    void tusUpload.findPreviousUploads().then((previous) => {
      if (previous[0]) tusUpload.resumeFromPreviousUpload(previous[0]);
      tusUpload.start();
    }).catch(() => tusUpload.start());
  });
}

export async function uploadCommunityImageFile(
  file: File,
  kind: CommunityMediaKind,
  onProgress?: (value: number) => void
) {
  const upload = await requestUploadToken(file, kind);
  onProgress?.(0);
  if (file.size > standardUploadLimit) await resumableSignedUpload(file, upload, onProgress);
  else await standardSignedUpload(file, upload);
  onProgress?.(100);
  return { path: upload.path, url: upload.publicUrl };
}
