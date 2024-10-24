// Comments are for Yiruma's "First Love".
// I skip "14 I… 48:33" since it's basically track 1 with added violin.
// For "05 Passing By 15:17", "09 Time Forgets… 29:52" and "15 Farewell 52:45"
// I use versions without a cello, since it's doubling a piano melody anyways.

type Corpora = {
  slug: string;
  midis: string[];
};

export const corpora: Corpora[] = [
  {
    slug: "yiruma_misc",
    midis: [
      "yiruma_27_may",
      "yiruma_chaconne",
      "yiruma_do_you",
      "yiruma_fairy_tale",
      "yiruma_if_i_could_see_you_again",
      "yiruma_its_your_day",
      "yiruma_kiss_the_rain_easy",
      "yiruma_love_me",
      "yiruma_love_me_easy",
      "yiruma_maybe",
      "yiruma_prelude_in_g_minor",
      "yiruma_reason",
      "yiruma_reminiscent",
      "yiruma_river_flows_in_you_easy",
      "River_Flows_In_You",
      "yiruma_room_with_a_view",
      "yiruma_spring_time",
      "yiruma_wait_there",
      "yiruma_when_the_love_falls",
      "Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019",
    ],
  },
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
    slug: "tomohito_nishiura",
    midis: ["professor-layton-s-theme---piano"],
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
    slug: "habanera",
    midis: [
      "la-cubana-danza-habanera-1850-de-florencio-lahoz",
      "habanera---pascual-roch-1864---1921",
      "la-paloma-habanera",
      "habanera---bartolome-calatayud",
      "soledad-.-habanera-par-ignazio-cervantes",
      "emilia-habanera-pour-guitare-a.alba",

      "piece-en-forme-de-habanera",
    ],
  },
  {
    slug: "ernesto_nazareth",
    midis: [
      "brejeiro---ernesto-nazareth",
      "tango-habanera-vers-1925-by-ernesto-nazareth",
      "apanhei-te-cavanquinho---ernesto-nazareth",
    ],
  },
  {
    slug: "georgian",
    midis: [
      "moxevis-k-alo-t-inao",
      "c-angala-da-gogona",
      "t-u-ase-turp-a-iqavi",
      "nu-giqors-k-alav",
      "mival-guriashi",
      "kintouri",
    ],
  },
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

      "tango-de-la-muerte",
      "tango-pour-claude---richard-galliano",
      "tango-from-schnittke-s-concerto-grosso-1",

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
      "tango-do-k-f-12-stulev---o.-zacepin",
      "underground_tango_goran_bregovic_string_quartet",
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
    slug: "peter_mcconnell",
    midis: [
      "plants-vs-zombies-2-modern-day-piano-transcription",
      "heartstone-pull-up-a-chair-piano",
      "pvz2-ancient-egypt",
      "pvz2-modern-day---ultimate-battle---peter-mcconnell",
      "wild-west-main-theme",
      "wip-plants-vs-zombies-garden-warfare-2---infinity-time-ost-only-piano---peter-mcconnell",
      "neon-mixtape-tour---choose-your-seeds",
      "swanky-maximo---grim-fandango",
      "plants-vs-zombies-2-ballad-jam",
    ],
  },
  {
    slug: "ari_pulkkinen",
    midis: [
      "angry-birds-theme---ari-pulkkinen-angry-birds-theme",
      "throne-of-the-lost-king-trine-ost",
      "waltz-of-the-temple-forest-elves-trine-2-soundtrack",
      "trine-4-moonlit-forest",
      "brambelstoke-village---trine---ari-pulkkinen",
      "academy-hallways",
    ],
  },
  {
    slug: "masayoshi_soken",
    midis: [
      "each-drop-flow-piano-arrangement-ffxiv-endwalker---masayoshi-soken",
      "finality-ffxiv-endwalker-dungeon-final-boss-theme---masayoshi-soken-ffxiv-endwalker---dungeon-final-boss-theme---masayoshi-soken",
    ],
  },
  {
    slug: "masashi_hamauzu",
    midis: [
      "besaid-island-final-fantasy-x-piano-collection---masashi-hamauzu",
      "wish---masashi-hamauzu-final-fantasy-xiii-2-piano",
    ],
  },
  {
    // wrong approach. better continue chiptheory's approach with parsing NES files: better coverage
    // see https://vpavlenko.github.io/chiptheory
    slug: "nobuo_uematsu",
    midis: [
      "final-fantasy-i-matoya-s-cave---nobuo-uematsu",
      "final-fantasy-prelude---nobuo-uematsu",
      "ffiv-theme-of-love-piano-collections-by-nobuo-uematsu",

      "dragonsong---nobuo-uematsu-advanced-solo-piano",
      "super-smash-bros.-brawl-main-theme-piano-transcription",
      "dou-uzhe-da-fighting-those-who-fight---final-fantasy-vii-ps1---nobuo-uematsu",
    ],
  },
  {
    slug: "elgar",
    midis: [
      "elgar_cello_concerto_1_adagio_moderato",
      "salut-d-amour-op.12---edward-elgar",
      "elgar---enigma-variations---xi.-nimrod",
      "elgar-pomp-and-circumstance-march-no.-1-piano-solo-with-choral-finale",
    ],
  },
  {
    slug: "kotaro_nakagawa",
    midis: ["the-master---code-geass"],
  },
  {
    slug: "mike_morasky",
    midis: [
      "your-precious-moon---mike-morasky-wheatley-boss-fight-ending",
      "thirty-seven-after-six",
      "team-fortress---upgrade-station-piano---mike-morasky",
      "rocket-jump-waltz-piano-solo",
      "cara-mia-addio---full-piano-cover",
      "soldier-of-dance",
      "team-fortress---rise-of-the-living-bread---mike-morasky",
      "team-fortress-2-main-theme---mike-morasky-team-fortress-2-piano-solo", // blues scale
      "saxton-s-dilemma-sax-quartet---mike-morasky",
      "machiavellian-bach",
      "the-parish---mike-morasky",
      "tf2---mannrobics---piano",
      "counter-strike-2---main-menu-theme---mike-morasky-counter-strike-2---main-menu-theme-for-solo-piano",
      "music-of-the-spheres", // augmented vibes
      "half-life-alyx---ending-triumph",
      "you-are-not-part-of-the-control-group",
      "the-calm---valve-for-brass-quintet",
      "medic",
      "misfortune-teller---valve-studio-orchestra-.",
    ],
  },
  {
    slug: "karen_khachaturian",
    midis: [],
  },
  {
    slug: "bach_misc",
    midis: [
      "bach-goldberg-variation-00-aria",
      "bwv0565-toccata-and-fugue-in-dm-c",
    ],
  },
  {
    slug: "olafur_arnalds",
    midis: ["saman---olafur-arnalds"],
  },
  {
    slug: "bach_wtc",
    midis: [
      "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
      "prelude-no.-2-bwv-847-in-c-minor",
      "prelude-no.-3-bwv-848-in-c-major", // very regular
      "prelude-no.-4-bwv-849-in-c-minor",
      "prelude-no.-5-bwv-850-in-d-major",
      "prelude-no.-6-bwv-851-in-d-minor",
      "prelude-no.-7-bwv-852-in-e-major",
      "prelude-no.-8-bwv-853-in-e-minor",
      "prelude-no.-9-bwv-854-in-e-major",
      "prelude-no.-10-bwv-855-in-e-minor",
      "prelude-no.-11-bwv-856-in-f-major", // decent
      "prelude-no.-12-bwv-857-in-f-minor",
      "prelude-no.-13-bwv-858-in-f-major",
      "prelude-no.-14-bwv-859-in-f-minor",
      "prelude-no.-15-bwv-860-in-g-major",
      "prelude-no.-16-bwv-861-in-g-minor",
      "prelude-no.-17-bwv-862-in-a-major",
      "prelude-no.-18-bwv-863-in-g-minor",
      "prelude-no.-19-bwv-864-in-a-major",
      "prelude-no.-20-bwv-865-in-a-minor",
      "prelude-no.-21-bwv-866-in-b-major",
      "prelude-no.-22-bwv-867-in-b-minor",
      "prelude-no.-23-bwv-868-in-b-major",
      "prelude-no.-24-bwv-869-in-b-minor",
      "prelude-no.-1-bwv-870-in-c-major",
      "prelude-no.-2-bwv-871-in-c-minor",
      "prelude-no.-3-bwv-872-in-c-major",
      "prelude-no.-4-bwv-873-in-c-minor",
      "fugue-no.-3-bwv-848-in-c-major",
    ],
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
      "malaguena-facil",
      "rumores-de-la-caleta-malaguena",
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
    midis: [
      "24-preludes-op.11-no.1---a.-scriabin",
      "scriabin-vers-la-flamme-op.-72",
      "scriabin-s-nocturne-for-the-left-hand",
    ],
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
      "happy-birthday-to-you-c-major",
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
    slug: "leo_weiner",
    midis: [
      "fox-dance---leo-weiner",
      "weiner-leo---esik-az-eso",
      "magyar-nepdal---ungarischer-volkslieder---repulj-madar---weiner-leo",
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

      "s_wonderful",
      "clap_yo-_hands",
      "do_it_again",
      "do-do-do",
      "fascinating_rhythm",
      "i_got_rhythm_roll",
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
      "Sweden_Minecraft",
      "Wet_Hands_Minecraft",
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
    slug: "ravel",
    midis: [
      "pavane_pour_une_infante_defunte_ravel_recorder",
      "ravel---miroirs-iii.-une-barque-sur-l-ocean",
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
    slug: "rachel_portman",
    midis: ["we-had-today", "the-letterbox", "chocolat---main-titles"],
  },
  {
    slug: "john_barry",
    midis: [
      "places-out-of-africa---john-barry",
      "somewhere-in-time---john-barry",
    ],
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
  {
    slug: "cyril_scott",
    midis: ["lotus-land", "cyril-scott-summerland-playtime-op.-54-no.1"],
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
    slug: "elza_ibrahimova",
    midis: [
      "elza-ibrahimova---daha-m-nd-dozum-yox",
      "ot-n-gunl-rimi-qaytaraydilar-azerbaijani-song-piano",
      "s-n-yadima-dus-nd", // iv-V7-i, three chord minor
    ],
  },
  // {
  //   slug: "azerbaijani_single",
  //   midis: [],
  // },
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
    slug: "kapustin",
    midis: ["concert-etudes-op.-40-no.-1---prelude"],
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
      "beleet-moy-parus-a.-mironov---gennadiy-gladkov",
      "padal-proshlogodniy-sneg---grigoriy-gladkov", // cool stuff
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
      "tariverdiev---net-eti-slyozy-ne-moi",
      "ya-sprosil-u-yasenya---tariverdiev-tariverdiev",
    ],
  },
  {
    slug: "bill_evans",
    midis: [
      "bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz",
      "remembering-the-rain---bill-evans",
      "danny-boy-bill-evans-ver.",
      "bill-evans---waltz-for-debby-medium",
    ],
  },
  {
    slug: "karsten_obarski",
    midis: [
      "oil-imperium-ingame-music-action-1---karsten-obarski",
      "oil-imperium-title-music---karsten-obarski",
    ],
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
    slug: "cardiacs",
    midis: [
      "cardiacs---tarred-and-feathered-for-solo-piano",
      "cardiacs---in-a-city-lining-for-solo-piano",
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
    slug: "takahiro_unisuga",
    midis: ["trails-of-cold-steel-iii----things-entrusted"],
  },
  {
    slug: "gustavo_santaolalla",
    midis: [
      "the-last-of-us---gustavo-santaolalla---hbo-opening-theme",
      "de-ushuaia-a-la-quiaca",
      "all-gone-no-escape---gustavo-santaolalla-all-gone-no-escape",
      "the-choice-last-of-us",
    ],
  },
  {
    slug: "tonci_huljic",
    midis: [
      "claudine---tonci-huljic",
      "cubana",
      "still-waters---tonci-huljic",
      "wonderland---tonci-huljic",
    ],
  },
  {
    slug: "hayato_sonoda",
    midis: [
      "ys-viii---dana-arcanashift",
      "ys-viii---the-sibylline-road",
      "the-legend-of-heroes--trails-in-the-sky---the-whereabouts-of-light",
    ],
  },
  {
    slug: "ken_nakagawa",
    midis: [
      "nefertiti---k.-nakagawa-d.-achiwa-mana-khemia",
      "atelier-totori---her-future-1",
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
    slug: "inon_zur",
    midis: [
      "dragon-age-origins-theme-song",
      "hymn-of-vaghen---inon-zur",
      "theme-from-fallout-76---inon-zur",
      "in-uthenera",
    ],
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
      "Clair_de_Lune__Debussy",
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
      "prelude-l.-117-no.-6-in-d-minor---debussy",
      "golliwog-s-cakewalk",
    ],
  },
  {
    slug: "autumn_leaves",
    midis: [
      "autumn-leaves",
      "autumn-leaves-les-feuilles-mortes",
      "autumn-leaves---jazz-piano-solo-tutorial", // need more remeasuring
      "bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz",
      "autumn-leaves-jazz-piano",
      "autumn-leaves-in-c",
      "autumn_leaves_diatonic",
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
    slug: "ivan_zajc",
    midis: ["na-gondoli---ivan-pl.-zajc"],
  },
  {
    slug: "stephen_rippy",
    midis: [
      "polyester-jammy-rome-2---age-of-empires",
      "age-of-empires-ii-aoc-main-theme",
      "music-9-operation-monkey-age-of-empires-ii-the-age-of-kings-for-piano----stephen-rippy",
    ],
  },
  {
    slug: "grant_kirkhope",
    midis: [
      "mid-boss-mayhem",
      "the-phantom-of-the-bwahpera-act-1---mario-rabbids-kingdom-battle",
    ],
  },
  {
    slug: "sage_guyton_jeremy_wakefield_nick_carr",
    midis: [
      "grass-skirt-chase-piano-arrangement",
      "spm---spongebob-production-music-hawaiian-adventures-spongebob-theme", // I V/V V7 I
      "hello-blues---sage-guyton-jeremy-wakefield", // ragtime?
      "rip-tide-ripped-hide",
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
    slug: "maclaine_diemer",
    midis: ["path-of-fire-main-theme-menu---piano-arrangement"],
  },
  {
    slug: "yuja_wang",
    midis: [
      "turkish-march-by-yuja-wang",
      "rhapsody-on-a-theme-of-paganini-op.43---sergei-rachmaninoff-18th-variation-yuja-wang",
      "yuja-wang-encore-transcription-of-orfeo-ed-euridice-wq.30---christoph-willibald-gluck",
    ],
  },
  {
    slug: "scott_lloyd_shelly",
    midis: [
      "overworld-day---scott-lloyd-shelly-terraria-ost", // finally lydian vgm vibes
      "boss-1---scott-lloyd-shelly-terraria-ost",
      "windy-day---scott-lloyd-shelly-terraria-ost",
      "alternate-day---scott-lloyd-shelly-terraria-ost",
      "thunderstorm-storm---scott-lloyd-shelly-terraria-ost",
    ],
  },
  {
    slug: "jazz_solos",
    midis: ["oblivion-bud-powell"],
  },
  {
    slug: "michiru_yamane",
    midis: [
      "michiru-yamane---wood-carving-partita",
      "dance-of-gold---castlevania-symphony-of-the-night",
    ],
  },
  {
    slug: "mendelssohn",
    midis: [
      "wedding-march-mendelssohn-piano",
      "mendelssohn-opus-67-no.-2-aka-lost-illusions",
      "mendelssohn-songs-without-words-no.-1-piano-solo",
    ],
  },
  {
    slug: "romantic_single_pieces",
    midis: ["caprice-brillant-sur-romeo-et-juliette-op.-303---georges-lamothe"],
  },
  {
    slug: "common_practice_single_pieces",
    midis: ["valsy-griboedova---griboedov-s-waltzes"],
  },
  {
    slug: "shuki_levy_haim_saban",
    midis: [
      "inspecteur-gadget---shuki-levy-haim-saban-inspecteur-gadget", // weird pre-dominant
      "heathcliff-theme-song", // test 50s progression
      "bulk-skull-s-theme-mighty-morphin-power-rangers---shuki-levy-haim-saban-et-al",
      "le-vol-du-condor---les-mysterieuses-cites-d-or---shuki-levy-haim-saban---4-mains",
      "piano-duet-he-man-and-the-masters-of-the-universe-1980s---shuki-levi-haim-saban",
    ],
  },
  {
    slug: "m2u",
    midis: ["m2u---masquerade"],
  },
  {
    slug: "haywyre",
    midis: ["prologue---haywyre"],
  },
  {
    slug: "gari_biasillo",
    midis: [
      "target-renegade-main-theme---gari-biasillo",
      "target-renegade-level-3-music---gari-biasillo",
      "target-renegade-end-theme---gari-biasillo",
    ],
  },
  {
    slug: "zun_touhou",
    midis: [
      "touhou-8---maiden-s-capriccio-~-dream-battle",
      "touhou---native-faith",
    ],
  },
  {
    slug: "edmund_fu",
    midis: [
      "dpsp-starting-wind---edmund-fu",
      "yi-zhan-next-station---edmund-fu",
      "deemo-walking-by-the-sea---edmund-fu",
    ],
  },
  {
    slug: "farhan_sarasin",
    midis: [
      "original-reflect---gawr-gura---farhan-sarasin",
      "id-entity-voices---hololive-idol-project",
      "scent-from-voez",
    ],
  },
  {
    slug: "yoko_shimomura",
    midis: [
      "guile-s-theme-street-fighter-ii",
      "beware-the-forest-s-mushrooms-forest-maze---super-mario-rpg---yoko-shimomura-piano",
    ],
  },
  {
    slug: "yasunori_mitsuda",
    midis: [
      "where-we-used-to-be---xenoblade-chronicles-2",
      "xenoblade-chronicles-2---mor-ardain-~-roaming-the-wastes",
      "xenoblade-2-one-last-you-piano-arrange---yasunori-mitsuda",
    ],
  },
  {
    slug: "dm_dokuro",
    midis: [
      "terraria-calamity-mod-ost-dm-dokuro---stained-brutal-calamity-piano-solo",
      "terraria-calamity-mod-ost-dm-dokuro---guardian-of-the-former-seas-piano-solo",
    ],
  },
  {
    slug: "geza_horvath",
    midis: ["petite-saltarelle---geza-horvath"],
  },
  {
    slug: "nikolay_myaskovsky",
    midis: [
      "nikolai-myaskovsky---the-yellowed-leaves-op.-31-no-2",
      "an-ancient-tale---drevnyaya-povest---nikolay-myaskovsky",
    ],
  },
  {
    slug: "yoshito_sekigawa",
    midis: [
      "cafe-scene---paper-mario-the-origami-king",
      "super-paper-mario---naoko-mitome-and-chika-sekigawa-staff-roll-",
      "it-s-showtime-from-super-paper-mario---naoko-mitome-chika-sekigawa",
      "the-museum---paper-mario-the-origami-king",
    ],
  },
  {
    slug: "guns_n_roses",
    midis: ["welcome-to-the-jungle", "november-rain---guns-n-roses"],
  },
  {
    slug: "dominic_james_la_rocca",
    midis: ["barnyard-blues---dominic-james-la-rocca-1917"],
  },
  {
    slug: "oesterreichisch-magyar_dance_music",
    midis: [
      "dunapalota---rozsnyai-sandor-1919",
      "the-star---rene-r.-schmal-1919",
    ],
  },
  {
    slug: "theo_northrup",
    midis: [
      "the-two-happy-coons---theodore-h.-northrup-1891",
      "plantation-echoes---theodore-h.-northrup-1897",
    ],
  },
  {
    slug: "early_xx_century_single_pieces",
    midis: [
      "feuillet-d-album-no.1-in-f-minor---ludovic-lamothe-feuillet-d-album-no.1-in-f-minor",
    ],
  },
  {
    slug: "scott_bradlee",
    midis: [
      "i-wanna-be-like-you-ragtime---scott-bradlee",
      "super-mario-bros.-ragtime-piano-medley---scott-bradlee",
    ],
  },
  {
    slug: "randy_newman",
    midis: [
      "you-ve-got-a-friend-in-me---randy-newman",
      "dexter-s-tune---randy-newman",
      "monsters-inc.-if-i-didn-t-have-you---randy-newman",
      "boo-s-going-home-by-monsters-inc.-randy-newman-ofimaticagio2-v-2.0",
      "its-a-jungle-out-there---randy-newman",
    ],
  },
  {
    slug: "oleksii_omelchuk",
    midis: [
      "metro-2033-main-menu-theme",
      "metro-exodus---race-against-fate",
      "metro-last-light-ending-bad-ending",
    ],
  },
  {
    slug: "modern_composers_of_single_pieces",
    midis: [
      "gray",
      "changing-times---heather-hammond",
      "ma-lu-mitai-baka-mitai---mitsuharu-fukuyama-piano-arrangement",
      "devotion",
      "tom-and-jerry-theme-piano-solo",
      "pilot-for-hire--microsoft-flight-simulator-x",
      "thundercats-theme",
      "mighty-morphin-power-rangers-sheet-music-easy-piano",
      "digimon-main-theme-organ-cover",
      "vizisi",
      "lost-patrol-main-theme---chris-glaister-jonathan-dunn",
      "none-of-them-knew-they-were-robots---mr.-bungle-mostly",
      "joker-folie-a-deux---trailer-theme---hildur-gudnadottir",
      "warsaw-concerto-dangerous-moonlight-theme-1941",
      "machinarium",
    ],
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
    midis: ["song-of-the-indian-guest", "flight-of-the-bumblebee"],
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
    slug: "j_p_ahmad",
    midis: ["castlemania", "ninja-runner", "super-bounce"],
  },
  {
    slug: "akira_yamaoka",
    midis: [
      "akira-yamaoka---silent-hill-2---promise-reprise",
      "magdalene---akira-yamaoka",
      "never-forgive-me-never-forget-me---akira-yamaoka",
      "silent-hill-not-tomorrow-lisa-s-death",
      "akira-yamaoka---true",
    ],
  },
  {
    slug: "shostakovich",
    midis: [
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "shostakovich_symphony_no5_2nd_movement_for_piano_solo",
      "symphony-no.-10-by-dmitri-shostakovich---piano-reduction",
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
      "footprints.mscz",
      "satin-doll",
      "lady_bird_piano_solo",
    ],
  },
  {
    // https://musescore.com/user/24069/sets/4869434
    slug: "rachmaninoff",
    midis: [
      "rachmaninoff-piano-concerto-no.-2-1st-mvmt.-arr.-for-2-pianos",
      "piano_concerto_no_4_op_40_sergei_rachmaninoff_i_allegro_vivace_alla_breve",
      "prelude_in_c_sharp_minor_opus_3_no_2_sergei_rachmaninoff",
      "rachmaninoff_piano_concerto_4_1",
      "Prelude_in_G_Minor_Opus_23_No._5",
      "symphony-no.-2-in-e-minor-op.-27-for-piano-duet---ii.-allegro-molto",
    ],
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
    slug: "boogie_woogie",
    midis: [
      "boogie-woogie",
      "original-boogie-woogie",
      "boogie-woogie---misc-traditional-boogie-woogie-_-basic-piano-solo-for-beginners",
      "pine-top-s-boogie-woogie---transcription-of-take-b",
      "suzan-boogie-woogie-in-c---easy-piano-riff---basic-boogie",
      "boogie-blues-etude-1974---oscar-peterson-piano-solo-transcription",
      "boogie-woogie---monday-struggle---by-albert-ammons",
      "boogie-woogie-stomp",
      "easy-boogie-woogie",
      "lewis-boogie-rock-n-roll-piano-arrangement",
      "surfboard-boogie",
      "boogie-woogie-7a11a3",
      "boogie-woogie-piano",

      "some-boogie-woogie-by-albert-ammons-friends",
      "bumble-boogie---adapted-from-the-flight-of-the-bumble-bee",
    ],
  },
  {
    slug: "fur_elise_covers",
    midis: ["fur-elise-reharmonization-cover"],
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
    slug: "evgeny_doga",
    midis: [
      "vals---ie.-doga",
      "sonet---ie.-doga",
      "meditation---ie.-doga",
      "i-love-you---ie.-doga",
      "portret---e.-doga",
    ],
  },
  {
    slug: "marc_sabatella",
    midis: [
      "reunion",
      "different-worlds",
      "for-dad",
      "coming-back-home",
      "birthday-rag",
      "fugue",
      "autumn-fires",
    ],
  },
  {
    slug: "raimonds_pauls",
    midis: [
      "million-alyh-roz---raimonds-pauls",
      "ischezli-solnechnye-dni",
      "raymond-pauls-ptichka-na-vetke",
      "zelyonyy-svet---valeriy-leontev-raymond-pauls",
    ],
  },
  {
    slug: "alkan",
    midis: ["nocturne-opus-22-in-b-major---alkan"],
  },

  {
    slug: "robert_d_vandall",
    midis: [
      "prelude-no.-4-in-f-major---robert-d.-vandall",
      "rockin-at-the-hall",
      "witches-waltz---robert-d.-vandall",
      "slide-easy---robert-d.-vandall", // test 12-bar blues search
      "in-the-groove---robert-d.-vandall-piano-trio",
      "prelude-no.-7-in-b-minor", // minor circle of fifths
    ],
  },
  {
    slug: "malcolm_arnold",
    midis: [
      "fanfara-for-horn---malcolm-arnold-fantasy-for-horn",
      "fantasy-for-trumpet-op.-100---malcolm-arnold-excerpt-from-fantasy-for-trumpet-op.-100",
      "fantasy-for-trombone",
      "siciliano-from-prelude-siciliano-and-rondo",
      "eight-children-s-pieces-op.36---malcolm-arnold",
      "piano-reduction-mvt-i-from-four-cornish-dances---malcolm-arnold",
      "whistle-down-the-wind---malcolm-arnold",
    ],
  },
  {
    slug: "mark_fradkin",
    midis: [
      "techyot-reka-volga---muzyka-m-fradkin",
      "doroga-na-berlin---mark-grigorevich-fradkin",
      "sluchaynyy-vals---m.-fradkin",
    ],
  },
  // {
  //   slug: "anatoly_novikov",
  //   midis: [],
  // },
  {
    slug: "aleksey_rybnikov",
    midis: [
      "ya-tebya-nikogda-ne-zabudu---o.-ribnikov",
      "pesnjakrasnoishapochki",
      "pesnya-krasnoy-shapochki---a.-rybnikov",
      "pesnya-krasnoy-shapochki---aleksey-rybnikov",
      "poslednyaya-poema-the-last-poem---aleksey-rybnikov", // many strategies
      "pisnya-kota-bazilio-ta-lisici-alisi---o.-ribnikov",
      "meeting-a.-rybnikov---zustrich-o.-ribnikov",
      "misyachna-pisnya---o.-ribnikov",
      "main---alexey-rybnikov-golovna-tema---oleksiy-ribnikov",
      "belyy-shipovnik---o.-ribnikov",
      "tema-mriy---oleksiy-ribnikov-dream-theme-alexey-rybnikov",
      "v-parke---aleksey-rybnikov-v-parke---aleksey-rybnikov-iz-kinofilma-vam-i-ne-snilos",
      "recognition-alexey-rybnikov-a.-rybnikov-priznanie",
      "groza---aleksey-rybnikov-iz-k-f-cherez-ternii-k-zvezdam",
      "a.-rybnikov----the-lamplighter-s-song-ost-the-adventures-of-buratino-1976",
      "ostrov-sokrovishch-aleksey-lvovich-rybnikov",
      "mlechnyy-put-milky-way",
    ],
  },
  {
    slug: "aleksandr_zatsepin",
    midis: [
      "pesenka-o-medvedyah---a.-zacepin",
      "s-lyubovyu-vstretitsya---a.-zacepin",
      "volki-gonyat-olenya---a.-zacepin",
      "hudozhniki---a.-zacepin",
      "island-of-misfortune-ostrov-nevezeniya---o.-zacepin",
      "proshchay---a.-zacepin",
      "tango-do-k-f-12-stulev---o.-zacepin",
      "kak-zhe-mne-teper-tebya-lyubit---a.-zacepin", // triton sub
      "lunnaya-serenada---a.-zacepin",
      "volshebnik-nedouchka---aleksandr-zacepin",
    ],
  },
  {
    slug: "tihon_hrennikov",
    midis: [
      "vals---t.-hrennikov",
      "vals-davnim-davno---t.-hrennikov",
      "prelyudiya---t.-hrennikov",
      "moskovskie-okna-bossa-nova",
      "chto-tak-serdce-rastrevozheno",
      "marsh-artilleristov---t.-n.-hrennikov",
      "proshchanie---tihon-hrennikov-proshchanie",
      "koliskova-svitlani---t.-hrennikov",
      "chastushki---t.-hrennikov",
    ],
  },
  {
    slug: "sergey_banevich",
    midis: [
      "fantaziya---s.-banevich",
      "soldatik-i-balerina",
      "at-the-station-na-vokzale",
      "road", // seventh chords in minor, change of meter
      "pesenka-pro-vovu-rasteryashku", // Iadd6 = ii65, V+/IV
    ],
  },
  {
    slug: "bslick",
    midis: [
      "let-go-piggy-book-2-soundtrack---bslick",
      "the-untold-story-ft.-melissa-medina---bslick",
      "archie-theme-scary-shanty---bslick",
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
    slug: "overcooked",
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
    slug: "jean-luc_ponty",
    midis: ["faith-in-you"],
  },
  {
    slug: "placebo",
    midis: ["every-you-every-me---placebo", "the-bitter-end---placebo"],
  },
  {
    slug: "john_cacavas",
    midis: [
      "jazzy-sax---john-cacavas",
      "corsage-for-winds---john-cacavas-string-quartet",
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
    slug: "altin_gun",
    midis: [
      "goca-dunya---altin-gun-goca-dunya.xml",
      "rakiya-su-katamam---selami-sahin-altin-gun",
      "badi-sabah-olmadan---altin-gun-badi-sabah-olmadan.xml",
    ],
  },
  {
    slug: "herbie_hancock",
    midis: ["cantaloupe-island"],
  },
  {
    slug: "michel_camilo",
    midis: [
      "one-more-once---michel-camilo", // 12-bar blues
      "michel-camilo-from-within",
      "blue-bossa-salsa---michel-camilo",
      "caribe---michel-camilo",
    ],
  },
  {
    slug: "hiromi_uehara",
    midis: [
      "the-tom-and-jerry-show---hiromi-uehara",
      "hiromi-uehara---haze",
      "hiromi-uehara---old-castle-by-the-river-in-the-middle-of-a-forest",
      "mr.-c.c.-cm-ver.---hiromi-uehara",
      "spark-by-hiromi-uehara-the-trio-project-piano-score",
    ],
  },
  {
    slug: "george_duke",
    midis: ["if-you-will---george-duke", "george-duke---it-s-on"],
  },
  {
    slug: "tonal_stretch",
    midis: [
      "jurassic-park---journey-to-the-island",
      "na-krilah-vitru---a.-minov",
      "narodniy-tanec---miroslav-skorik",
      "skyscraper---wynn-anne-rossi",
      "team-fortress---rise-of-the-living-bread---mike-morasky",
      "eight-children-s-pieces-op.36---malcolm-arnold",
      "the-tom-and-jerry-show---hiromi-uehara",
      "irken-armada-invasion-zim-s-theme---mattias-hakulinen-and-pontus-askbrink",
    ],
  },
  {
    slug: "aaron_copland",
    midis: [
      "copland_s_third_symphony_first_movement",
      "appalachian-spring---aaron-copland-appalachian-spring",
      "hoe-down---aaron-copland",
      "at-the-river-g",
      "aaron-copland---story-of-our-town",
      "the-cat-and-the-mouse",
    ],
  },
  {
    slug: "revaz_laghidze",
    midis: ["simg-era-t-bilisze---revaz-lag-iz-e"],
  },
  {
    slug: "john_williams",
    midis: [
      "john-william---jurassic-park-theme",
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
      "helena-s-theme---john-williams-from-indiana-jones-and-the-dial-of-destiny",
      "with-malice-toward-none---trumpet-solo-john-williams", // very coplandinan quartal language
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
    slug: "cameron_lee_simpson",
    midis: [
      "mr.rogers-theme-wont-you-be-my-neighbor-arr.-cameron-lee-simpson",
      "picking-the-chicken---cameron-lee-simpson---pjotr-kolster",
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

      "tones-for-joan-s-bones",
      "fingerprints---chick-corea",
      "chick-corea-s-scriabin",
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
      "dance-of-the-sugar-plum-fairy",
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
    slug: "timothy_brown",
    midis: [
      "dance-of-the-wind---timothy-brown",
      "toccatina---timothy-brown",
      "summer-song",
      "scherzino---timothy-brown", // i like this one. simple and effective
    ],
  },
  {
    slug: "lionel_yu",
    midis: [
      "fight-for-freedom---lionel-yu",
      "i-will-love-you-always---lionel-yu",
      "the-cursed-path",
    ],
  },
  {
    slug: "melody_bober",
    midis: [
      "stealth-mode---melody-bober",
      "blues-006---blyuz-006",
      "midnight-ride---melody-bober-midnight-ride",
      "melody-bober----yellowhammer-stomp",
      "antique-music-box---melody-bober",
      "dance-of-the-autumn-leaves---melody-bober",
    ],
  },
  {
    slug: "wynn-anne_rossi",
    midis: [
      "skyscraper---wynn-anne-rossi",
      "cafe-cha-cha---wynn-anne-rossi",
      "alma-del-tango---wynn-anne-rossi",
    ],
  },
  {
    slug: "jennifer_linn",
    midis: ["the-dreamcatcher", "snowcrystals---jennifer-linn"],
  },
  {
    slug: "john_adams",
    midis: [
      "piano-arr.-short-ride-in-a-fast-machine---john-adams",
      "phrygian-gates-china-gates---john-adams",
    ],
  },
  {
    slug: "ignacio_cervantes",
    midis: [
      "no-me-toques-danza-cubana-de-ignacio-cervantes",
      "soledad-.-habanera-par-ignazio-cervantes",
      "los-tres-golpes-danza-ignacio-cervantes",
    ],
  },
  {
    slug: "mozart_misc",
    midis: [
      "fantasia_in_d_minor_k_397_385g_wolfgang_amadeus_mozart",
      "i_allegro_symphony_no_4_in_d_major_k_19_w_a_mozart",
      "mozart_rondo_in_d_major_k_485_professional_production_score",

      "mozart_string_quartet_no_18_in_a_major_k464",
      "mozart_string_quartet_no_19_in_c_major_k465_dissonance",

      "string_quartet_no_23_in_f_major_k_590_wolfgang_amadeus_mozart",

      "sonata_no_9_3rd_movement_k_311",
      "mozart_sonata_11_1st",
      "sonata_no_13_1st_movement_k_333",
      "piano_sonata_no_16_in_c_major_k_545_wolfgang_amadeus_mozart_piano_solo",

      "wa-mozart-marche-turque-turkish-march-fingered",
    ],
  },
  {
    slug: "chopin_misc",
    midis: [
      "nocturnes-op.-9---no.-1-in-b-minor-d.-inoue",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
      "chopin_nocturne_op9_no2_maestro_2011r3d3t5",
      "nocturne-in-c-minor-op.-posth.-d.-inoue",
      "nocturne-in-c-sharp-minor",
      "nocturnes-op.-9---no.-3-in-b-d.-inoue",
      "nocturnes-op.-15---no.-1-in-f-d.-inoue",
      "nocturnes-op.-15---no.-2-in-f-d.-inoue",
      "nocturne-opus-15-no.-2-in-f-major",
      "nocturne-opus-15-no.-3-in-g-minor",
      "nocturne-opus-27-no.-1-in-c-minor",
      "nocturne-opus-27-no.-2-in-d-major",
      "nocturne-opus-32-no.-1-in-b-major",
      "nocturne-opus-32-no.-2-in-a-major",
      "nocturne-opus-48-no.-1-in-c-minor",
      "nocturne-opus-55-no.-1-in-f-minor",
      "nocturne-opus-62-no.-1-in-b-major",

      "waltz-opus-18-in-e-major-grande-valse-brillante",
      "chopin---waltz-no.-1-in-d-flat-major-op.-64",
      "waltz-opus-64-no.-2-in-c-minor",
      "waltz-opus-69-no.-1-in-a-major",
      "waltz-opus-69-no.-2-in-b-minor",
      "waltz-opus-70-no.-1-in-g-major",
      "waltz-b.-133-in-e-major---chopin",
      "Waltz_in_A_MinorChopin",

      "chopin_ballade_fminor_op52",
      "chopin_ballade_no_1_in_g_minor_op_23",
      "chopin_ballade_no_4_piano_solo",
      "chopin_military_polonaise",

      "fantaisie-impromptu-in-c-minor---chopin",

      "etude-opus-10-no.-1-in-c-major",
      "etude-opus-10-no.-2-in-a-minor",

      "mazurka-op.68-no.4---chopin---posth.",
      "mazurkas-op.-63---no.-2-in-f-minor-r.-lubetsky",
    ],
  },

  {
    slug: "chopin_24_preludes",
    midis: [
      "prelude-opus-28-no.-1-in-c-major",
      "prelude-opus-28-no.-2-in-a-minor",

      "chopin-prelude-e-minor-op-28-no-4-w-chord-symbols",

      "prelude-opus-28-no.-6-in-b-minor",
      "prelude-opus-28-no.-7-in-a-major---chopin",
      "prelude-opus-28-no.-8-in-f-minor",

      "chopin_raindrop_prelude",
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
    slug: "dora_pejacevic",
    midis: [
      "the-life-of-flowers-violet---dora-pejacevic",
      "papillon-op.-6---dora-pejacevic",
    ],
  },
  {
    slug: "mikulas_schneider_trnavsky",
    midis: [
      "otec-nebesky-jks017---mikulas-schneider-trnavsky",
      "kriste-zo-srdca-celeho-jks272---mikulas-schneider-trnavsky",
      "hospodine-vyslys-nas-jks527---mikulas-schneider-trnavsky",
    ],
  },
  {
    slug: "mihail_krug",
    midis: ["prihodite-v-moy-dom", "fraer---mihail-krug", "kolshchik"],
  },
  {
    slug: "danny_elfman",
    midis: [
      "victor-s-piano-solo---danny-elfman---corpse-bride",
      "the-simpsons-main-title-theme---piano",
      "the-simpsons-main-theme---danny-elfman",
      "everybody-knows",
      "hong-kong-disneyland-mystic-manor-theme-remastered---danny-elfman",
      "hero-s-theme---justice-league-2017---danny-elfman---piano-solo",
      "opening-titles-from-edward-scissorhands",
      "main-titles-from-doctor-strange-in-the-multiverse-of-madness-2022---danny-elfman",
      "wednesday---piano-opening-theme---danny-elfman-wednesday---piano-opening-theme",
      "alice-in-wonderland",
      "this-is-halloween-short-version---danny-elfman",
    ],
  },
  {
    slug: "george_bruns",
    midis: [
      "les-aristochats---george-bruns",
      "overture-from-the-jungle-book---george-bruns-overture-the-jungle-book---george-bruns",
      "yo-ho-a-pirate-s-life-for-me---george-bruns-xavier-atencio-yo-ho-a-pirates-life-for-me",
    ],
  },
  {
    slug: "yu-peng_chen",
    midis: [
      "rex-incognito-zhongli-s-theme-from-genshin-impact---yu-peng-chen-hoyo-mix",
      "ganyu-radiant-dreams-genshin-impact---yu-peng-chen",
      "kamisato-dance-cg-bgm-for-piano---genshin-impact-2.0-inazuma---yu-peng-chen",
      "ruu-s-song---yu-peng-chen",
      "yoimiya-dazzling-lights-in-the-summer-genshin-impact---yu-peng-chen",
      "moonlike-smile---yu-peng-chen",
      "genshin-impact---inazuma-miscellany---yu-peng-chen-genshin-impact-2.0-livestream-piano-part-1",
    ],
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
    slug: "johann_pachelbel",
    midis: [
      "Canon_in_D",
      "johann-pachelbel-1653~1706---fugue-in-c-major-p.144",
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
    slug: "mikhail_glinka",
    midis: [
      "glinka---the-lark-from-a-farewell-to-saint-petersburg-no.-10",
      "ya-pomnyu-chudnoe-mgnovene",
      "noktyurn-razluka-nocturne-la-separation---m.-i.-glinka-m.-i.-glinka-razluka",
    ],
  },
  {
    slug: "jared_emerson-johnson",
    midis: [
      "sam-and-max-save-the-world-the-office---jared-emerson-johnson",
      "cruisin---jared-emerson-johnson",
      "prologue---the-wolf-among-us",
      "crane-s-business-office-the-wolf-among-us",
    ],
  },
  {
    slug: "david_wise",
    midis: [
      "gang-plank-galleon-donkey-kong-country",
      "aquatic-ambience",
      "jib-jig-donkey-kong-country-2",
    ],
  },
  {
    slug: "andrew_prahlow",
    midis: [
      "andrew-prahlow---echoes-of-the-eye",
      "andrew-prahlow---end-times",
      "outer-wilds---main-theme---andrew-prahlow",
      "outer-wilds---timber-hearth",
      "andrew-prahlow---the-river",
    ],
  },
  {
    slug: "bear_mccreary",
    midis: [
      "the-walking-dead---theme-song-tv-series-2010---bear-mccreary",
      "god-of-war-ragnarok---raeb-s-lament---bear-mccreary",
      "nori-brandyfoot---lord-of-the-rings-the-rings-of-power",
      "this-wandering-day---bear-mccreary---the-rings-of-power",
      "percy-jackson-and-the-olympians---bear-mccreary-piano-solo",
      "god-of-war-ragnarok---giantess-of-ironwood---bear-mccreary",
      "leonardo-s-theme",
      "the-witcher-blood-origin---the-black-rose---bear-mccreary",
      "the-day-will-come---bear-mccreary",
      "the-veil-of-time---outlander-score",
      "agents-of-s.h.i.e.l.d.-theme",
    ],
  },
  {
    slug: "joe_hisaishi",
    midis: [
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
      "One_Summers_Day_Spirited_Away",
      "Summer_Joe_Hisaishi",
      "a-town-with-an-ocean-view--joe-hisaishi--natural-key-signature",
      "joe-hisaishi---hana-bi",
      "the-name-of-life-inochi-no-namae-joe-hisaishi",
    ],
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

      "lyapunov-reverie-du-soir-op.3",
      "thema-aus-die-moldau---b-smetana-s-sitnikava",
      "mein-vaterland-nr2-moldau---bedrich-smetana-for-piano-solo",
      "fantasia-on-greensleeves---ralph-vaughan-williams",
      "der-flohwalzer",
      "stanley-myers---cavatina-arranged-for-piano",
      "imslp181922-wima.ec84-oginski_polonez_a",
      "Entry_of_the_Gladiators_-_Julius_Fuk_-_1897",
    ],
  },
  {
    slug: "smetana",
    midis: [
      "thema-aus-die-moldau---b-smetana-s-sitnikava",
      "bedrich-smetana---vltava-ma-vlast",
      "mein-vaterland-nr2-moldau---bedrich-smetana-for-piano-solo",
    ],
  },
  {
    slug: "kelly_bailey",
    midis: [
      "triage-at-dawn",
      "portal-radio-music-for-trombone",
      "something-secret-steers-us",
    ],
  },
  {
    slug: "arif_malikov",
    midis: [
      "sehrli-xalat-filminin-musiqisi---arif-m-likov",
      "cix-yasil-duz---arif-m-likov-azerbaijan-folk-song",
      "brilliant-dadasova---gull-rim",
    ],
  },
  {
    slug: "jobim",
    midis: ["wave---antonio-carlos-jobim-jazz-piano-solo"],
  },
  {
    slug: "chico_buarque",
    midis: ["atras_da_porta"],
  },
  {
    slug: "borislav_slavov",
    midis: ["down-by-the-river---borislav-slavov-baldur-s-gate-3-ost"],
  },
  {
    slug: "takeshi_abo",
    midis: [
      "gate-of-steiner",
      "suzuha-s-farewell-wakare---steins-gate",
      "steins-gate-0---messenger-piano",
    ],
  },
  {
    slug: "esther_abrami",
    midis: [
      "no.9-esther-s-waltz---esther-abrami",
      "no.2-remembering-her---esther-abrami",
      "no.1-a-minor-waltz---esther-abrami-no-1-a-minor-waltz",
    ],
  },
  {
    slug: "brawl_stars",
    midis: [
      "brawl-stars---menu-theme",
      "brawl-stars-metropolis-theme",
      "brawl-stars---footbrawl-theme",
      "brawl-stars---win-theme-piano",
      "brawl-stars---draw-theme",
      "brawl-stars---lose-theme",
      "brawl-stars-ost---battle-8",
      "brawl-stars---brawl-o-ween-battle-2",
      "brawl-star",
      "brawl-stars-summer-of-monsters-battle-2-insane",
    ],
  },
  {
    slug: "65daysofstatic",
    midis: [
      "don-t-go-down-to-sorrow---65daysofstatic",
      "no-man-s-sky-escape-velocity---65daysofstatic",
    ],
  },
  {
    slug: "mogwai",
    midis: ["take-me-somewhere-nice---mogwai"],
  },
  {
    slug: "dmitry_kabalevsky",
    midis: [
      "slow-waltz-24-pieces-for-children-op.39-no.-23---dmitry-kabalevsky",
      "clowns---dmitri-kabalevsky", // I~i mix
      "a-happy-outing-24-pieces-for-children-op.39-no.-24---dmitry-kabalevsky",
      "animato-24-pieces-for-children-op.-39-no.-18---dmitri-kabalevsky",
    ],
  },
  {
    slug: "mattias_hakulinen",
    midis: [
      "nickelodeon-all-star-brawl-menu-theme---mattias-hakulinen",
      "irken-armada-invasion-zim-s-theme---mattias-hakulinen-and-pontus-askbrink",
      "i-m-thinking---ittle-dew",
      "that-cold-place-2nd-floor---ittle-dew",
      "princess-remedy---shark-of-omen-shore",
    ],
  },
  {
    slug: "james_newton_howard",
    midis: [
      "the-hunger-games-mockingjay-pt.-2-piano-suite",
      "running-on-raindrops-from-raya-and-the-last-dragon---james-newton-howard",
    ],
  },
  {
    slug: "claude_morgan",
    midis: [
      "el-bimbo---claude-morgan",
      "la-balanga",
      "tchoo-tchoo-hold-on-the-line",
    ],
  },
  {
    slug: "vladimir_dashkevich",
    midis: [
      "rekviem-iz-k-f-sobache-serdce---vladimir-dashkevich",
      "tam-na-nevedomyh-dorozhkah---v.-dashkevich",
      "irene-adler-waltz----v.-dashkevich",
      "marsh-krasnoarmeycev---vladimir-dashkevich-perelozhenie-dlya-fortepiano-i-golosa",
      "uvertyura---v.-dashkevich",
      "song-of-the-sea-pisnya-pro-more---v.-dashkevich",
      "surovye-gody-uhodyat-iz-k-f-sobache-serdce---vladimir-dashkevich-yuriy-kim",
    ],
  },
  {
    slug: "singles",
    midis: [
      "catherine-howard-s-fate---blackmore-s-night",
      "moskau---dschinghis-khan-moskau",
    ],
  },
  {
    slug: "anton_rubinstein",
    midis: [
      "melody-in-f-op.-3-no.-1---anton-rubinstein",
      "morceau-d-anton-rubinstein-toreador-et-andalouse",
      "melody-in-b-op.-3-no.-2---anton-rubinstein",
    ],
  },
  {
    slug: "russian_singles",
    midis: [
      "belym-snegom---muzyka-e-rodygina-belym-snegom---muzyka-e.-rodygina",
      "beri_shinel-_poshli_domoy",
      "i-hear-the-noise-of-birches...---konstantin-orbelyan",
    ],
  },
  {
    slug: "fleur",
    midis: [
      "formalin-formalin---flyour",
      "shelkopryad---flyour",
      "teplye-koty---flyour",
    ],
  },
  {
    slug: "manisha_vremeni",
    midis: [
      "moy-drug---mashina-vremeni",
      "odnazhdy-mir-prognetsya-pod-nas.",
      "she-walks-through-life-a-smile-on-her-face----a.-makarevich",
    ],
  },
  {
    slug: "melnitsa",
    midis: [
      "melnica---korolevna",
      "melnica---doroga-sna",
      "melnica----nevesta-poloza",
    ],
  },
  {
    slug: "igor_kornelyuk",
    midis: [
      "banditskiy-peterburg-gorod-kotorogo-net-fortepiano-a-town-that-does-not-exist",
      "syuyita-mayster-ta-margarita---i.-kornelyuk",
    ],
  },
  {
    slug: "krematoriy",
    midis: ["katmandu-polnaya-versiya", "musornyy-veter-gr.-krematoriy"],
  },
  {
    slug: "wang_jian",
    midis: ["fei-niao-he-chan-ren-ran"],
  },
  {
    slug: "chinese_single_pieces",
    midis: [
      "spring-festival-overture-chun-jie-xu-qu---li-huan-zhi-piano-cover",
      "cai-yun-zhui-yue-colorful-clouds-chasing-the-moon--piano-solo", // ren guang
    ],
  },
  {
    slug: "schumann",
    midis: [],
  },
  {
    slug: "norbert_schultze",
    midis: [
      "lili-marlene---norbert-schultz",
      "von-finnland-bis-zum-schwarzen-meer",
      "das-lied-vom-deutschen-u-boot-mann",
    ],
  },
  {
    slug: "boban_markovic",
    midis: [
      "majstorski-cocek---boban-markovic",
      "beli-dvor---boban-markovic",
      "za-beograd---boban-markovic",
      "zivot-cigana---boban-markovic",
      "ciganin-kuca---boban-markovic",
    ],
  },
  {
    slug: "thomas_attwood",
    midis: [
      "allegro---first-movement-from-sonatina-no.-1-in-g-trinity-grade-2-piano",
    ],
  },
  {
    slug: "nat_king_cole",
    midis: ["nat-king-cole---easy-listening-blues-transcription"],
  },
  {
    slug: "martin_kratochwil",
    midis: [
      "potato-blues",
      "sour-apple-blues",
      "lonesome-broccoli-blues-_-easy-piano",
    ],
  },
  {
    slug: "glenn_stafford",
    midis: [
      "starcraft-2---wings-of-liberty---piano-solo",
      "warcraft-2-human-1---by-glenn-stafford-arranged-by-gori-fater",
      "warcraft-ii---orcs-betrayal", // bvi in a functional context
      "brood-war-aria---glenn-stafford-and-neal-acree",
      "warcraft-ii---humans-beyond-the-dark-portal",
      "warcraft-2-intro---glenn-stafford",
      "drustvar",
      "grizzly-hills-wow",
      "warcraft-iii---orc-theme-old-school-battle-net-theme",
    ],
  },
  {
    slug: "ludwig_goransson",
    midis: [
      "can-you-hear-the-music---ludwig-goransson-from-oppenheimer",
      "the-book-of-boba-fett---main-title-theme---ludwig-goransson---piano-version",
      "venom-theme",
      "wakanda-forever-from-wakanda-forever---ludwig-goransson",
      "main-theme---black-panther---ludwig-goransson---piano-solo",
      "foils---ludwig-goransson-from-tenet",
      "the-mandalorian---main-theme",
      "greendale-is-where-i-belong---ludwig-goransson---community",
    ],
  },
  {
    slug: "brian_tyler",
    midis: [
      "formula-1-theme---brian-tyler",
      "peaches-from-super-mario-bros-movie-for-violin---brian-tyler-jack-blackman",
      "theme-from-rambo-brian-tyler",
    ],
  },
  {
    slug: "miki_higashino_sukoiden_2",
    midis: ["reminiscence---suikoden-2", "two-rivers---suikoden-2"],
  },
  {
    slug: "rob_hubbard",
    midis: ["monty-on-the-run"],
  },
  {
    slug: "jeremy_soule",
    midis: [
      "harry-potter-ii-game-main-menu---jeremy-soule",
      "diagon-alley---jeremy-soule-from-harry-potter-and-the-chamber-of-secrets---solo-piano-arr.",
      "happy-hogwarts-from-harry-potter-and-the-philosopher-s-stone",
      "call-of-magic-nerevar-rising---the-elder-scrolls-morrowind-jeremy-soule",
      "dragonborn---skyrim-theme-song-piano-solo",
      "secunda-the-elder-scrolls-v-skyrim",
      "fear-not-this-night-guild-wars-2-piano-version",
      "guild-wars-2-trailer---jeremy-soule",
      "guild-wars-factions-theme",
      "ashford-abbey---jeremy-soule-guild-wars",
      "overture-from-guild-wars-2",
    ],
  },
  {
    // she's not a composer?
    slug: "natalia_lafourcade",
    midis: ["soledad-y-el-mar", "mi-tierra-veracruzana---natalia-lafourcade"],
  },
  {
    slug: "handel",
    midis: [
      "minuet-from-music-for-the-royal-fireworks---georg-friedrich-handel",
      "gavotte_in_g_major_hwv_491_handel_george_frideric",
      "passacaglia---handel-halvorsen",
      "water-music-suite-in-d-major-ii---alla-hornpipe-handel",
    ],
  },
  {
    slug: "bo_burnham",
    midis: ["welcome-to-the-internet---bo-burnham-s-inside"],
  },
  {
    slug: "lin-manuel_miranda",
    midis: [
      "We_Dont_Talk_about_Bruno",
      "waiting-on-a-miracle-from-encanto---lin-manuel-miranda",
      "keep-the-beat---lin-manuel-miranda-keep-the-beat",
      "surface-pressure-disney-s-encanto",
      "surface-pressure---encanto",
      "moana-lin-manuel-miranda---you-re-welcome-piano-solo",
      "how-far-i-ll-go-~-moana-ost",
      "dos-oruguitas---lin-manuel-miranda-by-adonay-guedes",
      "where-you-are-from-moana---lin-manuel-miranda-where-you-are-easy",
      "aaron-burr-sir",
      "lauren-s-interlude",

      "the-family-madrigal-from-encanto---lin-manuel-miranda-simplified-for-kids-beginners-piano",
    ],
  },
  {
    slug: "three_part_harmony",
    midis: ["yksin-op.29b-no.4---toivo-kuula", "ekialde-dantza"],
  },

  {
    slug: "dario_marianelli",
    midis: [
      "Dawn_Pride_and_Prejudice",
      "liz-on-top-of-the-world",
      "your-hands-are-cold-from-pride-and-prejudice-2005-soundtrack",
    ],
  },
  {
    slug: "enya",
    midis: [
      "watermark-enya",
      "caribbean-blue---enya",
      "a-day-without-rain---enya",
    ],
  },
  {
    slug: "charles_villiers_stanford",
    midis: [
      "stanford-charles-villiers---the-blue-bird",
      "when-mary-thro-the-garden-went---charles-villiers-stanford",
    ],
  },
  {
    slug: "2002_band",
    midis: ["suddenly-yours---2002-band", "we-meet-again---2002-band"],
  },
  {
    slug: "lyle_mays",
    midis: ["lyle-mays-chorinho-arr.-for-solo-piano"],
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
    slug: "karel_svoboda",
    midis: [
      "drei-haselnusse-fur-aschenbrodel---karel-svoboda-by-jacroby",
      "n-a-v-s-t-e-v-n-i-c-i",
    ],
  },
  {
    slug: "benjamin_wallfisch",
    midis: [
      "a-cure-for-wellness---benjamin-wallfisch",
      "volmer-s-lab-a-cure-for-wellness",
      "magnificent-isn-t-it-a-cure-for-wellness",
      "blade-runner",
      "we-can-fix-this-the-flash-movie.-2023-ost",
    ],
  },
  {
    slug: "schubert",
    midis: [
      "moments_musicaux_d_780_no_3_in_f_minor",
      // "moments_musicaux_d_780_op_94_no_3_franz_schubert",
      "schubert-impromptu-op.-90-no.-4",
      "serenade---schubert",
      "schubert-liszt---standchen",
      "schubert-waltz-in-b-minor-op.-18-no.-6-d.145",
      "schubert-waltz-in-bb---d.783-op.-33-no.-7",
      "schubert-waltz-in-a-minor-d.924-op.-91a-no.-9",
      "waltz-ndeg-7---op.-18---d.145",
      "12-graz-waltzes-ndeg3---schubert",
      "franz-schubert---waltz-in-b-major-d.-145-nr2",
      // "ecossaise-no-3-d.529---franz-schubert",
      "schubert-ecossaise-no.-4-op-18-d.145",
      "schubert-ecossaise-no-8-op-18-d.145",
      "ecossaise-in-c-major-no-8-d.299---franz-schubert",
      "schubert-german-dance-d.783-op.-33-no.-2",
      "german-dance-and-ecossaise-d.643---franz-schubert",
      "schubert---sonata-in-a-op.120-d.664-movement-i",
    ],
  },

  {
    slug: "brad_mehldau",
    midis: ["anthropology---brad-mehldau"],
  },
  {
    slug: "aziza_mustafa_zadeh",
    midis: [
      "aziza_mustafa_zadeh_dance_of_fire_2010_live_trio",
      "aziza_mustafa_zadeh_dance_of_fire_nicola_morali_solo_piano_cover",
      "always---aziza-mustafa-zadeh",
    ],
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
    slug: "beethoven",
    midis: [
      "beethoven---sonata-in-f-minor-op.2-no.1-movement-i",
      "Sonate_No._14_Moonlight_1st_Movement",
      "moonlight_sonata_ludwig_van_beethoven_piano_solo",
      "Sonate_No._14_Moonlight_3rd_Movement",
      "sonate-no.-17-tempest-3rd-movement",
      "sonatina_in_g_beethoven_anh_5_no_1_beethoven",
      "bagatelle_in_g_minor_op_119_no_1_ludwig_van_beethoven_16_07_1770_26_03_1827_piano_solo",
      "beethoven-symphony-no.-5-1st-movement-piano-solo",
      "beethoven_sonata_in_f_minor_op_2_no_1_movement_i",
      "beethoven_sonata_in_g_op_14_no_2_movement_i",
      "beethoven_sonate_5_1st",
      "beethoven_trio_for_clarinet_cello_and_piano_no_4_op_11_2nd_movement",
      "Fr_Elise",
      "piano_sonata_no_3_in_c_major_op_2_no_3_ludwig_van_beethoven_piano_sonata_no_3_in_c_major_op_2_no_3_complete",
    ],
  },
  {
    slug: "einaudi",
    midis: [
      "the_earth_prelude_ludovico_einaudi_piano_solo",
      "ludovico-einaudi-una-mattina",
    ],
  },
  {
    slug: "horo",
    midis: [
      "aytoska-rchenica---unknown-aitoska_rachenitsa",
      "backovsko-horo",
      "bakovsko-horo",
      "bavno-horo",
      "bistrica-kopanica",
      "bistrishka-kopanica",
      "bistrishka-kopanitsa",
      "blagoevgradsko-horo",
      "bregovsko-horo-1",
      "bregovsko-horo-2",
      "brestaska-racenica---misc-traditional-brestaska-racenica",
      "bulcenska-racenica",
      "bulchenska-rachenitsa",
      "cecovoto-horo-9-8",
      "celebinsko-horo",
      "cerovska-kopanica",
      "cesto-horo",
      "cetvorno-horo",
      "cetvorno-horo-2",
      "cetvorno-horo-4",
      "chetvorno-horo---sofia",
      "chetvorno-shopsko-horo",
      "chtvorno-horo---misc-traditional",
      "daichovo-horo",
      "daichovo-horo---viacheslav-semyonov",
      "daichovo-horo-2",
      "daichovo-horo-3",
      "daichovo_horo_1",
      "denjovo-horo",
      "devetorka-samokovsko-horo",
      "drjanovska-racenica-ii",
      "dudino-horo---boris-karlov",
      "dunavsko-horo---diko-iliev-diko-iliev",
      "eleno-mome-elenino-horo",
      "elenska-racenica",
      "elenska-racenica---misc-traditional-elenska-racenica",
      "gankino_horo",
      "gankino_horo_traditionnel_bulgare",
      "gjusevska-racenica",
      "gr-uan-vcarsko-horo",
      "gr-uan-vcarsko-horo-1",
      "gr-uan-vcarsko-horo-2",
      "hanukah-in-santa-monica---tom-lehrer-8bbe875464c17f6faa9a162192557cf1a17a257d-2",
      "ivailovsko-horo-in-c",
      "kemensko-horo",
      "kojovo-horo",
      "kolev-s-kopanitsa",
      "koljovo-horo",
      "konushenska-rchenica---konushenski-orkestr",
      "kopanica",
      "kopanitsa",
      "kopanitsa-a-la-turka",
      "krajdunavsko-horo",
      "krivo-horo",
      "krivo_sadovsko_horo",
      "kulsko-horo",
      "kulsko-horo-1",
      "kulsko-horo-2",
      "lazarsko-horo",
      "lazarsko-horo-1",
      "lomka-po-lomka-kasapsko-horo",
      "malisevsko-horo",
      "mihaiylovgradsko-horo",
      "misino-horo",
      "momino-horo",
      "mr-zvonsky-s-kopanica",
      "novoselsko-kopanica",
      "paidushko-choro",
      "paidushko-horo",
      "paidushko-horo-2",
      "paidusko-horo",
      "pajdusko-horo",
      "pamela-s-ruchenitsa",
      "pasard-vzijska-kopanica",
      "pernishka-rchenica---ibro-lolov",
      "pravo-horo-version-2",
      "rachenica-for-three",
      "rachenitsa",
      "rachenitsa-1",
      "rachenitsa-2",
      "radino-horo",
      "radomirsko-horo",
      "sandansko-horo",
      "sandansko-horo-1",
      "satovcensko-horo",
      "serbian-racenica",
      "severnyashka-racenica",
      "seymour_blagoevgradsko_horo",
      "seymour_cekurjankino_horo",
      "seymour_drjanovska_rachenica",
      "seymour_elenska_rachenica",
      "seymour_gjusevska_rachenica",
      "shopska-rachenitsa",
      "sitno-krajdunavsko-horo",
      "smeceno_horo",
      "starceska-racenica",
      "suleman-s-kopanitsa",
      "svatbarska-racenica---bulgarien",
      "svatbarska-rachenitsa",
      "svornato-horo",
      "traditional-music---petrunino-horo",
      "traditional_music_plevensko_daichovo_horo",
      "trakijska-rachenica",
      "trakiyska-rchenica",
      "varnensko-horo",
      "vcekurjankino-horo",
      "vcerkesko-horo-3",
      "veselinovo-horo",
      "veselinovo-horo-1",
      "veselinovo-horo-2",
      "veselinovo-horo-3",
      "yareshko-horo",
      "sandansko-oro",
      "seymour_jambolsko_pajdushko",
      "seymour_paidushko",
      "seymour_pajdusko_oro",
      "bavno-oro",
      "dospatsko-oro---misc-tunes",
      "gankino",
      "gankino-2",
      "kasapsko",
      "maricensko",
      "chetvorno_shopsko_fixed",
      "daichovo-chara",
      "daichovo-hora",
    ],
  },
  {
    slug: "richard_clayderman",
    midis: [
      "ballade-pour-adeline---richard-clayderman",
      "moon-tango---r.-clayderman",
      "les-fleurs-sauvages---richard-clayderman",
      "souvenirs-d-enfance---richard-clayderman",
      "concerto-des-etoiles---richard-clayderman",
    ],
  },
  {
    slug: "marc_streitenfeld",
    midis: [
      "honoring-the-dead---marc-streitenfeld",
      "american-gangster-frank-lucas---marc-streitenfeld",
      "the-grey",
    ],
  },
  {
    slug: "ramin_djawadi",
    midis: [
      "Game_of_Thrones_Easy_piano",
      "light-of-the-seven---ramin-djawadi-complete-transcription",
      "the-night-king---ramin-djawadi",
    ],
  },
  {
    slug: "musescore_top",
    midis: [
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
      "ren-sheng-nomerigorando---jiu-shi-rang-jazz-arranged",
      // "River_Flows_In_You",
      "river-flows-in-you",
      // "yiruma_river_flows_in_you_easy",
      "Canon_in_D",
      "Fr_Elise",
      "Clair_de_Lune__Debussy",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
      "Gymnopdie_No._1__Satie",
      "Hallelujah",
      "Waltz_in_A_MinorChopin",
      "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
      "Sonate_No._14_Moonlight_1st_Movement",
      "passacaglia---handel-halvorsen",
      "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
      "One_Summers_Day_Spirited_Away",
      "Undertale_-_Megalovania_Piano_ver._3",
      "Carol_of_the_Bells",
      "Sonate_No._14_Moonlight_3rd_Movement",
      "Sweden_Minecraft",
      "Interstellar",
      "Another_Love__-_Tom_Odell_Professional",
      "Golden_Hour__JVKE_Updated_Ver.",
      "Game_of_Thrones_Easy_piano",

      "Believer_-_Imagine_Dragons",
      "Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019",
      "tude_S._1413_in_G_Minor_La_Campanella__Liszt",
      "Liebestraum_No._3_in_A_Major",
      "Mad_world_Piano",
      "Someone_Like_You_easy_piano",
      "my-heart-will-go-on", // double-tonic
      "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
      "Wet_Hands_Minecraft",
      "Fly_Me_to_the_Moon",
      "piano-man-piano",
      "All_I_Want_for_Christmas_is_You",
      "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",

      "a-thousand-years",
      "Disney_Pixar_Up_Theme",

      "Viva_La_Vida_Coldplay",
      "Gravity_Falls_Opening",
      "the_entertainer_scott_joplin",
      "John_Lennon_Imagine",
      "Lovely_Billie_Eilish",
      "fantaisie-impromptu-in-c-minor---chopin",
      "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
      "the-scientist---coldplay-piano-arrangement",
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "ballade-pour-adeline---richard-clayderman",
      "Ed_Sheeran_Perfect",
      "Fallen_Down_Undertale",
      "Omori_Duet",
      "Never_Gonna_Give_You_Up",
      // "Despacito",
      "despacito-piano-cover-peter-bence",
      "Summer_Joe_Hisaishi",
      "arabesque-l.-66-no.-1-in-e-major",
      "chopin-prelude-e-minor-op-28-no-4-w-chord-symbols",
      "24-preludes-op.-28---no.-4-in-e-minor-suffocation-g.-d.-robertson",
      "still-dre---variation-composition",
      "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
      "solas---jamie-duffy",
      "autumn-leaves-jazz-piano",
      "clocks---coldplay",
      // "Sadness_and_Sorrow",
      "sadness-and-sorrow-for-piano-solo",
      "Super_Mario_Bros_Main_Theme",
      "nocturne-in-c-sharp-minor",
      "gurenge--demon-slayer-kimetsu-no-yaiba-op",
      "Let_Her_Go_Passenger",
      "dragonborn---skyrim-theme-song-piano-solo",
      // "Michael_Giaccino_Married_Life",
      "undertale-ost---hopes-and-dreams-save-the-world",
      "Zeldas_Lullaby",
      "doki-doki-literature-club-ost---your-reality",
      "attack-on-titan-theme-guren-no-yumiya",
      "Bella_Ciao",
      // "Mariage_dAmour",
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
      "Maple_Leaf_Rag_Scott_Joplin",
      "the-office-opening-theme",
      // "the-office---opening-titles-theme-song-for-piano",
      "Take_on_me",
      "chopin_ballade_no_1_in_g_minor_op_23",
      "Dawn_Pride_and_Prejudice",
      "congratulations---mac-miller",
      // "Schindlers_List",
      "theme-from-schindler-s-list---piano-solo",
      // "g-minor-bach",
      "g-minor-bach-original",
      "kimi-no-na-wa---sparkle-theishter-2016",
      "undertale-undertale-piano",
      "etude-opus-25-no.-11-winter-wind-in-a-minor",
      "when-i-was-your-man---bruno-mars",
      "liszt---hungarian-rhapsody-no.-2",
      "beethoven-symphony-no.-5-1st-movement-piano-solo",
      "erik-satie---gnossienne-ndeg1",
      "waltz-opus-64-no.-2-in-c-minor",
      // "the-legend-of-zelda-main-theme-easy",
      // "main-theme---legend-of-zelda",
      "legend-of-zelda-main-theme-score",
      "undertale-ost---nyeh-heh-heh-bonetrousle",
      "minuet-bwv-anhang-114-in-g-major",
      "ylang-ylang---fkj-transcribed-by-lilroo",
      "sia---snowman",
      "flight-of-the-bumblebee",
      "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
      "bwv0565-toccata-and-fugue-in-dm-c",
      "happy-birthday-to-you-c-major",
      "Requiem_for_a_Dream",
      "Legend_of_Zelda_Great_Fairy_Fountain",

      "Cant_Help_Falling_In_Love",
      "Someone_You_Loved",
      "sonate-no.-17-tempest-3rd-movement",
      "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
      "africa---toto",
      "yuri-on-ice---piano-theme-full",
      "Yann_Tiersen_Amelie",
      "dont-stop-believing-piano",
      "lacrimosa---requiem",
      "dance-of-the-sugar-plum-fairy",
      "sign-of-the-times---harry-styles",
      "alan-walker---alone-piano",
      "Love_Like_You_Steven_Universe",
      "Pokemon_Theme_Song",
      "Billie_Eilish_Bad_Guy",
      "Test_Drive_How_to_Train_Your_Dragon",
      "how-far-i-ll-go-~-moana-ost",
      "Vivaldi_-_Summer__The_Four_Seasons__-_Rousseau",
      "vivaldi---summer---piano",
      "Im_Blue_Eiffel_65",
      "Ed_Sheeran_Shape_of_you",
      "chiquitita-abba---piano",
      "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
      "nothing-else-matters---metallica",
      "welcome-to-the-black-parade---my-chemical-romance",
      "fairy-tail-main-theme",
      "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
      "your-song-piano",
      "my-lie-watashi-no-uso---your-lie-in-april",
      "anastasia---once-upon-a-december",
      "bts-bangtansonyeondan---i-need-u-suga-piano-full-solo",
      "la-vie-en-rose-solo-accordion",
      "A_Thousand_Miles",
      "Godfather",
      "Pink_Panther",
      "stranger-things-theme",
      "abba--the-winner-takes-it-all",
      "20th-century-fox-fanfare-piano-arr.",
      "swan-lake-theme---tchaikovsky",
      "marshmello-ft.-bastille---happier",
      "kamado-tanjiro-no-uta-~-demon-slayer-ep-19-ed-ost-fonzi-m-improvised-hard-version",
      "senorita---shawn-mendes-camilla-cabello",
      "demons-imagine-dragons",
      "easy-on-me---adele",
      "bluestone-alley-piano-tiles-2",
      "rihanna-ft.-mikky-echo---stay",
      "olivia-rodrigo---drivers-license",
      "forest-gump---main-title-feather-theme",
      "the-avengers-theme---piano",
      "hall-of-fame",
      "rush-e-but-it-s-as-difficult-as-humanly-possible",
      "Let_It_Go_Disney_Frozen",
      "john-william---jurassic-park-theme",
      "always-with-me-piano-cover.",
      "spring-day---bts",
      // "river_flows_in_you_yiruma_10th_anniversary_version_piano",
      "lost-boy---ruth-b",
      "itsumo-nando-demo-always-with-me---spirited-away",
      "fix-you---coldplay",
    ],
  },

  {
    slug: "scarlatti",
    midis: ["sonata_k159_scarlatti", "scarlatti-sonata-aria-k.32"],
  },

  {
    slug: "scarlatti",
    midis: [
      "Jupiter_-_arr._for_two_pianos_by_Gustav_Holst",
      "neptune-the-mystic---gustav-holst-piano-reduction",
      "the-planets-op.-32----ii.-venus-bringer-of-peace-for-piano",
    ],
  },

  {
    slug: "unsorted",
    midis: [
      "Alice_DJ_Better_Off_Alone",

      "Anders_Thue_Sonne",

      "Attack_on_Titan_Shinzou_wo_Sasageyo",
      "Avicii_Wake_me_up",
      "Avril_14_Aphex_Twin",
      "Axel_F_Beverly_Hills_Cop_III",
      "Bags_Groove__Lead_sheet_",

      "Billie_s_Bounce_Billies_Bounce",
      "Blue_Rondo_A_La_Turk",
      "Blues_for_Alice",
      "Blues_in_the_Closet_Lead_sheet_",

      "Chris_Isaak_Wicked_Game",

      "Close_to_the_edge",
      "Coffin_dance",

      "Dream_a_little_dream_of_me",

      "Feliz_Navidad",
      "Flight_Facilities_Crave_You",
      "Flight_Facilities_Crave_You_2",

      "Gershwin_Rhapsody_in_Blue_Piano_solo",
      "Alone_Marshmello",

      "Good_Bye_Hachiko",

      "Happy_Birthday_to_You",
      "Hit_the_Road_Jack",
      "How_long_blues",

      "Jingle_Bell_Rock",

      "Johnny_Cash_Hurt",

      "Jolene",

      "Krylya_Nautilus_duo",
      "Kyle_Landrys_Tetris_Theme_Variations_for_Piano_SoloKorobeiniki",
      "Lady_Gaga_Always_remember_us_this_way",

      "Lena_Raine_Pigstep",

      "Liana_Flores_Rises_the_Moon",

      "Love_Store_Francis_Lai",

      "Misty_piano_solo",
      "Moon_River_Breakfast_at_Tiffanys",
      "Morphine_Cure_for_Pain",
      "My_War_Attack_on_Titan",

      "Numb_-_Linkin_Park",

      "Ophelia",
      "Photograph_Ed_Sheeran",

      "Prlude_to_Act_1_of_Carmen_-_Piano_Solo_-_Bizet",

      "Saint_Saens_Symphony_3_1st",
      "Sandu",

      "Sorcerers_doll___-_The_King_and_the_Jester___",

      "Super_Mario_Bros_Peaches",
      "Sviridov_Snowstorm_Waltz",
      "Sviridov_Time_Foward",
      "Sviridov_Time_Foward.1",
      "Sweet_Dreams",
      "Sweet_home_Chicago",

      "Tetris_Theme",
      "TheFatRat_Monody",
      "TheFatRat_Unity",
      "The_Prince_of_Silence____Nautilus_Pompilius",
      "The_Strokes_Reptilia",
      "The_Strokes_Reptilia_2",
      "The_Strokes_Reptilia_3",
      "The_Weeknd_Blinding_Lights",
      "Titanic",
      "To_be_over",

      "Vangelis_Chariots_of_fire",

      "Walking_On_a_dream",

      "Wellerman_Sea_Shanty",

      "alexey_bychkov_s_trio_goby_waltz",
      "all-major-scales-arpeggios",
      "all_of_the_girls_you_loved_before_taylor_swift",
      "alto_sax_natural_minor_scales_and_arpeggios",
      "as_it_was_harry_styles",
      "asphyxia---tokyo-ghoul-re-op",

      "average_rag_1",
      "average_rag_2",

      "bheki_mseleku_angola",
      "brahms_118_1",
      "brahms_op118_1",
      "bruckner_7_1",
      "bruckner_7_2",
      "bruckner_8",
      "bruckner_8_a_j",
      "bruckner_symphony_4_1",
      "bubamara",
      "cheek_to_cheek",

      "classical_music_mashup",
      "clocks---coldplay",
      "closed-topic----xiu-ti",
      "cody_fry_eleanor_rigby_no_lead_vocal",

      "contract---poshlaya-molly-easy-piano",
      "corelli_op1_no8_ii",
      "cuphead_a_quick_break",

      "dance-of-the-knights-transcription-for-piano-solo",
      "dazhe-moya-beybi-ne-znaet---poshlaya-molli",
      "diatonic-7th-chords-in-major-key",
      "directed_by_robert_b_weide",

      "don_t_deal_with_the_devil_barbershop_quartet_cuphead",

      "earth_wind_fire_september",
      "ederlezi",
      "eleanor_rigby_cody_fry_no_perc1",
      "etude-op.-10-no.-5-black-keys-pentatonic-arrangement",
      "examples_of_chord_progressions_in_a_minor",

      "firuze",
      "four-chord-song",
      "gamzedeyim_deva_bulmam",

      "gavotte",
      "gavotte_f_j_gossec",
      "glavinishko-cetvorno",
      "god_only_knows_bioshock_infinite_2013",
      "gotye_feat_kimbra_somebody_that_i_used_to_know",
      "gurenge--demon-slayer-kimetsu-no-yaiba-op",
      "hanna-montana---poshlaya-molli-hannamontana---poshlaya-molli",
      "hannamontana---poshlaya-molli-agga",
      "hava-nagila",
      "haydn_100_1",
      "he_s_a_pirate_easy_piano",
      "he_s_a_pirate_from_pirates_of_the_caribbean",
      "he_s_a_pirate_hans_zimmer_klaus_badelt",
      "he_s_a_pirate_hard_version",
      "he_s_a_pirate_klaus_badelt_pirates_of_the_caribbean_ost_rock_version",
      "he_s_a_pirate_ost_kalimba_cover",
      "hojnacki_1",

      "idotdotdot---yiruma",
      "ii-v-i-jazz-voicings",
      "ii-v-i-warmup",
      "kalasnjikov",
      "kars_1_tigran_hamasyan",

      "kimigayo_national_anthem_of_japan",
      "korobeiniki-tetris",
      "kukla_kolduna",
      "mahler_4_3",
      "major_diatonic_chords",

      "malenkiy-princ",
      "maple_starts",

      "mesecina",
      "mihail-krug-vladimirskiy-central",

      "motion-sickness---phoebe-bridgers",

      "mpaintoyska",
      "my_wild_irish_rose",
      "never_gunna_give_you_up_barbershop",
      "now_voyager_suite_max_steiner",
      "opa-cupa",

      "piano_tutorial",
      "pirate_melody_16measures_chromatic",
      "pirate_melody_16measures_scales",
      "pirate_melody_16measures_transpositions",
      "pirate_melody_16measures_whole_tone",
      "pirates_5ch",
      "pirates_of_the_caribbean_easy_piano",
      "pirates_of_the_caribbean_easy_piano_capa",
      "pirates_of_the_caribbean_for_alto_saxophone",
      "pirates_of_the_caribbean_hans_zimmer_virtuosic_piano_solo_movement_3",
      "pirates_of_the_caribbean_he_s_a_pirate_hard_version",
      "pirates_of_the_caribbean_main_theme",
      "pirates_of_the_carribean_beginner",
      "pirati_dei_caraibi_per_trio_di_flauti_pirates_of_the_carribean_for_flute_trio",
      "pizzicati-from-sylvia-act-iii-no.-20---leo-delibes---1876",
      "pornofilmy-prosti_proshyay_privet",
      "pornofilmy-prosti_proshyay_privet.1",
      "pornofilmy-prosti_proshyay_privet.2",
      "pornofilmy-ya_tak_soskuchilsya",
      "pornofilmy-ya_tak_soskuchilsya.1",
      "pornofilmy-ya_tak_soskuchilsya.2",
      "portal_still_alive",
      "prelude_in_c_major_bach_piano_solo",

      "pyos",

      "reverie_galimberti",

      "roumen-sirakov-s-daichevo",

      "sadness-and-sorrow",

      "sasha_2",
      "scott-joplin-s-new-rag---revised-edition---c1914----piano-tutorial",

      "shivers_ed_sheeran_shivers_ed_sheeran_mixed_ensemble",

      "skyrim-theme-for-piano",
      "sonata_in_e_minor_hob_xvi_34_joseph_haydn_piano_sonata_hob_xvi_34_2_adagio",

      "sonatina-in-c-major---dennis-alexander",

      "sorcerer_s_puppet_the_king_and_the_jester",
      "steve-reich---piano-phase",
      "string_quartet_in_g_major_hob_iii_75_op_76_no_1_joseph_haydn",

      "string_quartet_no_8_in_e_minor_opus_59_rasumovsky_no_2",
      "sydameni_laulu",
      "symphony_8_1",
      "symphony_no_1_k_16_2nd_movement",

      "the-blues-scale-in-all-12-keys",
      "the-four-chord-song---axis-of-awesome",

      "the-washington-post-piano-john-philip-sousa",

      "the_lamp_is_low",
      "the_seven_diatonic_natural_minor_chords_in_a_minor",
      "thirty_five_smallest_non_diatonic_chords_in_c_or_b",
      "this_charming_man_the_smiths_piano_vocal_guitar",
      "tipichnaya_vecherinka_s_basseynom",
      "tomorrow---giovanni-allevi",

      "underground-cocek",

      "varshaver-freylekhs-klezmer-tune",

      "white_christmas",
      "wonder-wave-by-david-lanz",
      "something-human---muse",
      "priboi",
      "marshmello-alone-sergio-moy-20201220161814-nonstop2k.com",
      "maromis-theme---smoke",
      "na-zare---alyans-na-zare",
      "zappaguri",

      "genesis-that-s-all-piano",
    ],
  },
];
