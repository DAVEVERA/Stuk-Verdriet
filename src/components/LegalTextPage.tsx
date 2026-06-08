import Link from "next/link";

type LegalTextPageProps = {
  title: string;
  text: string;
};

function renderParagraph(paragraph: string) {
  if (/^\d+\.\s/.test(paragraph)) {
    return <h2 key={paragraph}>{paragraph}</h2>;
  }

  if (/^Laatst bijgewerkt:/i.test(paragraph)) {
    return (
      <p className="legal-updated" key={paragraph}>
        {paragraph}
      </p>
    );
  }

  return <p key={paragraph}>{paragraph}</p>;
}

export function LegalTextPage({ title, text }: LegalTextPageProps) {
  const paragraphs = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .filter((paragraph, index) => !(index === 0 && paragraph.toLowerCase() === title.toLowerCase()));

  return (
    <section className="legal-page" aria-labelledby="legal-title">
      <div className="legal-page-header">
        <p className="eyebrow">Juridisch</p>
        <h1 id="legal-title">{title}</h1>
        <p>
          Deze pagina hoort bij Stuk Verdriet en beschrijft helder wat bezoekers, communityleden en betrokkenen mogen
          verwachten.
        </p>
      </div>
      <article className="legal-document">{paragraphs.map(renderParagraph)}</article>
      <div className="legal-actions">
        <Link className="button" href="/">
          Terug naar home
        </Link>
        <Link className="text-link" href="/contact">
          Contact opnemen
        </Link>
      </div>
    </section>
  );
}
