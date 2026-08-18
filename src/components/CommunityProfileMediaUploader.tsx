"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { finalizeCommunityProfileMedia } from "@/lib/actions";
import {
  COMMUNITY_IMAGE_MAX_BYTES,
  validateCommunityImageDescriptor,
  type CommunityMediaKind
} from "@/lib/community-media";
import { uploadCommunityImageFile } from "@/lib/community-media-upload-client";

export function CommunityProfileMediaUploader({
  kind,
  returnTo
}: {
  kind: Extract<CommunityMediaKind, "profile-avatar" | "profile-cover">;
  returnTo: string;
}) {
  const avatar = kind === "profile-avatar";
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
    setProgress(null);
    if (!selected) {
      setError(null);
      return;
    }
    const validation = validateCommunityImageDescriptor(selected);
    if (!validation.ok) {
      event.currentTarget.value = "";
      setError(validation.error === "size"
        ? "Kies een afbeelding van maximaal 15 MB."
        : "Kies een JPG-, PNG- of WebP-afbeelding.");
      return;
    }
    setError(null);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || pending) {
      if (!file) setError("Kies eerst een afbeelding.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const upload = await uploadCommunityImageFile(file, kind, setProgress);
      const formData = new FormData();
      formData.set("return_to", returnTo);
      formData.set("media_kind", kind);
      formData.set("media_path", upload.path);
      await finalizeCommunityProfileMedia(formData);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Opslaan lukt nu niet. Probeer het opnieuw.");
      setPending(false);
    }
  }

  return (
    <details className={`community-profile-media-control ${avatar ? "is-avatar" : "is-cover"}`}>
      <summary aria-label={avatar ? "Profielfoto wijzigen" : undefined}>
        <Camera size={18} />{avatar ? null : " Omslagfoto wijzigen"}
      </summary>
      <form onSubmit={handleSubmit}>
        <label>
          <span className={avatar ? "sr-only" : undefined}>{avatar ? "Nieuwe profielfoto" : "Nieuwe omslagfoto"}</span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required
            disabled={pending}
            onChange={handleFileChange}
          />
        </label>
        {preview ? (
          <span className={`community-profile-media-preview${avatar ? " is-avatar" : ""}`}>
            <Image src={preview} alt="Voorvertoning van de gekozen afbeelding" fill unoptimized sizes={avatar ? "72px" : "240px"} />
          </span>
        ) : null}
        <small>JPG, PNG of WebP · maximaal {COMMUNITY_IMAGE_MAX_BYTES / (1024 * 1024)} MB</small>
        {progress !== null && pending ? <progress max={100} value={progress} aria-label={`Upload ${progress}%`} /> : null}
        {error ? <p className="community-profile-media-error" role="alert">{error}</p> : null}
        <button type="submit" disabled={pending}>{pending ? `Uploaden${progress !== null ? ` ${progress}%` : "..."}` : "Opslaan"}</button>
      </form>
    </details>
  );
}
