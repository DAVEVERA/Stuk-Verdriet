export const site = {
  name: "Stuk Verdriet",
  tagline: "Verdriet verdient een stem.",
  email: "info@stukverdriet.nl",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  logo: "/brand/sverdriet_logo.webp",
  colors: {
    pine: "#425645",
    sage: "#8A9D8B",
    sand: "#E7DCC8",
    white: "#F2EFE9",
    brown: "#6F4F3A",
    taupe: "#A8A193",
    eucalyptus: "#6B7A6A",
    ink: "#2B312B"
  }
};

export type OnepagerPanel = "podcast" | "themas" | "community" | "over" | "contact" | "privacy" | "cookies" | "communityrichtlijnen" | "archief";

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast", panel: "podcast" },
  { href: "/themas", label: "Thema's", panel: "themas" },
  { href: "/community", label: "Community", panel: "community" },
  { href: "/over", label: "Over ons", panel: "over" },
  { href: "/contact", label: "Contact", panel: "contact" }
];
