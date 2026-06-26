# README

The gate is open.

The key was never hidden.

Some will look at the code.
Others will watch the fences.

Most won't notice the man behind the keyboard.

---

[START: INIT.SCANNER](https://mnrv.nl/assets/Nedry-The-King-Jurassic-Park.mp4)

---

Everything is exactly where it shouldn't be.

Proceed carefully.

## Local Setup

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Optional alias supported by newer Supabase snippets:
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAILS=beheerder@example.nl
```

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Enable Google and Email login providers in Supabase Auth.
4. Add the same admin email address to `ADMIN_EMAILS`.
5. Run the schema again after updates; it creates/updates podcast metadata, episode signup storage, community image metadata, `link_cards`, and public Storage buckets `podcast-audio`, `podcast-images`, and `community-images`.
6. Use the `/admin` podcast configurator to upload audio/covers or paste external URLs for audio, episode images, host photos, sponsor logos, and atmosphere images.
