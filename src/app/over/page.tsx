import { HostCard, PageIntro } from "@/components/ui";
import { getPublishedHosts } from "@/lib/content";

export default async function OverPage() {
  const hosts = await getPublishedHosts();
  return (
    <>
      <PageIntro eyebrow="Over" title="De mensen achter Stuk Verdriet">
        <p>Hostprofielen worden beheerbaar opgebouwd. Ontbrekende foto&apos;s en teksten worden niet als definitieve frontendcontent verzonnen.</p>
      </PageIntro>
      <section className="content-band">
        <div className="host-grid">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </section>
    </>
  );
}
