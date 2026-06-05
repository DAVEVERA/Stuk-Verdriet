import { redirect } from "next/navigation";
import { moderatePost, saveEpisode, saveFaq, saveHost, saveSeason, saveSiteSettings } from "@/lib/actions";
import { adminEmailList, createSupabaseAdminClient, createSupabaseServerClient, hasSupabaseEnv } from "@/lib/supabase";
import { PageIntro } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const server = await createSupabaseServerClient();
  const {
    data: { user }
  } = server ? await server.auth.getUser() : { data: { user: null } };
  const allowed = user?.email && adminEmailList().includes(user.email.toLowerCase());

  if (hasSupabaseEnv && !allowed) redirect("/login");

  const admin = createSupabaseAdminClient();
  const { data: pendingPosts } = admin
    ? await admin.from("community_posts").select("id,title,category,created_at,status").eq("status", "pending").order("created_at", { ascending: false })
    : { data: [] };
  const { data: reports } = admin
    ? await admin.from("community_reports").select("id,reason,created_at,post_id,resolved_at").is("resolved_at", null).order("created_at", { ascending: false })
    : { data: [] };

  return (
    <>
      <PageIntro eyebrow="Beheer" title="Admin dashboard">
        <p>Beheer content in de site en keur communityberichten handmatig goed. Supabase Studio blijft beschikbaar voor bulkbeheer.</p>
      </PageIntro>
      {!hasSupabaseEnv ? <p className="notice">Supabase env vars ontbreken. Het dashboard toont nu de beoogde beheerstructuur zonder live database-acties.</p> : null}
      <section className="admin-shell">
        <div className="admin-grid">
          <AdminPanel title="Site instellingen" items={["Logo vervangen", "Homepage placeholder", "Social media links", "Footerlinks"]} />
          <AdminPanel title="Podcast" items={["Seizoenen", "Afleveringen", "Audio uploads", "Spotify en Podimo links", "Featured latest"]} />
          <AdminPanel title="Community" items={["Berichten goedkeuren", "Reacties goedkeuren", "Meldingen beoordelen", "Archiveren of afwijzen"]} />
          <AdminPanel title="Content" items={["Hostprofielen", "FAQ's", "Sponsorlogo's", "Sfeerbeelden"]} />
        </div>

        <div className="admin-panel">
          <h2>Pending berichten</h2>
          {pendingPosts?.length ? (
            pendingPosts.map((post) => {
              const approve = moderatePost.bind(null, post.id, "approved");
              const reject = moderatePost.bind(null, post.id, "rejected");
              return (
                <div key={post.id} className="post-card">
                  <h3>{post.title}</h3>
                  <p>{post.category}</p>
                  <form className="subtle-actions" action={approve}>
                    <button className="button" type="submit">
                      Goedkeuren
                    </button>
                  </form>
                  <form className="subtle-actions" action={reject}>
                    <button className="text-link" type="submit">
                      Afwijzen
                    </button>
                  </form>
                </div>
              );
            })
          ) : (
            <p>Geen pending berichten.</p>
          )}
        </div>

        <div className="admin-panel">
          <h2>Meldingen</h2>
          {reports?.length ? reports.map((report) => <p key={report.id}>{report.reason}</p>) : <p>Geen open meldingen.</p>}
        </div>

        <div className="admin-grid wide">
          <AdminForm title="Site instellingen" action={saveSiteSettings}>
            <label>Logo URL<input name="logo_url" defaultValue="/brand/sverdriet_logo.webp" /></label>
            <label>Homepage intro<textarea name="homepage_intro" placeholder="Intro voor de homepage" /></label>
            <label>Instagram<input name="instagram_url" /></label>
            <label>Facebook<input name="facebook_url" /></label>
            <label>TikTok<input name="tiktok_url" /></label>
            <label>Spotify<input name="spotify_url" /></label>
            <label>Podimo<input name="podimo_url" /></label>
            <label>Apple Podcasts<input name="apple_podcast_url" /></label>
            <button className="button" type="submit">Opslaan</button>
          </AdminForm>

          <AdminForm title="Seizoen toevoegen" action={saveSeason}>
            <label>Titel<input name="title" required /></label>
            <label>Seizoensnummer<input name="season_number" type="number" min="1" required /></label>
            <label>Beschrijving<textarea name="description" /></label>
            <label>Cover image URL<input name="cover_image" /></label>
            <label>Status<StatusSelect /></label>
            <button className="button" type="submit">Seizoen opslaan</button>
          </AdminForm>

          <AdminForm title="Aflevering toevoegen" action={saveEpisode}>
            <label>Titel<input name="title" required /></label>
            <label>Slug<input name="slug" /></label>
            <label>Seizoen<input name="season_number" type="number" min="1" required /></label>
            <label>Aflevering<input name="episode_number" type="number" min="1" required /></label>
            <label>Korte intro<textarea name="short_intro" /></label>
            <label>Beschrijving<textarea name="description" /></label>
            <label>Audio URL<input name="audio_file_url" /></label>
            <label>Spotify URL<input name="spotify_url" /></label>
            <label>Podimo URL<input name="podimo_url" /></label>
            <label>Apple Podcasts URL<input name="apple_podcast_url" /></label>
            <label>Afbeelding URL<input name="image_url" /></label>
            <label>Publicatiedatum<input name="publication_date" type="datetime-local" /></label>
            <label>Volgende aflevering<input name="next_episode_date" type="date" /></label>
            <label>Duur<input name="duration" /></label>
            <label className="check-row"><input name="featured_latest" type="checkbox" /> Featured latest</label>
            <label>Status<StatusSelect /></label>
            <button className="button" type="submit">Aflevering opslaan</button>
          </AdminForm>

          <AdminForm title="Host toevoegen" action={saveHost}>
            <label>Naam<input name="name" required /></label>
            <label>Rol<input name="role" /></label>
            <label>Foto URL<input name="image_url" /></label>
            <label>Bio<textarea name="bio" /></label>
            <label>Persoonlijke motivatie<textarea name="personal_motivation" /></label>
            <label>Volgorde<input name="display_order" type="number" defaultValue="100" /></label>
            <label>Status<StatusSelect /></label>
            <button className="button" type="submit">Host opslaan</button>
          </AdminForm>

          <AdminForm title="FAQ toevoegen" action={saveFaq}>
            <label>Vraag<input name="question" required /></label>
            <label>Antwoord<textarea name="answer" required /></label>
            <label>Categorie<input name="category" /></label>
            <label>Volgorde<input name="display_order" type="number" defaultValue="100" /></label>
            <label>Status<StatusSelect /></label>
            <button className="button" type="submit">FAQ opslaan</button>
          </AdminForm>
        </div>
      </section>
    </>
  );
}

function AdminPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="admin-panel">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function AdminForm({ title, action, children }: { title: string; action: (formData: FormData) => Promise<void>; children: React.ReactNode }) {
  return (
    <article className="admin-panel">
      <h2>{title}</h2>
      <form className="form-grid" action={action}>
        {children}
      </form>
    </article>
  );
}

function StatusSelect() {
  return (
    <select name="status" defaultValue="draft">
      <option value="draft">draft</option>
      <option value="scheduled">scheduled</option>
      <option value="published">published</option>
      <option value="archived">archived</option>
    </select>
  );
}
