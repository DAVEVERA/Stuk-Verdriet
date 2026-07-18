import Image from "next/image";
import Link from "next/link";
import { Bookmark, Heart, Plus } from "lucide-react";
import { reactToCommunityPulseMoment, saveCommunityPulseMomentBookmark } from "@/lib/actions";
import type { CommunityProfile, CommunityPulseMoment } from "@/types/content";

type CommunityPulseStripProps = {
  moments: CommunityPulseMoment[];
  isLoggedIn: boolean;
  returnTo: string;
};

function pulseProfile(moment: CommunityPulseMoment) {
  const profile = Array.isArray(moment.community_profiles) ? moment.community_profiles[0] : moment.community_profiles;
  return profile as CommunityProfile | null | undefined;
}

export function CommunityPulseStrip({ moments, isLoggedIn, returnTo }: CommunityPulseStripProps) {
  return (
    <section className="community-pulse-strip" aria-labelledby="community-pulse-title">
      <div className="community-pulse-heading">
        <div>
          <p className="eyebrow">Aan de Pols</p>
          <h2 id="community-pulse-title">Even stilstaan bij wat er vanbinnen speelt.</h2>
        </div>
        <Link href={isLoggedIn ? "/community/profiel?tab=pulse" : "/login?next=%2Fcommunity%2Fprofiel"}>Deel een moment</Link>
      </div>
      <div className="community-pulse-rail" role="list" aria-label="Aan de Pols momenten">
        <Link className="community-pulse-create-card" href={isLoggedIn ? "/community/profiel?tab=pulse" : "/login?next=%2Fcommunity%2Fprofiel"} role="listitem">
          <span className="community-pulse-create-image">
            <Plus size={26} />
          </span>
          <strong>Moment maken</strong>
        </Link>
        {moments.map((moment) => {
          const profile = pulseProfile(moment);
          return (
            <article className={`community-pulse-card animation-${moment.animation}`} key={moment.id} role="listitem" style={{ backgroundColor: moment.background_color }}>
              {moment.image_url ? <Image src={moment.image_url} alt="" fill sizes="120px" /> : null}
              <span className="community-pulse-avatar">
                {profile?.avatar_url ? <Image src={profile.avatar_url} alt="" fill sizes="42px" /> : <span>{(profile?.display_name ?? "S").slice(0, 1).toUpperCase()}</span>}
              </span>
              <div className="community-pulse-card-copy">
                <strong>{moment.title}</strong>
                <span>{profile?.display_name ?? "SNAAR"}</span>
              </div>
              {isLoggedIn ? (
                <div className="community-pulse-card-actions">
                  <form action={reactToCommunityPulseMoment}>
                    <input type="hidden" name="return_to" value={returnTo} readOnly />
                    <input type="hidden" name="moment_id" value={moment.id} readOnly />
                    <button type="submit"><Heart size={14} /> Dit raakte mij</button>
                  </form>
                  <form action={saveCommunityPulseMomentBookmark}>
                    <input type="hidden" name="return_to" value={returnTo} readOnly />
                    <input type="hidden" name="moment_id" value={moment.id} readOnly />
                    <button type="submit"><Bookmark size={14} /> Bewaar dit moment</button>
                  </form>
                </div>
              ) : null}
            </article>
          );
        })}
        {!moments.length ? (
          <div className="community-pulse-empty" role="listitem">
            <strong>Hier zijn nog geen momenten gedeeld</strong>
            <span>De eerste Aan de Pols momenten verschijnen hier.</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
