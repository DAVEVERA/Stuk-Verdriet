/**
 * Bron: de vier bestuursdocumenten van Stichting Stuk Verdriet
 * (Wie zijn wij, Beleidsplan 2026–2028, Bestuur en beloningsbeleid, Website gegevens).
 * Deze module is de enige plek waar die teksten staan; de pagina's renderen ze alleen.
 */

export type GovernanceBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "lead"; text: string }
  | { kind: "list"; intro?: string; items: string[] }
  | { kind: "table"; caption: string; columns: [string, string]; rows: Array<[string, string]> };

export type GovernanceSection = {
  id: string;
  number: string;
  title: string;
  blocks: GovernanceBlock[];
};

export type GovernanceLink = {
  href: string;
  label: string;
  description: string;
};

/** De vier footerlinks, in leesvolgorde: wie, wat, hoe, waar. */
export const governanceLinks: GovernanceLink[] = [
  {
    href: "/wie-zijn-wij",
    label: "Wie zijn wij",
    description: "De drie bestuursleden achter Stichting Stuk Verdriet."
  },
  {
    href: "/beleidsplan",
    label: "Beleidsplan",
    description: "Doelstelling, werkzaamheden en besteding voor 2026–2028."
  },
  {
    href: "/bestuur-en-beloningsbeleid",
    label: "Bestuur en beloningsbeleid",
    description: "Taken, verantwoordelijkheden en waarom niemand betaald krijgt."
  },
  {
    href: "/stichtingsgegevens",
    label: "Stichtingsgegevens",
    description: "KVK, RSIN, vestigingsadres en rekeningnummer."
  }
];

export function otherGovernanceLinks(currentHref: string) {
  return governanceLinks.filter((link) => link.href !== currentHref);
}

/* ------------------------------------------------------------------ */
/* Wie zijn wij                                                        */
/* ------------------------------------------------------------------ */

export type BoardMember = {
  name: string;
  role: string;
  tagline: string;
  image: string;
  imageAlt: string;
  /** Per portret ingesteld zodat alle drie de gezichten op dezelfde hoogte uitkomen. */
  objectPosition: string;
};

export const boardMembers: BoardMember[] = [
  {
    name: "Susan",
    role: "Voorzitter",
    tagline: "Oprichtster van Stichting Stuk Verdriet. Moeder van Eva.",
    image: "/img/portretsuus.png",
    imageAlt: "Portret van Susan, voorzitter van Stichting Stuk Verdriet",
    objectPosition: "center 38%"
  },
  {
    name: "Daniela",
    role: "Secretaris",
    tagline: "Mede-oprichtster van Stichting Stuk Verdriet. Moeder van Tycho.",
    image: "/img/Portret_Daniela.jpeg",
    imageAlt: "Portret van Daniela, secretaris van Stichting Stuk Verdriet",
    objectPosition: "center 22%"
  },
  {
    name: "Anita",
    role: "Penningmeester",
    tagline: "Sloot zich als vrijwilliger aan vanuit haar moederhart en haar financiële ervaring.",
    image: "/img/portret-anita.jpg",
    imageAlt: "Portret van Anita, penningmeester van Stichting Stuk Verdriet",
    objectPosition: "center 30%"
  }
];

