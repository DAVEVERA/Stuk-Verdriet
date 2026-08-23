"use client";

import { useMemo, useState } from "react";
import { moderateCommunityPulse, moderateCommunityReply, moderatePost, setCommunityProfileVisibility } from "@/lib/actions";
import type { CommunityPost, CommunityProfile, CommunityPulseMoment, CommunityReply } from "@/types/content";
import styles from "./AdminCommunityManager.module.css";

type View = "inhoud" | "reacties" | "leden" | "pulse";

function statusLabel(status: string) {
  return ({ approved: "Gepubliceerd", pending: "Wacht op review", rejected: "Afgewezen", archived: "Verborgen", published: "Gepubliceerd", draft: "Concept" } as Record<string, string>)[status] ?? status;
}

export function AdminCommunityManager({ posts, replies, profiles, moments, sourceError }: { posts: CommunityPost[]; replies: CommunityReply[]; profiles: CommunityProfile[]; moments: CommunityPulseMoment[]; sourceError?: string | null }) {
  const [view, setView] = useState<View>("inhoud");
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const filteredPosts = useMemo(() => posts.filter((item) => `${item.title} ${item.body} ${item.category} ${item.author_name ?? ""}`.toLowerCase().includes(needle)), [posts, needle]);
  const filteredReplies = useMemo(() => replies.filter((item) => `${item.body} ${item.author_name ?? ""}`.toLowerCase().includes(needle)), [replies, needle]);
  const filteredProfiles = useMemo(() => profiles.filter((item) => `${item.display_name} ${item.bio ?? ""}`.toLowerCase().includes(needle)), [profiles, needle]);
  const filteredMoments = useMemo(() => moments.filter((item) => `${item.title} ${item.body ?? ""}`.toLowerCase().includes(needle)), [moments, needle]);

  return <section className={styles.manager}>
    <div className={styles.hero}>
      <div><h2>Community beheren</h2><p>Bekijk ook gepubliceerde inhoud, vind leden terug en grijp in zonder afhankelijk te zijn van een melding.</p></div>
      <div className={styles.counts}><span>{posts.length} berichten</span><span>{replies.length} reacties</span><span>{profiles.length} leden</span><span>{moments.length} momenten</span></div>
    </div>
    <div className={styles.toolbar} role="tablist" aria-label="Communityonderdelen">
      {([['inhoud','Berichten'],['reacties','Reacties'],['leden','Leden'],['pulse','Aan de pols']] as Array<[View,string]>).map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)}>{label}</button>)}
    </div>
    {sourceError ? <p className={styles.empty} role="alert">Communitygegevens konden niet volledig worden geladen. Ververs de bronnen of controleer de databasekoppeling. Technische melding: {sourceError}</p> : null}
    <div className={styles.panel}>
      <div className={styles.panelHeader}><div><h3>{view === 'inhoud' ? 'Alle recente berichten' : view === 'reacties' ? 'Alle recente reacties' : view === 'leden' ? 'Communityleden' : 'Aan de pols-momenten'}</h3><p>De nieuwste vijftig items staan hier, inclusief hun actuele status.</p></div><input className={styles.search} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoeken…" aria-label="Zoek in communitybeheer" /></div>
      <div className={styles.list}>
        {view === 'inhoud' ? filteredPosts.map((post) => <article className={styles.item} key={post.id}><div><span className={styles.status}>{statusLabel(post.status)}</span><h4>{post.title}</h4><p>{post.body}</p><div className={styles.meta}><span>{post.author_name || 'Anoniem'}</span><span>{post.category}</span><time>{new Date(post.created_at).toLocaleDateString('nl-NL')}</time></div></div><div className={styles.actions}>{post.status !== 'approved' ? <form action={moderatePost.bind(null, post.id, 'approved')}><button type="submit">Publiceren</button></form> : null}<form action={moderatePost.bind(null, post.id, 'archived')}><button className={styles.danger} type="submit">Verbergen</button></form></div></article>) : null}
        {view === 'reacties' ? filteredReplies.map((reply) => <article className={styles.item} key={reply.id}><div><span className={styles.status}>{statusLabel(reply.status)}</span><h4>Reactie van {reply.author_name || 'Anoniem'}</h4><p>{reply.body}</p><div className={styles.meta}><time>{new Date(reply.created_at).toLocaleDateString('nl-NL')}</time><span>Bericht {reply.post_id.slice(0,8)}</span></div></div><div className={styles.actions}>{reply.status !== 'approved' ? <form action={moderateCommunityReply.bind(null, reply.id, 'approved')}><button type="submit">Publiceren</button></form> : null}<form action={moderateCommunityReply.bind(null, reply.id, 'archived')}><button className={styles.danger} type="submit">Verbergen</button></form></div></article>) : null}
        {view === 'leden' ? filteredProfiles.map((profile) => <article className={styles.item} key={profile.user_id}><div><span className={styles.status}>{profile.is_discoverable ? 'Vindbaar' : 'Niet vindbaar'}</span><h4>{profile.display_name}</h4><p>{profile.bio || 'Geen openbare biografie ingevuld.'}</p><div className={styles.meta}><span>Lid sinds {profile.created_at ? new Date(profile.created_at).toLocaleDateString('nl-NL') : 'onbekend'}</span></div></div><div className={styles.actions}><form action={setCommunityProfileVisibility.bind(null, profile.user_id, !profile.is_discoverable)}><button className={styles.secondary} type="submit">{profile.is_discoverable ? 'Niet vindbaar maken' : 'Vindbaar maken'}</button></form></div></article>) : null}
        {view === 'pulse' ? filteredMoments.map((moment) => <article className={styles.item} key={moment.id}><div><span className={styles.status}>{statusLabel(moment.status)} · {moment.visibility === 'community' ? 'Community' : moment.visibility === 'connections' ? 'Connecties' : 'Privé'}</span><h4>{moment.title}</h4><p>{moment.body || 'Moment zonder begeleidende tekst.'}</p><div className={styles.meta}><time>{new Date(moment.created_at).toLocaleDateString('nl-NL')}</time><span>{moment.animation}</span></div></div><div className={styles.actions}>{moment.status !== 'published' ? <form action={moderateCommunityPulse.bind(null, moment.id, 'published')}><button type="submit">Publiceren</button></form> : null}<form action={moderateCommunityPulse.bind(null, moment.id, 'archived')}><button className={styles.danger} type="submit">Archiveren</button></form></div></article>) : null}
        {((view === 'inhoud' && !filteredPosts.length) || (view === 'reacties' && !filteredReplies.length) || (view === 'leden' && !filteredProfiles.length) || (view === 'pulse' && !filteredMoments.length)) ? <p className={styles.empty}>Geen resultaten gevonden.</p> : null}
      </div>
    </div>
  </section>;
}
