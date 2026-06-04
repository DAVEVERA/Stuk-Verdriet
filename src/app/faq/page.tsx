import { PageIntro } from "@/components/ui";
import { getPublishedFaqs } from "@/lib/content";

export default async function FaqPage() {
  const faqs = await getPublishedFaqs();
  return (
    <>
      <PageIntro eyebrow="FAQ" title="Veelgestelde vragen">
        {!faqs.length ? <p>FAQ&apos;s worden later gevuld en verschijnen alleen wanneer ze gepubliceerd zijn.</p> : null}
      </PageIntro>
      {faqs.length ? (
        <section className="content-band">
          {faqs.map((faq) => (
            <details key={faq.id} className="post-card">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </section>
      ) : null}
    </>
  );
}
