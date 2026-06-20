type SocialFollowTriggerProps = {
  platform: "Instagram" | "TikTok";
  href: string;
};

export function SocialFollowTrigger({ platform, href }: SocialFollowTriggerProps) {
  return (
    <a
      className="social-follow-trigger"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Volg Stuk Verdriet op ${platform}`}
    >
      Quick follow
    </a>
  );
}
