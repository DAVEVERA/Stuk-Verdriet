"use client";

import { useEffect, useId, useState } from "react";
import { X } from "lucide-react";

const danielaStory = [
  {
    type: "intro",
    text: "Daniela is 49 jaar, getrouwd met Rob (51) en moeder van 3 kinderen. Nadia en Larissa (26) en Tycho (24). Tycho is op 28 april 2025 overleden aan de gevolgen van uitgezaaide darmkanker en was dit jaar te zien in \"Over Mijn Lijk\" bij BNNVARA."
  },
  {
    type: "quote",
    text: "Tycho liet geen indruk achter, maar een afdruk."
  },
  {
    text: "2025 was een jaar van leven tussen angst en hoop. Van steeds opnieuw proberen overeind te blijven, terwijl de grond onder ons wegzakte. En uiteindelijk moesten we in april onze lieve Tycho laten gaan. Onze zoon. Mijn baby. Mijn ventje. Onze allerliefste, ondeugendste, moedigste zoon en broertje."
  },
  {
    text: "Hij heeft zo hard gevochten. Zo dapper. Hij heeft echt alles gegeven. Maar uiteindelijk heeft hij het leven waar hij zo ontzettend van hield moeten loslaten. En wij hebben hem moeten laten gaan. Tycho sloeg in onze wereld in als een komeet en liet een krater van leegte achter."
  },
  {
    heading: "Tycho"
  },
  {
    text: "15 december 2000 staat voor altijd in mijn geheugen gegrift. Tycho had toen al haast. Na een weeënstorm van ongeveer drie uur en één keer hard persen werd hij de wereld in gelanceerd. De gynaecoloog had zijn handschoenen nog niet eens aan en de verpleegkundige moest een snoekduik maken om hem op te vangen. Vanaf het allereerste moment wist hij hoe hij indruk moest maken."
  },
  {
    text: "Zodra hij kon praten, zat er geen stop meer op. Hij kletste tegen iedereen aan. Of ze nou wilden of niet. Tycho was altijd nieuwsgierig en leergierig. Hij wilde alles uitproberen en moest overal aan zitten. Alle knopjes indrukken, alles onderzoeken, alles snappen. Ook als wij zeiden: \"Doe nou niet, Tycho...\" Dan deed hij het vaak alsnog. Hij deed alles op zijn eigen manier."
  },
  {
    text: "Hij leefde voor de lach. Als hij mensen aan het lachen kon krijgen, had hij zijn doel bereikt. Hij was intelligent, had overal een mening over en kon die mening ook goed onderbouwen. Hij wist waar hij het over had, want hij hield het nieuws en allerlei andere kanalen nauwlettend in de gaten."
  },
  {
    text: "Zijn muzieksmaak ging alle kanten op en week vaak enorm af van de mainstream. Maar dat paste bij hem. Tycho was ook allesbehalve mainstream. Hij was zijn eigen stream. Zijn eigen beat. Zijn eigen melodie. Hij danste door het leven en had zo veel dromen. Dromen die hij helaas niet heeft mogen uitleven."
  },
  {
    text: "Daarom proberen wij nu, in alles wat we doen, iets van die dromen mee te nemen. We vragen ons vaak af: wat zou Tycho doen? En dan proberen we een beetje meer zijn mentaliteit te hebben. Iets meer schijt aan alles. Iets meer leven zoals hij dat deed."
  },
  {
    heading: "Over Mijn Lijk"
  },
  {
    text: "Tycho's deelname aan Over Mijn Lijk was iets wat hij heel graag wilde. Hij wilde laten zien hoe hard de werkelijkheid is als je moet leven met kanker, wetende dat je niet meer beter wordt. Dat was belangrijk voor hem. Hij wilde niet dat mensen wegkeken. Hij wilde laten zien wat deze ziekte met iemand doet, maar ook wie hij was naast die ziekte."
  },
  {
    text: "Voor ons is het natuurlijk bijzonder en waardevol dat we daardoor meer beeldmateriaal van Tycho hebben. Dat zijn stem, zijn lach, zijn blik en zijn manier van doen zijn vastgelegd. En dat de hele wereld nu in principe kan zien hoe leuk hij was. Maar het is ook ingewikkeld. Want daardoor moeten we Tycho delen met de buitenwereld. En dat voelt soms heel raar en eng. Hij is van ons. Onze zoon, ons kind, ons ventje. En ineens kijken er zoveel mensen mee."
  },
  {
    heading: "Dag voor dag"
  },
  {
    text: "Na zijn overlijden probeerden we ons moeizaam, maar vastberaden te herpakken. Niet omdat we dat wilden. Niet omdat het vanzelf ging. Maar omdat Tycho dat wilde. Hij wilde dat we door zouden gaan met leven. Hij wilde zelfs dat we plezier zouden blijven maken. Bedankt hè, Tycho, voor deze behoorlijk pittige uitdaging!"
  },
  {
    text: "Met de steun van lieve familie en vrienden proberen we stap voor stap verder te gaan. Daar zijn we enorm dankbaar voor. Zonder hen zou het nog zwaarder zijn. Want rouw is iets waarop we ons niet konden voorbereiden. Er is geen goed of fout, maar het is echt ontzettend zwaar. Het komt en gaat. Het overvalt je op de meest onverwachte momenten."
  },
  {
    text: "Er zijn nachten waarin ik wakker lig met vragen waarop geen antwoord komt. Waarom hij? Waarom zo jong? Waarom moest iemand die zo van het leven hield, het leven loslaten? Er zijn paniekaanvallen, tranen die maar blijven komen en stapels versleten zakdoekjes. Eerst was er vooral ontreddering, ongeloof en wanhoop. Later werd het verdriet dieper. Meer geworteld. Met boosheid erbij. Leegte. Paniek. Het besef dat ik hem nooit meer zie. Nooit meer kan knuffelen. Nooit meer zijn stem hoor zoals vroeger. Dat kan toch niet? Dat mag toch niet?"
  },
  {
    text: "Zijn jas hangt hier nog over een stoel in een kamer. Die jas had hij in Berlijn gekocht bij een secondhand store. Hij was er superblij mee, want volgens hem was het een koopje. Het was zijn favoriete jas. En nu hangt die jas daar. Zonder hem erin. Dat soort dingen breken je op momenten dat je het niet verwacht."
  },
  {
    text: "Rond de jaarwisseling kwam er opnieuw een pijnlijk besef binnen. Dat 2026 het eerste jaar zou worden waarin we geen nieuwe herinneringen meer met Tycho zouden maken. Op de een of andere manier hou je jezelf toch steeds weer een beetje voor de gek. Je blijft ergens hopen op een wonder. Op het einde van de nachtmerrie. Alsof hij toch ineens weer binnen kan komen lopen. Maar dat gebeurt niet."
  },
  {
    text: "We proberen het leven nu van dag tot dag te bekijken. Alleen vandaag telt. Dat maakt het overzichtelijker en iets behapbaarder. We proberen de lichtpuntjes te blijven zien, in contact te blijven met de mensen die ons en Tycho dierbaar zijn, en leuke dingen te blijven doen. Niet omdat het verdriet dan weg is, maar omdat Tycho het leven zo graag had willen leven. Omdat hij die kans niet meer kreeg. En omdat hij wilde dat wij zouden doorgaan."
  },
  {
    text: "Daarnaast ging ik regelmatig naar een psycholoog. Gewoon om in de gaten te houden of het nog oké gaat met mij. Het is heel fijn om dan te kunnen sparren met een zorgprofessional die verstand heeft van rouw. Iemand die niet schrikt van wat je voelt, maar helpt om het te dragen."
  },
  {
    text: "Een jaar zonder Tycho voelt als een constant proces van vallen en weer opstaan. Als iets een emotionele rollercoaster is, dan is het rouw. De ene dag sta je op en denk je: vandaag is best een oké dag. De andere dag wil je het liefst in bed blijven liggen, de deken over je hoofd trekken en denken: f*ck alles en iedereen, ik heb hier geen zin in. Niet zonder Tycho."
  },
  {
    heading: "Tycho Noah Foundation"
  },
  {
    text: "Hij wilde dat zijn leven en zijn dood niet voor niets zouden zijn. Hij wilde dat we anderen in een vergelijkbare situatie zouden helpen. Daarom zijn we aan de slag gegaan met het oprichten van de Tycho Noah Foundation. Met die stichting zamelen we donaties in voor onderzoek naar kanker. Specifiek naar het zegelring carcinoom, naar de vraag waarom jongeren steeds vaker darmkanker krijgen terwijl de cijfers bij ouderen juist dalen, en naar betere screening, onderzoeken en behandelingen. Zodat anderen straks hopelijk wél een eerlijke kans hebben tegen deze verschrikkelijke ziekte."
  },
  {
    text: "Daarvoor hebben we de handen ineengeslagen met het Radboud Oncologie Fonds. Vanuit allerlei hoeken komt er onverwachts hulp. Mensen denken mee, komen met ideeën, zetten acties op of bieden iets aan. Dat is zo hartverwarmend."
  },
  {
    text: "Zo had ik het idee om tijdens carnaval in Venray een shotje te introduceren bij Tycho's favoriete kroeg, Grandcafé Hulsman. Dat was ook de plek waar zijn uitvaart is gehouden. We lieten etiketten maken met een foto van Tycho erop en zijn trademark-begroeting: \"kleine hallo\". Voor elk verkocht shotje gaat een deel naar de foundation."
  },
  {
    text: "Mijn petekindje heeft sleutelhangers gemaakt met \"kleine hallo\" en \"grote doei\" en heeft deze verkocht tijdens Koningsdag. De HEMA in Venray heeft negentien tompoucepakken gedoneerd aan de stichting. Dat past ook zo bij Tycho, want hij ging zelfs in zijn tompoucepak naar de chemo."
  },
  {
    text: "Etan Huijs, een lokale singer-songwriter, heeft een prachtig nummer geschreven over en voor Tycho. Het nummer heet A Brief Spark en de opbrengst daarvan gaat ook naar de foundation. Twee vriendinnen van Tycho hebben de halve marathon van Eindhoven gelopen voor Tycho en voor KWF. Drie vrienden van hem hebben fietsend en één vriendin lopend de Alpe d'HuZes bedwongen als Team Tycho, ook voor KWF."
  },
  {
    text: "Omdat er zoveel vraag naar was, zijn we ook een tegeltjesactie gestart. Tycho's uitspraak \"Ik heb niet genoeg dagen om verdrietig te zijn\" wordt op tegels gedrukt en is via de Instagrampagina van de foundation te bestellen. De gehele opbrengst gaat naar de foundation. Wat het extra bijzonder maakt, is dat de naam Tycho op de tegels in zijn eigen handschrift staat."
  },
  {
    text: "Met al die acties die nu bezig zijn en nog komen gaan, hopen we genoeg donaties te verzamelen voor onderzoek. Want zoals Tycho zei: al helpen we maar één iemand, al kunnen we maar één iemand redden, dan is het al deze moeite waard. Wat wij hebben doorgemaakt, en vooral wat Tycho heeft moeten doorstaan, gunnen we niemand."
  },
  {
    text: "Zolang wij hiermee bezig zijn, wordt Tycho's naam regelmatig genoemd. En zal hij nooit worden vergeten. Dat was ook een angst van hem. Dat hij vergeten zou worden. Alsof dat überhaupt mogelijk was. Tycho liet geen indruk achter, maar een afdruk."
  },
  {
    text: "Zijn vrienden zorgen daar ook op hun eigen manier voor. In Venray hebben ze een pop laten maken met een foto van zijn gezicht erop. Die gaat overal mee naartoe. Hij is al mee geweest op vakantie naar Bali, Dublin en Zuid-Duitsland, en is ook al onderweg geweest in Frankrijk. Hij gaat mee naar de slotconcerten van Rowwen Hèze, naar carnaval en naar kroegentochten. Dat is wel goed voor de FOMO van Tycho. Zo mist hij niks."
  },
  {
    text: "Dat vind ik verdrietig en prachtig tegelijk. Het laat zien hoeveel hij betekende. Hoe aanwezig hij nog steeds is in de levens van mensen die van hem houden."
  },
  {
    heading: "Stuk Verdriet"
  },
  {
    text: "Nu ben ik samen met Susan, de moeder van Eva uit het vorige seizoen van Over Mijn Lijk, bezig met dit platform waar mensen met al hun vragen over rouw, doodgaan, palliatieve zorg, AYA's enz. terecht kunnen. Iets waarvan we hopen dat het anderen wat troost, hoop of houvast kan geven. En waar mensen ook een rouwmaatje kunnen vinden, iemand die hetzelfde doormaakt."
  },
  {
    text: "Want rouw is een eenzaam proces en in zo'n situatie wil je het liefste praten met iemand die hetzelfde meemaakt. Dan hoef je niets uit te leggen en kom je snel tot de kern, wat er echt toe doet. Dat schept een band en dan voelt de rouw net iets minder eenzaam."
  },
  {
    text: "Susan en ik hebben door onze vriendschap en gedeeld verdriet dit idee opgepikt en uitgewerkt omdat we iedereen in zo'n situatie een vriendschap als die van ons gunnen. En we delen onze ervaringen en die van onze gastsprekers ook nog in onze podcast. Dit alles doen we samen met een fijne groep vrijwilligers die echt een dikke pluim verdienen."
  },
  {
    text: "Rouw is liefde die nergens meer heen kan. Het is leren leven met een leegte die niet kleiner wordt, maar waar je langzaam omheen probeert te bewegen. Soms lukt dat. Soms helemaal niet. Soms lach je. Soms breek je. Soms doe je allebei tegelijk."
  },
  {
    text: "Wat ik vooral hoop, is dat Tycho blijft voortleven. In verhalen. In muziek. In acties. In onderzoek dat misschien ooit iemand anders kan helpen. In vrienden die hem meenemen op reis. In \"kleine hallo\" en \"grote doei\". In tompoucepakken, shotjes, tegeltjes en herinneringen. In alles wat hij was en alles wat hij nog steeds in beweging zet."
  },
  {
    text: "Wij proberen hier de lichtpuntjes te blijven zien. We proberen door te gaan. Dag voor dag. Zoals hij wilde. Zoals hijzelf zo graag had gewild. Want uiteindelijk heb je niet genoeg dagen om verdrietig te zijn!"
  },
  {
    type: "note",
    text: "De Tycho Noah Foundation is te volgen via Instagram: tycho_noah_foundation en Facebook: Tychonoahfoundation. Tycho's leven, herinneringen en acties van familie en vrienden zijn te volgen via Instagram: tumoristisch_."
  }
];

export function DanielaStoryPopout() {
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
        Lees Daniela&apos;s verhaal
      </button>
      {isOpen ? (
        <div className="story-popout-layer" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <button className="story-popout-backdrop" type="button" aria-label="Sluit verhaal" onClick={() => setIsOpen(false)} />
          <article className="story-popout-panel">
            <header className="story-popout-header">
              <div>
                <p className="story-popout-kicker">Over de podcast maker</p>
                <h2 id={titleId}>Daniela</h2>
                <p className="story-popout-deck">Over Tycho, rouw, liefde, lichtpuntjes en het voortzetten van wat hij in beweging bracht.</p>
              </div>
              <button className="story-popout-close" type="button" aria-label="Sluit verhaal" onClick={() => setIsOpen(false)}>
                <X size={20} aria-hidden />
              </button>
            </header>
            <div className="story-popout-body">
              {danielaStory.map((block, index) => {
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
