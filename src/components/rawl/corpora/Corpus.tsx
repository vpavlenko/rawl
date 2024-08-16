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
    slug: "ryan_elder",
    midis: ["rick-and-morty-main-theme---ryan-elder"],
  },
  {
    slug: "giovanni_allevi",
    // https://musescore.com/user/77038780
    midis: [
      "amor-sacro---giovanni-allevi",
      "la-stanza-dei-giochi---giovanni-allevi",
      "come-sei-veramente-~-giovani-allevi",
      "flowers---giovanni-allevi",
      "aria-~-giovanni-allevi",
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
    // also https://musescore.com/sheetmusic?text=%D1%82%D0%B0%D0%BD%D0%B3%D0%BE&type=non-official
    // also https://musescore.com/sheetmusic?text=%E3%82%BF%E3%83%B3%E3%82%B4&type=non-official
    // also https://musescore.com/sheetmusic?text=%E6%8E%A2%E6%88%88&type=non-official
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
      "tango-lyubvi",

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
      "tango-lyubvi",
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
    slug: "bach_chorales",
    midis: [
      "ach-bleib-bei-uns-herr-jesu-christ",
      "ach-bleib-bei-uns-herr-jesu-christ---j.-s.-bach---german-phrasing",
      "ach-gott-erhor-mein-seufzen-bwv-254-and-original-setting",
    ],
  },
  {
    slug: "karen_khachaturian",
    midis: [],
  },
  {
    slug: "misc_bach",
    midis: ["bach-goldberg-variation-00-aria"],
  },
  {
    slug: "bach_french_suite_no2",
    midis: [
      "j.-s.-bach---sarabande-from-french-suite-no2-bwv-813",
      "bach-allemande-bwv-813-french-suite-ii",
    ],
  },
  {
    slug: "lucrecia_roces_kasilag",
    midis: [
      "fantasia---lucrecia-roces-kasilag",
      "prelude-etnika---piano-transcription",
      "luwalhati---lucrecia-r.-kasilag",
    ],
  },
  {
    slug: "ernesto_lecuona",
    midis: [
      "danza-lucumi---e.-lecuona-original",
      "la-comparsa---ernesto-lecuona",
      "siboney---ernesto-lecuona",
      "andalucia---ernesto-lecuona",
      "malaguena---ernesto-lecuona",
      "gitanerias",
    ],
  },
  {
    slug: "malaguena",
    midis: [
      "malaguena---ernesto-lecuona",
      "rumores-de-la-caleta-malaguena-albeniz",
      "ndeg-3---malaguena",
      "nuevo-metodo-pag.-20-malaguena---francisco-cimadevilla",
      "malaguena-nocturna---l-elegiaque-malaguena-nocturna",
      "malaguena-by-azpiazu",
      "malaguena-sarasate",
      "malaguena-salerosa",
    ],
  },
  {
    slug: "ennio_morricone",
    midis: [
      "ennio-morricone-chi-mai-from-le-professionnel-easy-piano-arr.-by-free-musickey",
      "playing-love---ennio-morricone",
      "deborah-s-theme-~-ennio-morricone",
      "la-califfa-ennio-morricone",
      "gabriel-s-oboe---ennio-morricone",
      "cinema-paradiso-morricone",
    ],
  },
  // 1883
  {
    slug: "charlie_astin",
    midis: ["in-the-gloaming-1883", "clide-polka-1883"],
  },
  // 1897, first three annotated, then just preserved
  {
    slug: "theo_a_metz",
    midis: [
      "a-hot-time-in-the-old-town-1897",
      "fiddling-silas-1899",
      "the-klondike-1897",
      "the-song-they-sang-at-santiago-1898",
      "indian-smoke-dance-1919",
      "walk-baby-walk-1897",
      "omene-1893",
      "give-cinda-the-cake-1898",
    ],
  },
  // 1907
  {
    slug: "king_kollins",
    midis: ["the-whizzer-1907", "the-twirler-1907"],
  },
  // 1917
  {
    slug: "frank_h_grey",
    midis: ["love-in-venice-1924", "valse-des-fleurs-1925"],
  },
  {
    slug: "yamato_kasai",
    midis: [
      "ender-lilies-quietus-of-the-knights---holy-land-save-ver.",
      "ender-lilies-quietus-of-the-knights---grudge-save-ver.",
      "ender-lilies-quietus-of-the-knights---the-white-witch",
      "the-witch-s-breath---ender-lilies",
      "a-nocturne-for-all---ender-lilies-ost",
      "ephemeral---yamato-kasai---klavier---mili-mag-mell-deemo",
    ],
  },
  {
    slug: "aj_weidt",
    midis: [
      "aj_weidt_the_colored_guards", // two banjos
      "aj_weidt_kaloola",
      "memelicanmanrag",
    ],
  },
  {
    slug: "scriabin",
    midis: ["24-preludes-op.11-no.1---a.-scriabin"],
  },
  {
    slug: "tadeusz_joteyko",
    midis: [
      "elegie-op.16-no.1---tadeusz-joteyko",
      "xi.-prelude-des-dur-op.-6-no-5---tadeusz-joteyko",
      "prelude-op.5-no6---tadeusz-joteyko",
      "prelude-op.7-no3---tadeusz-joteyko",
    ],
  },
  {
    slug: "leo_delibes",
    midis: [
      "valse---coppelia---piano-solo---arr.-leo-delibes",
      "flower-duet-from-lakme-by-leo-delibes-transcription-for-violin-and-piano",
      "messe-breve---leo-delibes-delibes-messe-breve-ssa-kyrie",
    ],
  },
  {
    slug: "gustave_tritant",
    midis: [
      "elevation---gustave-tritant",
      "communion-funebre---gustave-tritant",
      "elevation-funebre---gustave-tritant",
      "l-office-pratique-de-l-organiste---gustave-tritant",
    ],
  },
  {
    slug: "cesare_pugni",
    midis: [
      "la-esmeralda-ballet-variacao---cesare-pugni",
      "coda---cesare-pugni",
      "peasant-pas-de-deux-interpolated-variation---cesare-pugni",
      "la-schottische",
      "le-carnaval-de-venise-pas-de-deux-di-satanella---cesare-pugni---variazione-maschile",
    ],
  },
  {
    slug: "ahmed_adnan_saygun",
    midis: [
      "inci---ahmed-adnan-saygun",
      "ayse-m",
      "oyun---ahmed-adnan-saygun",
      "ruya---ahmed-adnan-saygun",
      "masal---ahmed-adnan-saygun",
      "ataturk-marsi---ahmed-adnan-saygun",
      "ninni---ahmed-adnan-saygun",
      "kocaman-bebek---ahmed-adnan-saygun",
      "horon-for-bb-clarinet-and-piano---ahmed-adnan-saygun",
      "afacan-kedi---ahmed-adnan-saygun",
    ],
  },
  {
    slug: "paul_mauriat",
    midis: [
      "toccata---paul-mauriat",
      "minuetto",
      "nocturne---paul-mauriat",
      "alouette---paul-mauriat",
      "love-is-blue---paul-mauriat",
      "ballade---paul-mauriat",
      "petite-melodie",
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
      "gladiolus-rag---scott-joplin---1907",
      "the-cascades---scott-joplin---1904",
      "sugar-cane---scott-joplin---1908",
      "leola-two-step---scott-joplin---1905",
      "the-sycamore---scott-joplin---1904",

      "silver-swan-rag---scott-joplin---1914---transcribed-by-richard-zimmerman",
      "elite-syncopations---scott-joplin---1902",
      "weeping-willow---scott-joplin---1903",

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

      "school-of-ragtime---scott-joplin---1908",
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
    slug: "alex_thorn",
    midis: [
      "piano-serenade-in-a-flat",
      "as-bold-as-brass-a-very-british-march-for-piano",
      "baroque-harpsichord",
      "cryin-in-the-rain-piano-solo",
    ],
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
  {
    slug: "tokyo_ghoul",
    midis: [
      "unravel-acoustic-ver-tokyo-ghoul-theishter-sheet-music-full-sheets",
      "tokyo-ghoul---glassy-sky-theishter-edit",
      "tokyo-ghoul-a-kisetsu-wa-tsugitsugi-shindeiku",
      "tokyo-ghoul---licht-und-schatten-akmigone-transcription",
      "tokyo-ghoul-a-ost---wanderers",
      "schmetterling---tokyo-ghoul-re-ep-7-bgm",
      "tokyo-ghoul-re-op--katharsis",
    ],
  },
  {
    slug: "alan_silvestri",
    midis: [
      "the-avengers-theme---piano",
      "forest-gump---main-title-feather-theme",
      "back-to-the-future-theme-song",
    ],
  },
  {
    slug: "deltarune",
    midis: [
      "deltarune-chapter-2-ost-toby-fox---my-castle-town-piano-solo",
      "attack-of-the-killer-queen---deltarune-chapter-2",
    ],
  },
  {
    slug: "mieczyslaw_weinberg",
    midis: ["vstuplenie-iz-m-f-vinni-puh-m.-vaynberg"],
  },
  {
    slug: "françois_couperin",
    midis: [
      "francois-couperin---les-barricades-mysterieuses",
      "le-rossignol-en-amour---francois-couperin",
    ],
  },
  {
    slug: "austin_wintory",
    midis: [
      "apotheosis-journey-ost---austin-wintory-thepandatooth-s-arrangement",
      "nascence-journey-main-theme",
      "monaco---what-s-yours-is-mine",
      "pdf-volibear-the-relentless-storm",
      "jokes-jokes-jokes",
      "journey-i-was-born-for-this---austin-wintory",
      "the-old-south-distillery",
    ],
  },
  // world pianists
  {
    slug: "darren_korb_hades",
    midis: ["on-the-coast---darren-korb-austin-wintory"],
  },
  {
    slug: "percy_grainger",
    midis: [
      "molly-on-the-shore",
      "spoon-river---percy-grainger",
      "country-gardens-for-brass-quintet",
    ],
  },
  {
    slug: "abdullah_ibrahim",
    midis: [
      "blue-bolero",
      "homecoming-song---abdullah-ibrahim",
      "mandela---abdullah-ibrahim--y8-african-music",
      "water-from-an-ancient-well---abdullah-ibrahim",
      "the-wedding---abdullah-ibrahim",
      "thaba-bosigo",
      "maraba-blue---abdullah-ibrahim",
    ],
  },
  {
    slug: "bahram_dehghanyar",
    midis: ["zireh-gonbadeh-kabood", "grand-mother", "aghaye-hekayati"],
  },
  {
    slug: "jerry_goldsmith",
    midis: [
      "star-trek-voyager-theme-piano-arrangement",
      "the-russia-house---jerry-goldsmith",
      "the-gremlin-rag-accordion",
      "king-solomon-s-mines---main-theme",
      "theme-from-hoosiers",
      "it-s-a-long-road-from-first-blood---jerry-goldsmith",
    ],
  },
  {
    slug: "eduard_artemyev",
    midis: [
      "sibirskiy-ciryulnik---eduard-artemev",
      "svoy-sredi-chuzhih-chuzhoy-sredi-svoih---eduard-artemev",
      "raba-lyubvi---eduard-artemev",
    ],
  },
  {
    slug: "vladimir_shainsky",
    midis: [
      "belye-korabliki-v.-shainskiy",
      "chemu-uchat-v-shkole----vladimir-shainskiy",
      "pesenka-krokodila-geny-iz-m-f-cheburashka---vladimir-shainskiy-perelozhenie-dlya-fortepiano-i-golosa",
      "kukla---v.-shainskiy",
    ],
  },
  {
    slug: "maksim_dunaevsky",
    midis: [
      "misyachniy-vals---i.-dunaievskiy",
      "polka---i.-dunaievskiy",
      "oy-cvite-kalina---i.-dunaievskiy",
      "uvertyura-do-k-f-diti-kapitana-granta---i.-dunaievskiy",
    ],
  },
  {
    slug: "prokofiev",
    midis: ["dance-of-the-knights"],
  },
  {
    slug: "gennady_gladkov",
    midis: [
      "pesnya-genialnogo-syshchika---gennadiy-gladkov",
      "duet-princessy-i-korolya---gennadiy-gladkov-duet-princessy-i-korolya",
      "pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki---gennadiy-gladkov-pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki-g.-gladkov",
      "prosnis-i-poy---gennadiy-gladkov",
      "tviy-poyizd---g.-gladkov",
      "proshchalna-pisnya---g.-gladkov",
      "farewell-song----g.-gladkov----easy-violin-and-piano",
      "pisnya-ostapa---g.-gladkov", // reharm diatonic -> V/
      "golovna-tema---g.-gladkov",
      "rio---g.-gladkov",
      "pritvornaya-pesnya-trubadura---gladkov",
      "shestvie-cortege",
      "tango-lyubvi",
      "a-mozhet-byt-vorona---g.-gladkov",
      "dzhentlmeny-udachi---g.-gladkov",
    ],
  },
  {
    slug: "mikael_tariverdiev",
    midis: [
      "malenkiy-princ-m.-tariverdiev",
      "vals-iz-ironii-sudby-ili-s-legkim-parom-the-waltz-from-the-irony-of-fate",
      "dvoe-v-kafe",
      "mne-nravitsya-chto-vy-bolny-ne-mnoy---mikael-tariverdie",
      "mgnoveniya---m.-tariverdiiev",
      "tihaya-muzyka-regtaym-no-9---m.-tariverdiev",
      "tariverdiev-sudba-rezidenta-prelyudiya",
      "po-ulice-moey---m.-tariverdiev",
      "snow-above-leningrad-sneg-nad-leningradom---mikael-tariverdiev",
      "pesnya-o-dalyokoy-rodine",
      "tvoy-golos---mikael-tariverdiev",
      "ne-zhaleyu-ne-zovu-ne-plachu",
      "pesnya-tartali",
      "na-tihoreckuyu-sostav-otpravitsya",
      "v-sobore---m.-tariverdiev",
      "ubil-ya-poemu---m.-tariverdiev",
      "mikael-tariverdiev-michael-tariverdiyev---nikogo-ne-budet-v-dome-no-one-will-be-at-home",
    ],
  },
  {
    slug: "bill_evans",
    midis: ["bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz"],
  },
  {
    slug: "jules_massenet",
    midis: [
      "thais-meditation-by-jules-massenet",
      "aragonesa---jules-massenet",
      "avril-est-amoureux---jules-massenet---arr.-for-flute-and-harp",
      "musique-pour-bercer-les-petits-enfants-lullaby-jules-massenet---for-melodica-and-harmonium",
      "elegie---jules-massenet---version-for-voice-cello-and-piano",
    ],
  },
  {
    slug: "taylor_swift",
    midis: [
      "cardigan---taylor-swift",
      "champagne-problems---taylor-swift",
      // willow - call stack size exceeded bug
      "evermore---taylor-swift-feat.-bon-iver",
      "love-story---taylor-swift-taylor-s-version",
      "tolerate-it---taylor-swift-intro-from-the-eras-tour",
      "no-body-no-crime---taylor-swift",
      "shake-it-off---taylor-swift",
      // "fearless---taylor-swift", - is it that song?
      "fearless---taylor-swift-2",
      "enchanted-taylor-s-version---taylor-swift",
      "forever-and-always---taylor-swift",
      "lover---shawn-mendes-taylor-swift",
      "blank-space---taylor-swift-easy-piano",
      "wildest-dreams---taylor-swift",
      "run-feat.-ed-sheeran-taylor-s-version-from-the-vault---taylor-swift-run-feat.-ed-sheeran-taylor-s-version-from-the-vault---flute-and-clarinet-duet",
    ],
  },
  {
    slug: "c_pop",
    // https://musescore.com/user/33589731
    midis: ["meng---tntshi-dai-shao-nian-tuan"],
  },
  {
    slug: "ttng",
    midis: [
      "ttng_26_is_dancier_than_4_tablature",
      "ttng---empty-palms-tablature",
    ],
  },
  {
    slug: "nihoshika",
    midis: [
      "bu-wu-nizhao-rasaretaguang---nihosika-heyani-terasareta-hikari---nihoshika",
      "reinotubuyaki---nihosika",
    ],
  },
  {
    slug: "joel_peters",
    midis: ["trading-eights", "frostfang-s-theme", "waterfall---ec1ipze"],
  },
  {
    slug: "lena_raine_minecraft",
    midis: [
      "lena-raine---rubedo",
      "pigstep",
      "otherside---lena-raine-piano-solo",
    ],
  },
  {
    slug: "lena_raine_celeste",
    midis: [
      "little-goth---celeste",
      "scattered-and-lost---celeste",
      "quiet-and-falling---celeste",
      "awake-celeste-ost",
      "resurrections---lena-raine",
    ],
  },
  {
    slug: "mamomo",
    midis: [
      "xiu-ti---mamomo",
      "xxd44nature",
      "summer-echoes---mamomo",
      "silver----bai-yin",
      "huan-chuang-noidea---prayer",
      "sengokuhara_02",
    ],
  },
  {
    slug: "national_anthems",
    midis: [
      "zimbabwe-national-anthem",
      "togo-national-anthem",
      "nigeria-national-anthem",
      "lesotho-national-anthem",
      "burundi-national-anthem",
      "chad-national-anthem",
      "ghana-national-anthem",
      "algeria-national-anthem",
    ],
  },
  {
    slug: "debussy",
    midis: [
      "arabesque-l.-66-no.-1-in-e-major",
      "estampes-i-pagodes----debussy",
      "valse-romantique-claude-debussy",
      "petite-suite-for-piano-four-hands---claude-debussy",
      "debussy-claude---la-plus-que-lente",
      "the-little-nigar-le-petit-negre---debussy",
      "la-cathedrale-engloutie---debussy",
      "debussy---suite-bergamasque-4-passepied",
      "debussy---images-reflets-dans-leau",
      "claude-debussy---la-fille-aux-cheveux-de-lin",
    ],
  },
  {
    slug: "autumn_leaves",
    midis: [
      "autumn-leaves",
      "autumn-leaves-les-feuilles-mortes",
      "autumn-leaves---jazz-piano-solo-tutorial", // need more remeasuring
      "bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz",
    ],
  },
  {
    slug: "komitas",
    midis: [
      "garown-a-garun-a-spring-clarinet-piano-komitas",
      "garown-a-spring---komitas",
      "chinar-es-komitas",
      "ounabi-ndeg2-des-6-danses-armeniennes-de-komitas",
      "alagyas-alaghiyssh-clarinettepiano-komitas-komitas",
      "hov-arek---komitas",
      "hoy-nazan---komitas",
      "a.04-01-havadarim",
      "saren-kowga-jowxtm-goc",
      "kaqavik",
      "yar-jan-ari---komitas-vardapet",
      "a.03-01-vorti-assdoudzo-komitas",
    ],
  },
  {
    slug: "lionel_rusquet",
    midis: [
      "le-monde-des-graves-piano",
      "reflet", // ideal relative minor/major sequence
    ],
  },
  {
    slug: "modern_composers_of_single_pieces",
    midis: ["gray"],
  },
  {
    slug: "stephen_foster",
    midis: [
      "stephen-foster---hard-times-come-again-no-more",
      "jeanie-with-the-light-brown-hair---stephen-foster",
      "old-black-joe-by-stephen-foster",
      "beautiful-dreamer---stephen-foster",
      "soiree-polka---stephen-c.-foster---1850",
      "ah-may-the-red-rose-live-alway---stephen-foster-1850", // Indian Guest
      "some-folks-like-to-sigh---s-foster-arr.-p.r.-brass-quintet",
      "gentle-annie",
      "beyond-the-mystic-river---stephen-c.-foster",
      "445-friendship-with-jesus",
      "old-dog-tray",
      "weep-no-more---stephen-c.-foster",
      "old-folks-at-home---theme-and-variations-by-stephen-foster",
      "oh-susanna",
      "gone-from-my-heart---stephen-c.-foster",
      "angelina-baker-by-stephen-c.-foster-not-quite-angeline-the-baker",
      "my-old-kentucky-home---stephen-collins-foster",
      "slumber-my-darling-by-stephen-foster",
    ],
  },
  {
    slug: "possibly_tango",
    midis: ["veinte-anos", "rio---g.-gladkov"],
  },
  {
    slug: "gesualdo",
    midis: [
      "moro-lasso-al-mio-duolo---gesualdo",
      "belta-poi-che-t-assenti---carlo-gesualdo",
    ],
  },
  {
    slug: "rimsky-korsakoff",
    midis: ["song-of-the-indian-guest"],
  },
  {
    // https://musescore.com/user/68853055
    // also see https://musescore.com/sheetmusic?text=%CE%BC%CE%BF%CF%85%CF%83%CE%B9%CE%BA%CE%AE&type=non-official
    // https://musescore.com/sheetmusic?text=%CE%97&type=non-official
    slug: "greek_music",
    midis: [
      "m.-theodorakis---ena-to-helidoni---greek-music-001",
      "g.-katsaros---kathe-limani-kai-kaimos---greek-music-002",
      "m.-loizos---o-dromos---greek-music-003",

      "m.-theodorakis---omorfi-poli---greek-music-036",
      "a.-kaldaras---nyhtose-horis-feggari---greek-music-037",
      "m.-hatzidakis---efta-tragoydia-tha-soy-po---greek-music-038",
      "g.-katsaros---pame-gia-upno-katerina---greek-music-039",
      "g.-spanos---aspra-karavia---greek-music-040",
      "g.-mitsakis---palamakia---greek-music-041",
      "v.-tsitsanis---eimaste-alania---greek-music-042",
      "pyx-lax---de-tha-dakryso-pia-gia-sena---greek-music-043",
      "n.-portokalogloy---to-kalokairaki---greek-music-044",
      "p.-sidiropoylos---o-mpampis-o-floy---greek-music-045",
      "orf.-peridis---fotovolida---greek-music-046",
      "th.-mikroytsikos---enas-negros-thermastis-apo-to-tzimpoyti---greek-music-047",
      "m.-loizos---koytsi-kithara---greek-music-048", // a capella thirds
      "g.-spanos---mia-agapi-gia-to-kalokairi---greek-music-049",
      "h.-nikolopoylos---hronia-helidonia---greek-music-050",
      "m.-hiotis---thessaloniki-moy---greek-music-051",
      "m.-theodorakis---vrehei-sti-ftohogeitonia---greek-music-052",
      "v.-tsitsanis---horisame-ena-deilino---greek-music-053",
      "g.-zampetas---agonia---greek-music-054",
      "s.-xarhakos---stoy-thoma---greek-music-055",
      "g.-papaioannoy---vadizo-kai-paramilo---greek-music-056",
      "g.-mpithikotsis---toy-votanikoy-o-magkas---greek-music-057",
      "v.-tsitsanis---to-vapori-ap-tin-persia---greek-music-058",
      "a.-kaldaras---min-perimeneis-pia---greek-music-059",
      "m.-hiotis---perasmenes-moy-agapes---greek-music-060",
      "g.-zampetas---stalia-stalia---greek-music-061",
      "h.-nikolopoylos---ston-aggelon-ta-mpoyzoykia---greek-music-062",
      "m.-plessas---ti-soy-kana-kai-pineis---greek-music-063",
      "s.-koygioymtzis---to-kokkino-foystani---greek-music-064",
      "t.-moysafiris---o-taxitzis---greek-music-065",
      "g.-hatzinasios---me-lene-giorgo---greek-music-066",
      "g.-spanos---tha-me-thymitheis---greek-music-067",
      "m.-tokas---exartatai---greek-music-068", // demo minor chord
      "h.-nikolopoylos---yparho---greek-music-069", // phrygian
      "m.-loizos---ah-helidoni-moy---greek-music-070",
      "g.-katsaros---ta-kythira-pote-de-tha-ta-vroyme---greek-music-071", // typo in m.8
      "p.-katsimihas---an-yparhei-logos---greek-music-072", // hijaz bvi-I7 feel of iv-V7-i
      "t.-morakis---se-magika-nisia---greek-music-073",
      "s.-xarhakos---to-dihty---greek-music-074",
      "g.-zampetas---ti-na-ftaiei---greek-music-075",
      "h.-nikolopoylos---to-agrioloyloydo---greek-music-076",
      "m.-hatzidakis---to-vals-ton-hamenon-oneiron---greek-music-077",
      "d.-savvopoylos---dimosthenoys-lexis---greek-music-078",
      "s.-xarhakos---mpoyrnovalia---greek-music-079",
      "t.-moysafiris---kane-kati-na-haso-to-treno---greek-music-080",
    ],
  },
  {
    slug: "jazz_standards",
    midis: [
      "recorda-me-no-me-esqueca",
      "all-the-things-you-are",
      "all-the-things-you-are-2",
      "all-the-things-you-are-lead-sheet---jerome-kern-oscar-hammerstein-ii",
      "all-the-things-you-are---reharmonized---jerome-kern",
      "solo-transcription-all-the-things-you-are---paul-desmond",
      "all-the-things-you-are-guitar-chord-melody",
      "my-funny-valentine-lead-sheet-with-lyrics",
      "tea-for-two---vincent-youmans-and-irving-caesar-1924-piano-voice-sheet-music-arrangement",
      "tea-for-two-er-ren-deocha-wo---vincent-youmans",
      "straight-no-chaser-thelonious-monk",
      "blue-monk-piano",
      "round-midnight---thelonious-monk",
    ],
  },
  {
    // https://musescore.com/user/24069/sets/4869434
    slug: "rachmaninoff",
    midis: ["rachmaninoff-piano-concerto-no.-2-1st-mvmt.-arr.-for-2-pianos"],
  },
  {
    slug: "valentin_silvestrov",
    midis: [
      "five-pieces-op.-306-no.-4-waltz",
      "abschiedsserenade-ii-farewell-serenade---valentin-silvestrov",
      "english-serenades-op.-46-no.-1---valentin-silvestrov",
      "english-serenades-op.-46-no.-4---valentin-silvestrov",
    ],
  },
  {
    slug: "george_pelecis",
    midis: [
      "all-in-the-past---georgs-pelecis",
      "plaukstosais-jasmins---georgs-pelecis",
    ],
  },
  {
    slug: "marco_beltrami",
    midis: [
      "rosemary-s-theme-the-giver",
      "rosemary-s-waltz",
      "st.-estes-reform-school-extended---marco-beltrami-venom-let-there-be-carnage",
      "le-mans-66",
      "theme-from-world-war-z---marco-beltrami-theme-from-world-war-z--isolated-system",
    ],
  },
  {
    slug: "catherine_rollin",
    midis: [
      "french-movie-waltz---catherine-rollin",
      "moonlight-nocturne---catherine-rollin",
      "sneaky-skeleton---catherine-rollin",
      "blues-train---catherine-rollin-catherine-rollin---blues-train-jazz",
      "witches-brew---catherine-rollin",
    ],
  },
  {
    slug: "martha_mier",
    midis: [
      "to-catch-a-dream---martha-mier",
      "peppermint-rag---martha-mier",
      "downright-happy-rag",
      "just-struttin-along",
      "surfboard-boogie",
      "enchanted-waterfall---martha-mier",
      "baroque-expression---martha-mier",
    ],
  },
  {
    slug: "scary",
    midis: [
      "fur-elise-but-elise-is-scary",
      "funeral-march---f.-chopin-halloween-scary-version---easy-to-intermediate",
    ],
  },
  {
    slug: "carlos_chavez",
    midis: ["diez-preludios-para-piano---carlos-chavez", "ponchito-al-hombro"],
  },
  {
    slug: "anoushiravan_rohani", // pure harmonic minor
    midis: [
      "il-coure-mio---anoushiravan-rohani",
      "maadar",
      "gol-e-sang---anoushiravan-rohani",
      "aziz-joon---anoushiravan-rohani",
      "soltaan-e-ghalbhaa---anoushiravan-rohani",
      "potpurri---anoshirvan-rohani",
      "saraab---anoushiravan-rohani",
      "bahaneh",
      "queen-of-hearts",
    ],
  },
  {
    slug: "alan_hovhaness",
    midis: [
      "mountain-lullaby---jealous-of-the-birds-piano-solo",
      "prayer-of-st-gregory---alan-hovhaness",
      "symphony-no.-2-mysterious-mountain---alan-hovhaness-mysterious_mountain_iii",
    ],
  },
  {
    slug: "duke_ellington",
    midis: [
      "solitude---duke-ellington",
      "solitude---duke-ellington-eddie-de-lange-and-irving-mills-piano-version",
      "solitude---duke-ellington-as-played-by-roland-hanna",
    ],
  },
  {
    slug: "rhythm_changes",
    midis: [
      "oleo---sonny-rollins",
      "cottontail_sax_soli",
      "cotton-tail---duke-ellington",
      "cotton-tail---duke-ellington-musescore3",
      "cotton-tail",
      "dexterity",
      "dexterity---charlie-parker",
      "fungii-mama---richard-blue-mitchell",
    ],
  },
  {
    slug: "i_play",
    midis: [
      "overcooked---menu-theme",
      "overcooked-2-medley",
      "overcooked-medley",
    ],
  },
  {
    slug: "l_m_gottschalk",
    midis: [
      "grande-tarantelle---gottschalk-1872",
      "the-dying-swan-1870",
      "souvenirs-d-andalousie-1855",
      "morte-l.-m.-gottschalk-in-memoriam", // corrupted grid somehow
      "bamboula-1849",
      "the-banjo-1855",
      "tremolo---gottschalk-1868",
      "le-bananier-chanson-negre-de-l.m-gottschalk-1846",
      "souvenir-de-porto-rico-200-i.e.-206-follower-special",
      "god-save-the-queen---gottschalk-c.1860",
    ],
  },
  {
    slug: "jean_henri_ravina",
    midis: [
      "etude---ravina-no.-22-op.-50---h-moll",
      "petit-bolero-op.-62---jean-henri-ravina",
      "nocturne-op.112---jean-henri-ravina",
    ],
  },
  {
    slug: "joe_zawinul",
    midis: [
      "birdland-piano",
      "mercy-mercy-mercy---joe-zawinul",
      "mercy-mercy-mercy---joe-zawinul-2",
      "boogie-woogie-waltz-zawinul-leadsheet",
      "walk-tall---joe-zawinul",
      "125th-street-congress-zawinul-leadsheet",
      "cucumber-slumber-leadsheet-johnson-zawlinul",
    ],
  },
  {
    slug: "tonal_stretch",
    midis: [
      "jurassic-park---journey-to-the-island",
      "na-krilah-vitru---a.-minov",
      "narodniy-tanec---miroslav-skorik",
    ],
  },
  {
    slug: "aaron_copland",
    midis: [
      "copland_s_third_symphony_first_movement",
      "appalachian-spring---aaron-copland-appalachian-spring",
      "hoe-down---aaron-copland",
      "at-the-river-g",
    ],
  },
  {
    slug: "john_williams",
    midis: [
      "jurassic-park-theme---john-williams-jurrasic-park-theme---john-williams",
      "somewhere-in-my-memory-by-john-williams",
      "theme-from-schindler-s-list---piano-solo",
      "jurassic-park---journey-to-the-island", // what's going on?
      "e.t.-end-credits-piano-solo",
      "e.t.-theme---ywcm",
      "jazz-autographs---john-williams-jazz-autographs-from-the-terminal---john-williams",
      "holiday-flight-from-home-alone-2---john-williams-joni-leiman-solo-piano-transcription",
      "jaws-theme",
      "the-tale-of-viktor-navorski-john-williams",
      "catch-me-if-you-can-sax-solo",
      "nbc-sunday-night-football-theme",
      "the-fabelmans---john-williams",
    ],
  },
  {
    slug: "john_philip_sousa",
    midis: [
      "the-liberty-bell-march---john-philip-sousa---1893",
      "semper-fidelis-piano-john-philip-sousa",
      "the-stars-and-stripes-forever--john-f-sousa---arr.-v-horowitz",
    ],
  },
  {
    slug: "chick_corea",
    midis: [
      "spain---chick-corea",
      "children-s-song-no.-7---chick-corea",
      "children-s-song-no.-6",
      "children-s-song-2",
      "children-s-song-no.-5",
    ],
  },
  {
    slug: "dennis_alexander",
    midis: [
      "reflections-by-dennis-alexander",
      "titanium_toccata-50",
      "appaloosa-spirit---dennis-alexander",
      "going-places---dennis-alexander",
      "toccate---dennis-alexander-.",
      "valse-romantique-sriram",
      "grumpy-old-witch---dennis-alexander",
      "nocturne-in-e-flat-major---dennis-alexander",
    ],
  },
  {
    slug: "manfred_schmitz",
    midis: [
      "manfred-schmitz---kleine-pop-romanze-short-pop-romance",
      "barkarole---manfred-schmitz",
      "zimniy-vecher-winter-evening---manfred-shmitc-manfred-schmitz",
      "am-abend---manfred-schmitz",
      "elegie---manfred-schmitz",
      "mickey-mouse---manfred-schmitz", // rag
      "andrea---manfred-schmitz",
      "for-linda-king---manfred-schmitz",
      "manfredschmitzunpeutriste",
      "old-movie-man---manfred-schmitz",
      "bagatelle---manfred-schmitz",
      "romance-melancolique---manfred-schmitz-easy",
      "praerie-song---manfred-schmitz",
      "episode---manfred-schmitz",
      "spieluhr-serenade---manfred-schmitz",
      "poetische-skizze---manfred-schmitz",
      "prelude---manfred-schmitz",
    ],
  },
  {
    slug: "ignacy_feliks_dobrzynski",
    midis: [
      "feliks-dobrzynski---farewell-nocturne",
      "nocturne-op.21-no1---ignacy-feliks-dobrzynski",
      "nocturne-in-f-minor-op.24-no.1---ignacy-feliks-dobrzynski",
    ],
  },
  {
    slug: "ignacy_jan_paderewski",
    midis: [
      "elegy-op.4---ignacy-jan-paderewski",
      "miscellanea-op.16---ignacy-jan-paderewski-no.4-nocturne",
      "piano-concerto-op.17---ignacy-jan-paderewski",
      "ignacy-jan-paderewski-sarabande-op.-14-no-2",
    ],
  },
  {
    slug: "nikolay_zubov",
    midis: [
      "ne-uhodi-pobud-so-mnoyu-don-t-go-stay-with-me-romance",
      "o-ni-nemaie-mriyi---m.-zubov",
      "poglyad-tvoyih-chornih-ochey---m.-zubov",
    ],
  },
  {
    slug: "mykola_mozgovyy",
    midis: [
      "minaie-den-minaie-nich---mikola-mozgoviy",
      "moya-zemlya---mikola-mozgoviy",
      "zacharuy-nas-lyubov---mikola-mozgoviy",
      "nazvi---m.-mozgoviy",
    ],
  },
  {
    slug: "myroslav_skoryk",
    midis: [
      "melodiya-lya-minor-dlya-skripki-i-fortepiano---m.-skorik",
      "namalyuy-meni-nich---m.-skorik",
      "listok-do-albomu---miroslav-skorik",
      "narodniy-tanec---miroslav-skorik",
      "zhartivliva-p-iesa---miroslav-skorik",
      "sini-ochi---miroslav-skorik",
      "nav-yazliviy-motiv---miroslav-skorik",
      "v-narodnomu-stili---miroslav-skorik",
      "tanec-iz-guculskogo-triptiha",
    ],
  },
  {
    slug: "moritz_moszkowski",
    midis: [
      "moszkowski---la-jongleuse-op.52-no.4",
      "tarentelle-10-pieces-mignonnes-op.-77-no.-6-m.-moszkowski",
      "spanish-dance---moritz-moszkowski",
      "moszkowski---etincelles-op.36-no.6",
    ],
  },
  {
    slug: "platon_mayboroda",
    midis: [
      "bili-kashtani---platon-mayboroda",
      "kiyivskiy-vals---p.-mayboroda",
      "ridna-mati-moya-pisnya-pro-rushnik---p.-mayboroda",
    ],
  },
  {
    slug: "yaroslav_kis",
    midis: ["liricheskiy-vals---yaroslav-kis"],
  },
  {
    slug: "yuriy_zubay",
    midis: [
      "babusya-yagusya---yu.-zubay",
      "osinnya-pisnya---yuriy-zubay",
      "koncertino---yu.-zubay",
    ],
  },
  {
    slug: "loginvovchyk_single",
    midis: [
      "na-krilah-vitru---a.-minov",
      "dobriy-vechir-dole---o.-pushkarenko",
    ],
  },
  {
    slug: "valery_zubkov",
    midis: [
      "vozvrashchenie---v.-zubkov-return---v.-zubkov",
      "gypsy-v.-zubkov-cygan-v.-zubkov", // same?
    ],
  },
  {
    slug: "john_field",
    midis: [
      "nocturne-no.5---h.37---john-field---edited-by-liszt",
      "nocturne-no.1---field",
      "john-field-nocturne-no.-12",
    ],
  },
  {
    slug: "fuzzy",
    midis: [
      "julenat",
      "en-gammel-knark---gamle-er-unge-der-er-blevet-aeldre",
      "en-by-i-provinsen-mus3",
    ],
  },
  {
    slug: "ebbe_raun",
    midis: [
      "melodien-som-evert-taube-aldrig-skrev",
      "noget-om-mit-hjerterum",
      "ingen-er-evig-ung",
    ],
  },
  // barbershop
  {
    slug: "ringmasters",
    midis: [
      "kung-liljekonvalje",
      "you-ll-never-walk-alone",
      "between-the-devil-and-the-deep-blue-sea",
    ],
  },
  {
    slug: "white_star_line_1912",
    // https://musescore.com/user/64608175/sets/7661602
    midis: [
      "the-quaker-girl-valse---lionel-monckton-carl-kiefert-1910", // iiø-V->V7/V
      "barber-of-seville-overture",
      "overture-to-poet-and-peasant---franz-von-suppe-piano-reduction-solo",
    ],
  },
  {
    // https://musescore.com/user/24069/sets/4868382
    slug: "tchaikovsky",
    midis: [
      "trepak-russian-dance---tchaikovsky---piano-transcription",
      "dance-of-the-reed-flutes-the-nutcracker-suite---tchaikovsky",
      "chinese-dance---the-nutcracker-suite---peter-tchaikovsky",
      "tchaikovsky-waltz-of-the-flowers-from-the-nutcracker-piano-4-hands",
    ],
  },
  {
    // https://musescore.com/user/24069/sets/4868456
    slug: "wagner",
    midis: [
      "wagner-siegfried-s-funeral-march-from-gotterdammerung-piano-solo",
      "wagner-elsa-s-procession-to-the-cathedral-from-the-opera-lohengrin-piano-solo",
      "wagner_tannhauser_overture_piano_solo",
    ],
  },
  {
    slug: "chopin_24_preludes",
    midis: [
      "prelude-opus-28-no.-1-in-c-major",
      "prelude-opus-28-no.-2-in-a-minor",
    ],
  },
  {
    slug: "grieg_lyric_pieces",
    midis: ["grieg_arietta_yaskawa", "grieg_lyric_2_waltz_yaskawa"],
  },
  {
    slug: "kaijura_yuki",
    midis: ["nara-no-kyoukai-vol.-2---m01"],
  },
  {
    slug: "jacob_axel_josephson",
    midis: ["albumblad"],
  },
  {
    slug: "christian_hymns_worldwide",
    midis: ["karibu-na-bwana"],
  },
  {
    slug: "medleys",
    midis: ["seru-giran-medley---charly-garcia"],
  },
  {
    slug: "medorei",
    midis: [
      "zhao-he-aidorumedore", // Showa Era J-Pop Idol Medley
    ],
  },
  {
    slug: "mihail_krug",
    midis: ["prihodite-v-moy-dom", "fraer---mihail-krug", "kolshchik"],
  },
  {
    slug: "udo_jurgens",
    midis: [
      "griechischer-wein---udo-jurgens-griechischer-wein---udo-jurgens",
      "griechischer-wein---udo-jurgens",
      "zehn-nach-elf-udo-jurgens-piano-cover",
      "vielen-dank-fur-die-blumen---udo-jurgens",
      "ein-ehrenwertes-haus---udo-jurgens",
    ],
  },
  {
    slug: "geoffrey_gregoire_kargmax",
    midis: [
      "oriental-breath",
      "menuet-en-mib-mineur",
      "espieglerie-grazioso-entre-violon-et-piano-mi-m",
    ],
  },
  {
    slug: "emmerich_kalman",
    midis: [
      "the-tercet-from-die-bajadere-by-emmerich-kalman-tercet-iz-operetty-bayadera-i.-kalmana",
      "grafin-mariza.-no-7a-komm-zigany---emmerich-kalman",
      "die-zirkusprinzessin---emmerich-kalman-reminiszenz_nr.15a_die-zirkusprinzessin_emmerich-kalman",
      "die-herzogin-von-chicago-nr.1a---emmerich-kalman",
      "i-still-can-dream---emmerich-kalman",
      "throw-me-a-rose---emmerich-kalman-throw-me-a-rose",
      "grafin-mariza.-no-3-wenn-es-abend-wird---emmerich-kalman-wenn-es-abend-wird",
    ],
  },
  {
    slug: "vicenzo_piano",
    midis: [
      "winter---lucia-salieri-vicenzo-piano",
      "letter-to-my-mother---vicenzo-piano",
      "introspection---vicenzo-piano",
      "day-off---vicenzo-piano",
      "awakening---vicenzo-piano",
      "farewell---vicenzo-piano",
      "the-golden-waltz---vicenzo-piano",
      "the-midnight-waltz---vicenzo-piano",
      "a-dream-i-had---vicenzo-piano",
      "interstellar---vicenzo-piano",
    ],
  },
  {
    slug: "todd_owen",
    midis: [
      "leaves-upon-tess",
      "at-the-klutzy-ball",
      "backpack-quest",
      "when-i-am-dust-in-arcadia",
      "sincerest-betrayal",
    ],
  },
  {
    slug: "SIX",
    midis: [
      "heart-of-stone-from-six-the-musical",
      "six-the-musical---broadway-six-medley",
    ],
  },
  {
    slug: "xix_century_russian_romance",
    midis: [
      "no-ya-vas-vse-taki-lyublyu...-nevertheless-i-love-you...---russian-romance",
    ],
  },
  {
    slug: "bebu_silvetti",
    midis: [
      "mexico-de-noche",
      "quiero-amanecer-con-alguien---daniela-romo",
      "melissa---bebu-silvetti", // canon in D
      "bebu-silvetti---piano",
    ],
  },
  {
    slug: "early_20th_century_easy_american",
    midis: ["in-the-garden---c.-austin-miles"],
  },
  {
    // https://musescore.com/user/19710/sets/3559241
    slug: "pictures_at_the_exhibition",
    midis: [
      "promenade-i",
      "gnomus",
      "promenade-ii",
      "il-vecchio-castello",
      "promenade-iii",
      "tuileries-dispute-d-enfants-apres-jeux",
      "bydlo",
    ],
  },
  {
    // https://www.discogs.com/release/17759461-Various-%D0%A8%D0%B5%D0%B4%D0%B5%D0%B2%D1%80%D1%8B-%D0%9A%D0%BB%D0%B0%D1%81%D1%81%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B9-%D0%9C%D1%83%D0%B7%D1%8B%D0%BA%D0%B8-%D0%9A%D0%BE%D0%BB%D0%BB%D0%B5%D0%BA%D1%86%D0%B8%D1%8F-2-%D0%92%D1%8B%D0%BF%D1%83%D1%81%D0%BA-5
    // https://musescore.com/user/12163676
    slug: "popular_classics",
    midis: [
      "valse---coppelia---piano-solo---arr.-leo-delibes",
      "le-carnaval-des-animaux---aquarium",
      "hungarian-march---hector-berlioz",
      "hungarian-dance-no-5-in-g-minor",
      "waltz-no.-11-in-g-flat-major-op.70-no.1---frederic-chopin",
      "swan-lake-op.-20-act-iii-no.-20-danse-hongroise-hungarian-dance-czardas",
      "funiculi-funicula",
      "chopin---waltz-no.-1-in-d-flat-major-op.-64", // harmonic prototype for Scott Joplin
      "grand-march-from-the-opera-aida-by-giuseppe-verdi",
      "danse-macabre-opus-40-s.-555",
      "minuet-from-music-for-the-royal-fireworks---georg-friedrich-handel",
      "glinka---the-lark-from-a-farewell-to-saint-petersburg-no.-10",
      "lyapunov-reverie-du-soir-op.3",
      "thema-aus-die-moldau---b-smetana-s-sitnikava",
      "fantasia-on-greensleeves---ralph-vaughan-williams",
      "der-flohwalzer",
      "stanley-myers---cavatina-arranged-for-piano",
    ],
  },
  {
    slug: "bo_burnham",
    midis: ["welcome-to-the-internet---bo-burnham-s-inside"],
  },
  {
    slug: "three_part_harmony",
    midis: ["yksin-op.29b-no.4---toivo-kuula", "ekialde-dantza"],
  },
  {
    slug: "poulenc",
    midis: ["poulenc-melancolie-piano-solo"],
  },
  {
    slug: "chinese",
    midis: ["han-gong-chun-li-chun-ri---song-yu-ning", "shan-zhi-gao---song"],
  },
  {
    slug: "brad_mehldau",
    midis: ["anthropology---brad-mehldau"],
  },
  {
    // https://musescore.com/user/24069/sets/5098783
    slug: "dvorak",
    midis: [
      "Symphony_No9_From_The_New_World_1st_movement_for_piano_solo_",
      "Symphony_No9__From_The_New_World__2nd_movement",
      "Symphony_No.9_From_The_New_World_3rd_movement_Scherzo",
      "Symphony_No9_From_The_New_World_4th_movement__Z_Novho_Svta",
    ],
  },
  {
    // https://musescore.com/user/19710/sets
    slug: "beethoven_sonatas",
    midis: [
      "beethoven---sonata-in-f-minor-op.2-no.1-movement-i",
      "Sonate_No._14_Moonlight_1st_Movement",
      "moonlight_sonata_ludwig_van_beethoven_piano_solo",
      "Sonate_No._14_Moonlight_3rd_Movement",
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
              {slug.replace(/_/g, " ")}{" "}
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
