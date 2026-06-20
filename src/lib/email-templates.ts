import { site } from "@/lib/site";

export type CommunityEmailTemplate =
  | "community_post_submitted"
  | "community_reply_submitted"
  | "community_post_reply_received"
  | "community_post_support_received";

type CommunityEmailInput = {
  actionUrl?: string;
  actorName?: string | null;
  postTitle?: string | null;
  recipientName?: string | null;
  siteUrl?: string;
};

type RenderedEmail = {
  html: string;
  preheader: string;
  subject: string;
  text: string;
};

const templateCopy: Record<
  CommunityEmailTemplate,
  {
    cta: string;
    intro: (input: CommunityEmailInput) => string;
    preheader: string;
    subject: (input: CommunityEmailInput) => string;
    title: string;
  }
> = {
  community_post_submitted: {
    cta: "Bekijk de community",
    intro: ({ postTitle }) =>
      `Je bijdrage${postTitle ? ` "${postTitle}"` : ""} is ontvangen. We lezen nieuwe berichten eerst zorgvuldig door voordat ze zichtbaar worden in de community.`,
    preheader: "Je bijdrage is ontvangen en staat klaar voor moderatie.",
    subject: () => "Je bijdrage is ontvangen",
    title: "Dank je wel voor je verhaal"
  },
  community_reply_submitted: {
    cta: "Terug naar het gesprek",
    intro: ({ postTitle }) =>
      `Je reactie${postTitle ? ` op "${postTitle}"` : ""} is ontvangen. Ook reacties gaan eerst langs moderatie, zodat Stuk Verdriet een veilige plek blijft.`,
    preheader: "Je reactie is ontvangen en wordt eerst gelezen.",
    subject: () => "Je reactie is ontvangen",
    title: "Je reactie staat klaar"
  },
  community_post_reply_received: {
    cta: "Lees de reactie",
    intro: ({ actorName, postTitle }) =>
      `${actorName ?? "Iemand uit de community"} heeft gereageerd op je bericht${postTitle ? ` "${postTitle}"` : ""}. De reactie wordt zichtbaar zodra deze is goedgekeurd.`,
    preheader: "Er is gereageerd op je bericht in de community.",
    subject: ({ postTitle }) => (postTitle ? `Nieuwe reactie op "${postTitle}"` : "Nieuwe reactie op je bericht"),
    title: "Er is een reactie geplaatst"
  },
  community_post_support_received: {
    cta: "Bekijk je bericht",
    intro: ({ actorName, postTitle }) =>
      `${actorName ?? "Iemand uit de community"} heeft steun gegeven aan je bericht${postTitle ? ` "${postTitle}"` : ""}. Soms zegt een klein gebaar precies genoeg.`,
    preheader: "Iemand gaf steun aan je bericht.",
    subject: ({ postTitle }) => (postTitle ? `Steun voor "${postTitle}"` : "Iemand gaf steun aan je bericht"),
    title: "Je bericht kreeg steun"
  }
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function absoluteUrl(path: string, siteUrl: string) {
  return path.startsWith("http") ? path : `${siteUrl.replace(/\/$/, "")}${path}`;
}

export function renderCommunityEmail(template: CommunityEmailTemplate, input: CommunityEmailInput = {}): RenderedEmail {
  const copy = templateCopy[template];
  const siteUrl = input.siteUrl ?? site.url;
  const actionUrl = absoluteUrl(input.actionUrl ?? "/community", siteUrl);
  const logoUrl = absoluteUrl(site.logo, siteUrl);
  const greeting = input.recipientName ? `Hoi ${input.recipientName},` : "Hoi,";
  const intro = copy.intro(input);
  const subject = copy.subject(input);

  const html = `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#f2efe9;color:#2b312b;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(copy.preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f2efe9;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#fffdf8;border:1px solid rgba(66,86,69,.18);">
            <tr>
              <td style="background:#425645;padding:26px 28px;">
                <img src="${escapeHtml(logoUrl)}" width="72" height="72" alt="Stuk Verdriet" style="display:block;border:0;object-fit:contain;">
              </td>
            </tr>
            <tr>
              <td style="padding:34px 28px 10px;">
                <p style="margin:0 0 12px;color:#6f4f3a;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">Stuk Verdriet community</p>
                <h1 style="margin:0;color:#425645;font-size:34px;line-height:1.05;font-weight:800;">${escapeHtml(copy.title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 0;">
                <p style="margin:0 0 16px;font-size:17px;line-height:1.7;">${escapeHtml(greeting)}</p>
                <p style="margin:0;color:#425645;font-size:17px;line-height:1.7;">${escapeHtml(intro)}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <a href="${escapeHtml(actionUrl)}" style="display:inline-block;background:#425645;color:#fffdf8;font-size:15px;font-weight:800;padding:14px 20px;text-decoration:none;">${escapeHtml(copy.cta)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 34px;">
                <p style="margin:0;color:#6b7a6a;font-size:14px;line-height:1.6;">Je ontvangt deze mail omdat je een account of bijdrage hebt bij Stuk Verdriet. Reageer alleen als dat goed voelt.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = `${copy.title}

${greeting}

${intro}

${copy.cta}: ${actionUrl}

Stuk Verdriet - ${site.tagline}`;

  return { html, preheader: copy.preheader, subject, text };
}
