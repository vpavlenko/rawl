import * as React from "react";
import { Link } from "react-router-dom";

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
      "la-cumparsita",
      "sankarin-tango-finnish-tango---petri-alanko-and-martti-suosalo",
      "tango---traditionnel-paraguayen",
      "catherine-s-tango---dustin-o-halloran",
      "mi-noche-triste-tango---castriota-arr.-domingo-prat",

      "spanish-tango",
      "tango-to-evora",
      "a-la-gran-muneca---tango",
      "tango-ndeg3-op.50---jose-ferrer-y-esteve-1835---1916", // ideal V/bIII
      "happy-birthday-tango",
      "to-ostatnia-niedziela-last-sunday---polish-tango",
      "ojos-negros-tango-by-vicente-greco", // V-I compared to parallel V-i
      "shovel-knight-plague-of-shadows---tango-of-the-troupple-king",
      "tango-habanera-vers-1925-by-ernesto-nazareth",
      "ole-guapa-by-a.malando",

      "saladillo-tango-pour-piano-de-vicente-greco-1888-1924",
      "escorregando---tango-brasileiro",
      "tango---isaac-albeniz",
      "tango-flamenco---luis-de-soria-1851---1935", // pure major

      "lagrima---tango---joao-teixeira-guimaraes-1883---1947",
      "moon-tango---r.-clayderman",
      "assassin-s_tango",
      "tango-for-piano",
      "tango-of-the-roses",

      "carioca-1913",
      "tango-el-choclo---angel-gregorio-villoldo",
      "tango-por-una-cabeza",
      "the-masochism-tango---tom-lehrer-the-masochism-tango---tom-lehrer-the-masochism-tango",

      "tango-jealousy---jacob-gade",
      "beleet-moy-parus-a.-mironov---gennadiy-gladkov",
      "chicago---cell-block-tango---misc-soundtrack",
      "underground-tango---goran-bregovic-string-quartet",

      "happy-birthday-tango-variation",
      "happy-birthday-to-you---tango-version",
      "birthday-tango",
      "birthday-tango-2",

      "tango-de-la-muerte",
      "tango-pour-claude---richard-galliano",
      "tango-from-schnittke-s-concerto-grosso-1",

      "milca-s-birthday-tango.....",

      // el tango de roxanne

      "piazzolla_histoire_du_tango_bordel_1900",
      "piazzolla_histoire_du_tango_cafe_1930",
      "piazzolla_histoire_du_tango_nightclub_1960",
      "piazzolla_histoire_du_tango_concert_aujourdhui",
      "astor-piazzolla---prologue-tango-apasionado",
      "astor-piazzolla-adios-nonino-tango",
      "street-tango-for-clarinet-and-piano",
      "triunfal-tango-by-astor-piazzolla-in-edition-for-classical-guitar-from-victor-villadangos",
      "calambre-tango-piazzolla",
      "malena---tango", // exercise
      "tango-la-cumparsita---piano-solo-tutorial-parte-a",
      "tango-till-you-drop-abrsm-grade-5-saxophone-b-3", // melody for harmonization
      "Habanera_-_Piano_Solo_-_Georges_Bizet",
    ],
  },
  {
    slug: "musette",
    midis: ["sous-le-ciel-de-paris", "la-vie-en-rose-solo-accordion"],
  },
  {
    slug: "klezmer",
    midis: [
      "odessa-bulgar-no.3",
      "der-heyser-bulgar---misc-tunes-der-heyser-bulgar",
      "freylekhe-mekhutonim",
      "shloymke-s_freylekhs",
      "freylekhs-2",
      "freylekh-de-reconciliation",
      "odessa-bulgarish-new-york-psycho-freylekhs",
      "mr-zvonsky-s-freylekhs",
      "freylekh-zain---frohlich-sein",
      "lebedikh-un-freylekh---trad.-klezmer-for-flute-clarinet",
    ],
  },
  {
    slug: "fado",
    midis: [
      "fado-da-mouraria---anonimo",
      "lisboa-antiga---fado-marcha---raul-portela",
      "fado---alfredo-mantua",
      "fado-dos-passarinhos---antonio-menano",
      "fado---maria-se-fores-ao-baile",
      "fado-bohemio---reinaldo-varella",
      "fado-menina-e-moca",
      "fado---villa-franca-4-piano",
      "fado-saudade---adelino-d-almeida-couto",
      "fado-nacional---anonimo",
      "amor-eterno---l.-serra-e-moura",
      "fado-de-monchique---alberto-de-vasconcelos-moraes",
      "fado-portugues",
      "fado-freo",
      "fado-monte-estoril---reynaldo-varella",
      "meu-fado-meu---mariza-meu-fado-meu",
      "fado-lisboa---raul-ferrao",
      "fado-de-coimbra---anonimo",
      "fado---helena-rolim-g.-barba",
      "fado---rosinha-dos-limoes-4-piano",
      "fado---cancao-do-mar-solidao---recorder",
    ],
  },
  {
    slug: "happy_birthday",
    midis: [
      "happy-birthday-song-in-jazz-arr.-by-jonny-may",
      "happy-birthday-tango",
      "happy-birthday-tango-variation",
      "happy-birthday-to-you---tango-version",
      "birthday-tango",
      "birthday-tango-2",
      "happy-birthday-waltz",
      "happy-birthday-but-it-s-a-bach-chorale",
      "chopin-ish-happy-birthday-to-you",
      "happy-birthday-3-part-vocals",
      "happy-birthday-variations-in-g-minor",
    ],
  },
  {
    slug: "scott_joplin",
    midis: [
      "Maple_Leaf_Rag_Scott_Joplin",
      "the-sycamore---scott-joplin---1904",
      "the-cascades---scott-joplin---1904",
      "leola-two-step---scott-joplin---1905",
      "gladiolus-rag---scott-joplin---1907",
      "sugar-cane---scott-joplin---1908",

      "silver-swan-rag---scott-joplin---1914---transcribed-by-richard-zimmerman",
      "elite-syncopations---scott-joplin---1902",
      "weeping-willow---scott-joplin---1903",
      "school-of-ragtime---scott-joplin---1908",
      "country_club_ragtime_two_step_scott_joplin_1909",
      "the_ragtime_dance_scott_joplin_1906_arrangement",
      "Pine_Apple_Rag_-_Scott_Joplin_-_1908.mscz",
      "the_entertainer_scott_joplin",
      "sunflower-slow-drag---joplin-and-hayden---1901",
      "reflection-rag---scott-joplin---1917",
      "rose-leaf-rag---scott-joplin---1907",
      "palm-leaf-rag---scott-joplin---1903",
      "search-light-rag---scott-joplin---c1907",
      "the-strenuous-life---scott-joplin---1902",
      "wall-street-rag---scott-joplin---1909",
      "peacherine-rag---scott-joplin---1901",
      "fig-leaf-rag---scott-joplin---1908",
      "magnetic-rag---scott-joplin---1914",
      "original-rags---scott-joplin---1899",
      "paragon-rag---scott-joplin---1909",
      "the-nonpareil---scott-joplin---1907",
      "the-chrysanthemum---scott-joplin---1904",
      "euphonic-sounds---scott-joplin---1909",
      "scott-joplin-s-new-rag---original-edition---1912",
      "scott-joplin-s-new-rag---revised-edition---c1914",
      "kismet-rag---joplin-and-hayden---1913",
      "felicity-rag---joplin-and-hayden---1911",
      "swipesy-cakewalk-1900",
      "the-easy-winners---scott-joplin---1901",
      "cleopha---scott-joplin---1902",
      "a-breeze-from-alabama---scott-joplin---1902",
      "something-doing---joplin-and-hayden---1903",
      "the-favorite---scott-joplin---1904",
      "pleasant-moments---scott-joplin---1909",
      "heliotrope-bouquet---joplin-and-chauvin---1907",
      "lily-queen---joplin-marshall---1907",
      "eugenia---scott-joplin---1905-6",

      "stoptime-rag---scott-joplin---1910",
      "the-rose-bud-march---scott-joplin---1905",
      "antoinette---scott-joplin---1906",
      "a-real-slow-drag---scott-joplin---1913",
      "march-majestic---scott-joplin---1902",
    ],
  },
  {
    slug: "gershwin_songbook",
    midis: [
      "oh-lady-be-good---george-gershwin-1924-public-domain-piano-voice-sheet-music-arrangement",
      "gershwin_swanee",
      "piano-i-ll-build-a-stairway-to-paradise",
      "stairway-to-paradise-lead-sheet-with-verse-and-lyrics",
      "fascinating-rhythm---george-gershwin-ira-gershwin-1924-piano-vocal-arrangement",
      "do-it-again---george-gershwin-buddy-desylva",
      "the-man-i-love---george-gershwin-ira-gershwin-1924-piano-vocal-arrangement",
    ],
  },
  {
    slug: "fats_waller",
    midis: [
      // https://musescore.com/user/58480/sets/3470906
      "asbestos---fats-waller---c1930",
      "alligator-crawl---fats-waller---1934",
      "handful-of-keys---fats-waller---1933",
    ],
  },
  {
    slug: "gershwin_preludes",
    midis: ["gershwin_prelude_1", "gershwin_prelude_2", "gershwin_prelude_3"],
  },
  {
    slug: "minecraft_c418",
    midis: [
      "minecraft---dead-voxel",
      "beginning-minecraft",
      "aria-math---c418-from-minecraft",
      "minecraft-calm",
      "c418---cat-from-minecraft---volume-alpha",
      "clark-minecraft",
      "moog-city-minecraft",
      "danny-minecraft",
      "living-mice-minecraft",
      "alpha-full---minecraft-credits-end-poem",
      "dry-hands-minecraft",
      "haggstrom-minecraft",
      "minecraft-title",
      "mice-on-venus-minecraft",
      "subwoofer-lullaby-minecraft",
    ],
  },
  {
    slug: "tom_lehrer",
    midis: [
      "the-elements---tom-lehrer",
      "the-masochism-tango---tom-lehrer-the-masochism-tango---tom-lehrer-the-masochism-tango",
      "tom_lehrer_i_got_it_from_agnes",
      "poisoning-pigeons-in-the-park---tom-lehrer",
      "wernher-von-braun---tom-lehrer---tom-lehrer",
      "the-wild-west-is-where-i-want-to-be---tom-lehrer",
      "be-prepared---tom-lehrer",
      "tom-lehrer---new-math-music",
      "fight-fiercely-harvard---tom-lehrer",
      "the-old-dope-peddler---tom-lehrer",
      "i-hold-your-hand-in-mine---tom-lehrer-i-hold-your-hand-in-mine",
      "vatican-rag",
      "i-wanna-go-back-to-dixie---tom-lehrer",
      "a-christmas-carol---tom-lehrer-a-christmas-carol",
      "national-brotherhood-week",
      "my-home-town---tom-lehrer",
      "te-amo---tom-lehrer",
      "whos-next---tom-lehrer",
      "there-s-a-delta-for-every-epsilon---tom-lehrer",
      "hanukah-in-santa-monica---tom-lehrer",
      "so-long-mom----tom-lehrer",

      "we-will-all-go-together-when-we-go---tom-lehrer", //corrupt?

      "the-subway-song---tom-lehrer", // 1915, Theodore Morse!
    ],
  },
  {
    // todo: link "ragtime treasures" together
    slug: "joseph_lamb",
    midis: [
      "the-alaskan-rag---joseph-f-lamb",
      "paramount-rag",
      "thoroughbred-rag-c-1960",
      "toad-stool-rag-c-1959",
      "chimes-of-dixie-c-1960",
      "cinders",
    ],
  },
  {
    slug: "ted_snyder",
    midis: ["the-sheik-of-araby-arr.-zez-confrey"],
  },
  {
    slug: "bts",
    midis: [
      "bts-bangtansonyeondan---i-need-u-suga-piano-full-solo",
      "bts-jungkook-bangtansonyeondan-jeonggug---still-with-you",
      "bts-bangtansonyeondan---fake-love",

      "spring-day---bts",
      "the-truth-untold---bts",
      "bts-bangtansonyeondan---dynamite-piano-version",
    ],
  },
  {
    slug: "homm",
    midis: [
      "heroes-of-might-and-magic-2--sorceress-town---paul-anthony-romero",

      "heroes-of-might-and-magic-iii---main-menu-theme",
      "heroes-of-might-and-magic-iii----waiting-theme",
      "heroes-of-might-and-magic-3---necropolis-town-theme",
      "heroes-of-might-magic-iii---tower-town-theme",
      "inferno-theme-by-paul-romero-from-heroes-of-might-and-magic-3",
      "heroes-of-might-magic-iii---fortress-town-theme",
      "heroes-of-might-magic-iii---castle-town-theme",

      "dirt-theme-hope---heroes-of-might-and-magic-iv---celtic-harp",
      "academy-order-theme---heroes-and-might-and-magic-iv",

      "haven-theme-piano-form-heroes-of-might-and-magic-v",

      "heroes-of-might-and-magic-vi-unknown-title",
    ],
  },
  {
    slug: "beauty_and_the_beast",
    midis: [
      "beauty-and-the-beast-prologue",
      "evermore---alan-menken-evermore-from-beauty-and-the-beast---alan-menken-piano-voice",
      "something-there",
      "if-i-can-t-love-her",
      "belle",
      "gaston",
      "tale-as-old-as-time---beauty-and-the-beast---alan-menken---piano-solo",
    ],
  },
];

const Corpus: React.FC<{ slug: string }> = ({ slug }) => {
  if (!slug)
    return (
      <div>
        {corpora.map(({ slug, midis }) => (
          <div>
            <Link to={`/corpus/${slug}`}>
              {slug.replace("_", " ")}{" "}
              <span style={{ color: "white", fontSize: "0.6em" }}>
                {midis.length}
              </span>
            </Link>
          </div>
        ))}
      </div>
    );

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
