"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, MessageCircleQuestion, Settings2, Sparkles } from "lucide-react";
import { createCommunityPost } from "@/lib/actions";
import type { CommunityCategory } from "@/types/content";

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
  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;
  const initial = (displayName?.trim() || "Jij").slice(0, 1).toUpperCase();

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
    <form className="community-feed-composer" action={createCommunityPost}>
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
        <label className="community-feed-composer-file">
          <ImagePlus size={18} aria-hidden /> Foto
          <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" />
        </label>
        <button type="button" className={postType === "question" ? "active" : ""} onClick={() => setPostType(postType === "question" ? "story" : "question")} aria-pressed={postType === "question"}>
          <MessageCircleQuestion size={18} aria-hidden /> Vraag
        </button>
        <Link href="/community/profiel?tab=pulse"><Sparkles size={18} aria-hidden /> Moment</Link>
      </div>

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
        <small>Berichten worden kort gecontroleerd volgens de <Link href="/communityrichtlijnen">communityrichtlijnen</Link>.</small>
        <CommunitySubmitButton />
      </div>
    </form>
  );
}
