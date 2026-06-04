export const site = {
  name: "Stuk Verdriet",
  tagline: "Je staat er niet alleen voor.",
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

export const navigation = [
  { href: "/", label: "Home" },
  { href: "/podcast", label: "Podcast" },
  { href: "/community", label: "Community" },
  { href: "/over", label: "Over ons" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" }
];
