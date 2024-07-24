import * as React from "react";

// I skip "14 I… 48:33" since it's basically track 1 with added violin.
// For "05 Passing By 15:17", "09 Time Forgets… 29:52" and "15 Farewell 52:45"
// I use versions without a cello, since it's doubling a piano melody anyways.
const corpora = [
  {
    slug: "first_love",
    midis: [
      "river-flows-in-you",
      "may-be---yiruma",
      "it-s-your-day---yiruma",
      "yiruma---love-me",
      "farewell---yiruma",
      "time-forgets---yiruma",
      "if-i-could-see-you-again---yiruma",
      "i---yiruma",
      "on-the-way---yiruma",
      "till-i-find-you---yiruma",
      "passing-by---yiruma",
      "left-my-hearts---yiruma",
      "dream-a-little-dream-of-me---yiruma", // cover
      "when-the-love-falls---yiruma", // cover
    ],
  },
  {
    slug: "jim_brickman",
    midis: [
      "valentine---jim-brickman-with-martina-mcbride",
      "beautiful",
      "jim-brickman---night-prayer-uoc-gi",
    ],
  },
  {
    // minimalism
    slug: "george_winston",
    midis: [
      "thanksgiving",
      "colors-dance---george-winston",
      "february-sea---george-winston-771567dfea6219c668f882216e7f8c356a9b6bc5",
      "longing-love---george-winston",
      //       Lullaby (Sandman)
      // January Stars
      // Early Morning Range
    ],
  },
  {
    slug: "david_lanz",
    midis: [
      "cristofari-s-dream",
      "moonlight-lake-by-david-lanz",
      "angels-falling-by-david-lanz",
    ],
  },
  {
    slug: "philip_glass",
    midis: [
      "glassworks-opening-1---philip-glass-opening-1---philip-glass",
      "tales-from-the-loop",
      "walk-to-school-tales-from-the-loop",
      "it-was-always-you-helen-from-the-classic-horror-movie-candyman",
      "philip-glass---prophecies",
      "philip-glass---facades",
      "night-train---philip-glass-arr.-for-solo-piano",
      "philip-glass---spaceship",
      "philip-glass---pruit-igoe",
      "philip-glass---islands",
      "akhnaten-prelude---philip-glass",
      "dead-things",
      "candyman",
      "philip-glass---floe",
      "philip-glass---satyagraha-act-3-ending",
    ],
  },
  { slug: "machaut", midis: ["machaut---messe-de-nostre-dame---kyrie"] },
  {
    slug: "tango",
    midis: [
      "tango-la-cumparsita---piano-solo-tutorial-parte-a",
      "happy-birthday-tango-variation",
      "to-ostatnia-niedziela-last-sunday---polish-tango",
      "tango-ndeg3-op.50---jose-ferrer-y-esteve-1835---1916", // ideal V/bIII
      "assassin-s_tango",
      "tango-por-una-cabeza",
      "spanish-tango",

      "tango-jealousy---jacob-gade",
      "beleet-moy-parus-a.-mironov---gennadiy-gladkov",

      "tango---isaac-albeniz",
      "tango-el-choclo---angel-gregorio-villoldo",
      "sankarin-tango-finnish-tango---petri-alanko-and-martti-suosalo",
      "escorregando---tango-brasileiro",
      "tango---traditionnel-paraguayen",
      "catherine-s-tango---dustin-o-halloran",
      "ojos-negros-tango-by-vicente-greco", // V-I compared to parallel V-i
      "shovel-knight-plague-of-shadows---tango-of-the-troupple-king",
      "tango-for-piano",
      "underground-tango---goran-bregovic-string-quartet",
      "tango-habanera-vers-1925-by-ernesto-nazareth",
      "tango-de-la-muerte",
      "tango-pour-claude---richard-galliano",
      "tango-from-schnittke-s-concerto-grosso-1",
      "tango-of-the-roses",
      "ole-guapa-by-a.malando",
      "tango-to-evora",
      "carioca-1913",
      "moon-tango---r.-clayderman",
      "la-cumparsita",
      "the-masochism-tango---tom-lehrer-the-masochism-tango---tom-lehrer-the-masochism-tango",
      "lagrima---tango---joao-teixeira-guimaraes-1883---1947",
      "tango-flamenco---luis-de-soria-1851---1935", // pure major

      // el tango de roxanne

      "piazzolla_histoire_du_tango_bordel_1900",
      "piazzolla_histoire_du_tango_cafe_1930",
      "piazzolla_histoire_du_tango_nightclub_1960",
      "piazzolla_histoire_du_tango_concert_aujourdhui",
      "astor-piazzolla---prologue-tango-apasionado",
      "astor-piazzolla-adios-nonino-tango",
      "street-tango-for-clarinet-and-piano",
      "triunfal-tango-by-astor-piazzolla-in-edition-for-classical-guitar-from-victor-villadangos",
      "malena---tango", // exercise
    ],
  },
];

const Corpus: React.FC<{ slug: string }> = ({ slug }) => {
  const corpus = corpora.filter((corpus) => corpus.slug === slug)?.[0];
  if (!corpus) {
    return <div>Corpus {slug} not found</div>;
  }

  return (
    <div>
      <h1>{slug}</h1>
      {corpus.midis.map((midiSlug) => (
        <div>
          <a href={`/f/${midiSlug}`} target="_blank">
            {midiSlug.replace(/---/g, " – ").replace(/-/g, " ")}
          </a>
        </div>
      ))}
    </div>
  );
};

export default Corpus;
