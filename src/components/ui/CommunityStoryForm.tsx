"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";
import { createCommunityPost } from "@/lib/actions";
import type { CommunityCategory } from "@/types/content";

function CommunitySubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? "Wordt verstuurd..." : "Verstuur ter goedkeuring"}
    </button>
  );
}

export function CommunityStoryForm({
  categories,
  isLoggedIn,
  returnTo = "/community"
}: {
  categories: CommunityCategory[];
  isLoggedIn: boolean;
  returnTo?: "/community" | "/bijsluiter";
}) {
  if (!isLoggedIn) {
    return (
      <div className="story-form login-required-panel">
        <p>
          Stuk Verdriet is een plek voor verhalen en vragen over rouw, verlies, ziekte, gemis en verder leven. Lees voor
          je meedoet de <Link href="/communityrichtlijnen">communityrichtlijnen</Link>.
        </p>
        <Link className="button" href={`/login?next=${encodeURIComponent(returnTo)}`}>
          Log in om te posten
        </Link>
      </div>
    );
  }

  return (
    <form className="form-grid story-form" action={createCommunityPost} encType="multipart/form-data">
      <input type="hidden" name="return_to" value={returnTo} readOnly />
      <label>
        Wat wil je delen?
        <select name="post_type" defaultValue="story">
          <option value="story">Mijn verhaal</option>
          <option value="question">Een vraag</option>
          <option value="tip">Tip of handvat</option>
          <option value="link">Handige link</option>
        </select>
      </label>
      <label>
        Titel
        <input name="title" required />
      </label>
      <label>
        Categorie
        <select name="category" required>
          {categories.map((category) => (
            <option key={category.id}>{category.title}</option>
          ))}
        </select>
      </label>
      <label>
        Zichtbare naam
        <select name="author_display_type" defaultValue="first_name">
          <option value="first_name">Voornaam</option>
          <option value="real_name">Volledige naam</option>
          <option value="anonymous">Anoniem</option>
        </select>
      </label>
      <label>
        Voor wie is dit vooral?
        <select name="target_group" defaultValue="">
          <option value="">Iedereen</option>
          <option value="ouders">Ouders</option>
          <option value="ayas">AYA&apos;s en jonge mensen</option>
          <option value="naasten">Naasten en familie</option>
          <option value="vrienden">Vrienden en omgeving</option>
        </select>
      </label>
      <label>
        Handige link
        <input name="resource_url" type="url" placeholder="https://..." />
        <small>Optioneel. Deel bijvoorbeeld een hulporganisatie, artikel, boek of praktische bron.</small>
      </label>
      <label>
        Linktekst
        <input name="resource_label" placeholder="Bijvoorbeeld: Rouwzorg Nederland" />
      </label>
      <label>
        Tags
        <input name="tags" placeholder="rouw, praktische hulp, herkenning" />
        <small>Optioneel. Scheid tags met komma&apos;s.</small>
      </label>
      <label>
        Afbeelding
        <input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" />
        <small>Optioneel. Maximaal 4 MB. JPG, JPEG, PNG of WEBP.</small>
      </label>
      <label>
        Bericht
        <textarea name="body" required />
      </label>
      <CommunitySubmitButton />
    </form>
  );
}