/** Woordelijk overgenomen uit "Wie zijn wij" - de introductie van de penningmeester. */
export const anitaIntroduction = {
  eyebrow: "Even voorstellen",
  name: "Anita",
  role: "Penningmeester",
  paragraphs: [
    "Mijn naam is Anita.",
    "Na jarenlang met veel plezier te hebben gewerkt als Business Unit Manager binnen diverse facilitaire organisaties, geniet ik tegenwoordig van een rustiger leven. Een paar maanden geleden kwam ik opnieuw in contact met Susan, een oud-collega van mij.",
    "Tijdens onze gesprekken vertelde zij over het indrukwekkende en verdrietige traject dat zij samen met haar dochter Eva heeft doorlopen nadat Eva op 26-jarige leeftijd de diagnose ongeneeslijk ziek kreeg. Susan vertelde mij niet alleen over het verdriet en de zorgen die daarbij kwamen kijken, maar ook over de eenzaamheid die zij soms heeft ervaren. Hoe moeilijk het kan zijn wanneer mensen om je heen het beste met je voor hebben, maar simpelweg niet weten wat je doormaakt.",
    "Goedbedoelde woorden kunnen dan soms toch anders binnenkomen dan bedoeld.",
    "Tijdens die periode leerde Susan Daniela kennen, moeder van Tycho, die eveneens op veel te jonge leeftijd is overleden. In elkaar vonden zij iets heel waardevols: herkenning, begrip en een luisterend oor zonder uitleg. Een contact waarin ruimte was voor verdriet, herinneringen, maar ook voor kracht, warmte en soms zelfs een glimlach.",
    "Toen Susan en Daniela hun ideeën voor Stichting Stuk Verdriet met mij deelden, raakte mij dat diep. Niet alleen vanwege hun persoonlijke verhaal, maar vooral vanwege de behoefte die zij zichtbaar maakten: een plek waar mensen elkaar kunnen vinden, begrijpen en ondersteunen wanneer het leven een onverwachte en moeilijke wending neemt.",
    "Als moeder voelde ik direct de waarde van dit initiatief. Vanuit dat moederhart, maar ook vanuit mijn ervaring op organisatorisch en financieel gebied, heb ik besloten mij als vrijwilliger aan te sluiten bij Stichting Stuk Verdriet in de rol van penningmeester.",
    "Ik ben trots dat ik mag bijdragen aan een stichting die zich inzet om verbinding, herkenning en steun te bieden aan mensen die te maken krijgen met ongeneeslijke ziekte, verlies en rouw."
  ],
  closing: "Want niemand zou zich alleen moeten voelen in een stuk verdriet."
};

/* ------------------------------------------------------------------ */
/* Beleidsplan 2026–2028                                               */
/* ------------------------------------------------------------------ */

