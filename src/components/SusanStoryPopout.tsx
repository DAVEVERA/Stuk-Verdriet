"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

const susanStory = [
  {
    type: "intro",
    text: "Susan Mathijssen verloor op 30 november 2024 haar 26-jarige dochter Eva Hermans-Kroot, die bekend werd door het programma Over Mijn Lijk en haar Instagramaccount Longeneeslijk. \"Er zijn overal handboeken voor, maar niet voor als je kind doodgaat,\" vertelt ze. Hoe ging zij om met dit grote verdriet en het gemis? Susan is ook moeder van dochter Anne (29) en zoon Gijs (25)."
  },
  {
    type: "quote",
    text: "Eva maakte zich zorgen. Hoe het verder moest met mij als zij er niet meer zou zijn."
  },
  {
    type: "visual",
    image: "/story-visuals/susan-memory-room.png",
    imageAlt: "Een rustige woonkamer met herinneringsbrieven, thee en zacht daglicht"
  },
  {
    text: "Ze had gezien hoe ik in 2018 na het plotselinge overlijden van Mart, de vriend van mijn dochter Anne, mezelf compleet voorbijliep in zorgen en rouwen. Dat wilde Eva voorkomen. Ze wilde me in bescherming nemen. Eva heeft me daarom ook een tijdje niet altijd alles verteld. Ze wilde niet dat ik me druk zou maken. En ik sprak mijn angsten en mijn verdriet ook niet altijd uit naar haar, want daar wilde ik haar weer niet mee belasten."
  },
  {
    text: "Het was een lastige weg om te zoeken naar de balans. Daar hebben we het samen veel over gehad. Ze wilde dat ik goed voor mezelf zou zorgen. Maar hoe zorg je goed voor jezelf als je verdriet zo groot is? Om haar gerust te stellen ben ik al een half jaar voor haar overlijden naar een psycholoog gegaan. Zelf was ik ook wel bang om na Eva's dood weer terug te vallen."
  },
  {
    text: "Als je kind doodgaat, word je echt bijna letterlijk gek. Je hebt hulp nodig, niet alleen voor jezelf, maar ook om te leren hoe je er het beste kunt zijn voor je kind. En ik had de behoefte om van iemand te horen of dat wat ik voelde normaal was. Op een gegeven moment zat ik het liefst de hele dag naast Eva op de bank. Wilde ik alleen nog maar dicht bij haar zijn."
  },
  {
    heading: "Herinneringen maken"
  },
  {
    text: "Eva was al het huis uit toen ze ziek werd. Ze had haar leven met Matthijs en dan kom je als moeder toch op het tweede plan. Het is een dubbel gevoel. Dat is loslaten, wat ook moet, maar het is niet altijd makkelijk. Zeker niet als je kind zo ziek is. We konden gelukkig over alles praten. Eva zei vaak: 'Als je mee wilt naar het ziekenhuis, mam, dan kan dat altijd, hè!' Dus ben ik ook vaak mee geweest als ze weer een chemo kreeg of een belangrijke gesprek had."
  },
  {
    text: "Dat vond ik fijn. Ik was geregeld bij haar thuis, om een lunch te maken, voor haar te zorgen en om Matthijs te ontlasten. Ik wilde dat Matthijs ook dingen voor zichzelf kon doen. Ik ben dankbaar dat Eva hem had. In maart kreeg ze de diagnose ongeneeslijke longkanker en in mei heeft hij haar ten huwelijk gevraagd. Hoe bijzonder is dat? Zijn liefde heeft haar echt geholpen die vier jaar door te komen."
  },
  {
    text: "Hun huwelijk was een groot feest om de liefde en het leven te vieren. Door haar ziekte is Eva een ander kind geworden. In haar jeugd was ze best somber, ze zag vaak beren op de weg. Ze was dyslectisch en op haar zestiende kwamen we erachter dat ze ADHD had. Eva was een planner, maakte voor alles lijstjes. Zelfs als ze met Matthijs naar de Efteling ging, had ze van moment tot moment gepland in welke attractie ze gingen. En ze was vaak bezorgd."
  },
  {
    text: "Ik hield mijn hart dan ook vast toen ze ziek werd. Als straks het kwartje valt dat ze echt nooit meer beter zal worden, ja, wat gaat ze dan doen? Ze was pas 22 en moest grote keuzes maken: wil je ivf, wil je je eicellen invriezen? En hoelang had ze nog te leven?"
  },
  {
    text: "Eva heeft haar ziekte echt fantastisch opgepakt. Maakte ze zich vroeger druk om wat anderen van haar vonden, nu kreeg ze daar meer lak aan. Ze durfde meer. Ze wilde léven. Dat heeft ze ook echt gedaan. Ik zag hoe ze kon genieten van kleine dingen, van herinneringen maken. Haar positiviteit en relativeringsvermogen maakten het voor ons, haar familie, ook makkelijker."
  },
  {
    text: "Eva's ziekte en het verdriet daarover waren eerst alleen van ons, een intiem clubje. Maar toen Eva haar Instagrampagina begon en mee ging doen met Over Mijn Lijk, werd haar ziekte ineens van iedereen. Van mij hoefde dat hele mediacircus eigenlijk niet. Ze was mijn kind. Het was ons verhaal, ons verdriet."
  },
  {
    text: "Eva kreeg alleen maar positieve reacties en lieve berichten en ik vond het superfijn voor haar dat iedereen zo meeleefde. Maar ik had er moeite mee. Over dat gevoel heb ik toen gesproken met een mediapsycholoog van BNNVARA. Die liet me inzien dat er ook een positieve kant aan haar bekendheid zat. Als er een nieuwe ontwikkeling was in Eva's ziekte, hoefde ik niemand te informeren, omdat Eva nu eenmaal alles deelde met haar volgers."
  },
  {
    text: "Al liet ze niet altijd zien hoe slecht het echt met haar ging. Wij wisten wel beter. En soms deelde ze iets eerder met de buitenwereld dan met ons. Daar heb ik haar wel op aangesproken. Dan zei ik: 'Joh, Eva, dat kun je niet maken.' En dat zag ze dan ook wel in, hoor. Maar ik weet hoe ze is: eerst doen dan denken."
  },
  {
    heading: "Kort lontje"
  },
  {
    text: "De afgelopen vier jaar hebben we als familie, en zeker Matthijs, allemaal een marathon gelopen. Ik zeg vaak: 'Niet alleen Eva had kanker, wij hadden allemaal kanker.' We stonden in de wachtstand en leefden van scan naar scan, van uitslag naar uitslag. Soms was het een tijdje rustig, dan konden we even ademhalen. Constant was ik op mijn hoede. Als Eva belde, schrok ik. Wat zou er zijn?"
  },
  {
    text: "Het is heel gek: er zijn overal handboeken voor, voor ADHD en voor burn-out, maar niet voor als je kind doodgaat. Dat moet je helemaal zelf uitzoeken. Je gaat allerlei fases door. Eerst is er het ongeloof en er niet aan willen, daarna word je boos en opstandig. Ik was boos op oudere mensen: waarom leefden zij nog wel? En ook boos op mezelf: waarom zij en niet ik? Mijn lontje was kort. Dan volgt er verdriet en op een gegeven moment komt er ook berusting. Die gevoelens wisselen elkaar af."
  }
];

