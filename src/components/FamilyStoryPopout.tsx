"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

type StoryBlock = {
  type?: "intro" | "quote" | "note";
  heading?: string;
  text?: string;
};

type FamilyStory = {
  buttonLabel: string;
  deck: string;
  kicker: string;
  title: string;
  blocks: StoryBlock[];
};

const familyStories = {
  eva: {
    buttonLabel: "Lees Eva's verhaal",
    deck: "Over echtheid, liefde, humor en leven terwijl later ineens onder druk komt te staan.",
    kicker: "Over Eva",
    title: "Eva Hermans-Kroot",
    blocks: [
      {
        type: "intro",
        text: "Er zijn mensen die je niet persoonlijk hoeft te kennen om ze toch nooit meer helemaal kwijt te raken. Mensen die door een scherm heen breken, niet met grootse woorden of ingestudeerde moed, maar met iets veel zeldzamers: echtheid. Eva Hermans-Kroot was zo iemand."
      },
      {
        type: "quote",
        text: "Ze was geen symbool omdat ze ziek was. Ze werd een symbool omdat ze, midden in die ziekte, zo ongelooflijk levend bleef."
      },
      {
        text: "Eva had alles in zich van iemand die nog moest beginnen. Jong, scherp, grappig, verliefd, vol plannen. Een vrouw aan het begin van haar volwassen leven. Een leven waarin je normaal gesproken nog denkt dat later vanzelf komt. Later trouwen. Later reizen. Later rust nemen. Later zeggen wat je voelt. Later doen wat echt belangrijk is."
      },
      {
        text: "Maar bij Eva kwam dat later ineens onder druk te staan."
      },
      {
        text: "Op haar 22ste kreeg ze de diagnose ongeneeslijke longkanker. Niet na een lang leven vol afgeronde hoofdstukken, maar midden in het eerste echte hoofdstuk. Alsof iemand de bladzijde omsloeg voordat zij klaar was met schrijven. En toch werd haar verhaal niet alleen een verhaal over verlies. Het werd een verhaal over aandacht. Over liefde. Over humor als overlevingsmechanisme. Over hoe je, zelfs wanneer je toekomst kleiner wordt, je aanwezigheid groter kunt maken."
      },
      {
        text: "Daar zit de kracht van Eva. Ze maakte kanker niet mooier dan het was. Ze maakte er geen romantisch verhaal van. Ze liet de pijn zien, de angst, de benauwdheid, het ongemak van afscheid nemen. Maar ze liet ook zien dat een mens niet samenvalt met een diagnose. Dat je lichaam ziek kan zijn, terwijl je geest nog steeds danst. Dat verdriet en geluk niet altijd om de beurt komen, maar soms op dezelfde dag, in dezelfde kamer, aan dezelfde keukentafel zitten."
      },
      {
        heading: "Longeneeslijk"
      },
      {
        text: "Haar boek Longeneeslijk draagt alleen al in de titel alles wat Eva was. Een woordspeling, ja. Maar geen luchtige grap om iets zwaars weg te poetsen. Eerder een manier om het zware draagbaar te maken. Eva begreep iets wat veel mensen pas laat leren: dat humor geen gebrek aan diepgang is, maar soms juist de diepste vorm van moed. Lachen terwijl je bang bent, is niet ontkennen. Het is weigeren om de angst het laatste woord te geven."
      },
      {
        text: "In Longeneeslijk vertelt Eva openhartig en op haar eigen manier hoe haar leven volledig kantelde na de diagnose. Het boek gaat over ziek zijn, maar misschien nog meer over wakker worden. Over beseffen dat vanzelfsprekendheid een luxe is. Dat liefde niet in grote verklaringen zit, maar in er zijn. In samen puzzelen. In naast elkaar wakker worden. In een hand op je rug wanneer ademen moeilijk wordt. In mensen die blijven, ook wanneer ze niets kunnen oplossen."
      },
      {
        text: "Wat Eva zo bijzonder maakte, was dat ze geen heilige werd van haar eigen ellende. Ze bleef mens. Soms sterk, soms moe. Soms dankbaar, soms klaar met alles. Soms kwetsbaar, soms messcherp grappig. Juist daardoor kwam ze zo dichtbij. Ze liet zien dat inspiratie niet betekent dat je altijd positief moet zijn. Inspiratie kan ook zijn: eerlijk blijven wanneer het lelijk wordt. Zacht blijven wanneer het leven hard is. Liefde blijven toelaten terwijl je weet dat afscheid onvermijdelijk dichterbij komt."
      },
      {
        heading: "Leven in het nu"
      },
      {
        text: "In haar laatste fase koos Eva bewust voor thuis zijn, voor haar mensen, voor nabijheid. In de speciale aflevering over haar afscheid werd zichtbaar hoe zwaar haar laatste dagen waren, maar ook hoe helder haar boodschap bleef: leef in het nu. Niet als tegeltjeswijsheid. Niet als holle slogan. Maar als iemand die wist hoe kostbaar een gewone dag kan zijn wanneer gewone dagen niet meer vanzelfsprekend zijn."
      },
      {
        text: "Misschien is dat waarom Eva zoveel mensen raakte. Niet omdat ze ons vertelde dat we nooit meer mogen klagen. Niet omdat ze van ziekte een lespakket maakte. Maar omdat ze ons eraan herinnerde hoe vaak wij het leven uitstellen. Hoe vaak we wachten op het juiste moment, de perfecte omstandigheden, de betere versie van onszelf. Eva liet zien dat het leven niet begint wanneer alles klopt. Het leven gebeurt nu."
      },
      {
        text: "Eva werd 26 jaar. Dat is veel te kort. Onrechtvaardig kort. Woedend kort. Maar haar leven was niet klein."
      },
      {
        text: "Ze liet iets achter dat groter is dan een televisieseizoen, groter dan een boek, groter dan een Instagramaccount. Ze liet een houding achter. Een manier van kijken. Een bijna brutale tederheid tegenover het bestaan. Alsof ze zei: maak het leven niet groter dan het is, maar maak het ook niet kleiner. Wacht niet tot alles bijzonder voelt. Kijk beter. Het bijzondere is er al."
      },
      {
        type: "note",
        text: "In Matthijs, haar familie, haar vrienden en in al die mensen die haar volgden, blijft Eva aanwezig. Niet als iemand die alleen gemist wordt, maar als iemand die nog steeds aanzet tot leven."
      }
    ]
  },
  tycho: {
    buttonLabel: "Lees Tycho's verhaal",
    deck: "Over humor, levenslust, moed en een korte aanwezigheid die een lang spoor trekt.",
    kicker: "Over Tycho",
    title: "Tycho Reijnders",
    blocks: [
      {
        type: "intro",
        text: "Sommige mensen leven niet in jaren, maar in indruk. Ze komen binnen, laten iets bewegen, zetten een kamer op scherp en blijven hangen in alles wat daarna stiller wordt. Tycho Reijnders was zo iemand. Geen jongen die alleen herinnerd wordt om zijn ziekte, maar om de manier waarop hij bleef leven terwijl het leven hem steeds minder ruimte gaf."
      },
      {
        type: "quote",
        text: "Tycho Reijnders werd niet oud. Maar hij werd wel groot."
      },
      {
        text: "Hij was jong. Veel te jong. Vierentwintig jaar. Een leeftijd waarop dromen normaal gesproken nog alle kanten op schieten. Studeren, reizen, vrienden, liefde, toekomstplannen, fouten maken, opnieuw beginnen. Tycho had dat allemaal nog moeten kunnen doen."
      },
      {
        text: "Hij studeerde International Business aan Avans in 's-Hertogenbosch en behaalde, ondanks zware behandelingen, zijn propedeuse. Dat zegt iets over discipline, maar vooral over karakter: blijven bewegen, zelfs wanneer je lichaam je probeert tegen te houden."
      },
      {
        text: "Maar wie Tycho alleen beschrijft als dapper, doet hem tekort. Dapper klinkt soms te netjes, te gepolijst, alsof iemand keurig rechtop door ellende wandelt. Tycho leek eerder iemand die het donker recht aankeek, zijn schouders ophaalde en dan toch nog een grap maakte. Niet omdat het niet erg was. Juist omdat het zo verschrikkelijk erg was. Zijn humor was geen vlucht. Het was verzet."
      },
      {
        heading: "Licht op onverwachte plekken"
      },
      {
        text: "In Over Mijn Lijk werd zichtbaar wat mensen om hem heen allang wisten: Tycho bracht licht op plekken waar je dat bijna niet verwacht. Zelfs op de afdeling oncologie in het Radboud UMC wist hij mensen aan het lachen te krijgen, met een infuus naast zich en zijn familie en de crew om hem heen."
      },
      {
        text: "Wat zijn verhaal zo hard raakt, is niet alleen het onrecht. Het is de levenslust die dwars door dat onrecht heen breekt. Tycho kreeg op zijn twintigste te horen dat hij uitgezaaide darmkanker had. Na intensieve behandelingen leek er hoop, maar in 2024 kwam de ziekte terug en bleek genezing niet meer mogelijk."
      },
      {
        text: "Toch bleef zijn boodschap niet hangen in bitterheid. Hij wilde dat mensen beter naar elkaar zouden kijken. Meer zouden genieten van kleine dingen. Meer begrip zouden hebben. Meer mens zouden zijn."
      },
      {
        heading: "Gemis in beweging"
      },
      {
        text: "Misschien is dat de grootste nalatenschap van Tycho: hij liet zien dat betekenis niet pas ontstaat aan het einde van een lang leven. Betekenis ontstaat in hoe je aanwezig bent. In hoe je liefhebt. In hoe je vrienden vasthoudt. In hoe je familie achterblijft met pijn, maar ook met trots."
      },
      {
        text: "Zijn ouders richtten de Tycho Noah Foundation op, zodat zijn verhaal niet zou stoppen bij zijn overlijden. De stichting zamelt geld in voor onderzoek naar darmkanker, met speciale aandacht voor jonge patienten. Daarmee wordt verdriet omgezet in richting. Gemis in beweging. Liefde in hoop."
      },
      {
        text: "Tycho's vrienden dragen hem ook verder. In 2026 namen drie vrienden zich voor om met Tycho in hun hart Alpe d'HuZes te fietsen, waarbij de opbrengst naar KWF Kankerbestrijding zou gaan. Dat beeld is bijna symbolisch: een berg op, benen die branden, adem die stokt, maar doorgaan."
      },
      {
        text: "Groot in humor. Groot in moed. Groot in het vermogen om anderen te raken zonder zichzelf groter te maken dan hij was. Hij was een zoon, een vriend, een student, een levensgenieter. Iemand met plannen. Iemand met dromen. Iemand die veel te vroeg moest gaan, maar niet verdween."
      },
      {
        type: "note",
        text: "Sommige mensen laten geen stilte achter. Ze laten een opdracht achter: kijk om naar elkaar, lach wanneer het kan, huil wanneer het moet en stel het leven niet eindeloos uit."
      }
    ]
  }
} satisfies Record<"eva" | "tycho", FamilyStory>;

export function FamilyStoryPopout({ storyKey }: { storyKey: keyof typeof familyStories }) {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();
  const story = familyStories[storyKey];

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
        {story.buttonLabel}
      </button>
      {isOpen ? (
        <div className="story-popout-layer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button className="story-popout-backdrop" type="button" aria-label="Sluit verhaal" onClick={() => setIsOpen(false)} />
          <article className="story-popout-panel">
            <header className="story-popout-header">
              <div>
                <p className="story-popout-kicker">{story.kicker}</p>
                <h2 id={titleId}>{story.title}</h2>
                <p className="story-popout-deck">{story.deck}</p>
              </div>
              <button className="story-popout-close" type="button" aria-label="Sluit verhaal" onClick={() => setIsOpen(false)}>
                <X size={20} aria-hidden />
              </button>
            </header>
            <div className="story-popout-body">
              {story.blocks.map((block, index) => {
                if (block.heading) {
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

                return (
                  <p className={block.type === "intro" || block.type === "note" ? "story-popout-intro" : undefined} key={`${block.text}-${index}`}>
                    {block.text}
                  </p>
                );
              })}
            </div>
          </article>
        </div>
      ) : null}
    </>
  );
}
