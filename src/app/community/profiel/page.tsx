import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut, updateCommunityProfile } from "@/lib/actions";
import { createSupabaseServerClient } from "@/lib/supabase";
import type { CommunityConversation, CommunityProfile } from "@/types/content";

export const dynamic = "force-dynamic";

type CommunityProfilePageProps = {
  searchParams?: Promise<{ error?: string; profile?: string }>;
};

const profileMessages: Record<string, string> = {
  avatar: "Kies een jpg, png of webp van maximaal 3 MB.",
  "profile-storage": "Opslaan lukt nu niet. Probeer het straks opnieuw.",
  "profile-name": "Vul een naam in van maximaal 80 tekens.",
  "community-avatars": "De profielfoto kon niet worden opgeslagen."
};

export default async function CommunityProfilePage({ searchParams }: CommunityProfilePageProps) {
  const params = (await searchParams) ?? {};
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?next=%2Fcommunity%2Fprofiel");

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=%2Fcommunity%2Fprofiel");

  const fallbackName = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "SNAAR gebruiker";
  let profile: CommunityProfile | null = null;
  let conversations: CommunityConversation[] = [];

  const [profileResult, conversationsResult] = await Promise.all([
    supabase.from("community_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase
      .from("community_conversations")
      .select("id,created_by,created_at,updated_at,community_conversation_participants(conversation_id,user_id,last_read_at,created_at,community_profiles(user_id,display_name,avatar_url,is_discoverable)),community_messages(id,conversation_id,sender_id,body,created_at)")
      .order("updated_at", { ascending: false })
      .order("created_at", { referencedTable: "community_messages", ascending: true })
      .limit(6, { referencedTable: "community_messages" })
      .limit(8)
  ]);

  if (!profileResult.error) profile = profileResult.data as CommunityProfile | null;
  if (!conversationsResult.error) conversations = (conversationsResult.data as unknown as CommunityConversation[] | null) ?? [];

  const displayName = profile?.display_name ?? fallbackName;
  const avatarUrl = profile?.avatar_url ?? null;
  const initials = displayName.slice(0, 1).toUpperCase();

  return (
    <main className="community-profile-page">
      <section className="community-profile-cover" aria-label="Mijn SNAAR profiel">
        <div className="community-profile-cover-art" />
        <div className="community-profile-identity">
          <div className="community-profile-photo" aria-hidden>
            {avatarUrl ? <Image src={avatarUrl} alt="" width={156} height={156} /> : <span>{initials}</span>}
          </div>
          <div>
            <p className="eyebrow">Mijn profiel</p>
            <h1>{displayName}</h1>
            <p>{profile?.is_discoverable ? "Vindbaar voor rustige priveberichten." : "Niet vindbaar voor priveberichten."}</p>
          </div>
          <div className="community-profile-actions">
            <Link className="button" href="/community">Terug naar SNAAR</Link>
            <form action={signOut}>
              <input type="hidden" name="next" value="/community" readOnly />
              <button className="text-link" type="submit">Uitloggen</button>
            </form>
          </div>
        </div>
      </section>

      <section className="community-profile-grid">
        <article className="community-profile-card">
          <h2>Profiel aanpassen</h2>
          <p>Kies zelf hoe zichtbaar je bent. Je mag ook alleen initialen blijven gebruiken.</p>
          {params.error ? <p className="notice">{profileMessages[params.error] ?? "Profiel opslaan lukte niet."}</p> : null}
          {params.profile === "saved" ? <p className="notice">Je profiel is opgeslagen.</p> : null}
          <form className="community-profile-form" action={updateCommunityProfile} encType="multipart/form-data">
            <input type="hidden" name="return_to" value="/community/profiel" readOnly />
            <label>
              Naam
              <input name="display_name" defaultValue={displayName} maxLength={80} required />
            </label>
            <label>
              Profielfoto
              <input name="avatar_file" type="file" accept="image/png,image/jpeg,image/webp" />
            </label>
            <label className="community-checkbox-row">
              <input name="is_discoverable" type="checkbox" defaultChecked={profile?.is_discoverable ?? false} />
              Vindbaar voor priveberichten
            </label>
            <button className="community-panel-button" type="submit">Profiel opslaan</button>
          </form>
        </article>

        <article className="community-profile-card">
          <h2>Berichten</h2>
          {conversations.length ? (
            <div className="community-profile-conversation-list">
              {conversations.map((conversation) => {
                const rawPeer = conversation.community_conversation_participants
                  ?.find((participant) => participant.user_id !== user.id)
                  ?.community_profiles;
                const peer = Array.isArray(rawPeer) ? rawPeer[0] ?? null : rawPeer;
                const latest = conversation.community_messages?.at(-1);
                return (
                  <div key={conversation.id}>
                    <strong>{peer?.display_name ?? "SNAAR gesprek"}</strong>
                    <p>{latest?.body ?? "Nog geen berichten"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Nog geen berichten. Als je met iemand in gesprek gaat, verschijnt dat hier.</p>
          )}
        </article>
      </section>
    </main>
  );
}