export function SusanStoryPopout() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button className="host-story-trigger" type="button" onClick={() => setIsOpen(true)}>
        Susans verhaal
      </button>
      {isOpen ? createPortal(
        <div className="story-popout-layer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button className="story-popout-backdrop" type="button" aria-label="Sluit verhaal" onClick={() => setIsOpen(false)} />
          <article className="story-popout-panel">
            <header className="story-popout-header">
              <div>
                <p className="story-popout-kicker">Over de podcast maker</p>
                <h2 id={titleId}>Susan Mathijssen</h2>
                <p className="story-popout-deck">Over Eva, moederliefde, rouw en zoeken naar houvast wanneer niets nog vanzelfsprekend voelt.</p>
              </div>
              <button className="story-popout-close" type="button" aria-label="Sluit verhaal" onClick={() => setIsOpen(false)}>
                <X size={20} aria-hidden />
              </button>
            </header>
            <div className="story-popout-body">
              {susanStory.map((block, index) => {
                if ("heading" in block) {
                  return (
                    <h3 className="story-popout-section-title" key={`${block.heading}-${index}`}>
                      {block.heading}
                    </h3>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <blockquote className="story-popout-quote" key={`${block.text}-${index}`}>
                      {block.text}
                    </blockquote>
                  );
                }

                if (block.type === "visual" && block.image && block.imageAlt) {
                  return (
                    <figure className="story-popout-visual" key={`${block.image}-${index}`}>
                      <Image src={block.image} alt={block.imageAlt} width={1280} height={720} sizes="(max-width: 760px) calc(100vw - 48px), 720px" />
                    </figure>
                  );
                }

                return (
                  <p className={block.type === "intro" ? "story-popout-intro" : undefined} key={`${block.text}-${index}`}>
                    {block.text}
                  </p>
                );
              })}
            </div>
          </article>
        </div>,
        document.body
      ) : null}
    </>
  );
}
