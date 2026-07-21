import Image from "next/image";
import { DanielaStoryPopout } from "@/components/DanielaStoryPopout";
import { FamilyStoryPopout } from "@/components/FamilyStoryPopout";
import { SusanStoryPopout } from "@/components/SusanStoryPopout";
import type { HostProfile } from "@/types/content";

const tychoSupportUrl = "https://radboudoncologiefonds.voorradboudfonds.nl/project/tycho";

export function HostCard({ host }: { host: HostProfile }) {
  const hostName = host.name.toLowerCase();
  const isSusan = hostName.includes("susan");
  const isDaniela = hostName.includes("daniela");
  const familyCard = isSusan
    ? {
        deck: "Eva, dochter van Susan, blijft aanwezig in haar verhaal, humor en manier van leven.",
        image: "/img/EVA_PORTRET.jpg",
        imageAlt: "Portret van Eva",
        name: "Eva",
        relation: "Dochter van Susan",
        storyKey: "eva" as const
      }
    : isDaniela
      ? {
          deck: "Tycho, zoon van Daniela, leeft voort in liefde, herinneringen en alles wat hij in beweging bracht.",
          image: "/img/TYCHO_PORTRET.jpg",
          imageAlt: "Portret van Tycho",
          name: "Tycho",
          relation: "Zoon van Daniela",
          storyKey: "tycho" as const
        }
      : null;
  const imageUrl = hostName.includes("susan")
    ? "/img/portretsuus.png"
    : hostName.includes("daniela")
      ? "/img/Portret_Daniela.jpeg"
      : host.image_url || null;

  return (
    <article className="host-card">
      {imageUrl ? <Image src={imageUrl} alt={host.name} width={720} height={540} /> : <div className="host-placeholder" aria-hidden />}
      <div>
        <p className="eyebrow">{host.role ?? "Team"}</p>
        <h3>{host.name}</h3>
        {host.bio ? <p>{host.bio}</p> : null}
        {host.personal_motivation ? <p>{host.personal_motivation}</p> : null}
        {isSusan ? <SusanStoryPopout /> : null}
        {isDaniela ? <DanielaStoryPopout /> : null}
      </div>
      {familyCard ? (
        <div className="host-family-card">
          <Image src={familyCard.image} alt={familyCard.imageAlt} width={360} height={360} />
          <div>
            <p className="eyebrow">{familyCard.relation}</p>
            <h3>{familyCard.name}</h3>
            <p>{familyCard.deck}</p>
            <div className="host-family-card-actions">
              <FamilyStoryPopout storyKey={familyCard.storyKey} />
              {familyCard.storyKey === "tycho" ? (
                <a className="button" href={tychoSupportUrl} target="_blank" rel="noopener noreferrer">
                  Steun Tycho&apos;s inzamelingsactie
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