export const beleidsplanSections: GovernanceSection[] = [
  {
    id: "doelstelling-en-missie",
    number: "01",
    title: "Doelstelling en missie",
    blocks: [
      {
        kind: "lead",
        text: "Stichting Stuk Verdriet heeft als doel het bieden van herkenning, verbinding en ondersteuning aan ouders die te maken krijgen met het verlies van een kind of met de ernstige, ongeneeslijke ziekte van hun kind."
      },
      {
        kind: "paragraph",
        text: "De stichting wil het maatschappelijke begrip voor rouw vergroten en bijdragen aan het doorbreken van eenzaamheid en onbegrip bij ouders in rouw."
      }
    ]
  },
  {
    id: "werkzaamheden",
    number: "02",
    title: "Werkzaamheden",
    blocks: [
      {
        kind: "list",
        intro: "Om haar doelstelling te realiseren, verricht de stichting onder andere de volgende activiteiten:",
        items: [
          "Het ontwikkelen en publiceren van podcasts over rouw, verlies en het leven na het verlies van een kind.",
          "Het bieden van een platform waar ouders hun ervaringen en verhalen kunnen delen.",
          "Het vergroten van maatschappelijke bewustwording rondom rouw en verlies.",
          "Het opbouwen en onderhouden van een betrokken community.",
          "Het ontwikkelen van samenwerkingen met organisaties en professionals die bijdragen aan de doelstelling."
        ]
      },
      { kind: "paragraph", text: "De stichting richt zich op activiteiten die het algemeen belang dienen." }
    ]
  },
  {
    id: "werving-van-inkomsten",
    number: "03",
    title: "Werving van inkomsten",
    blocks: [
      {
        kind: "list",
        intro: "De stichting verwerft inkomsten door middel van:",
        items: [
          "Donaties van particulieren.",
          "Bijdragen van bedrijven en sponsors.",
          "Subsidies en bijdragen van fondsen.",
          "Crowdfunding en andere passende fondsenwervende activiteiten."
        ]
      },
      {
        kind: "paragraph",
        text: "De stichting heeft geen winstoogmerk. Eventuele positieve exploitatieresultaten worden volledig ingezet voor de doelstelling van de stichting."
      }
    ]
  },
  {
    id: "beheer-en-besteding",
    number: "04",
    title: "Beheer en besteding van het vermogen",
    blocks: [
      {
        kind: "paragraph",
        text: "Het bestuur is verantwoordelijk voor een zorgvuldig, transparant en doelmatig financieel beheer."
      },
      {
        kind: "paragraph",
        text: "De inkomsten worden besteed aan de realisatie van de doelstelling, waaronder de productie en verspreiding van podcasts, communicatie, community activiteiten en noodzakelijke organisatiekosten."
      },
      {
        kind: "paragraph",
        text: "De stichting houdt niet meer vermogen aan dan redelijkerwijs nodig is voor de continuïteit van haar activiteiten en de uitvoering van haar plannen. Eventuele reserves worden uitsluitend aangehouden voor duidelijk omschreven toekomstige activiteiten en noodzakelijke continuïteit."
      },
      {
        kind: "paragraph",
        text: "De financiële administratie wordt zorgvuldig bijgehouden en jaarlijks verantwoord."
      }
    ]
  },
  {
    id: "bestuur-en-beloning",
    number: "05",
    title: "Bestuur en beloningsbeleid",
    blocks: [
      {
        kind: "paragraph",
        text: "Het bestuur draagt verantwoordelijkheid voor het beleid, de financiën en de uitvoering van de doelstelling."
      },
      {
        kind: "paragraph",
        text: "Bestuurders ontvangen geen beloning voor hun bestuurlijke werkzaamheden. Aantoonbare onkosten kunnen worden vergoed binnen de geldende wettelijke voorwaarden en de statuten van de stichting."
      }
    ]
  },
  {
    id: "evaluatie-en-verantwoording",
    number: "06",
    title: "Evaluatie en verantwoording",
    blocks: [
      {
        kind: "paragraph",
        text: "Het bestuur evalueert jaarlijks de uitgevoerde activiteiten, de financiële resultaten en de voortgang van de doelstellingen. Op basis hiervan wordt het beleid waar nodig aangepast."
      },
      {
        kind: "paragraph",
        text: "De stichting publiceert de wettelijk vereiste gegevens en financiële verantwoording op haar website, overeenkomstig de geldende ANBI-voorwaarden."
      }
    ]
  }
];

export const beleidsplanAdoption = {
  statement: "Vastgesteld door het bestuur van Stichting Stuk Verdriet.",
  label: "Datum vaststelling",
  date: "16-08-2026"
};

/* ------------------------------------------------------------------ */
/* Bestuur en beloningsbeleid                                          */
/* ------------------------------------------------------------------ */

