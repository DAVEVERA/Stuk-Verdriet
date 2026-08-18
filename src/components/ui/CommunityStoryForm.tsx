"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, MessageCircleQuestion, Settings2, Sparkles, X } from "lucide-react";
import { createCommunityPost } from "@/lib/actions";
import { COMMUNITY_IMAGE_MAX_BYTES, validateCommunityImageDescriptor } from "@/lib/community-media";
import { uploadCommunityImageFile } from "@/lib/community-media-upload-client";
import type { CommunityCategory } from "@/types/content";

function formatFileSize(size: number) {
  return size >= 1024 * 1024
    ? `${(size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(size / 1024))} kB`;
}

function CommunitySubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="community-feed-composer-submit" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Wordt geplaatst..." : "Plaats bericht"}
    </button>
  );
}

export function CommunityStoryForm({
  categories,
  isLoggedIn,
  displayName,
  returnTo = "/community"
}: {
  categories: CommunityCategory[];
  isLoggedIn: boolean;
  displayName?: string | null;
  returnTo?: "/community" | "/bijsluiter";
}) {
  const [postType, setPostType] = useState("story");
  const [imagePreview, setImagePreview] = useState<{ name: string; size: number; url: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;
  const initial = (displayName?.trim() || "Jij").slice(0, 1).toUpperCase();

  useEffect(() => {
    return () => {
      if (imagePreview?.url) URL.revokeObjectURL(imagePreview.url);
    };
  }, [imagePreview]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      setImagePreview(null);
      setImageError(null);
      return;
    }

    const validation = validateCommunityImageDescriptor(file);
    if (!validation.ok) {
      event.currentTarget.value = "";
      setImagePreview(null);
      setImageError(validation.error === "size"
        ? "Kies een afbeelding van maximaal 15 MB."
        : "Kies een JPG-, PNG- of WebP-afbeelding.");
      return;
    }

    setImageError(null);
    setUploadProgress(null);
    setImagePreview({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
  }

  function removeImage() {
    if (imageInputRef.current) imageInputRef.current.value = "";
    setImagePreview(null);
    setImageError(null);
    setUploadProgress(null);
  }

  async function submitPost(formData: FormData) {
    const image = formData.get("image_file");
    if (image instanceof File && image.size > 0) {
      try {
        const uploaded = await uploadCommunityImageFile(image, "feed-image", setUploadProgress);
        formData.set("image_path", uploaded.path);
      } catch (failure) {
        setImageError(failure instanceof Error ? failure.message : "De foto kon niet worden geüpload.");
        return;
      } finally {
        formData.delete("image_file");
      }
    }
    await createCommunityPost(formData);
  }

  if (!isLoggedIn) {
    return (
      <section className="community-feed-composer" aria-label="Nieuw bericht maken">
        <div className="community-feed-composer-row">
          <span className="community-feed-composer-avatar" aria-hidden>{initial}</span>
          <Link className="community-feed-composer-login" href={loginHref}>Wat wil je delen?</Link>
        </div>
        <div className="community-feed-composer-actions" aria-label="Mogelijkheden voor een nieuw bericht">
          <Link href={loginHref}><ImagePlus size={18} aria-hidden /> Foto</Link>
          <Link href={loginHref}><MessageCircleQuestion size={18} aria-hidden /> Vraag</Link>
          <Link href={`/login?next=${encodeURIComponent('/community/profiel?tab=pulse')}`}><Sparkles size={18} aria-hidden /> Moment</Link>
        </div>
      </section>
    );
  }

  return (
    <form className="community-feed-composer" action={submitPost}>
      <input type="hidden" name="return_to" value={returnTo} readOnly />
      <input type="hidden" name="post_type" value={postType} readOnly />
      <div className="community-feed-composer-row">
        <span className="community-feed-composer-avatar" aria-hidden>{initial}</span>
        <label className="community-feed-composer-message">
          <span className="sr-only">Wat wil je delen?</span>
          <textarea name="body" required maxLength={5000} rows={3} placeholder="Wat wil je delen?" />
        </label>
      </div>

      <div className="community-feed-composer-actions" aria-label="Soort bericht">
        <label className={`community-feed-composer-file${imagePreview ? " selected" : ""}`}>
          <ImagePlus size={18} aria-hidden /> {imagePreview ? "Foto gekozen" : "Foto"}
          <input
            ref={imageInputRef}
            name="image_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-describedby={imageError ? "community-feed-image-error" : undefined}
            onChange={handleImageChange}
          />
        </label>
        <button type="button" className={postType === "question" ? "active" : ""} onClick={() => setPostType(postType === "question" ? "story" : "question")} aria-pressed={postType === "question"}>
          <MessageCircleQuestion size={18} aria-hidden /> Vraag
        </button>
        <Link href="/community/profiel?tab=pulse"><Sparkles size={18} aria-hidden /> Moment</Link>
      </div>

      {imagePreview ? (
        <figure className="community-feed-composer-preview" aria-live="polite">
          <span className="community-feed-composer-preview-image">
            <Image src={imagePreview.url} alt={`Voorvertoning van ${imagePreview.name}`} fill sizes="88px" unoptimized />
          </span>
          <figcaption>
            <strong>Foto toegevoegd</strong>
            <span title={imagePreview.name}>{imagePreview.name} · {formatFileSize(imagePreview.size)}</span>
          </figcaption>
          <button type="button" onClick={removeImage} aria-label={`Verwijder ${imagePreview.name}`}>
            <X size={19} aria-hidden />
          </button>
        </figure>
      ) : null}

      {imageError ? <p id="community-feed-image-error" className="community-feed-composer-image-error" role="alert">{imageError}</p> : null}
      {uploadProgress !== null ? <progress className="community-feed-composer-progress" max={100} value={uploadProgress} aria-label={`Upload ${uploadProgress}%`} /> : null}

      <details className="community-feed-composer-details">
        <summary><Settings2 size={17} aria-hidden /> Extra opties</summary>
        <div className="community-feed-composer-fields">
          <label>Titel <span>(optioneel)</span><input name="title" maxLength={140} placeholder="Wordt anders uit je bericht gehaald" /></label>
          <label>Categorie<select name="category" required defaultValue={categories[0]?.title ?? "Rouw algemeen"}>
            {categories.length ? categories.map((category) => <option key={category.id}>{category.title}</option>) : <option>Rouw algemeen</option>}
          </select></label>
          <label>Zichtbare naam<select name="author_display_type" defaultValue="first_name"><option value="first_name">Voornaam</option><option value="real_name">Volledige naam</option><option value="anonymous">Anoniem</option></select></label>
          <label>Type<select value={postType} onChange={(event) => setPostType(event.target.value)}><option value="story">Verhaal</option><option value="question">Vraag</option><option value="tip">Tip of handvat</option><option value="link">Handige link</option></select></label>
          <label>Handige link <span>(optioneel)</span><input name="resource_url" type="url" placeholder="https://..." /></label>
          <label>Linktekst <span>(optioneel)</span><input name="resource_label" placeholder="Naam van de bron" /></label>
          <label className="community-feed-composer-wide">Tags <span>(optioneel)</span><input name="tags" placeholder="rouw, herkenning, praktische hulp" /></label>
        </div>
      </details>

      <div className="community-feed-composer-footer">
        <small>Foto&apos;s mogen maximaal {COMMUNITY_IMAGE_MAX_BYTES / (1024 * 1024)} MB zijn. Berichten worden kort gecontroleerd volgens de <Link href="/communityrichtlijnen">communityrichtlijnen</Link>.</small>
        <CommunitySubmitButton />
      </div>
    </form>
  );
}