export const bestuurSections: GovernanceSection[] = [
  {
    id: "bestuur",
    number: "01",
    title: "Bestuur",
    blocks: [
      {
        kind: "lead",
        text: "Stichting Stuk Verdriet wordt bestuurd door een bestuur dat verantwoordelijk is voor het beleid, het beheer en de uitvoering van de doelstellingen van de stichting."
      },
      {
        kind: "paragraph",
        text: "Het bestuur zet zich in voor het bieden van herkenning, verbinding en ondersteuning aan ouders die te maken hebben met het verlies of de ernstige ziekte van hun kind. De stichting wil bijdragen aan meer begrip voor rouw en het bespreekbaar maken van verdriet, onder andere door middel van podcasts en andere initiatieven."
      },
      {
        kind: "table",
        caption: "Samenstelling van het bestuur",
        columns: ["Naam bestuurder", "Functie"],
        rows: [
          ["Susan Mathijssen", "Voorzitter"],
          ["Anita Franken-Triemstra", "Penningmeester"],
          ["Daniela Jilesen", "Secretaris"]
        ]
      }
    ]
  },
  {
    id: "taken-en-verantwoordelijkheden",
    number: "02",
    title: "Taken en verantwoordelijkheden",
    blocks: [
      {
        kind: "list",
        intro: "Het bestuur is verantwoordelijk voor:",
        items: [
          "Het bewaken van de doelstelling en missie van de stichting.",
          "Het vaststellen en uitvoeren van het beleid.",
          "Het beheren van de financiële middelen.",
          "Het verwerven van donaties, subsidies en sponsorgelden.",
          "Het toezicht houden op een zorgvuldige besteding van de beschikbare middelen.",
          "Het afleggen van verantwoording over de activiteiten en financiën van de stichting."
        ]
      }
    ]
  },
  {
    id: "beloningsbeleid",
    number: "03",
    title: "Beloningsbeleid",
    blocks: [
      {
        kind: "lead",
        text: "De bestuurders van Stichting Stuk Verdriet ontvangen geen beloning voor hun werkzaamheden als bestuurder."
      },
      {
        kind: "paragraph",
        text: "Eventuele kosten die bestuurders aantoonbaar maken in de uitoefening van hun bestuursfunctie kunnen worden vergoed. Eventuele vacatiegelden worden uitsluitend uitgekeerd indien van toepassing en binnen de geldende wettelijke en ANBI-voorwaarden."
      },
      {
        kind: "paragraph",
        text: "De stichting streeft naar een transparante, zorgvuldige en doelmatige besteding van haar middelen. De beschikbare inkomsten worden ingezet ter verwezenlijking van de doelstelling van de stichting."
      }
    ]
  },
  {
    id: "transparantie-en-verantwoording",
    number: "04",
    title: "Transparantie en verantwoording",
    blocks: [
      {
        kind: "paragraph",
        text: "Stichting Stuk Verdriet hecht grote waarde aan transparantie en verantwoord bestuur. De stichting publiceert de wettelijk vereiste gegevens en legt jaarlijks verantwoording af over haar activiteiten en financiële situatie, overeenkomstig de geldende verplichtingen."
      }
    ]
  }
];

/* ------------------------------------------------------------------ */
/* Stichtingsgegevens                                                  */
/* ------------------------------------------------------------------ */

export type GovernanceFact = {
  label: string;
  value: string;
  /** Alleen nummers die mensen echt overtikken krijgen een kopieerknop en cijferuitlijning. */
  copy?: boolean;
  /** Waarde zoals die naar het klembord gaat; standaard de zichtbare waarde. */
  copyValue?: string;
  hint?: string;
  href?: string;
};

export const organisationFacts: GovernanceFact[] = [
  { label: "Statutaire naam", value: "Stichting Stuk Verdriet" },
  { label: "Rechtsvorm", value: "Stichting" },
  { label: "KVK-nummer", value: "42137342", copy: true, hint: "Kamer van Koophandel" },
  { label: "RSIN", value: "869887294", copy: true, hint: "Fiscaal nummer" }
];

export const contactFacts: GovernanceFact[] = [
  {
    label: "Vestigingsadres",
    value: "Laagstraat 17, 5038 PA Tilburg",
    copy: true,
    hint: "Post- en vestigingsadres"
  },
  { label: "E-mail", value: "info@stukverdriet.com", href: "mailto:info@stukverdriet.com" },
  { label: "Website", value: "www.stukverdriet.com", href: "https://www.stukverdriet.com" }
];

export const bankingFacts: GovernanceFact[] = [
  {
    label: "Rekeningnummer",
    value: "NL47 RABO 0178 4871 63",
    copy: true,
    copyValue: "NL47RABO0178487163",
    hint: "IBAN, ten name van Stichting Stuk Verdriet"
  }
];
