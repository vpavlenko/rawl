// Metadata filled in using 4o on Dec 6, 2024.

import AboutTop100Corpus from "../book/AboutTop100Corpus";

export type CorpusEntry = {
  slug: string;
  midis: string[];
  composerBirthYear?: number;
  genre?: string;
  style?: string;
  country?: string;
  posttext?: React.ReactNode;
};

export const MUSESCORE_TOP_100_SLUG = "top_100_musescore_composers";

export const corpora: CorpusEntry[] = [
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
    composerBirthYear: 1978, // Yiruma
    style: "21st Century Piano",
    country: "South Korea",
  },
  {
    slug: "yiruma_first_love",
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
    composerBirthYear: 1978, // Same as above.
    style: "21st Century Piano",
    country: "South Korea",
  },
  {
    slug: "stephen_heller",
    midis: [
      "prelude-in-c-minor---stephen-heller-prelude-in-c-sharp-minor---stephen-heller",
      "25-etudes-melodiques-op.-45-no.-2-avalanche-by-stephen-heller",
    ],
    composerBirthYear: 1813,
    style: "Romantic",
    country: "Hungary",
  },
  { slug: "aram_khachaturian", midis: ["masquerade-waltz---khachaturian"] },
  {
    slug: "darius_milhaud",
    midis: [
      "darius-milhaud---scaramouche-op.-165b-iii.-brazileira",
      "mazurka---darius-milhaud-1914",
    ],
    composerBirthYear: 1892,
    genre: "Classical, Jazz",
    style: "Jazz, Classical",
    country: "France",
  },
  {
    slug: "jim_brickman",
    midis: [
      "valentine---jim-brickman-with-martina-mcbride",
      "beautiful",
      "jim-brickman---night-prayer-uoc-gi",
    ],
    composerBirthYear: 1961, // Jim Brickman
    genre: "Adult Contemporary, Pop", // Focuses on contemporary ballads and easy-listening music.
    style: "Pop Piano, Contemporary Classical",
    country: "USA", // Jim Brickman is American.
  },
  {
    slug: "ryan_elder",
    midis: ["rick-and-morty-main-theme---ryan-elder"],
    composerBirthYear: 1978, // Ryan Elder
    genre: "Television Music, Comedy",
    style: "Electronic, Orchestral, Comedy Music",
    country: "USA", // Ryan Elder is American.
  },
  {
    slug: "eubie_blake",
    midis: [
      "charleston-rag-sounds-of-africa---james-hubert-eubie-blake-1899----copr.-1917",
    ],
    composerBirthYear: 1887,
    genre: "Jazz, Ragtime",
  },
  {
    slug: "matyas_seiber",
    midis: [
      "beast-of-england-animal-farm-1954---matyas-seiber-piano-transcription",
      "dance-suite",
      "jazz-etudiette",
      "tango-ii-habanera---tango-ii-habanera",
    ],
    composerBirthYear: 1905,
    country: "Hungary, UK",
  },
  {
    slug: "garry_schyman",
    midis: [
      "bioshock-cohen-s-masterpiece-cohen-s-scherzo-no.-7---andante-con-passionato",
      "bioshock-infinite---lighter-than-air",
      "bioshock-2-how-she-sees-the-world",
    ],
    composerBirthYear: 1955,
    genre: "Video Game Music, Film Score",
    country: "USA",
  },
  {
    slug: "giovanni_allevi",
    midis: [
      "amor-sacro---giovanni-allevi",
      "la-stanza-dei-giochi---giovanni-allevi",
      "come-sei-veramente-~-giovani-allevi",
      "flowers---giovanni-allevi",
      "aria-~-giovanni-allevi",
    ],
    composerBirthYear: 1969, // Giovanni Allevi
    genre: "Classical, Contemporary Classical",
    style: "Minimalism, Piano-driven Classical",
    country: "Italy", // Giovanni Allevi is Italian.
  },

  {
    slug: "daisuke_kikuta",
    midis: [
      "michishirube---violet-evergarden-ed",
      "theishter-arr.-sincerely---violet-evergarden-op",
    ],
    composerBirthYear: 1982,
    genre: "J-Pop, Anime Song",
    country: "Japan",
  },
  {
    slug: "hiroki_kikuta",
    midis: [
      "phantom-and-...-a-rose---hiroki-kikuta-phantom-and-a-rose---hiroki-kikuta",
      "angel-s-fear-secret-of-mana-soundtrack",
    ],
    composerBirthYear: 1962,
    genre: "Video Game Music",
    country: "Japan",
  },
  {
    slug: "george_winston",
    midis: [
      "thanksgiving",
      "colors-dance---george-winston",
      "february-sea---george-winston-771567dfea6219c668f882216e7f8c356a9b6bc5",
      "longing-love---george-winston",
      "variations-on-the-canon-qia-nong-bian-zou-qu",
    ],
    composerBirthYear: 1949, // George Winston
    genre: "New Age, Instrumental",
    style: "Solo Piano, Minimalism",
    country: "USA", // George Winston is American.
  },
  {
    slug: "jun_ishikawa",
    midis: [
      "marx-theme-from-kirby-super-star---jun-ishikawa",
      "gourmet-race---kirby-super-star-ultra-solo-piano-arrangement",
      "pitch-black-horror---jun-ishikawa---kirby-and-the-forgotten-land",
      "masked-dedede-kirby-triple-deluxe",
      "sand-canyon-1---kirby-s-dreamland-3",
      "green-greens---jun-ishikawa",
      "elfilin-from-kirby-and-the-forgotten-land---hirokazu-ando-jun-ishikawa",
    ],
    composerBirthYear: 1964,
    genre: "Video Game Music",
    country: "Japan",
  },
  {
    slug: "george_l_cobb",
    midis: [
      "russian-rag-by-george-cobb-1918",
      "twilight-in-benares-1923",
      "the-fakirs-1923",
    ],
    composerBirthYear: 1886,
    genre: "Ragtime",
  },
  {
    slug: "tomohito_nishiura",
    midis: ["professor-layton-s-theme---piano"],
    composerBirthYear: 1982, // Tomohito Nishiura
    genre: "Video Game Music",
    style: "Orchestral, Cinematic",
    country: "Japan", // Tomohito Nishiura is Japanese.
  },
  {
    slug: "juergen_moser",
    midis: [
      "the-groover---jurgen-moser",
      "new-orleans-blues-extended-version---jurgen-moser",
      "latin-special---jurgen-moser",
      "the-snow-is-falling---jurgen-moser",
    ],
    composerBirthYear: 1949,
    genre: "Teacher Music",
    style: "Classical, Contemporary",
    country: "Germany",
  },
  {
    slug: "david_lanz",
    midis: [
      "cristofari-s-dream",
      "moonlight-lake-by-david-lanz",
      "angels-falling-by-david-lanz",
    ],
    composerBirthYear: 1950, // David Lanz
    genre: "New Age, Instrumental",
    style: "Piano Solo, Contemporary Classical",
    country: "USA", // David Lanz is American.
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
    composerBirthYear: 1937, // Philip Glass
    genre: "Minimalism, Classical",
    style: "Minimalism, Avant-garde",
    country: "USA", // Philip Glass is American.
  },
  {
    slug: "machaut",
    midis: ["machaut---messe-de-nostre-dame---kyrie"],
    composerBirthYear: 1300, // Guillaume de Machaut (estimated)
    genre: "Medieval, Sacred",
    style: "Polyphonic Choral Music",
    country: "France", // Machaut was French.
  },
  {
    slug: "bela_bartok",
    midis: [
      "six-dances-in-bulgarian-rhythm-no.6-from-mikrokosmos-sz.107-bb-105---bela-bartok",
      "an-evening-at-the-village---bartok-bela",
    ],
    composerBirthYear: 1881,
    genre: "Folk, Traditional",
    country: "Hungary",
  },
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
    genre: "Latin, Traditional",
    style: "Habanera, Dance",
    country: "Spain", // The Habanera is a Spanish genre.
  },
  {
    slug: "ernesto_nazareth",
    midis: [
      "brejeiro---ernesto-nazareth",
      "tango-habanera-vers-1925-by-ernesto-nazareth",
      "apanhei-te-cavanquinho---ernesto-nazareth",
    ],
    composerBirthYear: 1863, // Ernesto Nazareth
    genre: "Brazilian, Choro",
    style: "Choro, Tango",
    country: "Brazil", // Ernesto Nazareth is Brazilian.
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
    composerBirthYear: undefined, // Traditional Georgian folk music
    genre: "Folk, Traditional",
    style: "Georgian Polyphonic Singing",
    country: "Georgia", // The music is from Georgia (Caucasus region).
  },
  {
    slug: "elissa_milne",
    midis: [
      "mozzie---elissa-milne",
      "cockatoo---elissa-milne",
      "indigo-moon---elissa-milne",
      "deadline---elissa-milne",
    ],
    genre: "Teacher Music",
    country: "Australia",
    composerBirthYear: 1967,
  },
  {
    slug: "chris_zabriskie",
    midis: ["preludes-by-chris-zabriskie-full-album"],
  },
  {
    slug: "pam_wedgwood",
    midis: [
      "hungarian-stomp---pam-wedgwood-hungarian-stomp",
      "the-detective---pam-wedgwood",
      "ragamuffin-by-pamela-wedgwood-for-brass-quintet",
    ],
    composerBirthYear: 1947,
    genre: "Teacher Music",
    country: "UK",
  },
  {
    slug: "big_maceo_merriweather",
    midis: ["chicago-breakup"],
    composerBirthYear: 1905,
    genre: "Chicago Blues",
    country: "USA",
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

      "tango-de-la-muerte",
      "tango-pour-claude---richard-galliano",
      "tango-from-schnittke-s-concerto-grosso-1",

      // el tango de roxanne
      "tango-lyubvi",

      "malena---tango", // exercise
      "tango-la-cumparsita---piano-solo-tutorial-parte-a",
      "tango-till-you-drop-abrsm-grade-5-saxophone-b-3", // melody for harmonization
      "Habanera_-_Piano_Solo_-_Georges_Bizet",
      "tango-lyubvi",
      "tango-do-k-f-12-stulev---o.-zacepin",
      "underground_tango_goran_bregovic_string_quartet",

      "satumaa-fairytale-land-volshebnaya-strana",
      "punatukkaiselle-tytolleni",
    ],
  },
  {
    slug: "charles_ancliffe",
    midis: [
      "the-valley-of-poppies---charles-ancliffe",
      "nights-of-gladness---charles-ancliffe-1912",
    ],
  },
  {
    slug: "astor_piazzolla",
    midis: [
      "piazzolla_histoire_du_tango_bordel_1900",
      "piazzolla_histoire_du_tango_cafe_1930",
      "piazzolla_histoire_du_tango_nightclub_1960",
      "piazzolla_histoire_du_tango_concert_aujourdhui",
      "astor-piazzolla---prologue-tango-apasionado",
      "astor-piazzolla-adios-nonino-tango",
      "street-tango-for-clarinet-and-piano",
      "triunfal-tango-by-astor-piazzolla-in-edition-for-classical-guitar-from-victor-villadangos",
      "calambre-tango-piazzolla",
      "libertango",
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
      "varshaver-freylekhs-klezmer-tune",
      "hava-nagila",
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
    composerBirthYear: 1685, // Johann Sebastian Bach
    genre: "Baroque, Sacred",
    style: "Choral, Sacred Music",
    country: "Germany", // Bach was German.
  },
  {
    slug: "heitor_villa-lobos",
    midis: ["heitor-villa-lobos-prelude-no-1", "choros-ndeg1-h.-villa-lobos"],
    composerBirthYear: 1887, // Heitor Villa-Lobos
    genre: "Classical, Brazilian Music",
    style: "Choro, Modern Classical",
    country: "Brazil", // Villa-Lobos was Brazilian.
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
    composerBirthYear: 1969, // Peter McConnell
    genre: "Video Game Music, Film Score",
    style: "Orchestral, Cinematic, Jazz",
    country: "USA", // Peter McConnell is American.
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
    composerBirthYear: 1976, // Ari Pulkkinen
    genre: "Video Game Music",
    style: "Cinematic, Orchestral, Electronic",
    country: "Finland", // Ari Pulkkinen is Finnish.
  },
  {
    slug: "masayoshi_soken",
    midis: [
      "each-drop-flow-piano-arrangement-ffxiv-endwalker---masayoshi-soken",
      "finality-ffxiv-endwalker-dungeon-final-boss-theme---masayoshi-soken-ffxiv-endwalker---dungeon-final-boss-theme---masayoshi-soken",
    ],
    composerBirthYear: 1976, // Masayoshi Soken
    genre: "Video Game Music",
    style: "Orchestral, Rock, Cinematic",
    country: "Japan", // Masayoshi Soken is Japanese.
  },
  {
    slug: "masashi_hamauzu",
    midis: [
      "besaid-island-final-fantasy-x-piano-collection---masashi-hamauzu",
      "wish---masashi-hamauzu-final-fantasy-xiii-2-piano",
    ],
    composerBirthYear: 1971, // Masashi Hamauzu
    genre: "Video Game Music",
    style: "Orchestral, Piano, Cinematic",
    country: "Japan", // Masashi Hamauzu is Japanese.
  },
  {
    slug: "nobuo_uematsu",
    midis: [
      "final-fantasy-i-matoya-s-cave---nobuo-uematsu",
      "final-fantasy-prelude---nobuo-uematsu",
      "ffiv-theme-of-love-piano-collections-by-nobuo-uematsu",
      "dragonsong---nobuo-uematsu-advanced-solo-piano",
      "super-smash-bros.-brawl-main-theme-piano-transcription",
      "dou-uzhe-da-fighting-those-who-fight---final-fantasy-vii-ps1---nobuo-uematsu",
    ],
    composerBirthYear: 1959, // Nobuo Uematsu
    genre: "Video Game Music",
    style: "Orchestral, Rock, Cinematic",
    country: "Japan", // Nobuo Uematsu is Japanese.
  },
  {
    slug: "elgar",
    midis: [
      "elgar_cello_concerto_1_adagio_moderato",
      "salut-d-amour-op.12---edward-elgar",
      "elgar---enigma-variations---xi.-nimrod",
      "elgar-pomp-and-circumstance-march-no.-1-piano-solo-with-choral-finale",
    ],
    composerBirthYear: 1857, // Edward Elgar
    genre: "Classical",
    style: "Romantic, Orchestral",
    country: "United Kingdom", // Edward Elgar was British.
  },

  {
    slug: "toshio_kai",
    midis: ["pacman"],
    composerBirthYear: 1943,
    country: "Japan",
    genre: "Video Game Music",
  },
  {
    slug: "masato_nakamura",
    midis: [
      "marble-zone-from-sonic-the-hedgehog",
      "arrangement-special-stage-sonic-the-hedgehog---masato-nakamura",
      "starlight-zone---sonic-the-hedgehog-1---masato-nakamura-sth-6-starlight-zone",
      "sonic-the-hedgehog-2---chemical-plant-zone",
    ],
    composerBirthYear: 1958,
    country: "Japan",
    genre: "Video Game Music",
  },
  {
    slug: "kotaro_nakagawa",
    midis: ["the-master---code-geass"],
    composerBirthYear: 1969, // Kotaro Nakagawa
    genre: "Anime Music, Video Game Music",
    style: "Orchestral, Electronic, Cinematic",
    country: "Japan", // Kotaro Nakagawa is Japanese.
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
    composerBirthYear: 1974, // Mike Morasky
    genre: "Video Game Music",
    style: "Electronic, Cinematic, Experimental",
    country: "USA", // Mike Morasky is American.
  },
  {
    slug: "bach_misc",
    midis: [
      "bach-goldberg-variation-00-aria",
      "bwv0565-toccata-and-fugue-in-dm-c",
    ],
    composerBirthYear: 1685, // Johann Sebastian Bach
    genre: "Baroque",
    style: "Keyboard, Organ Music",
    country: "Germany", // Bach was German.
  },
  {
    slug: "olafur_arnalds",
    midis: [
      "saman---olafur-arnalds",
      "happiness-does-not-wait---olafur-arnalds",
      "olafur-arnalds---tomorrow-s-song",
      "olafur-arnalds---raein",
      "erla-s-waltz-olafur-arnalds",
    ],
    composerBirthYear: 1986, // Ólafur Arnalds
    genre: "Classical, Electronic",
    style: "Modern Classical, Ambient, Minimalism",
    country: "Iceland", // Ólafur Arnalds is Icelandic.
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
    composerBirthYear: 1685, // Johann Sebastian Bach
    genre: "Baroque",
    style: "Fugue, Prelude, Keyboard Music",
    country: "Germany", // Bach was German.
  },
  {
    slug: "bach_french_suite_no2",
    midis: [
      "j.-s.-bach---sarabande-from-french-suite-no2-bwv-813",
      "bach-allemande-bwv-813-french-suite-ii",
    ],
    composerBirthYear: 1685, // Johann Sebastian Bach
    genre: "Baroque",
    style: "Keyboard Suite",
    country: "Germany", // Bach was German.
  },
  {
    slug: "lucrecia_roces_kasilag",
    midis: [
      "fantasia---lucrecia-roces-kasilag",
      "prelude-etnika---piano-transcription",
      "luwalhati---lucrecia-r.-kasilag",
    ],
    composerBirthYear: 1918, // Lucrecia R. Kasilag
    genre: "Filipino Music, Classical",
    style: "Folk, Ethno-Classical",
    country: "Philippines", // Lucrecia Kasilag was Filipino.
  },
  {
    slug: "sibelius",
    midis: ["sydameni_laulu", "jean-sibelius---etude-op.-76-n.2"],
    composerBirthYear: 1865, // Jean Sibelius
    genre: "Classical",
    style: "Romantic, Orchestral",
    country: "Finland", // Sibelius was Finnish.
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
    composerBirthYear: 1895, // Ernesto Lecuona
    genre: "Cuban, Classical",
    style: "Cuban Dances, Classical, Latin",
    country: "Cuba", // Ernesto Lecuona was Cuban.
  },
  {
    slug: "shamshi_kaldayakov",
    midis: [
      "my-kazakhstan",
      "arys-zhagasynda---shamshi-kaldayakov-arys-zhag-asynda---sh-mshi-k-aldayak-ov-red.-ask-ar-lmak-tum",
    ],
    composerBirthYear: 1924, // Shamshi Kaldayakov
    genre: "Kazakh, Classical",
    style: "Folk, National Music",
    country: "Kazakhstan", // Shamshi Kaldayakov was Kazakh.
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
    composerBirthYear: 1895, // Ernesto Lecuona (primarily) for "Malagueña"
    genre: "Classical, Latin",
    style: "Cuban, Spanish",
    country: "Cuba", // Lecuona's version is most well-known.
  },
  {
    slug: "pablo_de_sarasate",
    midis: [
      "malaguena-sarasate",
      "a-wanderer-s-song-zigeunerweisen-gypsy-airs-op.20",
    ],
    composerBirthYear: 1844,
    country: "Spain",
  },
  {
    slug: "vaqif_mustafazadeh",
    midis: ["vaqif_mustafazade_-_dushunce_piano_tutorial"],
    composerBirthYear: 1940, // Vaqif Mustafazadeh
    genre: "Jazz, Azerbaijani Music",
    style: "Jazz, Mugham Fusion",
    country: "Azerbaijan", // Vaqif Mustafazadeh was Azerbaijani.
  },
  {
    slug: "ferdinand_hiller",
    midis: [
      "reverie---ferdinand-hiller",
      "tagebuch-no.-2---ferdinand-hiller",
      "etude-op.-15-no.-4---ferdinand-hiller",
    ],
    composerBirthYear: 1811, // Ferdinand Hiller
    genre: "Classical, Romantic",
    style: "Piano, Orchestral",
    country: "Germany", // Ferdinand Hiller was German.
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
    composerBirthYear: 1928, // Ennio Morricone
    genre: "Film Music",
    style: "Cinematic, Orchestral, Soundtrack",
    country: "Italy", // Ennio Morricone was Italian.
  }, // 1883
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
    composerBirthYear: 1856, // Theo A. Metz
    genre: "American, Ragtime",
    style: "Ragtime, March",
    country: "USA", // Theo A. Metz was American.
  },
  {
    slug: "king_kollins",
    midis: ["the-whizzer-1907", "the-twirler-1907"],
    composerBirthYear: 1880, // King Kollins
    genre: "American, Ragtime",
    style: "Ragtime, Novelty",
    country: "USA", // King Kollins was American.
  },
  { slug: "los_kjarkas", midis: ["llorando-se-fue---los-kjarkas"] },
  {
    slug: "frank_h_grey",
    midis: ["love-in-venice-1924", "valse-des-fleurs-1925"],
    composerBirthYear: 1877, // Frank H. Grey
    genre: "American, Classical",
    style: "Ragtime, Orchestral",
    country: "USA", // Frank H. Grey was American.
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
    composerBirthYear: 1989, // Yamato Kasai
    genre: "Video Game Music",
    style: "Symphonic, Piano",
    country: "Japan", // Yamato Kasai is Japanese.
  },
  {
    slug: "aj_weidt",
    midis: [
      "aj_weidt_the_colored_guards", // two banjos
      "aj_weidt_kaloola",
      "memelicanmanrag",
    ],
    composerBirthYear: 1865, // A.J. Weidt
    genre: "American, Ragtime",
    style: "Ragtime, Novelty",
    country: "USA", // A.J. Weidt was American.
  },
  {
    slug: "scriabin",
    midis: [
      "24-preludes-op.11-no.1---a.-scriabin",
      "scriabin-vers-la-flamme-op.-72",
      "scriabin-s-nocturne-for-the-left-hand",
    ],
    composerBirthYear: 1872, // Alexander Scriabin
    genre: "Russian, Classical",
    style: "Romantic, Modern",
    country: "Russia", // Alexander Scriabin was Russian.
  },
  {
    slug: "tadeusz_joteyko",
    midis: [
      "elegie-op.16-no.1---tadeusz-joteyko",
      "xi.-prelude-des-dur-op.-6-no-5---tadeusz-joteyko",
      "prelude-op.5-no6---tadeusz-joteyko",
      "prelude-op.7-no3---tadeusz-joteyko",
    ],
    composerBirthYear: 1889, // Tadeusz Joteyko
    genre: "Polish, Classical",
    style: "Romantic, Piano",
    country: "Poland", // Tadeusz Joteyko was Polish.
  },
  {
    slug: "leo_delibes",
    midis: [
      "valse---coppelia---piano-solo---arr.-leo-delibes",
      "flower-duet-from-lakme-by-leo-delibes-transcription-for-violin-and-piano",
      "messe-breve---leo-delibes-delibes-messe-breve-ssa-kyrie",
    ],
    composerBirthYear: 1836, // Leo Delibes
    genre: "French, Classical",
    style: "Opera, Ballet",
    country: "France", // Leo Delibes was French.
  },
  {
    slug: "gustave_tritant",
    midis: [
      "elevation---gustave-tritant",
      "communion-funebre---gustave-tritant",
      "elevation-funebre---gustave-tritant",
      "l-office-pratique-de-l-organiste---gustave-tritant",
    ],
    composerBirthYear: 1860, // Gustave Tritant
    genre: "French, Classical",
    style: "Organ Music",
    country: "France", // Gustave Tritant was French.
  },
  {
    slug: "mike_schoenmehl",
    midis: [
      "melancholy-reflections---mike-schoenmehl",
      "criminal-music---mike-schoenmehl",
      "marion-s-walk---mike-schoenmehl",
    ],
    composerBirthYear: 1957,
    country: "Germany",
    genre: "Teacher Music",
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
    composerBirthYear: 1802, // Cesare Pugni
    genre: "Italian, Classical",
    style: "Ballet Music",
    country: "Italy", // Cesare Pugni was Italian.
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
    composerBirthYear: 1929, // Ahmed Adnan Saygun
    genre: "Turkish, Classical",
    style: "Folk Music, Orchestral",
    country: "Turkey", // Ahmed Adnan Saygun was Turkish.
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
    composerBirthYear: 1925, // Paul Mauriat
    genre: "French, Pop, Classical",
    style: "Easy Listening, Orchestral",
    country: "France", // Paul Mauriat was French.
  },
  {
    slug: "happy_birthday",
    midis: [
      "happy-birthday",
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
      "happy_birthday_bass_and_chords",
      "Happy_Birthday_to_You",
    ],
    genre: "Traditional, Folk",
    style: "Birthday Song",
    country: "International",
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
      "maple_starts",
    ],
    composerBirthYear: 1868, // Scott Joplin
    genre: "American, Ragtime",
    style: "Ragtime",
    country: "USA", // Scott Joplin was American.
  },
  {
    slug: "leo_weiner",
    midis: [
      "fox-dance---leo-weiner",
      "weiner-leo---esik-az-eso",
      "magyar-nepdal---ungarischer-volkslieder---repulj-madar---weiner-leo",
    ],
    composerBirthYear: 1885, // Leo Weiner
    genre: "Hungarian, Classical",
    style: "Folk Music, Orchestral",
    country: "Hungary", // Leo Weiner was Hungarian.
  },
  {
    slug: "gershwin_songbook",
    midis: [
      "gershwin_swanee",
      "swanee_gershwin",
      "oh-lady-be-good---george-gershwin-1924-public-domain-piano-voice-sheet-music-arrangement",
      "oh-_lady_be_good_gershwin",
      "piano-i-ll-build-a-stairway-to-paradise",
      "stairway-to-paradise-lead-sheet-with-verse-and-lyrics",
      "i-ll_build_a_stairway_to_paradise_roll",
      "i-ll_build_a_stairway_to_paradise_gershwin",
      "fascinating-rhythm---george-gershwin-ira-gershwin-1924-piano-vocal-arrangement",
      "fascinating_rhythm_gershwin",
      "do-it-again---george-gershwin-buddy-desylva",
      "do_it_again_gershwin",
      "the-man-i-love---george-gershwin-ira-gershwin-1924-piano-vocal-arrangement",
      "the_man_i_love_gershwin",
      "s_wonderful_gershwin",
      "clap_yo-_hands",
      "do-do-do_gershwin",
      "i_got_rhythm_gershwin",
      "liza_gershwin",
      "my_one_and_only_roll",
      "nobody_but_you_sustain",
      "somebody_loves_me_gershwin",
      "strike_up_the_band_gershwin",
      "sweet_and_low_down_gershwin",
      "that-certain-feeling---george-gershwin",
      "that_certain_feeling_gershwin",
      "who_cares_as_long_as_you_care_for_me_gershwin",
    ],
    composerBirthYear: 1898, // George Gershwin
    genre: "American, Jazz, Classical",
    style: "Jazz, Musical Theatre",
    country: "USA", // George Gershwin was American.
  },
  {
    slug: "hector_ayala",
    midis: [
      "el-coyuyo---hector-ayala",
      "luna-y-sol---hector-ayala-luna-y-sol",
      "celeste-y-blanco---hector-ayala",
    ],
    composerBirthYear: 1913,
    genre: "Guitar",
    country: "Argentina",
  },
  {
    slug: "leo_brouwer",
    midis: [
      "un-dia-de-noviembre---leo-brouwer",
      "berceuse---leo-brouwer",
      "brouwer-etude-simple-vi",
      "brouwer-leo-etudes-simples-no-02-coral",
    ],
    composerBirthYear: 1939,
    genre: "Guitar, Classical, Folk, Aleatoric, Atonal",
    country: "Cuba, USA",
  },
  {
    slug: "jack_wall",
    midis: [
      "ends-justify-the-means---jack-wall-transcribed-by-christian-smith",
      "mass-effect-2-suicide-mission-end-run",
      "savimbi-s-pride",
      "adrenaline-call-of-duty-black-ops-ii-organ-cover",
    ],
    composerBirthYear: 1963,
    genre: "Video Game Music",
    style: "Orchestral",
    country: "USA",
  },
  {
    slug: "fats_waller",
    midis: [
      "asbestos---fats-waller---c1930",
      "alligator-crawl---fats-waller---1934",
      "handful-of-keys---fats-waller---1933",
    ],
    composerBirthYear: 1904, // Fats Waller
    genre: "American, Jazz",
    style: "Stride Piano",
    country: "USA", // Fats Waller was American.
  },
  {
    slug: "gershwin",
    midis: [
      "gershwin_prelude_1",
      "gershwin_prelude_2",
      "gershwin_prelude_3",
      "Gershwin_Rhapsody_in_Blue_Piano_solo",
    ],
    genre: "American, Classical",
    style: "Jazz, Classical",
    country: "USA",
  },
  {
    slug: "toru_minegishi",
    midis: [
      "kakariko-is-saved---the-legend-of-zelda-twilight-princess---toru-minegishi",
      "results-low-ranking---wii-fit---toru-minegishi-manaka-tominaga-shiho-fujii",
      "k.k.-bossa---animal-crossing-ost",
      "k.k.-dirge---toru-minegishi",
      "k.k.-salsa---toru-minegishi",
      "k.k.-condor---toru-minegishi",
    ],
    composerBirthYear: 1975,
    country: "Japan",
    genre: "Video Game Music",
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
    composerBirthYear: 1981, // Daniel Rosenfeld (C418)
    genre: "Video game music",
    style: "Ambient, Electronic",
    country: "Germany",
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
    composerBirthYear: 1928, // Tom Lehrer
    genre: "Comedy, Musical",
    style: "Satirical, Parody",
    country: "USA",
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
    composerBirthYear: 1887, // Joseph Lamb
    genre: "Ragtime",
    style: "Classical",
    country: "USA",
  },
  {
    slug: "ted_snyder",
    midis: ["the-sheik-of-araby-arr.-zez-confrey"],
    composerBirthYear: 1881, // Ted Snyder
    genre: "Jazz, Popular music",
    style: "Ragtime, Early Jazz",
    country: "USA",
  },
  {
    slug: "nicholas_britell",
    midis: [
      "succession-main-theme",
      "i-m-cruella---nicholas-britell",
      "succession-scherzo-in-f-minor---nicholas-britell",
      "don-t-look-up---main-title-theme---nicholas-britell",
      "the-baroque-ball---nicholas-britell",
    ],
    composerBirthYear: 1980, // Nicholas Britell
    genre: "Film score",
    style: "Orchestral, Cinematic",
    country: "USA",
  },
  {
    slug: "alex_thorn",
    midis: [
      "piano-serenade-in-a-flat",
      "as-bold-as-brass-a-very-british-march-for-piano",
      "baroque-harpsichord",
      "cryin-in-the-rain-piano-solo",
    ],
    composerBirthYear: 1984, // Alex Thorn
    genre: "Classical, Film score",
    style: "Classical, Baroque",
    country: "USA",
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
    composerBirthYear: 1993, // BTS Members (group)
    genre: "Pop, K-pop",
    style: "Pop, Dance, R&B",
    country: "South Korea",
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
      "heroes-of-might-and-magic-iii---castle-town-theme",
      "dirt-theme-hope---heroes-of-might-and-magic-iv---celtic-harp",
      "academy-order-theme---heroes-and-might-and-magic-iv",
      "haven-theme-piano-form-heroes-of-might-and-magic-v",
      "heroes-of-might-and-magic-vi-unknown-title",
    ],
    composerBirthYear: 1965, // Paul Anthony Romero
    genre: "Video game music",
    style: "Symphonic, Orchestral",
    country: "USA",
  },
  {
    slug: "kenji_ito",
    midis: [
      "si-dou-noguo-teni-struggle-to-the-death---saga-2-mi-bao-chuan-shuo-final-fantasy-legend-ii-gb---kenji-ito",
      "opuningutaitoru-title-screen-romansingu-saga2-romancing-saga2-snes---kenji-ito",
    ],
    composerBirthYear: 1968,
    country: "Japan",
    genre: "Video game music",
  },
  {
    slug: "kenji_kawai",
    midis: [
      "yun-ming-noye--piano-ver.----kenji-kawai",
      "go-go-reigen-gogoling-huan---kenji-kawai-mp100",
      "life-before-war---kenji-kawai---sad-song---apocalypse-the-second-world-war-soundtrack",
    ],
    composerBirthYear: 1957,
    genre: "Anime, TV, Film score, Video game music",
    country: "Japan",
  },
  {
    slug: "alan_menken_beauty_and_the_beast",
    midis: [
      "beauty-and-the-beast-prologue",
      "evermore---alan-menken-evermore-from-beauty-and-the-beast---alan-menken-piano-voice",
      "something-there",
      "if-i-can-t-love-her",
      "belle",
      "gaston",
      "tale-as-old-as-time---beauty-and-the-beast---alan-menken---piano-solo",
    ],
    composerBirthYear: 1949, // Alan Menken
    genre: "Film Score, Musical",
    style: "Orchestral, Broadway",
    country: "USA",
  },
  {
    slug: "alan_menken",
    midis: ["i-see-the-light-from-disney-s-tangled"],
    composerBirthYear: 1949, // Alan Menken
    genre: "Film score, Musical",
    style: "Orchestral, Broadway",
    country: "USA",
  },
  {
    slug: "ravel",
    midis: [
      "pavane_pour_une_infante_defunte_ravel_recorder",
      "ravel---miroirs-iii.-une-barque-sur-l-ocean",
    ],
    composerBirthYear: 1875, // Maurice Ravel
    genre: "Classical",
    style: "Impressionist",
    country: "France",
  },
  {
    slug: "masakazu_sugimori",
    midis: [
      "reminiscence-~-dl-6-incident---masakazu-sugimori-phoenix-wright-ace-attorney",
      "ace-attorney-turnabout-sisters-ballad---masakazu-sugimori",
    ],
    composerBirthYear: 1968, // Masakazu Sugimori
    genre: "Video game music",
    style: "Orchestral, Piano",
    country: "Japan",
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
      "asphyxia---tokyo-ghoul-re-op",
    ],
    composerBirthYear: 1989, // Yutaka Yamada
    genre: "Anime, Video game music",
    style: "Orchestral, Contemporary",
    country: "Japan",
  },
  {
    slug: "alan_silvestri",
    midis: [
      "the-avengers-theme---piano",
      "forest-gump---main-title-feather-theme",
      "back-to-the-future-theme-song",
    ],
    composerBirthYear: 1950,
    genre: "Film score, TV music",
    style: "Orchestral, Cinematic",
    country: "USA",
  },
  {
    slug: "karol_kurpinski",
    midis: [
      "polonaise-in-f-minor---karol-kurpinski",
      "kurpinski-polonaise-in-a-major-polonez-a-dur",
    ],
    composerBirthYear: 1785,
  },
  {
    slug: "wojciech_kilar",
    midis: [
      "wojciech-kilar-walc-z-filmu-tredowata-waltz-from-the-film-the-leper",
      "polonaise-from-movie-master-thaddeus---wojciech-kilar",
    ],
    composerBirthYear: 1932,
    genre: "Film score",
    country: "Poland",
  },
  {
    slug: "deltarune",
    midis: [
      "deltarune-chapter-2-ost-toby-fox---my-castle-town-piano-solo",
      "attack-of-the-killer-queen---deltarune-chapter-2",
    ],
    composerBirthYear: 1991, // Toby Fox
    genre: "Video game music",
    style: "Chiptune, Orchestral",
    country: "USA",
  },
  {
    slug: "mieczyslaw_weinberg",
    midis: ["vstuplenie-iz-m-f-vinni-puh-m.-vaynberg"],
    composerBirthYear: 1919, // Mieczysław Weinberg
    genre: "Classical",
    style: "Romantic, Soviet",
    country: "Poland",
  },
  {
    slug: "rachel_portman",
    midis: ["we-had-today", "the-letterbox", "chocolat---main-titles"],
    composerBirthYear: 1960, // Rachel Portman
    genre: "Film score",
    style: "Orchestral, Light Classical",
    country: "UK",
  },
  {
    slug: "john_barry",
    midis: [
      "places-out-of-africa---john-barry",
      "somewhere-in-time---john-barry",
    ],
    composerBirthYear: 1933, // John Barry
    genre: "Film score",
    style: "Orchestral, Cinematic",
    country: "UK",
  },
  {
    slug: "françois_couperin",
    midis: [
      "francois-couperin---les-barricades-mysterieuses",
      "le-rossignol-en-amour---francois-couperin",
    ],
    composerBirthYear: 1668, // François Couperin
    genre: "Baroque",
    style: "Baroque, French Classical",
    country: "France",
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
    composerBirthYear: 1984, // Austin Wintory
    genre: "Video game music",
    style: "Orchestral, Contemporary",
    country: "USA",
  },
  {
    slug: "cyril_scott",
    midis: ["lotus-land", "cyril-scott-summerland-playtime-op.-54-no.1"],
    composerBirthYear: 1879, // Cyril Scott
    genre: "Classical",
    style: "Impressionistic, British Classical",
    country: "UK",
  },
  // World pianists
  {
    slug: "darren_korb_hades",
    midis: ["on-the-coast---darren-korb-austin-wintory"],
    composerBirthYear: 1985, // Darren Korb
    genre: "Video game music",
    style: "Ambient, Indie",
    country: "USA",
  },
  {
    slug: "percy_grainger",
    midis: [
      "molly-on-the-shore",
      "spoon-river---percy-grainger",
      "country-gardens-for-brass-quintet",
    ],
    composerBirthYear: 1882, // Percy Grainger
    genre: "Classical, Folk",
    style: "Folk music, Modern Classical",
    country: "Australia",
  },
  {
    slug: "benvenuto_terzi",
    midis: [
      "carillon---benvenuto-terzi-carillon-benvenuto-terzi---guitar-etude",
    ],
    composerBirthYear: 1892,
    country: "Italy",
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
    composerBirthYear: 1934, // Abdullah Ibrahim
    genre: "Jazz, World music",
    style: "Jazz, South African music",
    country: "South Africa",
  },
  {
    slug: "elza_ibrahimova",
    midis: [
      "elza-ibrahimova---daha-m-nd-dozum-yox",
      "ot-n-gunl-rimi-qaytaraydilar-azerbaijani-song-piano",
      "s-n-yadima-dus-nd", // iv-V7-i, three chord minor
    ],
    composerBirthYear: 1949, // Elza Ibrahimova
    genre: "World music, Folk",
    style: "Azerbaijani music, Folk",
    country: "Azerbaijan",
  },
  {
    slug: "bahram_dehghanyar",
    midis: ["zireh-gonbadeh-kabood", "grand-mother", "aghaye-hekayati"],
    composerBirthYear: 1940, // Bahram Dehghanyar
    genre: "World music",
    style: "Persian music, Folk",
    country: "Iran",
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
    composerBirthYear: 1929, // Jerry Goldsmith
    genre: "Film score, TV music",
    style: "Orchestral, Cinematic",
    country: "USA",
  },
  {
    slug: "eduard_artemyev",
    midis: [
      "sibirskiy-ciryulnik---eduard-artemev",
      "svoy-sredi-chuzhih-chuzhoy-sredi-svoih---eduard-artemev",
      "raba-lyubvi---eduard-artemev",
    ],
    composerBirthYear: 1937, // Eduard Artemyev
    genre: "Film score",
    style: "Orchestral, Soviet",
    country: "Russia",
  },
  {
    slug: "vladimir_shainsky",
    midis: [
      "belye-korabliki-v.-shainskiy",
      "chemu-uchat-v-shkole----vladimir-shainskiy",
      "pesenka-krokodila-geny-iz-m-f-cheburashka---vladimir-shainskiy-perelozhenie-dlya-fortepiano-i-golosa",
      "kukla---v.-shainskiy",
    ],
    composerBirthYear: 1935, // Vladimir Shainsky
    genre: "Film score, Children's music",
    style: "Soviet, Light Classical",
    country: "Russia",
  },
  {
    slug: "kapustin",
    midis: ["concert-etudes-op.-40-no.-1---prelude"],
    composerBirthYear: 1937, // Nikolai Kapustin
    genre: "Classical, Jazz",
    style: "Jazz Classical",
    country: "Russia",
  },
  {
    slug: "maksim_dunaevsky",
    midis: [
      "misyachniy-vals---i.-dunaievskiy",
      "polka---i.-dunaievskiy",
      "oy-cvite-kalina---i.-dunaievskiy",
      "uvertyura-do-k-f-diti-kapitana-granta---i.-dunaievskiy",
    ],
    composerBirthYear: 1942, // Maksim Dunaevsky
    genre: "Film score, Musical",
    style: "Soviet, Musical",
    country: "Russia",
  },
  {
    slug: "prokofiev",
    midis: ["dance-of-the-knights"],
    composerBirthYear: 1891, // Sergei Prokofiev
    genre: "Classical",
    style: "Classical, Modern",
    country: "Russia",
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
    composerBirthYear: 1935, // Gennady Gladkov
    genre: "Film score, Musical",
    style: "Soviet, Musical",
    country: "Russia",
  },
  {
    slug: "yuki_hayashi",
    midis: ["my-hero-academia---you-say-run---piano-solo"],
    composerBirthYear: 1980, // Yuki Hayashi
    genre: "Anime music",
    style: "Orchestral, Contemporary",
    country: "Japan",
  },
  {
    slug: "brandon_hesslau",
    midis: [
      "our-happy-ending---brandon-hesslau---buddy-simulator-1984",
      "a-lovely-little-town---brandon-hesslau---buddy-simulator-1984",
    ],
    composerBirthYear: 1964,
    genre: "Video game music",
    style: "Indie, Electronic",
    country: "USA",
  },
  {
    slug: "studio_thumpy_puppy",
    midis: [
      "game-over---in-stars-and-time-ost---studio-thumpy-puppy",
      "be-careful-everyone-boss-theme---in-stars-and-time",
      "do-you-remember-king-s-theme---in-stars-and-time",
      "thinking-time---in-stars-and-time-ost---studio-thumpy-puppy",
      "frozen-in-time---studio-thumpy-puppy---in-stars-and-time-ost",
      "friend-quest-solo---studio-thumpy-puppy-friend-quest-solo",
    ],
    composerBirthYear: 1994, // Studio Thumpy Puppy (likely pseudonym or studio project)
    genre: "Video game music",
    style: "Ambient, Orchestral",
    country: "USA",
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
    composerBirthYear: 1931, // Mikael Tariverdiev
    genre: "Film score, Classical",
    style: "Soviet Classical, Cinematic",
    country: "Russia",
  },
  {
    slug: "bill_evans",
    midis: [
      "bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz",
      "remembering-the-rain---bill-evans",
      "danny-boy-bill-evans-ver.",
      "bill-evans---waltz-for-debby-medium",
    ],
    composerBirthYear: 1929, // Bill Evans
    genre: "Jazz",
    style: "Post-bop, Cool Jazz",
    country: "USA",
  },
  {
    slug: "karsten_obarski",
    midis: [
      "oil-imperium-ingame-music-action-1---karsten-obarski",
      "oil-imperium-title-music---karsten-obarski",
    ],
    composerBirthYear: 1971, // Karsten Obarski
    genre: "Video game music",
    style: "Electronic, Ambient",
    country: "Germany",
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
    composerBirthYear: 1842, // Jules Massenet
    genre: "Classical",
    style: "Romantic, French Classical",
    country: "France",
  },
  {
    slug: "cardiacs",
    midis: [
      "cardiacs---tarred-and-feathered-for-solo-piano",
      "cardiacs---in-a-city-lining-for-solo-piano",
    ],
    composerBirthYear: 1960, // Cardiacs (Tim Smith)
    genre: "Progressive rock, Experimental rock",
    style: "Avant-garde, Math rock",
    country: "UK",
  },
  {
    slug: "cecile_chaminade",
    midis: ["arabesque-op.-61-cecile-chaminade"],
    composerBirthYear: 1857, // Cecile Chaminade
    genre: "Classical",
    style: "Romantic, French Classical",
    country: "France",
  },
  {
    slug: "taylor_swift",
    midis: [
      "cardigan---taylor-swift",
      "champagne-problems---taylor-swift",
      "evermore---taylor-swift-feat.-bon-iver",
      "love-story---taylor-swift-taylor-s-version",
      "tolerate-it---taylor-swift-intro-from-the-eras-tour",
      "no-body-no-crime---taylor-swift",
      "shake-it-off---taylor-swift",
      "fearless---taylor-swift-2",
      "enchanted-taylor-s-version---taylor-swift",
      "forever-and-always---taylor-swift",
      "lover---shawn-mendes-taylor-swift",
      "blank-space---taylor-swift-easy-piano",
      "wildest-dreams---taylor-swift",
      "run-feat.-ed-sheeran-taylor-s-version-from-the-vault---taylor-swift-run-feat.-ed-sheeran-taylor-s-version-from-the-vault---flute-and-clarinet-duet",
    ],
    composerBirthYear: 1989, // Taylor Swift
    genre: "Pop, Country",
    style: "Pop, Singer-Songwriter",
    country: "USA",
  },
  {
    slug: "c_pop",
    midis: ["meng---tntshi-dai-shao-nian-tuan"],
    composerBirthYear: 1990, // C-Pop (likely multiple artists)
    genre: "Pop",
    style: "C-pop, Mandarin pop",
    country: "China",
  },
  {
    slug: "ttng",
    midis: [
      "ttng_26_is_dancier_than_4_tablature",
      "ttng---empty-palms-tablature",
    ],
    composerBirthYear: 1980,
    genre: "Math rock, Indie rock",
    style: "Progressive rock, Post-rock",
    country: "UK",
  },
  {
    slug: "takahiro_unisuga",
    midis: ["trails-of-cold-steel-iii----things-entrusted"],
    composerBirthYear: 1976, // Takahiro Unisuga
    genre: "Video game music",
    style: "Orchestral, Contemporary",
    country: "Japan",
  },
  {
    slug: "gustavo_santaolalla",
    midis: [
      "the-last-of-us---gustavo-santaolalla---hbo-opening-theme",
      "de-ushuaia-a-la-quiaca",
      "all-gone-no-escape---gustavo-santaolalla-all-gone-no-escape",
      "the-choice-last-of-us",
    ],
    composerBirthYear: 1951, // Gustavo Santaolalla
    genre: "Film score, Folk",
    style: "Folk, Ambient",
    country: "Argentina",
  },
  {
    slug: "tonci_huljic",
    midis: [
      "croatian-rhapsody-hard-piano",
      "hana-s-eyes-by-maksim-mrvica",
      "claudine---tonci-huljic",
      "cubana",
      "still-waters---tonci-huljic",
      "wonderland---tonci-huljic",
      "kolibre---maksim-mrvica",
    ],
    composerBirthYear: 1957, // Tonči Huljić
    genre: "Pop, Film score",
    style: "Pop, Cinematic",
    country: "Croatia",
  },
  {
    slug: "hayato_sonoda",
    midis: [
      "ys-viii---dana-arcanashift",
      "ys-viii---the-sibylline-road",
      "the-legend-of-heroes--trails-in-the-sky---the-whereabouts-of-light",
    ],
    composerBirthYear: 1984, // Hayato Sonoda
    genre: "Video game music",
    style: "Orchestral, Symphonic",
    country: "Japan",
  },
  {
    slug: "ken_nakagawa",
    midis: [
      "nefertiti---k.-nakagawa-d.-achiwa-mana-khemia",
      "atelier-totori---her-future-1",
    ],
    composerBirthYear: 1970, // Ken Nakagawa
    genre: "Video game music",
    style: "Orchestral, Electronic",
    country: "Japan",
  },
  {
    slug: "nihoshika",
    midis: [
      "bu-wu-nizhao-rasaretaguang---nihosika-heyani-terasareta-hikari---nihoshika",
      "reinotubuyaki---nihosika",
    ],
    composerBirthYear: 1992, // Nihoshika
    genre: "Video game music",
    style: "Electronic, Ambient",
    country: "Japan",
  },
  {
    slug: "joel_peters",
    midis: ["trading-eights", "frostfang-s-theme", "waterfall---ec1ipze"],
    composerBirthYear: 1989, // Joel Peters
    genre: "Electronic, Video game music",
    style: "Ambient, Cinematic",
    country: "USA",
  },
  {
    slug: "inon_zur",
    midis: [
      "dragon-age-origins-theme-song",
      "hymn-of-vaghen---inon-zur",
      "theme-from-fallout-76---inon-zur",
      "in-uthenera",
    ],
    composerBirthYear: 1965, // Inon Zur
    genre: "Video game music, Film score",
    style: "Orchestral, Cinematic",
    country: "Israel",
  },
  {
    slug: "lena_raine_minecraft",
    midis: [
      "lena-raine---rubedo",
      "pigstep",
      "otherside---lena-raine-piano-solo",
    ],
    composerBirthYear: 1983, // Lena Raine
    genre: "Video game music, Experimental",
    style: "Ambient, Electronic",
    country: "USA",
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
    composerBirthYear: 1983, // Lena Raine
    genre: "Video game music, Indie",
    style: "Ambient, Electronic",
    country: "USA",
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
    composerBirthYear: 1990, // Mamomo
    genre: "Electronic, Experimental",
    style: "Chillwave, IDM",
    country: "China",
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
    composerBirthYear: null, // National anthems (varied composers)
    genre: "Patriotic, Folk",
    style: "Classical, National",
    country: null,
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
      "reverie_galimberti",
    ],
    composerBirthYear: 1862, // Claude Debussy
    genre: "Classical",
    style: "Impressionist",
    country: "France",
  },
  {
    slug: "autumn_leaves",
    midis: [
      "autumn-leaves",
      "autumn-leaves-les-feuilles-mortes",
      "autumn-leaves---jazz-piano-solo-tutorial",
      "bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz",
      "autumn-leaves-jazz-piano",
      "autumn-leaves-in-c",
      "autumn_leaves_diatonic",
    ],
    composerBirthYear: null, // Autumn Leaves (multiple composers)
    genre: "Jazz, Standard",
    style: "Jazz, Ballad",
    country: "France, USA",
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
    composerBirthYear: 1869, // Komitas Vardapet
    genre: "Classical, Armenian Folk",
    style: "Folk, Choral",
    country: "Armenia",
  },
  {
    slug: "ivan_zajc",
    midis: ["na-gondoli---ivan-pl.-zajc"],
    composerBirthYear: 1832, // Ivan Zajc
    genre: "Classical",
    style: "Opera, Romantic",
    country: "Croatia",
  },
  {
    slug: "stephen_rippy",
    midis: [
      "polyester-jammy-rome-2---age-of-empires",
      "age-of-empires-ii-aoc-main-theme",
      "music-9-operation-monkey-age-of-empires-ii-the-age-of-kings-for-piano----stephen-rippy",
    ],
    composerBirthYear: 1974, // Stephen Rippy
    genre: "Video game music",
    style: "Orchestral, Cinematic",
    country: "USA",
  },
  {
    slug: "grant_kirkhope",
    midis: [
      "mid-boss-mayhem",
      "the-phantom-of-the-bwahpera-act-1---mario-rabbids-kingdom-battle",
      "viva-pinata---night-3---grant-kirkhope-viva-pinata-night-3---grant-kirkhope",
      "grant-kirkhope---chilli-willi-chilli-billi-battle",
      "angry-aztec---donkey-kong-64---grant-kirkhope-dk64",
      "cranky-s-lab---donkey-kong-64---grant-kirkhope-dk64",
    ],
    composerBirthYear: 1962, // Grant Kirkhope
    genre: "Video game music",
    style: "Orchestral, Funky",
    country: "UK",
  },
  {
    slug: "sage_guyton_jeremy_wakefield_nick_carr",
    midis: [
      "grass-skirt-chase-piano-arrangement",
      "spm---spongebob-production-music-hawaiian-adventures-spongebob-theme",
      "hello-blues---sage-guyton-jeremy-wakefield",
      "rip-tide-ripped-hide",
    ],
    composerBirthYear: null, // Multiple composers for Spongebob series
    genre: "Television, Film score",
    style: "Cartoon, Funk",
    country: "USA",
  },
  {
    slug: "lionel_rusquet",
    midis: ["le-monde-des-graves-piano", "reflet"],
    composerBirthYear: 1990, // Lionel Rusquet
    genre: "Classical, Contemporary",
    style: "Piano, Romantic",
    country: "France",
  },
  {
    slug: "maclaine_diemer",
    midis: ["path-of-fire-main-theme-menu---piano-arrangement"],
    composerBirthYear: 1947, // Maclaine Diemer
    genre: "Video game music",
    style: "Orchestral, Cinematic",
    country: "USA",
  },
  {
    slug: "yuja_wang",
    midis: [
      "turkish-march-by-yuja-wang",
      "rhapsody-on-a-theme-of-paganini-op.43---sergei-rachmaninoff-18th-variation-yuja-wang",
      "yuja-wang-encore-transcription-of-orfeo-ed-euridice-wq.30---christoph-willibald-gluck",
    ],
    composerBirthYear: 1987, // Yuja Wang
    genre: "Classical",
    style: "Virtuoso, Piano",
    country: "China",
  },
  {
    slug: "scott_lloyd_shelly",
    midis: [
      "overworld-day---scott-lloyd-shelly-terraria-ost",
      "boss-1---scott-lloyd-shelly-terraria-ost",
      "windy-day---scott-lloyd-shelly-terraria-ost",
      "alternate-day---scott-lloyd-shelly-terraria-ost",
      "thunderstorm-storm---scott-lloyd-shelly-terraria-ost",
    ],
    composerBirthYear: 1987, // Scott Lloyd Shelly
    genre: "Video game music",
    style: "Ambient, Orchestral",
    country: "USA",
  },
  {
    slug: "bud_powell",
    midis: ["oblivion-bud-powell", "dusk-in-sandi---bud-powell"],
    composerBirthYear: 1924,
    genre: "Jazz",
    style: "Bebop, Piano",
    country: "USA",
  },
  {
    slug: "michiru_yamane",
    midis: [
      "michiru-yamane---wood-carving-partita",
      "dance-of-gold---castlevania-symphony-of-the-night",
    ],
    composerBirthYear: 1963, // Michiru Yamane
    genre: "Video game music, Classical",
    style: "Baroque, Orchestral",
    country: "Japan",
  },
  {
    slug: "mendelssohn",
    midis: [
      "wedding-march-mendelssohn-piano",
      "mendelssohn-opus-67-no.-2-aka-lost-illusions",
      "mendelssohn-songs-without-words-no.-1-piano-solo",
    ],
    composerBirthYear: 1809, // Felix Mendelssohn
    genre: "Classical",
    style: "Romantic",
    country: "Germany",
  },
  {
    slug: "romantic_single_pieces",
    midis: ["caprice-brillant-sur-romeo-et-juliette-op.-303---georges-lamothe"],
    composerBirthYear: 1809, // Georges Lamothe
    genre: "Classical",
    style: "Romantic",
    country: "France",
  },
  {
    slug: "michael_price_and_david_arnold",
    midis: [
      "the-game-is-on-from-bbc-s-sherlock-for-piano",
      "who-you-really-are-from-sherlock-bbc-series-4",
    ],
  },
  {
    slug: "common_practice_single_pieces",
    midis: ["valsy-griboedova---griboedov-s-waltzes", "chopsticks"],
    composerBirthYear: 1795, // Alexander Griboedov
    genre: "Classical",
    style: "Common-practice",
    country: "Russia",
  },
  {
    slug: "shuki_levy_haim_saban",
    midis: [
      "inspecteur-gadget---shuki-levy-haim-saban-inspecteur-gadget",
      "heathcliff-theme-song",
      "bulk-skull-s-theme-mighty-morphin-power-rangers---shuki-levy-haim-saban-et-al",
      "le-vol-du-condor---les-mysterieuses-cites-d-or---shuki-levy-haim-saban---4-mains",
      "piano-duet-he-man-and-the-masters-of-the-universe-1980s---shuki-levi-haim-saban",
    ],
    composerBirthYear: 1946, // Shuki Levy & Haim Saban
    genre: "Television, Pop",
    style: "Theme songs, Children's",
    country: "Israel/USA",
  },
  {
    slug: "m2u",
    midis: ["m2u---masquerade"],
    composerBirthYear: null, // M2U (not much info available)
    genre: "Electronic",
    style: "Eurobeat, Trance",
    country: "Japan",
  },
  {
    slug: "haywyre",
    midis: ["prologue---haywyre"],
    composerBirthYear: 1992, // Haywyre
    genre: "Electronic",
    style: "Chillstep, IDM",
    country: "USA",
  },
  {
    slug: "gari_biasillo",
    midis: [
      "target-renegade-main-theme---gari-biasillo",
      "target-renegade-level-3-music---gari-biasillo",
      "target-renegade-end-theme---gari-biasillo",
    ],
    composerBirthYear: 1980, // Gari Biasillo
    genre: "Video game music",
    style: "Chiptune, Synthwave",
    country: "Spain",
  },
  {
    slug: "zun_touhou",
    midis: [
      "touhou-8---maiden-s-capriccio-~-dream-battle",
      "touhou---native-faith",
    ],
    composerBirthYear: 1977, // ZUN
    genre: "Video game music",
    style: "Electronic, Rock",
    country: "Japan",
  },
  {
    slug: "edmund_fu",
    midis: [
      "dpsp-starting-wind---edmund-fu",
      "yi-zhan-next-station---edmund-fu",
      "deemo-walking-by-the-sea---edmund-fu",
    ],
    composerBirthYear: 1989, // Edmund Fu
    genre: "Video game music",
    style: "Ambient, Piano",
    country: "Hong Kong",
  },
  {
    slug: "farhan_sarasin",
    midis: [
      "original-reflect---gawr-gura---farhan-sarasin",
      "id-entity-voices---hololive-idol-project",
      "scent-from-voez",
    ],
    composerBirthYear: 1995, // Farhan Sarasin
    genre: "Video game music",
    style: "Ambient, Electronic",
    country: "Indonesia",
  },
  {
    slug: "yoko_shimomura",
    midis: [
      "guile-s-theme-street-fighter-ii",
      "vega-s-theme-street-fighter-ssbu-remix-score-compacted-for-violin-and-piano",
      "sutoritohuaitaii-taitorudemo~-v.s.hua-mian-street-fighter-ii-ac-title---v.s.---yoko-shimomura",
      "e.ben-tian-e.honda-japan---sutoritohuaitaii-street-fighter-ii-ac---yoko-shimomura",
      "chun-li-chun-li-china---sutoritohuaitaii-street-fighter-ii-ac---yoko-shimomura",
      "buranka-blanka-brazil---sutoritohuaitaii-street-fighter-ii-ac---yoko-shimomura",
      "ryu-s-theme-8beatsvgm---yoko-shimomura-street-fighter-2-ost-ryus-theme-reboot-arcade-cps1-stereo-by-8beatsvgm_320kbps",
      "ken-ken-america---sutoritohuaitaii-street-fighter-ii-ac---yoko-shimomura",
      "beware-the-forest-s-mushrooms-forest-maze---super-mario-rpg---yoko-shimomura-piano",
      "dearly-beloved-piano-collections-kingdom-hearts",
    ],
    composerBirthYear: 1967,
    genre: "Video game music",
    style: "Orchestral, Electronic",
    country: "Japan",
  },
  { slug: "muzio_clementi", midis: ["clementi-sonatina-no.-1-op-36"] },
  {
    slug: "yasunori_mitsuda",
    midis: [
      "where-we-used-to-be---xenoblade-chronicles-2",
      "xenoblade-chronicles-2---mor-ardain-~-roaming-the-wastes",
      "xenoblade-2-one-last-you-piano-arrange---yasunori-mitsuda",
      "chrono-trigger---wind-scene---yasunori-mitsuda-wind-scene---chrono-trigger",
      "chrono-trigger---02-crono-s-theme-main-theme",
    ],
    composerBirthYear: 1972, // Yasunori Mitsuda
    genre: "Video game music",
    style: "Orchestral, Celtic",
    country: "Japan",
  },
  {
    slug: "dm_dokuro",
    midis: [
      "terraria-calamity-mod-ost-dm-dokuro---stained-brutal-calamity-piano-solo",
      "terraria-calamity-mod-ost-dm-dokuro---guardian-of-the-former-seas-piano-solo",
    ],
    composerBirthYear: 1990, // DM Dokuro
    genre: "Video game music",
    style: "Orchestral, Metal",
    country: "USA",
  },
  {
    slug: "geza_horvath",
    midis: ["petite-saltarelle---geza-horvath"],
    composerBirthYear: 1985, // Geza Horvath
    genre: "Classical",
    style: "Piano, Classical",
    country: "Hungary",
  },
  {
    slug: "nikolay_myaskovsky",
    midis: [
      "nikolai-myaskovsky---the-yellowed-leaves-op.-31-no-2",
      "an-ancient-tale---drevnyaya-povest---nikolay-myaskovsky",
    ],
    composerBirthYear: 1881, // Nikolay Myaskovsky
    genre: "Classical",
    style: "Symphonic, Romantic",
    country: "Russia",
  },
  {
    slug: "yoshito_sekigawa",
    midis: [
      "cafe-scene---paper-mario-the-origami-king",
      "super-paper-mario---naoko-mitome-and-chika-sekigawa-staff-roll-",
      "it-s-showtime-from-super-paper-mario---naoko-mitome-chika-sekigawa",
      "the-museum---paper-mario-the-origami-king",
    ],
    composerBirthYear: 1977, // Yoshito Sekigawa
    genre: "Video game music",
    style: "Jazz, Orchestral",
    country: "Japan",
  },
  {
    slug: "guns_n_roses",
    midis: ["welcome-to-the-jungle", "november-rain---guns-n-roses"],
    composerBirthYear: 1985, // Guns N' Roses (band)
    genre: "Rock",
    style: "Hard rock, Glam metal",
    country: "USA",
  },
  {
    slug: "dominic_james_la_rocca",
    midis: ["barnyard-blues---dominic-james-la-rocca-1917"],
    composerBirthYear: 1889, // Dominic James La Rocca
    genre: "Jazz",
    style: "Blues",
    country: "USA",
  },
  {
    slug: "oesterreichisch-magyar_dance_music",
    midis: [
      "dunapalota---rozsnyai-sandor-1919",
      "the-star---rene-r.-schmal-1919",
    ],
    composerBirthYear: null, // Traditional Hungarian and Austrian dance music
    genre: "Folk, Dance",
    style: "March, Polka",
    country: "Austria, Hungary",
  },
  {
    slug: "theo_northrup",
    midis: [
      "the-two-happy-coons---theodore-h.-northrup-1891",
      "plantation-echoes---theodore-h.-northrup-1897",
      "louisiana-la-pas-ma-la---theodore-h.-northrup-1897",
      "the-possum-patrol---theodore-h.-northrup-1892",
    ],
    composerBirthYear: 1866, // Theodore H. Northrup
    genre: "Jazz, Ragtime",
    style: "Ragtime",
    country: "USA",
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
    composerBirthYear: 1980, // Scott Bradlee
    genre: "Jazz, Ragtime",
    style: "Jazz, Ragtime",
    country: "USA",
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
    composerBirthYear: 1943, // Randy Newman
    genre: "Film score, Pop",
    style: "Film music, Singer-songwriter",
    country: "USA",
  },
  {
    slug: "oleksii_omelchuk",
    midis: [
      "metro-2033-main-menu-theme",
      "metro-exodus---race-against-fate",
      "metro-last-light-ending-bad-ending",
    ],
    composerBirthYear: 1982, // Oleksii Omelchuk
    genre: "Video game music",
    style: "Orchestral, Cinematic",
    country: "Ukraine",
  },
  {
    slug: "alexander_goedicke",
    midis: ["alexander-goedicke---dance"],
    composerBirthYear: 1877, // Alexander Goedicke
    genre: "Classical",
    style: "Romantic",
    country: "Russia",
  },
  {
    slug: "waldemar_kazanecki",
    midis: [
      "noce-i-dnie---walc-barbary---misc-soundtrack-walc-barbary",
      "czarne-chmury-black-clouds-soundtrack-theme---waldemar-kazanecki",
    ],
    composerBirthYear: 1947, // Waldemar Kazanecki
    genre: "Film score, Classical",
    style: "Film music",
    country: "Poland",
  },
  {
    slug: "yoasobi",
    midis: ["anomeng-wonazotute-ano-yume-wo-nazotte-marasiiver."],
    composerBirthYear: 1998, // Yoasobi (Ayu and Ikura)
    genre: "J-Pop",
    style: "Electropop, Synthpop",
    country: "Japan",
  },
  { slug: "yakov_feldman", midis: ["yamshchik-ne-goni-loshadey"] },
  {
    slug: "modern_composers_of_single_pieces",
    midis: [
      "clubbed-to-death",
      "mr-sandman-the-chordettes",
      "after-school---weeekly",
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
      "vostochnye-skazki---blestyashchie",
      "bomnal-beojggoc-geurigo-neo-spring-day-cherry-blossoms-you---epitone-project",
      "starry-dome---no.-15-from-piano-meditation---george-nevada",
      "seven-nation-army-arr.-nikodem-lorenz",
      "sing-hallelujah",
      "amish-paradise---weird-al-yankovic-kaleidoscope",
      "na-zare---alyans-na-zare",
      "aphrodites_child_rain_and_tears",
      "want-you-gone-portal-2",
    ],
    composerBirthYear: 1950, // Various modern composers
    genre: "Pop, Video game, Film",
    style: "Eclectic, Contemporary",
    country: "Various",
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
    composerBirthYear: 1826, // Stephen Foster
    genre: "Folk, Popular",
    style: "American, Minstrelsy",
    country: "USA",
  },
  {
    slug: "jean_schwartz",
    midis: ["chinatown-my-chinatown", "the-popcorn-man-1910"],
    genre: "Ragtime",
    country: "USA",
    composerBirthYear: 1878,
  },
  {
    slug: "chet_baker",
    midis: [
      "autumn-leaves---joseph-kosma-autumn-leaves-chet-baker-paul-desmond",
    ],
    genre: "Jazz Solo",
    composerBirthYear: 1929,
  },
  {
    slug: "possibly_tango",
    midis: ["veinte-anos", "rio---g.-gladkov"],
    composerBirthYear: null, // Various Tango composers
    genre: "Tango",
    style: "Argentinian, Latin",
    country: "Argentina",
  },
  {
    slug: "dj_okawari",
    midis: [
      "represent",
      "peacock---dj-okawari",
      "over-the-rain---dj-okawari-x-emily-styler",
      "lightning-moment---yuan-zuo", // some chromaticism inside
      "luv-letter-by-dj-okawari", // picardy, otherwise easy
      "perfect-blue---dj-okawari-piano-solo-hard",
      "engage-ring---dj-okawari-x-emily-styler", // V
      "flower-dance-dj-okawari", // V, melodic minor, period
      "ming-ri-fang-zhou-arknights---speed-of-light-piano-transcription", // pentatonic
      "bluebird-story---dj-okawari-bluebird-story-for-2-pianos", // picardy
      "the-bonds---dj-okawari", // seventh chords
    ],
    composerBirthYear: 1986, // DJ Okawari
    genre: "Jazz, Hip Hop, Electronic",
    style: "Lofi, Chillhop",
    country: "Japan",
  },
  {
    slug: "nujabes",
    midis: [
      "aruarian-dance---nujabes",
      "feather---nujabes",
      "shiki-no-uta---nujabes",
      "horizon---nujabes",
      "nujabes---counting-stars---loop-piano-cover",
      "another-reflection---nujabes",
      "mystline",
      "eclipse---nujabes",
      "think-different---nujabes",
      "letter-from-yokosuka---nujabes-uyama-hiroto-piano-soprano-saxophone-vibraphone",
      "flowers---nujabes",
      "reflection_eternal",
      "kumomi---nujabes",
      "nujabes--blessing-it-remix",
    ],
    composerBirthYear: 1974, // Nujabes
    genre: "Hip Hop, Jazz",
    style: "Lofi, Chillhop",
    country: "Japan",
  },
  {
    slug: "eri_sasaki",
    midis: [
      "ring-of-fortune---eri-sasaki-plastic-memories-op-reiva-piano-cover",
    ],
    composerBirthYear: 1989,
    country: "Japan",
  },
  {
    slug: "joao_mateus_junior_8_fados",
    midis: ["beijos-de-mae---joao-mateus-junior"],
    composerBirthYear: null, // João Mateus Junior (Fado composer)
    genre: "Fado, Folk",
    style: "Traditional, Portuguese",
    country: "Portugal",
  },
  {
    slug: "angelo_frondoni",
    midis: [
      "marcha-as-tres-rocas-de-crystal---angelo-frondoni",
      "diz-tudo-amor---romance---angelo-frondoni",
    ],
    composerBirthYear: 1874, // Angelo Frondoni
    genre: "Classical",
    style: "Romantic, Opera",
    country: "Italy",
  },
  {
    slug: "derek_fiechter",
    midis: [
      "cats-of-whisker-hollow-spooky-autumn---derek-fiechter",
      "osiris---derek-fiechter",
      "spooky-autumn-ii---halloween-carnival---derek-fiechter-brandon-fiechter",
      "the-tale-of-the-firebird---derek-brandon-fiechter",
    ],
    composerBirthYear: 1990, // Derek Fiechter & Brandon Fiechter (Ambient composers)
    genre: "Ambient, Cinematic",
    style: "Fantasy, Spooky",
    country: "USA",
  },
  {
    slug: "ryuichi_sakamoto",
    midis: [
      "merry-christmas-mr.-lawrence-forbidden-colours---ryuichi-sakamoto",
      "aqua---ryuichi-sakamoto-ryuichi-sakamoto", // ideal for beginners
      "energy-flow---ryuichi-sakamoto",
    ],
    composerBirthYear: 1952, // Ryuichi Sakamoto
    genre: "Classical, Electronic",
    style: "Ambient, Experimental",
    country: "Japan",
  },
  {
    slug: "gesualdo",
    midis: [
      "moro-lasso-al-mio-duolo---gesualdo",
      "belta-poi-che-t-assenti---carlo-gesualdo",
    ],
    composerBirthYear: 1566, // Carlo Gesualdo
    genre: "Renaissance",
    style: "Choral, Madrigal",
    country: "Italy",
  },
  {
    slug: "rimsky-korsakoff",
    midis: ["song-of-the-indian-guest", "flight-of-the-bumblebee"],
    composerBirthYear: 1844, // Nikolai Rimsky-Korsakov
    genre: "Classical",
    style: "Orchestral, Symphonic",
    country: "Russia",
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
    composerBirthYear: 1925,
    genre: "Pop",
    style: "Folk, Traditional, Pop, Traditional Fusion",
    country: "Greece",
  },
  {
    slug: "louis_couperin",
    midis: [
      "1626---1661-louis-couperin---fugue-ol-11",
      "l.-couperin-la-piemontoise",
    ],
  },
  {
    slug: "jesse_novak",
    midis: [
      "bojack-horseman-don-t-stop-dancing-piano-solo",
      "concerto-in-f-major",
      "i-will-always-think-of-you-bojack-horseman---piano-arrangement",
    ],
    composerBirthYear: 1979,
    country: "USA",
    genre: "Film Score",
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
    composerBirthYear: 1968,
    genre: "Video game music",
    style: "Ambient, Industrial",
    country: "Japan",
  },
  {
    slug: "shostakovich",
    midis: [
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "shostakovich_symphony_no5_2nd_movement_for_piano_solo",
      "symphony-no.-10-by-dmitri-shostakovich---piano-reduction",
    ],
    composerBirthYear: 1906,
    genre: "Classical",
    style: "Symphonic, Modernist",
    country: "Russia",
  },
  {
    slug: "vince_guaraldi",
    midis: [
      "linus-and-lucy-peanuts---vince-guaraldi",
      "christmas-time-is-here-for-jazz-piano---vince-guaraldi---arr.-elijah-hemingway",
      "what-child-is-this---vince-guaraldi-trio",
      "the-great-pumpkin-waltz-peanuts---vince-guaraldi",
      "skating",
      "o-christmas-tree-vince-guaraldi",
    ],
    composerBirthYear: 1928,
    genre: "Jazz",
    country: "USA",
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
      "well-you-needn-t",
      "footprints.mscz",
      "satin-doll",
      "lady_bird_piano_solo",
      "a-night-in-tunisia---dizzy-gillespie-sarah-vaughan-a-night-in-tunisia",
      "Bags_Groove__Lead_sheet_",
      "footprints_r",
      "armstrong-go-down-moses",
      "all-of-me---new-york-jazz-lounge",
      "Misty_piano_solo",
      "bheki_mseleku_angola",
      "donna-lee---charlie-parker---lead-sheet-bass-clef-up-8va-from-real-book-ver.",
      "indiana-back-home-again-in-indiana-lead-sheet-with-lyrics-alternate",
    ],
    genre: "Jazz",
    // This is a collection of jazz standards, no specific composer can be assigned.
    style: "Jazz Standards",
    country: "USA",
  },
  {
    // https://musescore.com/user/24069/sets/4869434
    slug: "rachmaninoff",
    midis: [
      "rachmaninoff-piano-concerto-no.-2-1st-mvmt.-arr.-for-2-pianos",
      "piano_concerto_no_4_op_40_sergei_rachmaninoff_i_allegro_vivace_alla_breve",
      "prelude_in_c_sharp_minor_opus_3_no_2_sergei_rachmaninoff",
      "rachmaninoff_piano_concerto_4_1",
      "serguei-rachmaninov---piano-concerto-ndeg4-in-g-minor---1st-mouvement-intro",
      "Prelude_in_G_Minor_Opus_23_No._5",
      "prelude-in-c-sharp-minor-opus-3-no.-2---sergei-rachmaninoff",
      "rachmaninoff-10-preludes-op.-23---no.-5-in-g-minor-m.-a.-deocariza",

      "symphony-no.-2-in-e-minor-op.-27-for-piano-duet---i.-largo-allegro-moderato",
      "symphony-no.-2-in-e-minor-op.-27-for-piano-duet---ii.-allegro-molto",
    ],
    composerBirthYear: 1873,
    genre: "Classical",
    style: "Romantic",
    country: "Russia",
  },
  {
    slug: "valentin_silvestrov",
    midis: [
      "five-pieces-op.-306-no.-4-waltz",
      "abschiedsserenade-ii-farewell-serenade---valentin-silvestrov",
      "english-serenades-op.-46-no.-1---valentin-silvestrov",
      "english-serenades-op.-46-no.-4---valentin-silvestrov",
    ],
    composerBirthYear: 1937,
    genre: "Classical",
    style: "Postmodern, Minimalism",
    country: "Ukraine",
  },
  {
    slug: "george_pelecis",
    midis: [
      "all-in-the-past---georgs-pelecis",
      "plaukstosais-jasmins---georgs-pelecis",
    ],
    composerBirthYear: 1947,
    genre: "Classical",
    style: "Contemporary",
    country: "Latvia",
  },
  { slug: "jaco_pastorius", midis: ["donna-lee---jaco-pastorius"] },
  {
    slug: "frank_wildhorn",
    midis: [
      "master-of-the-strings-die-faden-in-der-hand-rudolf---affaire-mayerling-for-violin-and-piano",
      "the-confrontation---frank-wildhorn",
    ],
  },
  {
    slug: "klaus_doldinger",
    midis: ["erinnerung-from-das-boot---klaus-doldinger"],
  },
  { slug: "falco", midis: ["jeanny-falco"] },
  {
    slug: "marco_beltrami",
    midis: [
      "rosemary-s-theme-the-giver",
      "rosemary-s-waltz",
      "st.-estes-reform-school-extended---marco-beltrami-venom-let-there-be-carnage",
      "le-mans-66",
      "theme-from-world-war-z---marco-beltrami-theme-from-world-war-z--isolated-system",
    ],
    composerBirthYear: 1966,
    genre: "Film Score",
    style: "Orchestral, Cinematic",
    country: "USA",
  },
  {
    slug: "catherine_rollin",
    midis: [
      // major desc bass
      "sunlight-waltz---catherine-rollin",
      "sweet-elegy---catherine-rollin",
      "tenderly---catherine-rollin",
      // minor desc bass
      "french-movie-waltz---catherine-rollin",
      "moonlight-nocturne---catherine-rollin",

      // minor circle of fifths
      "russian-waltz",
      "lyric-nocturne---catherine-rollin", // bII, rel major

      "winter-waltz---catherine-rollin", // autumn leaves exit

      "summer-s-dream---catherine-rollin", // minor pachelbel, 50s

      "remembrance---catherine-rollin", // reverse V/ii, bVII
      "pure-heart---catherine-rollin",
      "summer-splendor---catherine-rollin",

      "the-swan---catherine-rollin", // line cliche
      "mah_g4.05",
      "ballad-for-our-time",

      "blues-boulevard---catherine-rollin",
      "back-beat-blues---catherine-rollin",
      "miami-blues---catherine-rollin",
      "waltzing-the-blues---catherine-rollin",
      "baroque-bop---catherine-rollin",
      "jazzy-moves---catherine-rollin",

      "sneaky-skeleton---catherine-rollin",
      "witches-brew---catherine-rollin",
      "cool-ghoul---catherine-rollin-cool-ghoul",
      "solar-wind",

      "tap-time---catherine-rollin",

      "blues-train---catherine-rollin-catherine-rollin---blues-train-jazz",
      "motown-rag---catherine-rollin",
      "circus-rag---catherine-rollin",
      "nashville-rag---catherine-rollin-nashville-rag",

      "hoe-down---catherine-rollin",
      "rock-it---catherine-rollin",
      "la-senorita---catherine-rollin",
    ],
    composerBirthYear: 1954,
    style: "Jazz, Blues, Teacher Music",
    country: "USA",
  },
  {
    slug: "jelly_roll_morton",
    midis: ["king-porter-stomp---jelly-roll-morton---melrose-edition"],
    composerBirthYear: 1890,
    genre: "Jazz",
    style: "Jazz, Blues",
    country: "USA",
  },
  {
    slug: "chen_gang",
    midis: [
      "liang-zhu---he-zhan-hao-chen-gang-liang-zhu---chen-gang-he-zhan-hao---butterfly-lovers-violin-concerto",
    ],
    composerBirthYear: 1935,
    genre: "Classical",
    country: "China",
  },
  {
    slug: "kensuke_ushio",
    midis: [
      "to-a-kinder-world---kensuke-ushio",
      "chainsaw-man-ost---sweet-dreams-by-kensuke-ushio-arranged-by-thezewmusic",
      "lit-a-silent-voice",
    ],
    country: "Japan",
    composerBirthYear: 1983,
    genre: "Anime, EBM",
  },
  {
    slug: "oscar_peterson",
    midis: ["oscar-peterson---jazz-exercises-for-piano---exercise-1"],
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
      "jingle-bells-boogie-woogie-cover",
      "jingle-bells-boogie",
    ],
    genre: "Boogie Woogie",
    // This is a genre-based collection, not tied to a specific composer.
    style: "Boogie Woogie",
  },
  {
    slug: "fur_elise_covers",
    midis: [
      "fur-elise-reharmonization-cover",
      "fur-elise-but-elise-is-scary",
      "Fr_Elise",
    ],
    // Cover of Beethoven's piece, so no new composer or style info necessary here.
  },
  {
    slug: "rhcp_red_hot_chili_peppers",
    midis: ["road-trippin---red-hot-chili-peppers"],
    composerBirthYear: 1970,
    genre: "Funk Rock, Alternative Rock",
    country: "USA",
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
    composerBirthYear: 1955,
    genre: "Classical, Ragtime",
    style: "Ragtime, Light Classical",
    country: "USA",
  },
  {
    slug: "scary",
    midis: [
      "fur-elise-but-elise-is-scary",
      "funeral-march---f.-chopin-halloween-scary-version---easy-to-intermediate",
    ],
    genre: "Classical",
    style: "Spooky Variations",
    // No specific country, these are just spooky versions of classical pieces.
  },
  {
    slug: "carlos_chavez",
    midis: ["diez-preludios-para-piano---carlos-chavez", "ponchito-al-hombro"],
    composerBirthYear: 1899,
    genre: "Classical",
    style: "Nationalist",
    country: "Mexico",
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
    composerBirthYear: 1959,
    genre: "World, Traditional",
    style: "Persian, Classical",
    country: "Iran",
  },
  {
    slug: "evgeny_doga",
    midis: [
      "vals---ie.-doga",
      "sonet---ie.-doga",
      "meditation---ie.-doga",
      "i-love-you---ie.-doga",
      "portret---e.-doga",
      "pollyanna---ie.-doga",
    ],
    composerBirthYear: 1937,
    genre: "Classical, Film Score",
    style: "Romantic, Cinematic",
    country: "Moldova",
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
    composerBirthYear: 1966,
    genre: "Jazz, Classical",
    style: "Jazz, Ragtime",
    country: "USA",
  },
  {
    slug: "raimonds_pauls",
    midis: [
      "million-alyh-roz---raimonds-pauls",
      "ischezli-solnechnye-dni",
      "raymond-pauls-ptichka-na-vetke",
      "zelyonyy-svet---valeriy-leontev-raymond-pauls",
    ],
    composerBirthYear: 1936,
    genre: "Pop, Jazz, Classical",
    style: "Popular, Light Classical",
    country: "Latvia",
  },
  {
    slug: "alkan",
    midis: ["nocturne-opus-22-in-b-major---alkan"],
    composerBirthYear: 1813,
    genre: "Classical",
    style: "Romantic",
    country: "France",
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
    composerBirthYear: 1945,
    genre: "Classical, Educational",
    style: "Jazz, Classical",
    country: "USA",
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
    composerBirthYear: 1921,
    genre: "Classical",
    style: "British, Orchestral",
    country: "UK",
  },
  {
    slug: "mark_fradkin",
    midis: [
      "techyot-reka-volga---muzyka-m-fradkin",
      "doroga-na-berlin---mark-grigorevich-fradkin",
      "sluchaynyy-vals---m.-fradkin",
    ],
    composerBirthYear: 1926,
    genre: "Film Score, Classical",
    style: "Orchestral, Cinematic",
    country: "Russia",
  },
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
    composerBirthYear: 1945,
    genre: "Film Score, Classical",
    style: "Film, Popular Music",
    country: "Russia",
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
    composerBirthYear: 1926,
    genre: "Film Score, Popular",
    style: "Film, Popular Music",
    country: "Russia",
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
    composerBirthYear: 1913,
    genre: "Classical",
    style: "Russian, Nationalist",
    country: "Russia",
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
    composerBirthYear: 1952,
    genre: "Classical",
    style: "Contemporary",
    country: "Russia",
  },
  {
    slug: "bslick",
    midis: [
      "let-go-piggy-book-2-soundtrack---bslick",
      "the-untold-story-ft.-melissa-medina---bslick",
      "archie-theme-scary-shanty---bslick",
    ],
    // Unknown composer and country, genre/style unclear.
  },
  {
    slug: "alan_hovhaness",
    midis: [
      "mountain-lullaby---jealous-of-the-birds-piano-solo",
      "prayer-of-st-gregory---alan-hovhaness",
      "symphony-no.-2-mysterious-mountain---alan-hovhaness-mysterious_mountain_iii",
    ],
    composerBirthYear: 1911,
    genre: "Classical",
    style: "Symphonic, Mystical",
    country: "USA",
  },
  {
    slug: "duke_ellington",
    midis: [
      "solitude---duke-ellington",
      "solitude---duke-ellington-eddie-de-lange-and-irving-mills-piano-version",
      "solitude---duke-ellington-as-played-by-roland-hanna",
    ],
    composerBirthYear: 1899,
    genre: "Jazz, Swing",
    style: "Big Band, Jazz",
    country: "USA",
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
    genre: "Jazz",
    style: "Bebop, Swing",
    country: "USA",
  },
  { slug: "cherokee_changes", midis: [] },
  {
    slug: "overcooked",
    midis: [
      "overcooked---menu-theme",
      "overcooked-2-medley",
      "overcooked-medley",
    ],
    composerBirthYear: 1980,
    genre: "Video Game Music",
    style: "Video Game Music",
    country: "USA",
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
    composerBirthYear: 1829,
    genre: "Romantic",
    style: "Virtuoso Piano, Early American",
    country: "USA",
  },
  {
    slug: "jean_henri_ravina",
    midis: [
      "etude---ravina-no.-22-op.-50---h-moll",
      "petit-bolero-op.-62---jean-henri-ravina",
      "nocturne-op.112---jean-henri-ravina",
    ],
    composerBirthYear: 1813,
    genre: "Romantic",
    style: "French Romanticism",
    country: "France",
  },
  {
    slug: "jean-luc_ponty",
    midis: ["faith-in-you"],
    composerBirthYear: 1942,
    genre: "Jazz Fusion",
    style: "Jazz, Fusion",
    country: "France",
  },
  {
    slug: "placebo",
    midis: ["every-you-every-me---placebo", "the-bitter-end---placebo"],
    composerBirthYear: 1974,
    genre: "Alternative Rock",
    style: "Alternative Rock, Britpop",
    country: "UK",
  },
  {
    slug: "john_cacavas",
    midis: [
      "jazzy-sax---john-cacavas",
      "corsage-for-winds---john-cacavas-string-quartet",
    ],
    composerBirthYear: 1930,
    genre: "Jazz",
    style: "Jazz, Classical Crossover",
    country: "USA",
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
    composerBirthYear: 1932,
    genre: "Jazz Fusion",
    style: "Fusion, Funk, Jazz",
    country: "Austria",
  },
  {
    slug: "lucas_pope",
    midis: ["papers-please"],
    composerBirthYear: 1977,
    genre: "Video Game Music",
    country: "USA",
  },
  {
    slug: "asuka_ota_and_ryo_nagamatsu",
    midis: ["coconut-mall---mario-kart-wii"],
  },
  {
    slug: "asuka_hayazaki",
    midis: [
      "daisy-circuit---mario-kart-wii",
      "winning-results-race---mario-kart-wii",
    ],
    country: "Japan",
    genre: "Video Game Music",
    composerBirthYear: 1981,
  },
  {
    slug: "selected",
    midis: [
      "monk-maz-koshia---the-legend-of-zelda-breath-of-the-wild-",
      "vizisi",
      "marx-theme-from-kirby-super-star---jun-ishikawa",
    ],
  },
  {
    slug: "manaka_kataoka",
    midis: [
      "main-theme---the-legend-of-zelda-tears-of-the-kingdom---manaka-kataoka-yasuaki-iwata-and-hajime-wakai-totk-sheet-music",
      "kass-theme--full-the-legend-of-zelda-breath-of-the-wild",
      "attack-on-vah-naboris---manaka-kataoka",
      "monk-maz-koshia---the-legend-of-zelda-breath-of-the-wild-",
    ],
    composerBirthYear: 1985,
    genre: "Video Game Music",
    country: "Japan",
  },
  {
    slug: "altin_gun",
    midis: [
      "goca-dunya---altin-gun-goca-dunya.xml",
      "rakiya-su-katamam---selami-sahin-altin-gun",
      "badi-sabah-olmadan---altin-gun-badi-sabah-olmadan.xml",
    ],
    composerBirthYear: 1970,
    genre: "Psychedelic Folk, Turkish Folk",
    style: "Folk, Psychedelic",
    country: "Netherlands, Turkey",
  },
  {
    slug: "herbie_hancock",
    midis: ["cantaloupe-island"],
    composerBirthYear: 1940,
    genre: "Jazz",
    style: "Jazz, Fusion",
    country: "USA",
  },
  {
    slug: "michel_camilo",
    midis: [
      "one-more-once---michel-camilo", // 12-bar blues
      "michel-camilo-from-within",
      "blue-bossa-salsa---michel-camilo",
      "caribe---michel-camilo",
    ],
    composerBirthYear: 1954,
    genre: "Jazz",
    style: "Latin Jazz",
    country: "Dominican Republic",
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
    composerBirthYear: 1979,
    genre: "Jazz",
    style: "Jazz Fusion, Contemporary Jazz",
    country: "Japan",
  },
  {
    slug: "george_duke",
    midis: ["if-you-will---george-duke", "george-duke---it-s-on"],
    composerBirthYear: 1946,
    genre: "Jazz",
    style: "Fusion, R&B, Funk",
    country: "USA",
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
      "do-you-remember-king-s-theme---in-stars-and-time",
      "marx-theme-from-kirby-super-star---jun-ishikawa",
      "twilight-in-benares-1923",
      "alien-lair",
      "greenpath---christopher-larkin",
      "qiao-shang-nozhan-i-battle-on-the-bridge---final-fantasy-tactics-ps1---hitoshi-sakimoto",
      "heroes-of-might-magic-iii---fortress-town-theme",
      "lavender-town-pokemon-r-b-y",
      "amor-sacro---giovanni-allevi",
    ],
  },
  {
    slug: "gibran_alcocer",
    midis: [
      "idea-15---gibran-alcocer",
      "idea-22---gibran-alcocer",
      "idea-n.10---gibran-alcocer",
      "idea-9---gibran-alcocer",

      "idea-20---gibran-alcocer",
      "idea-7---gibran-alcocer",
      "idea-1---gibran-alcocer",
      "idea-5---gibran-alcocer",
    ],
    composerBirthYear: 2003,
    genre: "21st Century Piano",
    country: "Mexico",
  },
  {
    slug: "aaron_copland",
    midis: [
      "copland_s_third_symphony_first_movement",
      "copland_symphony_3_mov_1_rewired",
      "appalachian-spring---aaron-copland-appalachian-spring",
      "hoe-down---aaron-copland",
      "at-the-river-g",
      "aaron-copland---story-of-our-town",
      "the-cat-and-the-mouse",
    ],
    composerBirthYear: 1900,
    genre: "Classical",
    style: "American Classical",
    country: "USA",
  },
  {
    slug: "revaz_laghidze",
    midis: ["simg-era-t-bilisze---revaz-lag-iz-e"],
    composerBirthYear: 1930,
    genre: "Classical",
    style: "Georgian Classical",
    country: "Georgia",
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
    composerBirthYear: 1932,
    genre: "Film Score",
    style: "Film Music, Classical",
    country: "USA",
  },
  {
    slug: "john_philip_sousa",
    midis: [
      "the-liberty-bell-march---john-philip-sousa---1893",
      "semper-fidelis-piano-john-philip-sousa",
      "the-stars-and-stripes-forever--john-f-sousa---arr.-v-horowitz",
    ],
    composerBirthYear: 1854,
    genre: "March",
    style: "Military March, American Patriotic",
    country: "USA",
  },
  {
    slug: "cameron_lee_simpson",
    midis: [
      "mr.rogers-theme-wont-you-be-my-neighbor-arr.-cameron-lee-simpson",
      "picking-the-chicken---cameron-lee-simpson---pjotr-kolster",
    ],
    composerBirthYear: 1930,
    genre: "Pop, Children’s Music",
    style: "Children’s Music, Jazz",
    country: "USA",
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
    composerBirthYear: 1941,
    genre: "Jazz",
    style: "Jazz Fusion, Latin Jazz",
    country: "USA",
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
    composerBirthYear: 1957, // Dennis Alexander was born in 1957
    genre: "Classical", // Mainly classical, with some contemporary influences
    style: "Romantic, Contemporary", // Known for both romantic and contemporary piano works
    country: "USA", // American composer
  },
  {
    slug: "fabrizio_paterlini",
    midis: [
      "fabrizio-paterlini---snow",
      "waltz---fabrizio-paterlini",
      "all-my-joy-all-my-pain---fabrizio-paterlini",
      "rue-des-trois-freres---fabrizio-paterlini",
      "fabrizio-paterlini---my-misty-mornings",
    ],
    composerBirthYear: 1973,
    country: "Italy",
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
    composerBirthYear: 1950, // Born in 1950, known for contemporary classical compositions
    genre: "Teacher Music, Classical, Pop", // Combines classical and pop elements
    country: "Germany", // German composer
  },
  {
    slug: "ignacy_feliks_dobrzynski",
    midis: [
      "feliks-dobrzynski---farewell-nocturne",
      "nocturne-op.21-no1---ignacy-feliks-dobrzynski",
      "nocturne-in-f-minor-op.24-no.1---ignacy-feliks-dobrzynski",
    ],
    composerBirthYear: 1807, // Born in 1807
    genre: "Classical", // Classical composer
    style: "Romantic", // Romantic period composer
    country: "Poland", // Polish composer
  },
  {
    slug: "ignacy_jan_paderewski",
    midis: [
      "elegy-op.4---ignacy-jan-paderewski",
      "miscellanea-op.16---ignacy-jan-paderewski-no.4-nocturne",
      "piano-concerto-op.17---ignacy-jan-paderewski",
      "ignacy-jan-paderewski-sarabande-op.-14-no-2",
    ],
    composerBirthYear: 1860, // Born in 1860
    genre: "Classical", // Classical, especially known for his piano compositions
    style: "Late-Romantic", // Late Romantic era style
    country: "Poland", // Polish composer and statesman
  },
  {
    slug: "nikolay_zubov",
    midis: [
      "ne-uhodi-pobud-so-mnoyu-don-t-go-stay-with-me-romance",
      "o-ni-nemaie-mriyi---m.-zubov",
      "poglyad-tvoyih-chornih-ochey---m.-zubov",
    ],
    composerBirthYear: 1915, // Born in 1915
    genre: "Romantic", // Romantic and early 20th-century style
    style: "Romantic", // Predominantly Romantic style
    country: "Ukraine", // Ukrainian composer
  },
  {
    slug: "mykola_mozgovyy",
    midis: [
      "minaie-den-minaie-nich---mikola-mozgoviy",
      "moya-zemlya---mikola-mozgoviy",
      "zacharuy-nas-lyubov---mikola-mozgoviy",
      "nazvi---m.-mozgoviy",
    ],
    composerBirthYear: 1943, // Born in 1943
    genre: "Folk, Classical", // Combines folk music with classical traditions
    style: "Romantic, Folk", // Romantic influences with Ukrainian folk music
    country: "Ukraine", // Ukrainian composer
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
    composerBirthYear: 1938, // Born in 1938
    genre: "Classical, Folk", // Classical and folk influences
    style: "Contemporary, Folk", // Contemporary with traditional folk elements
    country: "Ukraine", // Ukrainian composer
  },
  {
    slug: "moritz_moszkowski",
    midis: [
      "moszkowski---la-jongleuse-op.52-no.4",
      "tarentelle-10-pieces-mignonnes-op.-77-no.-6-m.-moszkowski",
      "spanish-dance---moritz-moszkowski",
      "moszkowski---etincelles-op.36-no.6",
    ],
    composerBirthYear: 1854, // Born in 1854
    genre: "Classical", // Classical and Romantic composer
    style: "Romantic", // Romantic era style
    country: "Poland", // Polish composer
  },
  {
    slug: "platon_mayboroda",
    midis: [
      "bili-kashtani---platon-mayboroda",
      "kiyivskiy-vals---p.-mayboroda",
      "ridna-mati-moya-pisnya-pro-rushnik---p.-mayboroda",
    ],
    composerBirthYear: 1918, // Born in 1918
    genre: "Folk, Classical", // Combines Ukrainian folk and classical traditions
    style: "Romantic, Folk", // Romantic and folk elements
    country: "Ukraine", // Ukrainian composer
  },

  { slug: "max_richter", midis: [] },
  {
    slug: "yaroslav_kis",
    midis: ["liricheskiy-vals---yaroslav-kis"],
    composerBirthYear: 1980, // Born in 1980
    genre: "Classical", // Classical composer
    style: "Romantic", // Romantic piano music
    country: "Ukraine", // Ukrainian composer
  },
  {
    slug: "yuriy_zubay",
    midis: [
      "babusya-yagusya---yu.-zubay",
      "osinnya-pisnya---yuriy-zubay",
      "koncertino---yu.-zubay",
    ],
    composerBirthYear: 1952, // Born in 1952
    genre: "Classical, Folk", // Classical with folk influences
    style: "Folk, Contemporary", // Folk-inspired classical compositions
    country: "Ukraine", // Ukrainian composer
  },
  {
    slug: "loginvovchyk_single",
    midis: [
      "na-krilah-vitru---a.-minov",
      "dobriy-vechir-dole---o.-pushkarenko",
    ],
    genre: "Folk, Classical", // Folk and classical music
    style: "Folk", // Traditional folk music
    country: "Ukraine", // Ukrainian composers
  },
  {
    slug: "valery_zubkov",
    midis: [
      "vozvrashchenie---v.-zubkov-return---v.-zubkov",
      "gypsy-v.-zubkov-cygan-v.-zubkov", // same?
    ],
    composerBirthYear: 1949, // Born in 1949
    genre: "Classical, Folk", // Classical with folk influences
    style: "Folk", // Ukrainian folk and classical music
    country: "Ukraine", // Ukrainian composer
  },
  {
    slug: "john_field",
    midis: [
      "nocturne-no.5---h.37---john-field---edited-by-liszt",
      "nocturne-no.1---field",
      "john-field-nocturne-no.-12",
    ],
    composerBirthYear: 1782, // Born in 1782
    genre: "Classical", // Classical composer
    style: "Romantic", // Early Romantic composer
    country: "Ireland", // Irish composer
  },
  {
    slug: "fuzzy",
    midis: [
      "julenat",
      "en-gammel-knark---gamle-er-unge-der-er-blevet-aeldre",
      "en-by-i-provinsen-mus3",
    ],
    genre: "Pop, Folk", // Pop and folk influences
    style: "Pop, Folk", // Pop and traditional folk
    country: "Denmark", // Danish artists
  },
  {
    slug: "ebbe_raun",
    midis: [
      "melodien-som-evert-taube-aldrig-skrev",
      "noget-om-mit-hjerterum",
      "ingen-er-evig-ung",
    ],
    genre: "Folk", // Primarily folk music
    style: "Folk", // Folk music
    country: "Denmark", // Danish composer
  },
  {
    slug: "ringmasters",
    midis: [
      "kung-liljekonvalje",
      "you-ll-never-walk-alone",
      "between-the-devil-and-the-deep-blue-sea",
    ],
    composerBirthYear: 1975,
    genre: "Barbershop", // Barbershop style
    style: "Barbershop", // Traditional barbershop quartet
    country: "Sweden", // Swedish barbershop quartet
  },
  {
    slug: "white_star_line_1912",
    midis: [
      "the-quaker-girl-valse---lionel-monckton-carl-kiefert-1910", // iiø-V->V7/V
      "barber-of-seville-overture",
      "overture-to-poet-and-peasant---franz-von-suppe-piano-reduction-solo",
    ],
    composerBirthYear: 1870,
    genre: "Classical", // Classical music
    style: "Romantic", // Late Romantic period
    country: "UK", // British composers
  },
  {
    slug: "louis_vierne",
    midis: ["vierne-organ-symphony-no.-1-part-vi---final"],
  },
  {
    slug: "tchaikovsky",
    midis: [
      "trepak-russian-dance---tchaikovsky---piano-transcription",
      "dance-of-the-reed-flutes-the-nutcracker-suite---tchaikovsky",
      "chinese-dance---the-nutcracker-suite---peter-tchaikovsky",
      "tchaikovsky-waltz-of-the-flowers-from-the-nutcracker-piano-4-hands",
      "dance-of-the-sugar-plum-fairy",
      "swan-lake-theme---tchaikovsky",

      "the-seasons-op.-37b---1.-january-at-the-fireside-t.-yaskawa",
    ],
    composerBirthYear: 1840, // Born in 1840
    genre: "Classical", // Classical composer
    style: "Romantic", // Romantic era composer
    country: "Russia", // Russian composer
  },
  {
    slug: "wagner",
    midis: [
      "wagner-siegfried-s-funeral-march-from-gotterdammerung-piano-solo",
      "wagner-elsa-s-procession-to-the-cathedral-from-the-opera-lohengrin-piano-solo",
      "wagner_tannhauser_overture_piano_solo",
    ],
    composerBirthYear: 1813, // Born in 1813
    genre: "Classical", // Classical composer
    style: "Romantic", // Romantic opera composer
    country: "Germany", // German composer
  },
  {
    slug: "timothy_brown",
    midis: [
      "dance-of-the-wind---timothy-brown",
      "toccatina---timothy-brown",
      "summer-song",
      "scherzino---timothy-brown", // i like this one. simple and effective
    ],
    composerBirthYear: 1961, // Born in 1961
    genre: "Contemporary Classical", // Contemporary classical music
    style: "Minimalism", // Minimalism style
    country: "USA", // American composer
  },
  {
    slug: "lionel_yu",
    midis: [
      "fight-for-freedom---lionel-yu",
      "i-will-love-you-always---lionel-yu",
      "the-cursed-path",
    ],
    composerBirthYear: 1989,
    genre: "Contemporary", // Contemporary classical and cinematic
    style: "Cinematic", // Cinematic and contemporary classical
    country: "China, USA", // American composer
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
    composerBirthYear: 1952, // Born in 1952
    genre: "Classical, Educational", // Classical with an educational focus
    style: "Contemporary, Educational", // Contemporary educational music
    country: "USA", // American composer
  },
  {
    slug: "wynn-anne_rossi",
    midis: [
      "skyscraper---wynn-anne-rossi",
      "cafe-cha-cha---wynn-anne-rossi",
      "alma-del-tango---wynn-anne-rossi",
    ],
    composerBirthYear: 1964, // Born in 1964
    genre: "Classical, Jazz", // Classical with jazz influences
    style: "Contemporary, Jazz", // Contemporary classical with jazz influences
    country: "USA", // American composer
  },
  {
    slug: "jennifer_linn",
    midis: ["the-dreamcatcher", "snowcrystals---jennifer-linn"],
    composerBirthYear: 1978, // Born in 1978
    genre: "Classical", // Classical music
    style: "Contemporary", // Contemporary classical music
    country: "USA", // American composer
  },
  {
    slug: "john_adams",
    midis: [
      "piano-arr.-short-ride-in-a-fast-machine---john-adams",
      "phrygian-gates-china-gates---john-adams",
    ],
    composerBirthYear: 1947, // Born in 1947
    genre: "Minimalism", // Minimalism composer
    style: "Minimalism", // Famous for Minimalism music
    country: "USA", // American composer
  },
  {
    slug: "ignacio_cervantes",
    midis: [
      "no-me-toques-danza-cubana-de-ignacio-cervantes",
      "soledad-.-habanera-par-ignazio-cervantes",
      "los-tres-golpes-danza-ignacio-cervantes",
    ],
    composerBirthYear: 1847, // Born in 1847
    genre: "Classical", // Classical and Cuban music
    style: "Romantic", // Romantic period composer
    country: "Cuba", // Cuban composer
  },
  { slug: "borrtex", midis: ["flowing---borrtex"] },
  {
    slug: "kristofer_maddigan",
    midis: [
      "inkwell-hell-piano-from-cuphead---kristofer-maddigan",
      "cuphead---kristofer-maddigan---die-house",
      "inkwell-isle-four-piano---kristofer-maddigan",
      "inkwell-isle-three",
      "snow-cult-scuffle---kristofer-maddigan",
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

      "lacrimosa---requiem",
    ],
    composerBirthYear: 1756, // Born in 1756
    genre: "Classical", // Classical composer
    style: "Classical", // Classical period composer, known for his operas, symphonies, and chamber music
    country: "Austria", // Austrian composer
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
      "waltz-no.-11-in-g-flat-major-op.70-no.1---frederic-chopin",
      "chopin---waltz-no.-1-in-d-flat-major-op.-64", // harmonic prototype for Scott Joplin

      "chopin_ballade_fminor_op52",
      "chopin_ballade_no_1_in_g_minor_op_23",
      "chopin_ballade_no_4_piano_solo",
      "chopin_military_polonaise",

      "fantaisie-impromptu-in-c-minor---chopin",

      "etude-opus-10-no.-1-in-c-major",
      "etude-opus-10-no.-2-in-a-minor",
      "etude-opus-25-no.-11-winter-wind-in-a-minor",

      "mazurka-op.68-no.4---chopin---posth.",
      "mazurkas-op.-63---no.-2-in-f-minor-r.-lubetsky",

      "etudes-op.-10---no.-12-in-c-minor-revolutionary-n.-carter",
    ],
    composerBirthYear: 1810, // Born in 1810
    genre: "Classical", // Classical composer
    style: "Romantic", // Romantic period composer, known for his piano works
    country: "Poland", // Polish composer (spent much of his life in France)
  },

  {
    slug: "chopin_24_preludes",
    midis: [
      "prelude-opus-28-no.-1-in-c-major",
      "prelude-opus-28-no.-2-in-a-minor",

      "chopin-prelude-e-minor-op-28-no-4-w-chord-symbols",
      "24-preludes-op.-28---no.-4-in-e-minor-suffocation-g.-d.-robertson",

      "prelude-opus-28-no.-6-in-b-minor",
      "prelude-opus-28-no.-7-in-a-major---chopin",
      "prelude-opus-28-no.-8-in-f-minor",

      "chopin_raindrop_prelude",
    ],
    composerBirthYear: 1810, // Born in 1810
    genre: "Classical", // Classical composer
    style: "Romantic", // Romantic period composer, known for his piano works
    country: "Poland", // Polish composer (spent much of his life in France)
  },
  {
    slug: "grieg",
    midis: [
      "grieg_arietta_yaskawa",
      "grieg_lyric_2_waltz_yaskawa",
      "in-the-hall-of-the-mountain-king-dovregubbens-hall",
    ],
    composerBirthYear: 1843, // Edvard Grieg
    genre: "Classical", // Late Romantic period
    style: "Romantic", // Known for his expressive piano pieces
    country: "Norway", // Grieg was Norwegian
  },
  {
    slug: "kaijura_yuki",
    midis: ["nara-no-kyoukai-vol.-2---m01"],
    composerBirthYear: 1963, // Yuki Kajiura
    genre: "Soundtrack", // Known for composing anime soundtracks
    style: "Orchestral, Electronic", // Combines orchestral with electronic music
    country: "Japan", // Yuki Kajiura is Japanese
  },
  {
    slug: "jacob_axel_josephson",
    midis: ["albumblad"],
    composerBirthYear: 1850, // Jacob Axel Josephson
    genre: "Classical", // Primarily known for his works in the classical genre
    style: "Romantic", // Romantic era composer
    country: "Sweden", // Josephson was Swedish
  },
  {
    slug: "christian_hymns_worldwide",
    midis: ["karibu-na-bwana"],
    composerBirthYear: undefined, // No specific composer
    genre: "Gospel", // Christian hymns are often gospel in style
    style: "Gospel, Hymn", // Traditional Christian hymns
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
    composerBirthYear: undefined, // Medley, no specific composer
    genre: "Pop", // J-Pop, Japanese pop music
    style: "J-Pop, Idol", // Showa era idol music
    country: "Japan", // J-Pop is a genre from Japan
  },
  {
    slug: "dora_pejacevic",
    midis: [
      "the-life-of-flowers-violet---dora-pejacevic",
      "papillon-op.-6---dora-pejacevic",
    ],
    composerBirthYear: 1885, // Dora Pejacevic
    genre: "Classical", // Primarily classical composer
    style: "Romantic", // Works in the late Romantic style
    country: "Croatia", // Dora Pejacevic was Croatian
  },
  {
    slug: "mikulas_schneider_trnavsky",
    midis: [
      "otec-nebesky-jks017---mikulas-schneider-trnavsky",
      "kriste-zo-srdca-celeho-jks272---mikulas-schneider-trnavsky",
      "hospodine-vyslys-nas-jks527---mikulas-schneider-trnavsky",
    ],
    composerBirthYear: 1881, // Mikuláš Schneider-Trnavský
    genre: "Classical", // Classical music with folk influences
    style: "Folk-inspired, Sacred", // Known for sacred and folk-inspired compositions
    country: "Slovakia", // Schneider-Trnavský was Slovak
  },
  {
    slug: "mihail_krug",
    midis: ["prihodite-v-moy-dom", "fraer---mihail-krug", "kolshchik"],
    composerBirthYear: 1962, // Mikhail Krug
    genre: "Russian chanson", // Popular in Russian chanson genre
    style: "Chanson", // Known for his distinctive style in Russian chanson
    country: "Russia", // Mikhail Krug was Russian
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
    composerBirthYear: 1953, // Danny Elfman
    genre: "Film Score", // Known for film scores and movie soundtracks
    style: "Orchestral, Gothic, Pop", // A blend of orchestral, gothic, and sometimes pop elements
    country: "USA", // Danny Elfman is American
  },
  {
    slug: "george_bruns",
    midis: [
      "les-aristochats---george-bruns",
      "overture-from-the-jungle-book---george-bruns-overture-the-jungle-book---george-bruns",
      "yo-ho-a-pirate-s-life-for-me---george-bruns-xavier-atencio-yo-ho-a-pirates-life-for-me",
    ],
    composerBirthYear: 1914, // George Bruns
    genre: "Film Score", // Composer of film scores
    style: "Orchestral", // Traditional orchestral film scoring
    country: "USA", // George Bruns was American
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
      "genshin-impact-main-theme",
    ],
    composerBirthYear: 1984,
    genre: "Video Game Music", // Composer for video games, primarily Genshin Impact
    style: "Orchestral, Cinematic", // Cinematic style with orchestral elements
    country: "China", // Yu-Peng Chen is Chinese
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
    composerBirthYear: 1934, // Udo Jürgens
    genre: "Schlager, Pop", // Schlager is a key genre he worked in
    style: "Pop, Easy Listening", // His style was easy listening and pop
    country: "Austria", // Udo Jürgens was Austrian
  },
  {
    slug: "geoffrey_gregoire_kargmax",
    midis: [
      "oriental-breath",
      "menuet-en-mib-mineur",
      "espieglerie-grazioso-entre-violon-et-piano-mi-m",
    ],
    composerBirthYear: undefined, // Not enough information to determine
    genre: "Classical", // Classical genre
    style: "Baroque, Classical", // Works in classical and baroque style
    country: undefined, // Country of origin unclear
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
    composerBirthYear: 1882, // Emmerich Kálmán
    genre: "Operetta", // Known for operettas and light opera
    style: "Operetta, Classical", // Works in operetta and classical styles
    country: "Hungary", // Emmerich Kálmán was Hungarian
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
    composerBirthYear: undefined, // Information about Vicenzo Piano's birth year is unclear
    genre: "New Age", // New Age piano compositions
    style: "Instrumental, Classical Crossover", // Instrumental with elements of classical crossover
    country: undefined, // Country of origin unclear
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
    composerBirthYear: undefined, // Not enough information available
    genre: "Indie, Classical", // Indie-classical style music
    style: "Minimalism", // Minimalism piano compositions
    country: undefined, // Country not specified
  },
  {
    slug: "SIX",
    midis: [
      "heart-of-stone-from-six-the-musical",
      "six-the-musical---broadway-six-medley",
    ],
    composerBirthYear: 1984, // Toby Marlow & Lucy Moss (co-composers of Six)
    genre: "Musical Theatre", // Broadway musical
    style: "Pop Musical", // Pop-influenced musical style
    country: "UK", // SIX originated in the UK
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
      "pachelbel-chaconne-in-f-minor",
    ],
    composerBirthYear: 1653, // Johann Pachelbel's birth year
    genre: "Baroque", // Pachelbel was a Baroque composer
    style: "Classical", // Common style descriptor for Baroque music
    country: "Germany", // Pachelbel was German
  },
  {
    slug: "bebu_silvetti_and_raul_di_blasio",
    midis: [
      "mexico-de-noche",
      "quiero-amanecer-con-alguien---daniela-romo",
      "melissa---bebu-silvetti", // canon in D
      // "bebu-silvetti---piano",
      "volviendo-a-casa-raul-di-blasio",
      "barroco---raul-di-blasio",
      "piano---raul-di-blasio",
      "corazon-de-nino-child-s-heart-by-raul-di-blasio---raul-di-blasio-corazon-de-nino-child-s-heart-by-raul-di-blasio",
    ],
    composerBirthYear: 1939, // Bebu Silvetti's birth year
    genre: "Latin", // Bebu Silvetti was known for Latin music
    style: "Pop", // Known for Latin pop arrangements
    country: "Argentina", // Silvetti was from Argentina
  },
  {
    slug: "c_austin_miles",
    midis: ["in-the-garden---c.-austin-miles"],
    composerBirthYear: 1868, // C. Austin Miles' birth year (composer of "In the Garden")
    genre: "Gospel", // "In the Garden" is a Christian hymn
    style: "Hymn", // Hymnal style music
    country: "USA", // C. Austin Miles was American
  },
  {
    slug: "mikhail_glinka",
    midis: [
      "glinka---the-lark-from-a-farewell-to-saint-petersburg-no.-10",
      "ya-pomnyu-chudnoe-mgnovene",
      "noktyurn-razluka-nocturne-la-separation---m.-i.-glinka-m.-i.-glinka-razluka",
    ],
    composerBirthYear: 1804, // Glinka's birth year
    genre: "Romantic", // Glinka was a Romantic composer
    style: "Classical", // Typical descriptor for his style
    country: "Russia", // Glinka was Russian
  },
  {
    slug: "jared_emerson-johnson",
    midis: [
      "sam-and-max-save-the-world-the-office---jared-emerson-johnson",
      "cruisin---jared-emerson-johnson",
      "prologue---the-wolf-among-us",
      "crane-s-business-office-the-wolf-among-us",
    ],
    composerBirthYear: 1980, // Approximate birth year
    genre: "Video Game", // Known for video game music
    style: "Orchestral, Electronic", // Blend of orchestral and electronic styles
    country: "USA", // Emerson-Johnson is American
  },
  {
    slug: "david_wise",
    midis: [
      "gang-plank-galleon-donkey-kong-country",
      "aquatic-ambience",
      "jib-jig-donkey-kong-country-2",
    ],
    composerBirthYear: 1967, // David Wise's birth year
    genre: "Video Game", // Known for video game music, specifically Donkey Kong Country
    style: "Electronic, Orchestral", // Known for a mix of electronic and orchestral elements in video game scores
    country: "UK", // David Wise is from the UK
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
    composerBirthYear: 1988,
    genre: "Video Game", // Known for video game music, particularly Outer Wilds
    style: "Ambient, Electronic", // Prahlow's music is largely ambient with electronic influences
    country: "USA", // Prahlow is American
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
    composerBirthYear: 1979, // Bear McCreary's birth year
    genre: "Film, TV", // Known for composing for films and TV series
    style: "Orchestral, Electronic, Rock", // McCreary blends orchestral, electronic, and rock styles
    country: "USA", // McCreary is American
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
      "itsumo-nando-demo-always-with-me---spirited-away",
    ],
    composerBirthYear: 1950, // Joe Hisaishi's birth year
    genre: "Film, Anime", // Known for composing music for films and anime
    style: "Orchestral", // His compositions are often orchestral
    country: "Japan", // Hisaishi is Japanese
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
    composerBirthYear: 1834, // Modest Mussorgsky's birth year (composer of Pictures at an Exhibition)
    genre: "Romantic", // Mussorgsky was a Romantic composer
    style: "Classical", // Typical descriptor for Romantic era music
    country: "Russia", // Mussorgsky was Russian
  },
  {
    slug: "zequinha_de_abreu",
    midis: [
      "tico-tico-no-fuba---zequinha-de-abreu",
      "nao-me-toques-chorinho---zequinha-de-abreu",
      "os-pintinhos-no-terreiro-zequinha-de-abreu",
      "levanta-poeira-chorinho---zequinha-de-abreu",
      "bafo-de-onca",
      "sururu-na-cidade",
    ],
  },
  {
    slug: "saint_saens",
    midis: [
      "danse-macabre-opus-40-s.-555",
      "Saint_Saens_Symphony_3_1st",
      "le-carnaval-des-animaux---aquarium",
      "le-cygne-the-swan",
    ],
    composerBirthYear: 1835,
    genre: "Romantic",
    country: "France",
  },
  {
    // https://www.discogs.com/release/17759461-Various-%D0%A8%D0%B5%D0%B4%D0%B5%D0%B2%D1%80%D1%8B-%D0%9A%D0%BB%D0%B0%D1%81%D1%81%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%BE%D0%B9-%D0%9C%D1%83%D0%B7%D1%8B%D0%BA%D0%B8-%D0%9A%D0%BE%D0%BB%D0%BB%D0%B5%D0%BA%D1%86%D0%B8%D1%8F-2-%D0%92%D1%8B%D0%BF%D1%83%D1%81%D0%BA-5
    // https://musescore.com/user/12163676
    slug: "popular_classics",
    midis: [
      "valse---coppelia---piano-solo---arr.-leo-delibes",

      "hungarian-march---hector-berlioz",

      "swan-lake-op.-20-act-iii-no.-20-danse-hongroise-hungarian-dance-czardas",
      "funiculi-funicula",
      "grand-march-from-the-opera-aida-by-giuseppe-verdi",
      "lyapunov-reverie-du-soir-op.3",
      "thema-aus-die-moldau---b-smetana-s-sitnikava",
      "mein-vaterland-nr2-moldau---bedrich-smetana-for-piano-solo",
      "fantasia-on-greensleeves---ralph-vaughan-williams",
      "der-flohwalzer",
      "stanley-myers---cavatina-arranged-for-piano",
      "imslp181922-wima.ec84-oginski_polonez_a",
      "Entry_of_the_Gladiators_-_Julius_Fuk_-_1897",
    ],
    composerBirthYear: 1836,
    style: "Classical",
    genre: "Classical, Romantic",
  },
  {
    slug: "smetana",
    midis: [
      "thema-aus-die-moldau---b-smetana-s-sitnikava",
      "bedrich-smetana---vltava-ma-vlast",
      "mein-vaterland-nr2-moldau---bedrich-smetana-for-piano-solo",
    ],
    composerBirthYear: 1824, // Bedřich Smetana (1824-1884)
    genre: "Romantic", // Romantic era composer
    style: "Symphonic, Nationalism", // Known for his symphonic poems and Czech nationalistic music
    country: "Czech Republic", // Born in what is now the Czech Republic
  },
  {
    slug: "austin_farwell",
    midis: [
      "city-lights---austin-farwell",
      "wedding-ballet---austin-farwell",
      "once-upon-a-time---austin-farwell",
    ],
  },
  { slug: "dylan_john_sparkes", midis: ["butterfly"] },
  {
    slug: "hania_rani",
    midis: [
      "glass---hania-rani",
      "eden---hania-rani",
      "sun---hania-rani",
      "silent-night---hania-rani",
      "hania-rani---rurka",
    ],
    genre: "Minimalism",
    composerBirthYear: 1990,
    country: "Poland",
  },
  {
    slug: "kelly_bailey",
    midis: [
      "triage-at-dawn",
      "portal-radio-music-for-trombone",
      "something-secret-steers-us",
    ],
    composerBirthYear: 1967, // Kelly Bailey (born 1967)
    genre: "Video Game Music", // Known for composing for video games, notably Portal and Half-Life
    style: "Electronic, Ambient", // Often uses electronic and ambient styles in his compositions
    country: "USA", // American composer
  },
  {
    slug: "arif_malikov",
    midis: [
      "sehrli-xalat-filminin-musiqisi---arif-m-likov",
      "cix-yasil-duz---arif-m-likov-azerbaijan-folk-song",
      "brilliant-dadasova---gull-rim",
    ],
    composerBirthYear: 1933, // Arif Malikov (born 1933)
    genre: "Classical, Film Music", // Known for classical compositions and film scores
    style: "Romantic, Nationalism", // Romanticism with elements of national identity in his music
    country: "Azerbaijan", // Azerbaijani composer
  },
  {
    slug: "alexander_nakarada",
    midis: [
      "adventure---alexander-nakarada",
      "village-ambiance---alexander-nakarada",
    ],
  },
  {
    slug: "kevin_macleod",
    midis: [
      "monkey-spinning-monkeys---kevin-macleod",
      "if-i-had-a-chicken---kevin-macleod",
      "carefree---kevin-macleod",
      "amazing-plan---kevin-macleod",
    ],
    composerBirthYear: 1972,
    genre: "Stock Music, Video Game Music",
    country: "USA",
  },
  {
    slug: "pete_johnson",
    midis: ["boogie-woogie-jump---pete-johnson", "dive-bomber---pete-johnson"],
    style: "Boogie Woogie",
    country: "USA",
  },
  {
    slug: "jobim",
    midis: [
      "wave---antonio-carlos-jobim-jazz-piano-solo",
      "desafinado",
      "aguas-de-marco---elis-regina-e-tom-jobim",
    ],
    composerBirthYear: 1927, // Antônio Carlos Jobim (1927–1994)
    genre: "Bossa Nova", // Pioneer of the bossa nova genre
    style: "Jazz, Brazilian", // Known for blending jazz with Brazilian rhythms
    country: "Brazil", // Brazilian composer
  },
  {
    slug: "chico_buarque",
    midis: ["atras_da_porta"],
    composerBirthYear: 1944, // Chico Buarque (born 1944)
    genre: "Bossa Nova, MPB", // Brazilian popular music (MPB) and bossa nova
    style: "Samba, Bossa Nova", // Combines samba and bossa nova in his compositions
    country: "Brazil", // Brazilian composer
  },
  {
    slug: "borislav_slavov",
    midis: ["down-by-the-river---borislav-slavov-baldur-s-gate-3-ost"],
    composerBirthYear: 1980, // Borislav Slavov (born 1980)
    genre: "Video Game Music", // Composer for video game soundtracks like Baldur's Gate 3
    style: "Orchestral, Cinematic", // Orchestral music with cinematic qualities
    country: "Bulgaria", // Bulgarian composer
  },
  {
    slug: "takeshi_abo",
    midis: [
      "gate-of-steiner",
      "suzuha-s-farewell-wakare---steins-gate",
      "steins-gate-0---messenger-piano",
    ],
    composerBirthYear: 1977, // Takeshi Abo (born 1977)
    genre: "Video Game Music", // Known for composing music for visual novels and video games
    style: "Electronic, Orchestral", // A mix of electronic and orchestral elements in his compositions
    country: "Japan", // Japanese composer
  },
  {
    slug: "esther_abrami",
    midis: [
      "no.9-esther-s-waltz---esther-abrami",
      "no.2-remembering-her---esther-abrami",
      "no.1-a-minor-waltz---esther-abrami-no-1-a-minor-waltz",
    ],
    composerBirthYear: 1995, // Esther Abrami (born 1995)
    genre: "Classical", // Classical composer and violinist
    style: "Romantic", // Often performs and composes in the Romantic style
    country: "France", // French composer and violinist
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
    composerBirthYear: 1980,
    genre: "Video Game Music",
    style: "Electronic, Orchestral",
    country: "Finland",
  },
  {
    slug: "65daysofstatic",
    midis: [
      "don-t-go-down-to-sorrow---65daysofstatic",
      "no-man-s-sky-escape-velocity---65daysofstatic",
    ],
    composerBirthYear: 1980,
    genre: "Post-Rock, Electronic", // Known for their mix of post-rock and electronic music
    style: "Instrumental", // Primarily instrumental music
    country: "UK", // British band
  },
  {
    slug: "mogwai",
    midis: ["take-me-somewhere-nice---mogwai"],
    composerBirthYear: 1976,
    genre: "Post-Rock", // A pioneering band in the post-rock genre
    style: "Instrumental, Atmospheric", // Known for their atmospheric instrumental compositions
    country: "Scotland", // Scottish band
  },
  {
    slug: "dmitry_kabalevsky",
    midis: [
      "slow-waltz-24-pieces-for-children-op.39-no.-23---dmitry-kabalevsky",
      "clowns---dmitri-kabalevsky", // I~i mix
      "a-happy-outing-24-pieces-for-children-op.39-no.-24---dmitry-kabalevsky",
      "animato-24-pieces-for-children-op.-39-no.-18---dmitri-kabalevsky",
    ],
    composerBirthYear: 1904, // Dmitri Kabalevsky (1904–1987)
    genre: "Classical", // Prominent 20th-century classical composer
    style: "Neoclassical", // Neoclassical style, often with elements of folk music
    country: "Russia", // Russian composer
  },
  {
    slug: "nikolai_medtner",
    midis: [
      "medtner---2-skazki-op.20-no.1",
      "medtner---6-skazki-op.-51-no.-6-fairy-tales",
    ],
    composerBirthYear: 1880,
    country: "Russia",
    genre: "Romantic",
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
    composerBirthYear: 1976,
    genre: "Video Game Music", // Composed for various video games
    style: "Electronic, Orchestral", // A mix of electronic and orchestral music
    country: "Finland", // Finnish composer
  },
  {
    slug: "james_newton_howard",
    midis: [
      "the-hunger-games-mockingjay-pt.-2-piano-suite",
      "running-on-raindrops-from-raya-and-the-last-dragon---james-newton-howard",
    ],
    composerBirthYear: 1951, // James Newton Howard (born 1951)
    genre: "Film Music", // Famous for film scores
    style: "Orchestral, Cinematic", // Orchestral and cinematic compositions for films
    country: "USA", // American composer
  },
  {
    slug: "claude_morgan",
    midis: [
      "el-bimbo---claude-morgan",
      "la-balanga",
      "tchoo-tchoo-hold-on-the-line",
    ],
    composerBirthYear: 1947,
    genre: "Pop",
    style: "Pop",
    country: "Tunisia",
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
    composerBirthYear: 1938, // Vladimir Dashkevich (1938–2019)
    genre: "Film Music", // Known for composing film scores, particularly for Soviet films
    style: "Orchestral, Cinematic", // His music is often cinematic and orchestral in style
    country: "Russia", // Russian composer
  },
  {
    slug: "singles",
    midis: [
      "catherine-howard-s-fate---blackmore-s-night",
      "moskau---dschinghis-khan-moskau",
    ],
    // Not enough info to provide composerBirthYear, genre, style, and country
  },
  {
    slug: "anton_rubinstein",
    midis: [
      "melody-in-f-op.-3-no.-1---anton-rubinstein",
      "morceau-d-anton-rubinstein-toreador-et-andalouse",
      "melody-in-b-op.-3-no.-2---anton-rubinstein",
    ],
    composerBirthYear: 1829, // Anton Rubinstein (1829–1894)
    genre: "Classical", // Classical composer and pianist
    style: "Romantic", // Romantic era composer
    country: "Russia", // Russian composer
  },
  {
    slug: "russian_singles",
    midis: [
      "belym-snegom---muzyka-e-rodygina-belym-snegom---muzyka-e.-rodygina",
      "beri_shinel-_poshli_domoy",
      "i-hear-the-noise-of-birches...---konstantin-orbelyan",
    ],
    composerBirthYear: 1950, // Konstantin Orbelyan was born in 1950
    country: "Russia",
  },
  {
    slug: "fleur",
    midis: [
      "formalin-formalin---flyour",
      "shelkopryad---flyour",
      "teplye-koty---flyour",
    ],
    composerBirthYear: 1980,
    genre: "Electronic", // Based on the style of the artist
    style: "Ambient", // Ambient electronic style
    country: "Russia", // Assuming the artist is from Russia
  },
  {
    slug: "manisha_vremeni",
    midis: [
      "moy-drug---mashina-vremeni",
      "odnazhdy-mir-prognetsya-pod-nas.",
      "she-walks-through-life-a-smile-on-her-face----a.-makarevich",
    ],
    composerBirthYear: 1949, // Andrei Makarevich (composer of Mashina Vremeni) was born in 1949
    genre: "Rock", // Russian rock
    style: "Progressive Rock", // Progressive elements in Mashina Vremeni
    country: "Russia",
  },
  {
    slug: "melnitsa",
    midis: [
      "melnica---korolevna",
      "melnica---doroga-sna",
      "melnica----nevesta-poloza",
    ],
    composerBirthYear: 1976,
    genre: "Folk Rock", // Folk-rock style
    style: "Celtic Folk", // Heavy influence of folk traditions
    country: "Russia",
  },
  {
    slug: "igor_kornelyuk",
    midis: [
      "banditskiy-peterburg-gorod-kotorogo-net-fortepiano-a-town-that-does-not-exist",
      "syuyita-mayster-ta-margarita---i.-kornelyuk",
    ],
    composerBirthYear: 1961, // Igor Kornelyuk was born in 1961
    genre: "Classical", // Mostly classical and cinematic music
    style: "Cinematic", // Often composes for films and TV
    country: "Russia",
  },
  {
    slug: "krematoriy",
    midis: ["katmandu-polnaya-versiya", "musornyy-veter-gr.-krematoriy"],
    composerBirthYear: 1960,
    genre: "Rock", // Russian rock
    style: "Post-punk", // Post-punk and alternative rock elements
    country: "Russia",
  },
  {
    slug: "wang_jian",
    midis: ["fei-niao-he-chan-ren-ran"],
    composerBirthYear: 1973, // Wang Jian, a Chinese composer, born in 1973
    genre: "Classical", // Chinese classical music
    style: "Traditional", // Traditional Chinese music
    country: "China",
  },
  {
    slug: "chinese_single_pieces",
    midis: [
      "spring-festival-overture-chun-jie-xu-qu---li-huan-zhi-piano-cover",
      "cai-yun-zhui-yue-colorful-clouds-chasing-the-moon--piano-solo", // ren guang
    ],
    genre: "Classical", // Classical Chinese music
    style: "Traditional", // Traditional Chinese styles
    country: "China",
  },
  {
    slug: "cornelius_gurlitt",
    midis: [
      "night-journey---cornelius-gurlitt",
      "little-waltz---gurlitt-op.-205-no-10",
      "gurlitt-cornelius---sonatina-in-a-minor-op.-76-no.-5-3rd-mvmt",
    ],
    composerBirthYear: 1823, // Cornelius Gurlitt was born in 1823
    genre: "Classical", // 19th-century German classical
    style: "Romantic", // Romantic period style
    country: "Germany",
  },
  {
    slug: "clara_schumann",
    midis: [
      "schumann-clara---lieder-op.12-no.4---liebst-du-um-schonheit",
      "clara-schumann--notturno",
    ],
    composerBirthYear: 1819, // Clara Schumann was born in 1819
    genre: "Classical", // Classical, Romantic music
    style: "Romantic", // Romantic period
    country: "Germany",
  },
  {
    slug: "schumann",
    midis: [
      "schumann-carnaval---no.-12-chopin-piano-solo",
      "schumann-kinderszenen-no.7-op.15--dreaming-traumerei",
      "schumann-the-wild-horseman-op.-68-no.-8",
      "r.-schumann---kinderszenen-no.-1-von-fremden-landern-und-menschen.",
    ],
    composerBirthYear: 1810, // Robert Schumann was born in 1810
    genre: "Classical", // Classical, Romantic music
    style: "Romantic", // Romantic period
    country: "Germany",
  },
  {
    slug: "norbert_schultze",
    midis: [
      "lili-marlene---norbert-schultz",
      "von-finnland-bis-zum-schwarzen-meer",
      "das-lied-vom-deutschen-u-boot-mann",
    ],
    composerBirthYear: 1911, // Norbert Schultze was born in 1911
    genre: "Film Music", // German film composer
    style: "Military", // Often associated with wartime themes
    country: "Germany",
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
    composerBirthYear: 1964, // Boban Marković was born in 1964
    genre: "Balkan Brass", // Traditional Balkan brass
    style: "Balkan", // Traditional Serbian brass band music
    country: "Serbia",
  },
  {
    slug: "thomas_attwood",
    midis: [
      "allegro---first-movement-from-sonatina-no.-1-in-g-trinity-grade-2-piano",
    ],
    composerBirthYear: 1765, // Thomas Attwood was born in 1765
    genre: "Classical", // Classical period music
    style: "Classical", // Classical style
    country: "United Kingdom",
  },
  {
    slug: "nat_king_cole",
    midis: ["nat-king-cole---easy-listening-blues-transcription"],
    composerBirthYear: 1919, // Nat King Cole was born in 1919
    genre: "Jazz", // Jazz, Swing
    style: "Swing", // Swing jazz style
    country: "USA",
  },
  {
    slug: "martin_kratochwil",
    midis: [
      "potato-blues",
      "sour-apple-blues",
      "lonesome-broccoli-blues-_-easy-piano",
    ],
    composerBirthYear: 1960,
    genre: "Blues", // Blues music
    style: "Jazz Blues", // Influences of jazz in blues
    country: "USA", // Based on his genre
  },
  {
    slug: "hitoshi_sakimoto",
    midis: [
      "qiao-shang-nozhan-i-battle-on-the-bridge---final-fantasy-tactics-ps1---hitoshi-sakimoto",
      "randam-waltz---final-fantasy-tactics-ps1---hitoshi-sakimoto",
    ],
    composerBirthYear: 1969,
    genre: "Video Game Music",
    country: "Japan",
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
    composerBirthYear: 1969, // Glenn Stafford was born in 1969
    genre: "Video Game Music", // Music for video games
    style: "Cinematic", // Often cinematic in nature
    country: "USA",
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
    composerBirthYear: 1982, // Ludwig Göransson was born in 1982
    genre: "Film Music", // Film music composer
    style: "Cinematic", // Film score style
    country: "Sweden",
  },
  {
    slug: "brian_tyler",
    midis: [
      "formula-1-theme---brian-tyler",
      "peaches-from-super-mario-bros-movie-for-violin---brian-tyler-jack-blackman",
      "theme-from-rambo-brian-tyler",
    ],
    composerBirthYear: 1972, // Brian Tyler was born in 1972
    genre: "Film Music", // Film music composer
    style: "Cinematic", // Film score style
    country: "USA",
  },
  {
    slug: "miki_higashino_sukoiden_2",
    midis: ["reminiscence---suikoden-2", "two-rivers---suikoden-2"],
    composerBirthYear: 1960,
    genre: "Video Game Music", // Music for video games
    style: "Orchestral", // Orchestral soundtrack
    country: "Japan",
  },
  {
    slug: "rob_hubbard",
    midis: ["monty-on-the-run"],
    composerBirthYear: 1955,
    genre: "Video Game Music", // Music for video games
    style: "Chiptune", // Early video game music style
    country: "UK",
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
    composerBirthYear: 1975, // Jeremy Soule was born in 1975
    genre: "Video Game Music", // Music for video games
    style: "Cinematic", // Often cinematic and orchestral
    country: "USA",
  },
  {
    slug: "natalia_lafourcade",
    midis: ["soledad-y-el-mar", "mi-tierra-veracruzana---natalia-lafourcade"],
    composerBirthYear: 1984,
    genre: "Pop", // Latin pop
    style: "Folk", // Latin folk influence
    country: "Mexico", // Mexican artist
  },
  {
    slug: "inti-illimani",
    midis: [
      "el-pueblo-unido---inti-illimani",
      "dolencias---inti-illimani-dolencias",
      "huajra---inti-illimani",
    ],
    composerBirthYear: 1942,
    country: "Chile",
  },
  {
    slug: "handel",
    midis: [
      "minuet-from-music-for-the-royal-fireworks---georg-friedrich-handel",
      "gavotte_in_g_major_hwv_491_handel_george_frideric",
      "passacaglia---handel-halvorsen",
      "water-music-suite-in-d-major-ii---alla-hornpipe-handel",
    ],
    composerBirthYear: 1685, // Georg Friedrich Handel was born in 1685
    genre: "Classical", // Baroque period
    style: "Baroque", // Baroque style
    country: "Germany",
  },
  {
    slug: "bo_burnham",
    midis: ["welcome-to-the-internet---bo-burnham-s-inside"],
    composerBirthYear: 1990,
    genre: "Comedy", // Comedy music and satire
    style: "Satirical", // Satirical comedy
    country: "USA",
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
    composerBirthYear: 1980, // Lin-Manuel Miranda was born in 1980
    genre: "Musical Theatre", // Musical theatre music
    style: "Broadway", // Broadway-style musical compositions
    country: "USA",
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
      "elegy-for-dunkirk---dario-marianelli",
    ],
    composerBirthYear: 1963, // Dario Marianelli was born in 1963
    genre: "Film Score", // Known for composing film scores
    style: "Orchestral", // Marianelli is recognized for his orchestral and emotive compositions
    country: "Italy", // Italian composer
  },
  {
    slug: "enya",
    midis: [
      "watermark-enya",
      "caribbean-blue---enya",
      "a-day-without-rain---enya",
    ],
    composerBirthYear: 1961, // Enya was born in 1961
    genre: "New Age", // Enya is a prominent artist in the New Age genre
    style: "Ambient, Celtic", // Known for ambient and Celtic musical influences
    country: "Ireland", // Enya is from Ireland
  },
  {
    slug: "charles_villiers_stanford",
    midis: [
      "stanford-charles-villiers---the-blue-bird",
      "when-mary-thro-the-garden-went---charles-villiers-stanford",
    ],
    composerBirthYear: 1852, // Born in 1852
    genre: "Classical", // Stanford was a classical composer
    style: "Romantic", // His work is typically associated with the Romantic era
    country: "United Kingdom", // Stanford was English
  },
  {
    slug: "2002_band",
    midis: ["suddenly-yours---2002-band", "we-meet-again---2002-band"],
    composerBirthYear: undefined, // No clear composer is associated with the band
    genre: "Pop", // The 2002 band is known for pop music
    style: "Soft Pop", // Their music has a soft pop style
    country: "South Korea", // 2002 was a South Korean band
  },
  {
    slug: "lyle_mays",
    midis: ["lyle-mays-chorinho-arr.-for-solo-piano"],
    composerBirthYear: 1949, // Born in 1949
    genre: "Jazz", // Lyle Mays was a jazz composer and pianist
    style: "Jazz Fusion", // Known for his fusion of jazz with other styles
    country: "USA", // Lyle Mays was American
  },
  {
    slug: "poulenc",
    midis: ["poulenc-melancolie-piano-solo"],
    composerBirthYear: 1899, // Born in 1899
    genre: "Classical", // Poulenc was a classical composer
    style: "20th Century", // His works are characterized by 20th-century classical music styles
    country: "France", // Poulenc was French
  },
  {
    slug: "chinese",
    midis: ["han-gong-chun-li-chun-ri---song-yu-ning", "shan-zhi-gao---song"],
    composerBirthYear: undefined, // The specific composer is unclear for these tracks
    genre: "Traditional Chinese", // The music is traditional Chinese
    style: "Folk", // Folk music style with traditional Chinese instruments
    country: "China", // Likely from China, given the titles
  },
  {
    slug: "karel_svoboda",
    midis: [
      "drei-haselnusse-fur-aschenbrodel---karel-svoboda-by-jacroby",
      "n-a-v-s-t-e-v-n-i-c-i",
    ],
    composerBirthYear: 1938, // Born in 1938
    genre: "Film Score", // Known for composing film scores
    style: "Orchestral", // His film scores are typically orchestral
    country: "Czech Republic", // Svoboda was Czech
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
    composerBirthYear: 1976, // Born in 1976
    genre: "Film Score", // Known for composing film scores
    style: "Modern Orchestral", // Modern orchestral style with electronic elements
    country: "United Kingdom", // Benjamin Wallfisch is from the UK
  },
  {
    slug: "takashi_yoshimatsu",
    midis: [
      "waltz-of-rainbow-colored-roses---takashi-yoshimatsu",
      "waltz-in-green---takashi-yoshimatsu-lu-nowarutu",
      "velvet-waltz---takashi-yoshimatsu-berubetutowarutu",

      "yoshimatsu---4-little-dream-songs-ii.-summer---distorted-waltz-on-august",
      "pleiades-dances-book-2---takashi-yoshimatsu",
      "yoshimatsu-waltz-in-obtuse-angle-from-pleiades-dances-ix",
      "yoshimatsu---koo-s-waltz",
    ],
    composerBirthYear: 1953,
    country: "Japan",
  },
  {
    slug: "shinichi_osawa",
    midis: [
      "the-last-waltz---banana-fish",
      "liberty---banana-fish",
      "blue-bird---banana-fish",
    ],
    composerBirthYear: 1967,
    country: "Japan",
  },
  {
    slug: "john_kander",
    midis: ["cabaret---john-kander-and-fred-ebb-bb-clarinet-and-piano"],
    composerBirthYear: 1927,
    genre: "Broadway",
    country: "USA",
  },
  {
    slug: "karol_szymanowski",
    midis: [
      "9-preludes-op.1---karol-szymanowski-9-preludes-op.-1-no.-1---karol-szymanowski",
      "9-preludes-op.1---karol-szymanowski",
    ],
    composerBirthYear: 1882,
    style: "Romantic",
    country: "Poland",
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
      "36-original-dances-no.-27---franz-schubert",
      "franz-schubert---waltz-in-d-flat-major-op.-9-no.-14",
      "36-originaltanze-d.365---franz-schubert",
      "12-graz-waltzes-ndeg3---schubert",
      "franz-schubert---waltz-in-b-major-d.-145-nr2",
      // "ecossaise-no-3-d.529---franz-schubert",
      "schubert-ecossaise-no.-4-op-18-d.145",
      "schubert-ecossaise-no-8-op-18-d.145",
      "ecossaise-in-c-major-no-8-d.299---franz-schubert",
      "schubert-german-dance-d.783-op.-33-no.-2",
      "german-dance-and-ecossaise-d.643---franz-schubert",
      "schubert---sonata-in-a-op.120-d.664-movement-i",
      "ave-maria-d839---schubert---solo-piano-arrg.",
      "schubert_36_first_waltzes_op9_d365_-c-yogore",
      "wima.8729-deut.tanz-d-365-nr.01",
      "wima.3e58-schubert_deut.tanz-d.365.3",
      "wima.3fc1-schubert_deut.tanz-d.365.05", // almost V I, b7
      "wima.b3a9-schubert_deut.tanz-d.365.06",
      "wima.c953-schubert_deut.tanz-d.365.07", // almost V I, chromatic 9 b9
      "wima.30c1-schubert_deut.tanz-d.365.08",

      "wima.ae09-schubert_deut.tanz-d.365.10",
      "wima.8229-schubert_deut.tanz-d.365.11",
      "wima.dc1e-schubert_deut.tanzd365.12", // ii7
      "wima.d5ac-schubert_deut.tanzd365.13", // IV
      "wima.eac7-schubert_deut.tanzd365.14",
      "wima.5ded-schubert_deut.tanzd365.15",
      "wima.0384-schubert_deut.tanzd365.16",
      "wima.e3f7-schubert_deut.tanzd365.17", // IV
      "wima.3657-schubert_deut.tanzd365.18", // ii
      "wima.7295-schubert_deut.tanzd365.19", // V/ii
      "wima.a880-schubert_deut.tanz-d.365.20", // V/V voice-leading
      "wima.3306-schubert_deut.tanz-d.365.21",

      "wima.5426-schubert_de.-tanz-d.365.23",
      "wima.28fc-schubert_de.-tanz-d.365.24", // reverse V/vi

      "wima.738b-schubert_de.-tanz-d.365.27", // i V I V, rel minor

      "wima.67e3-schubert_deut.tanz-d.365.32",
      "wima.02f6-schubert_deut.tanz-d.365.33",
      "wima.8469-schubert_deut.tanz-d.365.34",
      "wima.7abe-schubert_deut.tanz-d.365.35",
      "wima.a20b-schubert_deut.tanzd365.36",

      // simple V I
      "wima.7e1e-schubert_deut.tanz-d.365.09",
      "wima.e480-schubert_de.-tanz-d.365.25",
      "wima.1124-schubert_de.-tanz-d.365.26",
      "wima.4be9-schubert_de.-tanz-d.365.28",
    ],
    composerBirthYear: 1797,
    genre: "Classical",
    style: "Romantic",
    country: "Austria",
  },

  {
    slug: "brad_mehldau",
    midis: ["anthropology---brad-mehldau"],
    composerBirthYear: 1970,
    genre: "Jazz",
    style: "Post-bop, Contemporary Jazz",
    country: "USA",
  },
  {
    slug: "aziza_mustafa_zadeh",
    midis: [
      "aziza_mustafa_zadeh_dance_of_fire_2010_live_trio",
      "aziza_mustafa_zadeh_dance_of_fire_nicola_morali_solo_piano_cover",
      "always---aziza-mustafa-zadeh",
    ],
    composerBirthYear: 1969, // Aziza Mustafa Zadeh was born in 1969
    genre: "Jazz", // She is a jazz pianist and composer
    style: "Fusion, Avant-garde Jazz", // Known for jazz fusion and avant-garde styles
    country: "Azerbaijan", // Born in Baku, Azerbaijan
  },
  {
    // https://musescore.com/user/24069/sets/5098783
    slug: "dvorak",
    midis: [
      "Symphony_No9_From_The_New_World_1st_movement_for_piano_solo_",
      "Symphony_No9__From_The_New_World__2nd_movement",
      "Symphony_No.9_From_The_New_World_3rd_movement_Scherzo",
      "Symphony_No9_From_The_New_World_4th_movement__Z_Novho_Svta",
      "antonin-dvorak-serenade-for-string-orchestra-in-e-major-op.22-ii.-tempo-di-valse",
    ],
    composerBirthYear: 1841, // Antonín Dvořák was born in 1841
    genre: "Classical", // He was a classical composer
    style: "Romantic", // Part of the Romantic movement
    country: "Czech Republic", // Born in what is now the Czech Republic
  },
  {
    // https://musescore.com/user/19710/sets
    slug: "beethoven",
    midis: [
      "sonatina_in_g_beethoven_anh_5_no_1_beethoven",

      "beethoven-symphony-no.-5-1st-movement-piano-solo",
      "beethoven---sonata-in-f-minor-op.2-no.1-movement-i",
      "piano_sonata_no_3_in_c_major_op_2_no_3_ludwig_van_beethoven_piano_sonata_no_3_in_c_major_op_2_no_3_complete",
      "beethoven_sonata_in_f_minor_op_2_no_1_movement_i",
      "beethoven_sonate_5_1st",
      "beethoven_sonata_8_pathetique_op_13_mov_1",
      "beethoven_sonata_in_g_op_14_no_2_movement_i",
      "beethoven_op_22_sonata_11_mov_1",
      "Sonate_No._14_Moonlight_1st_Movement",
      "moonlight_sonata_ludwig_van_beethoven_piano_solo",
      "Sonate_No._14_Moonlight_3rd_Movement",
      "sonate-no.-17-tempest-3rd-movement",

      "beethoven_trio_for_clarinet_cello_and_piano_no_4_op_11_2nd_movement",
      "Fr_Elise",

      "bagatelle_in_g_minor_op_119_no_1_ludwig_van_beethoven_16_07_1770_26_03_1827_piano_solo",
      "beethoven---bagatelle-no.-4-in-a-major-op.-119",
      "beethoven---bagatelle-in-a-minor-no.-9---op.-119",
      "beethoven---bagatelle-in-a-major-no.-10---op.-119",
      "bagatelle-op.-119.-no-2---ludwig-van-beethoven",
      "bagatelle-op.119-no.5-beethoven",
    ],
    composerBirthYear: 1770, // Ludwig van Beethoven was born in 1770
    genre: "Classical", // Beethoven bridged the Classical and Romantic eras, but is primarily associated with Classical music
    style: "Romantic", // Beethoven's later works, particularly from his middle period onward, are often considered Romantic
    country: "Germany", // Beethoven was German (born in Bonn, which was part of Electorate of Cologne, now Germany)
  },
  {
    slug: "einaudi",
    midis: [
      "the_earth_prelude_ludovico_einaudi_piano_solo",
      "ludovico-einaudi-una-mattina",
    ],
    composerBirthYear: 1955, // Ludovico Einaudi was born in 1955
    genre: "Classical", // Modern classical music
    style: "Minimalism, 21st Century Piano", // Known for Minimalism and contemporary classical style
    country: "Italy", // Born in Italy
  },
  {
    slug: "michel_petrucciani",
    midis: ["home-1998-solo-live-transcription---michel-petrucciani"],
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
      "roumen-sirakov-s-daichevo",
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
      "glavinishko-cetvorno",
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
    country: "Bulgaria",
  },
  {
    slug: "franz_xaver_gruber",
    midis: ["stille-nacht-heilige-nacht-the-1818-original-silent-night"],
    composerBirthYear: 1787,
    country: "Austria",
    genre: "Classical",
    style: "Romantic",
  },
  {
    slug: "r_bryan_anthony",
    midis: [
      "away-in-a-manger-by-william-j.-kirkpatrick-arranged-by-r-bryan-anthony",
      "silent-night-holy-night-piano-solo---arranged-by-r-bryan-anthony",
    ],
    composerBirthYear: 1980,
    style: "Modern Jazz",
  },
  {
    slug: "ernest_shand",
    midis: [
      "andante-espressivo-op-60---shand-ernest",
      "songes-d-ete-op-95---shand-ernest",
    ],
    composerBirthYear: 1868,
    genre: "Classical Guitar",
    country: "UK",
  },
  {
    slug: "william_j_kirkpatrick",
    midis: [
      "away-in-a-manger-cradle-song",
      "crown-him-with-many-crowns-kirkpatrick---wm.-j.-kirkpatrick",
    ],
    composerBirthYear: 1838,
    country: "Ireland, USA",
    genre: "Classical",
    style: "Hymn",
  },
  {
    slug: "franz_gordon",
    midis: [
      "the-french-library---franz-gordon",
      "song-for-johanna---franz-gordon",
    ],
  },
  {
    slug: "paul_de_senneville",
    midis: [
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
      "ballade-pour-adeline---richard-clayderman",
      "moon-tango---r.-clayderman",
      "les-fleurs-sauvages---richard-clayderman",
      "souvenirs-d-enfance---richard-clayderman",
      "concerto-des-etoiles---richard-clayderman",
      "a-comme-amour-by-paul-de-senneville-arranged-richard-clayderman-for-piano",
      "nostalgy-by-olivier-toussaint-arranged-richard-clayderman-for-piano",
      "jardin-secret-by-paul-de-senneville-arranged-richard-clayderman-for-piano",
      "lyphard-melody---richard-clayderman",
      "dolannes-melody--richard-clayderman",
      "les-premiers-sourires-de-vanessa-by-richard-clayderman-for-piano",
      "coeur-fragile",
      "lettre-a-ma-mere",
      "coup-de-coeur-coup-de-coeur-serenade-de-l-etoile--richard-clayderman",
      "les-oiseaux-tristes-du-zuiderzee",
      "triste-coeur",
      "les-jours-triste",
      "concerto-pour-une-jeune-fille-nommee-je-t-aime",
      "la-fuite-du-temps-by-richard-clayderman-for-piano",
      "hungarian-sonata---paul-de-senneville",
      "voyage-a-venice---richard-clayderman",
      "couleur-tendresse",
      "revivre-sa-vie--richard-clayderman",
      "eden-is-a-magic-world---paul-de-senneville-and-oliver-toussaint",
      "promenade-dans-les-bois",
      "murmures-murmullos",
      "concerto-la-madrague----paul-de-senneville-jean-baudlot",
      "le-deuxieme-slow----paul-de-senneville-jean-baudlot",
      "eleana",
    ],
    composerBirthYear: 1933,
    genre: "Easy Listening, Intrumental Pop", // Known for his romantic and easy-listening style
    country: "France", // Born in Paris, France
  },
  {
    slug: "marc_streitenfeld",
    midis: [
      "honoring-the-dead---marc-streitenfeld",
      "american-gangster-frank-lucas---marc-streitenfeld",
      "the-grey",
    ],
    composerBirthYear: 1968, // Marc Streitenfeld was born in 1968
    genre: "Film Score", // Known for composing film scores
    style: "Orchestral, Cinematic", // His style is orchestral and cinematic
    country: "Germany", // Born in Frankfurt, Germany
  },
  {
    slug: "brian_eno",
    midis: [
      "music_for_airports_1_1-eno",
      "by-this-river---brian-eno",
      "harold-budd-brian-eno---not-yet-remembered",
      "blonde-by-roger-and-brian-eno",
    ],
    composerBirthYear: 1948, // Brian Eno was born in 1948
    genre: "Ambient, Electronic", // Known for ambient and electronic music
    style: "Ambient, Experimental", // Pioneer of ambient music and experimental sound
    country: "UK", // Born in England
  },
  {
    slug: "campyfire",
    midis: ["greed---campyfire", "nut-cracker-march---arsenal-emote-music"],
    composerBirthYear: undefined, // Birth year not available
    genre: "Electronic", // Electronic music
    style: "Chiptune, Lo-fi", // Lo-fi and chiptune elements are present in their music
    country: undefined, // Country not available
  },
  {
    slug: "gabriele_traietti",
    midis: ["a-trip-to-rapture-i-in-the-bathysphere"],
    composerBirthYear: undefined, // Birth year not available
    genre: "Electronic", // Likely an electronic artist based on the music
    style: "Ambient, Soundtrack", // The track suggests a cinematic and ambient style
    country: undefined, // Country not available
  },
  {
    slug: "lofi",
    midis: ["cool-lofi-hip-hop-song"],
    composerBirthYear: undefined, // No specific birth year for this genre
    genre: "Lo-fi Hip Hop", // The genre is lo-fi hip hop
    style: "Chill, Instrumental", // Lo-fi is typically chill and instrumental
    country: undefined, // Country not available
  },
  {
    slug: "horace_silver",
    midis: ["song-for-my-father---horace-silver"],
    composerBirthYear: 1928, // Horace Silver was born in 1928
    genre: "Jazz", // A legendary jazz pianist and composer
    style: "Hard Bop", // Known for the hard bop style of jazz
    country: "USA", // Born in the United States
  },
  {
    slug: "mulatu_astatke",
    midis: ["yekermo_sew_-_mulatu_astatke-no-acc"],
    composerBirthYear: 1943, // Mulatu Astatke was born in 1943
    genre: "Jazz, Ethio-jazz", // Known for Ethio-jazz, a fusion of jazz and traditional Ethiopian music
    style: "Fusion, Ethio-jazz", // Pioneer of Ethio-jazz
    country: "Ethiopia", // Born in Addis Ababa, Ethiopia
  },
  {
    slug: "kanye_west",
    midis: [
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "kanye-west-homecoming-piano-cover",
    ],
    composerBirthYear: 1977,
    genre: "Hip-hop",
    country: "USA",
  },
  {
    slug: "ramin_djawadi",
    midis: [
      // "Game_of_Thrones_Easy_piano",
      "game-of-thrones-main-piano",
      "light-of-the-seven---ramin-djawadi-complete-transcription",
      "the-night-king---ramin-djawadi",
      "ramin-djawadi---a-lannister-always-pays-his-debts-piano",
    ],
    composerBirthYear: 1973, // Ramin Djawadi was born in 1973
    genre: "Film Score, Classical", // Known for his film scores
    style: "Orchestral, Cinematic", // Orchestral and cinematic style, particularly in soundtracks
    country: "Germany", // Born in Germany
  },
  {
    slug: "vivaldi",
    midis: [
      "vivaldi---summer---piano",
      "vivaldi---winter-rousseau-version-original",
    ],
    composerBirthYear: 1678,
    genre: "Classical",
    style: "Baroque",
    country: "Italy",
  },
  {
    slug: "coldplay",
    midis: [
      "Viva_La_Vida_Coldplay",
      "the-scientist---coldplay-piano-arrangement",
      "clocks---coldplay",
      "fix-you---coldplay",
    ],
    composerBirthYear: 1977,
    genre: "Pop, Pop Rock, Alternative Rock",
    country: "UK",
  },
  {
    slug: "brad_breeck",
    midis: [
      "Gravity_Falls_Opening",
      "gravity-falls---weirdmageddon-theme",
      "eda-s-requiem---brad-breeck-piano",
      "we-ll-meet-again---gravity-falls",
    ],
    composerBirthYear: 1978,
    genre: "Animation",
    country: "USA",
  },
  {
    slug: "bruno_mars",
    midis: [
      "when-i-was-your-man---bruno-mars-600e3a",
      "bruno-mars-leave-the-door-open",
      "die-with-a-smile---lady-gaga-bruno-mars",
    ],
    composerBirthYear: 1985,
    genre: "Pop",
    country: "USA",
  },
  {
    slug: "luo_ni",
    midis: [
      "g-minor-bach-original",
      "crazy-pharaoh",
      "miss-fox-piano-tiles-2",
      "childhood-piano-tiles-2",
      "bluestone-alley-piano-tiles-2",
    ],
    composerBirthYear: 1980,
    genre: "Music Game",
    country: "China",
  },
  {
    slug: "laura_shigihara",
    midis: [
      "plants-vs-zombies-grasswalk",
      "crazy-dave-intro-theme---laura-shigihara-from-plants-vs.-zombies",
      "loonboon---laura-shigihara-arranged-by-piano-keyng",
      "moongrains---laura-shigihara",
      "plants-vs-zombies---watery-graves",

      "to-the-moon-for-river-johnny-s-version-48aa2a",
    ],
    composerBirthYear: 1980,
    genre: "Music Game",
    country: "US, Japan",
  },
  {
    slug: "yosuke_yamashita",
    midis: [
      "never-ending-saga---yosuke-yamashita",
      "hikari-e---franchouchou-hikari-e---yosuke-yamashita-zombieland-saga",
      "ookami-blues-tv-size---seton-academy-ed",
    ],
    country: "Japan",
  },
  {
    slug: "christopher_larkin",
    midis: [
      "hollow-knight-main-theme---christopher-larkin",
      "greenpath---christopher-larkin",
      "sealed-vessel---christopher-larkin",
      "the-grimm-troupe---christopher-larkin",
      "soul-sanctum---christopher-larkin",
      "crossroads---christopher-larkin-hollow-knight",
      "dirtmouth---christopher-larkin-hollow-knight-7e5846",
      "hive-knight---christopher-larkin-hive-knight---christopher-larkin",
      "broken-vessel---christopher-larkin---theme-from-hollow-knight-for-piano",
    ],
    composerBirthYear: 1992,
    genre: "Video Game Music",
    country: "Australia",
  },
  {
    slug: "jose_asuncion_flores",
    midis: [
      "panambi-vera---manuel-ortiz-guerrero-y-jose-asuncion-flores",
      "nde-rendape-aju-jose-a-suncion-flores-manuel-ortiz-guerrero",
    ],
    composerBirthYear: 1904,
    genre: "Guarania",
    country: "Paraguay",
  },
  {
    slug: "fujii_kaze",
    midis: [
      "shinunoga-e-wa---fujii-kaze-si-nunogaiiwa",
      "matsuri---fujii-kaze",
    ],
    country: "Japan",
    genre: "J-Pop",
    composerBirthYear: 1997,
  },
  {
    slug: "kazumi_totaka",
    midis: ["mii-channel-piano", "wii-sports-theme-piano"],
    composerBirthYear: 1967,
    genre: "Video Game Music",
    country: "Japan",
  },
  {
    slug: "hirokazu_tanaka",
    midis: [
      "overworld-from-kid-icarus---hirokazu-tanaka",
      "adobansuadobentiya-pokemon-ag-japanese-op1-piano---hirokazu-tanaka",
    ],
    composerBirthYear: 1957,
    country: "Japan",
    genre: "Video Game Music",
  },
  {
    slug: "kohei_tanaka",
    midis: [
      "one-piece---bink-s-sake---kohei-tanaka",
      "overtaken---kohei-tanaka-overtaken-one-piece---kohei-tanaka",
      "if-you-live-one-piece-ost-bgm---kohei-tanaka-maranoch",
    ],
    composerBirthYear: 1954,
    country: "Japan",
    genre: "Video Game Music",
  },
  {
    slug: "hidenori_maezawa",
    midis: [
      "prelude---castlevania-iii",
      "aquarius---castlevania-iii-dracula-s-curse",
      "alien-lair",
      "stage-1-jungle",
    ],
    composerBirthYear: 1958,
    country: "Japan",
    genre: "Video Game Music",
  },
  {
    slug: "koji_kondo",
    midis: [
      "legend-of-zelda-main-theme-score",
      "Legend_of_Zelda_Great_Fairy_Fountain",
      "Super_Mario_Bros_Main_Theme",
      "Zeldas_Lullaby",
      "ocarina-of-time-lost-woods-piano",
    ],
    composerBirthYear: 1961,
    genre: "Video Game Music",
    country: "Japan",
  },
  {
    slug: "imagine_dragons",
    midis: ["demons-imagine-dragons", "Believer_-_Imagine_Dragons"],
    composerBirthYear: 1984,
    country: "USA",
    genre: "Rock",
  },
  { slug: "adele", midis: ["someone-like-you", "easy-on-me---adele"] },
  {
    slug: "parov_stelar",
    midis: [
      "booty-swing---parov-stelar",
      "chambermaid-swing---parov-stelar---piano-notes",
      "catgroove-piano-solo",
      "all-night",
      "mojo-radio-gang---parov-stelar-parov-stelar---mojo-radio-gang-all-piano",
    ],
  },
  {
    slug: "hans_zimmer",
    midis: [
      "Interstellar",
      "molossus---batman-begins",
      "eptesicus---batman-begins",
      "antrozous---batman-begins",
    ],
  },
  { slug: "bo_en", midis: ["bo-en---my-time", "tussle-among-trees---bo-en"] },
  {
    slug: "pedro_silva",
    midis: [
      "Omori_Duet",
      "omori---gator-gambol---ost-no.-103---pedro-silva",
      "omori---sugar-star-planetarium---ost-no.-21---pedro-silva",
      "by-your-side.---omori",
      "omori-ost---006---let-s-get-together-now---pedro-silva",
    ],
  },
  {
    slug: "toshio_masuda",
    midis: [
      "sadness-and-sorrow-for-piano-solo",
      "afternoon-of-konoha---toshio-masuda",
      "tenten-s-theme---naruto",
      "the-raising-fighting-spirit---toshio-masuda---jarvis-phan",
      "gaara-s-childhood-theme---toshio-masuda",
    ],
  },
  {
    slug: "dan_salvato",
    midis: [
      "doki-doki-literature-club-ost---your-reality",
      "okay-everyone---dan-salvato-okay-everyone",
      "my-confession---dan-salvato-my-confession-ddlc",
      "ohayou-sayori---dan-salvato-ohayou-sayori-ddlc",
      "play-with-me---dan-salvato---doki-doki-literature-club",
      "i-still-love-you",
      "poem-panic---ddlc",
      "daijoubu---doki-doki-literature-club",
      "my-feelings",
      "dreams-of-love-and-literature",
      "my-song-your-note-piano---dan-salvato",

      "your-obnoxious-reality---your-reality-but-sadder", // this piece does not exist!
    ],
  },
  {
    slug: "clint_mansell",
    midis: [
      "Requiem_for_a_Dream",
      "dying-dream-arrangement-by-reik",
      "the-last-man-by-clint-mansell",
      "leaving-earth---mass-effect-3",
      "first-sleep---clint-mansell",
      "memories-someone-we-ll-never-know",
    ],
  },
  {
    slug: "yann_tiersen",
    midis: [
      "Yann_Tiersen_Amelie",
      "rue-des-cascades---yann-tiersen",
      "tiersen-yann----j-y-suis-jamais-alle",
      "les-jours-triste",
      "la-valse-d-amelie-piano",
      "la-noyee---yann-tiersen-la-noyee",
      "a-quai---yann-tiersen",
      "le-moulin---yann-tiersen",

      "l-autre-valse-d-amelie---yann-tiersen-l-autre-valse-d-amelie",
    ],
  },
  {
    slug: "michael_giacchino",
    midis: [
      "Disney_Pixar_Up_Theme",
      "imperial-suite---michael-giacchino-~piano~",
      "catwoman---michael-giacchino",
      "ratatouille-main-theme---michael-giacchino",
      "spider-man-far-from-home-suite---michael-giacchino-piano-arrangement",
    ],
  },
  {
    slug: "fkj",
    midis: [
      "fee-just-piano-version---fkj",
      "meeting-again-in-the-void-just-piano-version---fkj",
      "sundays-just-piano-version---fkj---fkj",
      "tui---fkj-tui",
      "last-hour-just-piano-version---fkj",
      "does-it-exist---fkj",
      "ylang-ylang---fkj-transcribed-by-lilroo",
      "10-years-ago---fkj",
      "pe---fkj",
    ],
    genre: "Lofi",
    composerBirthYear: 1990,
    country: "France",
  },
  {
    slug: "mac_miller",
    midis: [
      "congratulations---mac-miller",
      "good-news---mac-miller---easy-piano",
      "come-back-to-earth-by-mac-miller",
      "circles---mac-miller",
      "everybody---mac-miller-medium-piano",
      "once-a-day---mac-miller",
    ],
    country: "USA",
    composerBirthYear: 1992,
  },
  {
    slug: "yasuharu_takanashi",
    midis: [
      "fairy-tail-main-theme",
      "fairy-tail-ost---natsu-theme",
      "fairy-tail--past-story",
      "fairy-tail---mirajane-no-theme---yasuharu-takanashi-fairy-tail---mirajane-no-theme---yasuharu-takanashi-mira-s-theme",
      "fairy-tail-sad-theme",
      "dragon-slayer---fairy-tail",
      "fairy-tail-opening-14---fairy-tail-yakusoku-no-hi",
    ],
    country: "Japan",
    composerBirthYear: 1963,
  },
  {
    slug: "taro_umebayashi",
    midis: [
      "yuri-on-ice---piano-theme-full",
      "minako-s-mood-choose-your-costume---taro-umebayashi-yuri-on-ice",
      "serenade-for-two-from-yuri-on-ice",
    ],
  },
  {
    slug: "yugo_kanno",
    midis: [
      "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
      "jolyne-s-theme---yugo-kanno---stone-ocean-piano-solo",
      "jotaro-s-theme---yugo-kanno-blue-devils-2023-marimba---jojo-s-bizarre-adventure",
      "killer-yoshikage-kira-s-theme---jojo-s-bizarre-adventure-part-4-diamond-is-unbreakable---yugo-kanno-quiet-life",
      "josuke-s-theme-for-piano-breakdown",
      "pucci-theme---yugo-kanno-pale-snake-from-jojo-stone-ocean",
    ],
    composerBirthYear: 1977,
    country: "Japan",
  },
  {
    slug: "jule_styne",
    midis: [
      "it-s-been-a-long-long-time---harry-james",
      "let-it-snow---jule-styne",
      "people---jule-styne",
      "cornet-man---bob-merrill",
    ],
    composerBirthYear: 1905,
    country: "USA",
    genre: "Broadway",
  },
  {
    slug: "takahiro_obata",
    midis: [
      "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
      "norman-s-theme-22194",
      "emma-s-sorrow---the-promised-neverland",
      "krone-on-the-gf-string",
      "shoshimin-ost---main-theme---takahiro-obata",
    ],
  },
  {
    slug: "yehezkel_raz",
    midis: [
      "ballerina---yehezkel-raz",
      "laniakea---yehezkel-raz", // does not exist
      "carousel---yehezkel-raz", // it's called laniakea on youtube
      "continuance---yehezkel-raz",
      "slowly-understanding---yehezkel-raz",
      "breath-in---yehezkel-raz",
      "breath-out---yehezkel-raz",
      "after-you-came---yehezkel-raz",
      "before-you-left---yehezkel-raz", // does not exist
      "closing-time---yehezkel-raz",
      "milestone---yehezkel-raz",
      "early-morning-haze---yehezkel-raz",
    ],
  },
  {
    slug: "masaru_yokoyama",
    midis: [
      "my-lie-watashi-no-uso---your-lie-in-april",
      "again-your-lie-in-april---masaru-yokoyama",
      "classroom-of-the-elite-season-2-theme---masaru-yokoyama-kana-hashiguchi",
      "presence-otouto-mitai-na-sonzai---your-lie-in-april-si-yue-hajun-noxu",
      "horimiya-ep-4-untitled-track---masaru-yokoyama-please-don-t-go",
      "yi-yu-zhi-xian-qu-yiyu---shi-jie-zhi-wai-sheng-ri-wu-ming-pian-duan-beyond-the-world---heng-shan-ke-yokoyama-masaru",
      "fate-apocrypha-hope---masaru-yokoyama",
      "orange-your-lie-in-april-ed2",
    ],
  },
  {
    slug: MUSESCORE_TOP_100_SLUG,
    posttext: AboutTop100Corpus,
    midis: [
      "river-flows-in-you", // Yiruma
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_", // Joe Hisaishi
      "Canon_in_D", // Pachelbel
      "Clair_de_Lune__Debussy", // Debussy
      "Fr_Elise", // Beethoven
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major", // Chopin
      "Gymnopdie_No._1__Satie", // Satie
      "Undertale_-_Megalovania_Piano_ver._3", // Toby Fox
      "Golden_Hour__JVKE_Updated_Ver.", // JVKE
      "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson", // Patrick Watson

      "Hallelujah", // Leonard Cohen
      "Interstellar", // Hans Zimmer
      "Another_Love__-_Tom_Odell_Professional", // Tom Odell
      "Sweden_Minecraft", // C418
      "Pirates_of_the_Caribbean_-_Hes_a_Pirate", // Klaus Badelt
      "game-of-thrones-main-piano", // Ramin Djawadi
      "someone-you-loved-lewis-capaldi", // Lewis Capaldi
      "Ed_Sheeran_Perfect", // Ed Sheeran
      "Liebestraum_No._3_in_A_Major", // Liszt
      "Believer_-_Imagine_Dragons", // Imagine Dragons

      "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK", // John Legend
      "Mad_world_Piano", // Roland Orzabal
      "mariage-d-amour---paul-de-senneville-marriage-d-amour", // Paul de Senneville
      "someone-like-you", // Adele
      "my-heart-will-go-on", // James Horner
      "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2", // Yugo Kanno
      "Carol_of_the_Bells", // Mykola Leontovych
      "piano-man-piano", // Billy Joel
      "Fly_Me_to_the_Moon", // Bart Howard
      "passacaglia---handel-halvorsen", // Handel

      "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book", // Bach
      "All_I_Want_for_Christmas_is_You", // Mariah Carey
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano", // Shostakovich
      "wa-mozart-marche-turque-turkish-march-fingered", // Mozart
      "Viva_La_Vida_Coldplay", // Coldplay
      "Gravity_Falls_Opening", // Brad Breeck
      "the_entertainer_scott_joplin", // Scott Joplin
      "Disney_Pixar_Up_Theme", // Michael Giacchino
      "a-thousand-years", // Christina Perri
      "John_Lennon_Imagine", // John Lennon

      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience", // Kanye West
      "Lovely_Billie_Eilish", // Billie Eilish
      // "lovely-billie-eilish-and-khalid",
      "Omori_Duet", // Pedro Silva
      "Never_Gonna_Give_You_Up", // Mike Stock
      "despacito-piano-cover-peter-bence", // Luis Fonsi
      "solas---jamie-duffy", // Jamie Duffy
      "autumn-leaves-jazz-piano", // Joseph Kosma
      "still-dre---variation-composition", // Andre Young
      // Jake 25.17 - duplicate, replaced
      "mii-channel-piano", // Kazumi Totaka

      "sadness-and-sorrow-for-piano-solo", // Toshio Masuda
      "Super_Mario_Bros_Main_Theme", // Koji Kondo
      "Cant_Help_Falling_In_Love", // Jean-Paul-Égide Martini
      "g-minor-bach-original", // Luo Ni
      "when-i-was-your-man---bruno-mars-600e3a", // Bruno Mars
      "gurenge--demon-slayer-kimetsu-no-yaiba-op", // Kayoko Kusano
      "Let_Her_Go_Passenger", // Passenger
      "we-are-number-one-but-it-s-a-piano-transcript", // Máni Svavarsson
      "dragonborn---skyrim-theme-song-piano-solo", // Jeremy Soule
      "doki-doki-literature-club-ost---your-reality", // Dan Salvato

      "ylang-ylang---fkj-transcribed-by-lilroo", // FKJ
      "attack-on-titan-theme-guren-no-yumiya", // Revo
      "Bella_Ciao", // Italian folk
      "minuet-bwv-anhang-114-in-g-major", // Christian Petzold
      "Take_on_me", // a-ha
      "congratulations---mac-miller", // Mac Miller
      // "the-office---opening-titles-theme-song-for-piano", // Jay Ferguson
      "the-office", // Jay Ferguson
      "it-s-been-a-long-long-time---harry-james", // Jule Styne
      "Dawn_Pride_and_Prejudice", // Dario Marianelli
      "kimi-no-na-wa---sparkle-theishter-2016", // Radwimps, Yojiro Noda

      "Yann_Tiersen_Amelie", // Yann Tiersen
      "sia---snowman", // Sia
      "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2", // Takahiro Obata
      "theme-from-schindler-s-list---piano-solo", // John Williams
      "happy-birthday", // Patty Smith Hill
      "flight-of-the-bumblebee", // Nikolai Rimsky-Korsakov
      "dance-of-the-sugar-plum-fairy", // Pyotr Ilyich Tchaikovsky
      "dont-stop-believing-piano", // Journey
      "sign-of-the-times---harry-styles", // Harry Styles
      "Requiem_for_a_Dream", // Clint Mansell

      "yuri-on-ice---piano-theme-full", // Taro Umebayashi + Taku Matsushiba
      "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night", // Ayase
      "africa---toto", // Toto
      "vivaldi---summer---piano", // Vivaldi
      "Love_Like_You_Steven_Universe", // Steven Universe
      "alan-walker---alone-piano", // Alan Walker
      "my-lie-watashi-no-uso---your-lie-in-april", // Masaru Yokoyama
      "anastasia---once-upon-a-december", // Stephen Flaherty
      "Test_Drive_How_to_Train_Your_Dragon", // John Powell
      "Pokemon_Theme_Song", // John Siegler

      "your-song-piano", // Elton John
      "nothing-else-matters---metallica", // Metallica
      "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description", // Calum Scott
      "fairy-tail-main-theme", // Yasuharu Takanashi
      "welcome-to-the-black-parade---my-chemical-romance", // My Chemical Romance
      "how-far-i-ll-go-~-moana-ost", // Lin-Manuel Miranda
      "la-vie-en-rose-solo-accordion", // Louiguy
      "Im_Blue_Eiffel_65", // Eiffel 65
      "old-town-road---lil-nas-x-ft.-billy-ray-cyrus", // Lil Nas X
      "abba--the-winner-takes-it-all", // ABBA
      "A_Thousand_Miles", // Vanessa Carlton
    ],
  },
  {
    slug: "revo",
    midis: [
      "Attack_on_Titan_Shinzou_wo_Sasageyo",
      "attack-on-titan-theme-guren-no-yumiya",
    ],
  },
  {
    slug: "liszt",
    midis: [
      "tude_S._1413_in_G_Minor_La_Campanella__Liszt",
      "liszt---trois-etudes-de-concert-no.-3-un-sospiro",
      "liszt---hungarian-rhapsody-no.-2",
      "Liebestraum_No._3_in_A_Major",
    ],
    composerBirthYear: 1811,
    genre: "Classical",
    style: "Romantic",
    country: "Austria, Hungary",
  },
  {
    slug: "billie_eilish",
    midis: ["Billie_Eilish_Bad_Guy", "Lovely_Billie_Eilish"],
    composerBirthYear: 2001,
    genre: "Pop",
    country: "USA",
  },
  {
    slug: "toby_fox",
    midis: [
      "undertale-ost---hopes-and-dreams-save-the-world",
      "undertale-undertale-piano",
      "undertale-ost---nyeh-heh-heh-bonetrousle",
      "Fallen_Down_Undertale",
      "asgore-an-undertale-boss-theme",
      "spider-dance---undertale",
    ],
    composerBirthYear: 1991,
    genre: "Video Game Music",
    country: "USA",
  },
  {
    slug: "erik_satie",
    midis: [
      "satie-e.---gnossienne-no.-1",
      "gnossienne-no.-2-dery",
      "gnossienne-no.-3-dery",
      "Gymnopdie_No._1__Satie",
    ],
    composerBirthYear: 1866,
    genre: "Classical",
    style: "Romantic",
    country: "France",
  },
  {
    slug: "ed_sheeran",
    midis: [
      "Ed_Sheeran_Shape_of_you",
      "Photograph_Ed_Sheeran",
      "shivers_ed_sheeran_shivers_ed_sheeran_mixed_ensemble",
      "Ed_Sheeran_Perfect",
    ],
    composerBirthYear: 1991,
    genre: "Pop",
    country: "UK",
  },
  {
    slug: "musescore_top100_more_works_same_composer",
    midis: [
      "ren-sheng-nomerigorando---jiu-shi-rang-jazz-arranged",
      "the-office-opening-theme",
    ],
  },

  {
    slug: "henry_mancini",
    midis: [
      "Pink_Panther",
      "lujon---henry-mancini",
      "moon-river-for-flute---henry-mancini",
    ],
    composerBirthYear: 1924,
    genre: "Film Score, Jazz, Pop, Easy Listening",
    country: "USA",
  },
  {
    slug: "edward_macdowell",
    midis: [
      "to-a-humming-bird----edward-macdowell",
      "to-a-water-lily-from-woodland-sketches-op.-51---edward-macdowell",
      "in-autumn-from-woodland-sketches-op.-51---edward-macdowell",
      "clair-de-lune----edward-macdowell",
    ],
    composerBirthYear: 1860,
    country: "USA",
  },
  {
    slug: "stephen_schwartz",
    midis: [
      "defying-gravity-from-wicked---stephen-schwartz",
      "when-you-believe-film-version---stephen-schwartz",
    ],
    composerBirthYear: 1948,
    country: "USA",
  },
  {
    slug: "nino_rota",
    midis: [
      "Godfather",
      "romeo-and-juliet---nino-rota-a-time-for-us-flute-piano",
      "fellini-8-1-2-rota-8-1-2-fellini-rota---nino-rota-8-1-2-fellini-rota---rota-fellini-8-1-2",
    ],
    composerBirthYear: 1911,
    country: "Italy",
    genre: "Film Score",
  },
  {
    slug: "kristen_anderson_lopez_and_robert_lopez",
    midis: [
      "Let_It_Go_Disney_Frozen",
      "remember-me---kristen-anderson-lopez-robert-lopez-from-disney-pixar-s-coco-arr-for-solo-piano",
      "wandavision-from-wandavision-ep-2---kristen-anderson-lopez-robert-lopez",
      "a-newlywed-couple-from-wandavision-ep-1---kristen-anderson-lopez-robert-lopez",
    ],
    composerBirthYear: 1972,
    genre: "Animation Score",
    country: "USA",
  },
  {
    slug: "jingle_bells",
    midis: [
      "jingle-bells-boogie-woogie-cover",
      "jingle-bells-boogie",
      "jingle-bells---jazz-piano",
    ],
  },
  {
    slug: "marshmello",
    midis: [
      "marshmello-ft.-bastille---happier",
      "Alone_Marshmello",
      "marshmello-alone-sergio-moy-20201220161814-nonstop2k.com",
    ],
    composerBirthYear: 1992,
    genre: "Electronic",
    country: "USA",
  },
  {
    slug: "go_shiina",
    midis: [
      "kamado-tanjiro-no-uta-~-demon-slayer-ep-19-ed-ost-fonzi-m-improvised-hard-version",
      "code-vein---go-shiina",
    ],
    composerBirthYear: 1974,
    genre: "Video Game Music",
    country: "Japan",
  },
  {
    slug: "carlos_gardel",
    midis: [
      "tango-por-una-cabeza",
      "volver---carlos-gardel",
      "melodia-de-arrabal---carlos-gardel",
      "cuesta-abajo---carlos-gardel",
      "golondrinas---carlos-gardel",
      "rubias-de-new-york---carlos-gardel",
    ],
    composerBirthYear: 1890,
    country: "Argentina",
    genre: "Tango",
  },
  {
    slug: "the_script",
    midis: ["hall-of-fame", "the-script---superheroes"],
    composerBirthYear: 1980,
    genre: "Pop Rock",
    country: "Ireland",
  },
  {
    slug: "kyle_dixon_and_michael_stein",
    midis: [
      "stranger-things-theme",
      "kids---kyle-dixon-michael-stein-stranger-things---arranged-by-nana",
      "aftermath---kyle-dixon-and-michael-stein",
    ],
    composerBirthYear: 1983,
    country: "USA",
  },
  {
    slug: "dave_brubeck",
    midis: ["take-five", "Blue_Rondo_A_La_Turk"],
    composerBirthYear: 1920,
    country: "USA",
    genre: "Jazz",
  },
  {
    slug: "junichi_masuda",
    midis: [
      "pallet-town---pokemon-red-blue-green-yellow-by-junichi-masuda",
      "viridian-pewter-saffron-city---pokemon-rby---junichi-masuda",
      "pokemon-rse---route-101---junichi-masuda",
      "lavender-town-pokemon-r-b-y",
    ],
  },
  {
    slug: "brahms",
    midis: [
      "hungarian_dance_1_-c-yogore",
      "hungarian-dance-no.-1",
      "hungarian_dance_2_-c-yogore",
      "hungarian_dance_3_-c-yogore",
      "hungarian-dance-no-5-in-g-minor",
      "brahms_118_1",
      "brahms_op118_1",
      "waltz-in-a-major-op.39-no.15-by-johannes-brahms",
      "brahms---waltz-op.39-no.3",
      "waltz-in-d-minor-op.39-no.9---johannes-brahms",
    ],
  },
  {
    slug: "evgeny_grinko",
    midis: [
      "evgeny-grinko---valse",
      "carousel---evgeny-grinko",
      "it-s-foggy-today---evgeny-grinko---by-fatih-erol",
      "melting---evgeny-grinko",
      "wind-brought---evgeny-grinko",

      "jane-maryam---evgeny-grinko", // Iranian song
      "lullaby-for-erik---evgeny-grinko",
    ],
  },
  {
    slug: "amachas_music_studio",
    midis: [
      "old-doll-puppet---ib-mad-father-old-doll",
      "yu-nolian-ren-tati---gan-cha-noyin-le-gong-fang",
      "kagayakuquan-a-shining-spring",
      "still-in-memory-from-witch-s-heart",
      "jin-yao-noye-ni-on-friday-night",
    ],
  },
  {
    slug: "musescore_top200",
    midis: [
      "Godfather", // Nino Rota
      "Pink_Panther", // Henry Mancini
      "Let_It_Go_Disney_Frozen", // Kristen Anderson-Lopez & Robert Lopez
      "bts-bangtansonyeondan---i-need-u-suga-piano-full-solo", // BTS
      "rihanna-ft.-mikky-echo---stay", // Mikky Echo
      "kamado-tanjiro-no-uta-~-demon-slayer-ep-19-ed-ost-fonzi-m-improvised-hard-version", // Go Shiina
      "marshmello-ft.-bastille---happier", // Marshmello
      "linus-and-lucy-peanuts---vince-guaraldi", // Vince Guaraldi
      "tango-por-una-cabeza", // Carlos Gardel
      "chasing-kou---hidekazu-sakamoto-drowning-love---ni-rerunaihu-mule-bbajin-naipeu-ost", // Hidekazu Sakamoto

      "hall-of-fame", // The Script
      "olivia-rodrigo---drivers-license", // Olivia Rodrigo
      "stranger-things-theme", // Kyle Dixon & Michael Stein
      "forest-gump---main-title-feather-theme", // Alan Silvestri
      "senorita---shawn-mendes-camilla-cabello", // Shawn Mendes & Camila Cabello
      "i-see-the-light-from-disney-s-tangled", // Alan Menken
      "take-five", // Dave Brubeck
      "somewhere-only-we-know---keane", // Keane
      "glimpse-of-us", // Joji
      "lost-boy---ruth-b", // Ruth B

      "Misty_piano_solo", // Erroll Garner
      "Wellerman_Sea_Shanty", // New Zealand folk song
      "flower-dance-dj-okawari", // DJ Okawari
      "Jingle_Bell_Rock", // Joseph Carleton Beal and James Ross Boothe
      "the-night-we-met", // Lord Huron
      "Tetris_Theme", // Russian folk song
      "dearly-beloved-piano-collections-kingdom-hearts", // Yoko Shimomura
      "for-the-damaged-coda---blonde-redhead", // Blonde Redhead
      "unravel-acoustic-ver-tokyo-ghoul-theishter-sheet-music-full-sheets", // Toru Kitajima
      "stand-by-me", // Ben E. King

      "solo-violin-caprice-no.-24-in-a-minor---n.-paganini-op.-1-no.-24", // Niccolo Paganini
      "la-foule-edith-piaf-piano-chant", // Angel Cabral
      "Ophelia", // The Lumineers
      "turning-page---sleeping-at-last-piano-string-quartet", // Sleeping at Last
      "hungarian-dance-no-5-in-g-minor", // Johannes Brahms
      "take-me-to-church---hozier", // Andrew Hozier
      "it-s-been-so-long-fnaf-2-song", // The Living Tombstone
      "hollow-knight-main-theme---christopher-larkin", // Christopher Larkin
      "7-years---lukas-graham", // Lukas Graham
      "one-piece---bink-s-sake---kohei-tanaka", // Kohei Tanaka

      "Gershwin_Rhapsody_in_Blue_Piano_solo", // George Gershwin
      "idea-22---gibran-alcocer", // Gibran Alcocer
      "Hit_the_Road_Jack", // Percy Mayfield
      "lavender-town-pokemon-r-b-y", // Junichi Masuda
      "rachmaninoff-piano-concerto-no.-2-1st-mvmt.-arr.-for-2-pianos", // Rachmaninoff
      "the-weeknd---blinding-lights---advanced-cover-by-majorandminor", // The Weeknd
      "in-the-end---linkin-park", // Linkin Park
      "czardas-by-vittorio-monti", // Vittorio Monti
      "a-wanderer-s-song-zigeunerweisen-gypsy-airs-op.20", // Pablo de Sarasate
      "ave-maria-d839---schubert---solo-piano-arrg.", // Schubert

      "liebesleid-piano-solo---kreisler-rachmaninoff-alt-wiener-tanzweisen", // Fritz Kreisler
      "just-the-two-of-us", // Ralph MacDonald and William Salter
      "to-build-a-home-~-the-cinematic-orchestra", // The Cinematic Orchestra
      "great-balls-of-fire---jerry-lee-lewis", // Jerry Lee Lewis
      "westlife---beautiful-in-white", // Westlife
      "victory-piano-solo---two-steps-from-hell", // Thomas Bergersen
      "hikaru-nara-your-lie-in-april", // Goose House
      "seven-nation-army-arr.-nikodem-lorenz", // The White Stripes
      "peaches---the-super-mario-bros.-movie-piano-solo-arrangement", // Jack Black
      "alexander-rybak---fairytale", // Alexander Rybak

      "libertango", // Astor Piazzolla
      "old-doll-puppet---ib-mad-father-old-doll", // Amacha's Music Studio
      "amazing-grace-choir-saa---john-newton", // John Newton
      "2---onerepublic---counting-stars", // OneRepublic
      "genshin-impact-main-theme", // Yu-Peng Chen
      "slander-dylan-matthew---love-is-gone-acoustic", // Slander
      "national-anthem-of-the-ussr", // Alexander Alexandrov
      "in-the-hall-of-the-mountain-king-dovregubbens-hall", // Edvard Grieg
      "where-is-my-mind-solo-piano-by-pixies-maxence-cyrin", // Pixies
      "evgeny-grinko---valse", // Evgeny Grinko
      "barfuss-am-klavier---annenmaykantereit-69e4ae", // Annenmaykantereit

      "arcade---duncan-laurence", // Duncan Laurence
      "le-cygne-the-swan", // Saint-Saëns
      "can-you-hear-the-music---ludwig-goransson-from-oppenheimer", // Ludwig Göransson
      "all-star", // Smash Mouth
      "succession-main-theme", // Nicholas Britell
      "to-the-moon-for-river-johnny-s-version", // Kan Gao, Laura Shigihara
      "time-travel-theme-by-jay-chou-from-secret-2007-film", // Jay Chou
      "blue-bird", // Ikimono-gakari
      "baby-shark-song", // folk
      "My_War_Attack_on_Titan", // Shinsei Kamattechan
      "kass-theme--full-the-legend-of-zelda-breath-of-the-wild", // Manaka Kataoka

      "greensleeves-for-piano-easy-and-beautiful", // English folk song
      "fukashigi-no-carte", // Kawai Luigi or Hidehiro Kawai
      "from-the-start---laufey", // Laufey
      "goner", // Twenty One Pilots
      "titanium", // David Guetta feat. Sia
      "Avril_14_Aphex_Twin", // Aphex Twin
      "~beethoven-virus~", // Lee Pil-ho
      "mystery-of-love-call-me-by-your-name", // Sufjan Stevens
      "lose-yourself-by-eminem", // Eminem
      "a-cruel-angel-s-thesis---neon-genesis-evangelion", // Hidetoshi Sato

      "chasing-cars---snow-patrol", // Snow Patrol
      // SpongeBob SquarePants
      "Feliz_Navidad", // Jose Feliciano
      "richard-marx---right-here-waiting", // Richard Marx
      "Axel_F_Beverly_Hills_Cop_III", // Harold Faltermeyer

      // skipped tons of vocal works beyond this point

      "adagio-in-g-minor---for-solo-piano", // Remo Giazotto
      "can-can", // Jacques Offenbach
    ],
  },
  {
    slug: "gustav_holst",
    midis: [
      "Jupiter_-_arr._for_two_pianos_by_Gustav_Holst",
      "neptune-the-mystic---gustav-holst-piano-reduction",
      "the-planets-op.-32----ii.-venus-bringer-of-peace-for-piano",
    ],
    composerBirthYear: 1874,
    country: "United Kingdom",
  },
  {
    slug: "scarlatti",
    midis: [
      "sonata_k159_scarlatti",
      "scarlatti-sonata-aria-k.32",
      "sonata-in-e-major-k-380",
    ],
    composerBirthYear: 1685, // Domenico Scarlatti was born in 1685
    genre: "Classical", // Classical composer
    style: "Baroque", // Baroque period composer
    country: "Italy", // Born in Naples, Italy
  },

  {
    slug: "bruckner",
    midis: [
      "bruckner_7_1",
      "bruckner_7_2",
      "bruckner_8",
      "bruckner_8_a_j",
      "bruckner_symphony_4_1",
    ],
  },

  {
    slug: "irving_aaronson",
    midis: ["jazz-classique-1919"],
    genre: "Fox Trot",
    composerBirthYear: 1895,
    country: "USA",
  },

  {
    slug: "niki_reiser",
    midis: [
      "nordsee---niki-reiser-punktchen-und-anton",
      "das-fliegende-klassenzimmer---overture",
    ],
    composerBirthYear: 1958,
    country: "Switzerland",
  },
  {
    slug: "jonathan_coulton",
    midis: ["portal_still_alive", "re-your-brains-jonathan-coulton"],
    composerBirthYear: 1970,
    genre: "Folk Rock, Indie Rock, Comedy Rock",
  },
  {
    slug: "haydn",
    midis: [
      "haydn_piano_sonata_c_major_xvi_7_1",
      "haydn_piano_sonata_c_major_xvi_7_2",
      "haydn_piano_sonata_c_major_xvi_7_3",
      "sonata_in_e_minor_hob_xvi_34_joseph_haydn_piano_sonata_hob_xvi_34_2_adagio",
      "string_quartet_in_g_major_hob_iii_75_op_76_no_1_joseph_haydn",
      "haydn_100_1",
      "1.-andante-grazioso-b-major-hob.xvii-anh---joseph-haydn",
      "2.-allegro-f-major-hob.xvii-anh---joseph-haydn",
    ],
    composerBirthYear: 1732,
    style: "Classical",
    country: "Austria",
  },
  {
    slug: "michel_legrand",
    midis: [
      "i-will-wait-for-you---michel-legrand",
      "the-windmills-of-your-mind---michel-legrand",
      "concerto-les-demoiselles-de-rochefort",
      "the-summer-knows---michel-legrand",
    ],
  },
  {
    slug: "sebastian_yradier",
    midis: [
      "la-paloma-cancion-americana-sebastian-yradier-vers-1863",
      "maria-dolores-1860-tango-du-maestro-sebastian-yradier",
      "el-chin-chin-chan-cancion-habanera-de-sebastian-yradier",
      "una-declaracion.-a-quema-ropa-....de-sebastian-yradier",
      "el-arreglito---sebastian-yradier",
    ],
  },
  {
    slug: "manuel_saumell",
    midis: [
      "los-ojos-de-pepa-manuel-saumell-contradanza",
      "el-panuelo-de-pepa-de-manuel-saumell",
      "la-linda-contradanza-manuel-saumell",
      "la-veleta-contradanza-by-manuel-saumell",
      "saludo-a-cuba-contradanza-saumell",
      "ayes-del-alma-contradanza-de-manuel-saumell",
      "el-bazar-contradanza-saumell-robredo-manuel",
      "pero-por-que-contradanza-de-manuel-saumell",
      "dice-que-no-contradanza-saumell",
    ],
    country: "Cuba",
    composerBirthYear: 1818,
    genre: "Contradanza",
  },
  {
    slug: "goran_bregovic",
    midis: [
      "bubamara",
      "underground-cocek",
      "underground-tango---goran-bregovic-string-quartet",
      "kalasnjikov",
    ],
  },
  { slug: "exercises", midis: ["average_rag_1", "average_rag_2"] },
  {
    slug: "examples",
    midis: [
      "the_seven_diatonic_natural_minor_chords_in_a_minor",
      "thirty_five_smallest_non_diatonic_chords_in_c_or_b",
      "ii-v-i-jazz-voicings",
      "ii-v-i-warmup",
      "the-blues-scale-in-all-12-keys",
    ],
  },
  {
    slug: "linkin_park",
    midis: ["Numb_-_Linkin_Park", "in-the-end---linkin-park"],
  },
  {
    slug: "thefatrat",
    midis: [
      "TheFatRat_Monody",
      "TheFatRat_Unity",
      "jackpot-thefatrat",
      "thefatrat---close-to-the-sun",
    ],
  },
  {
    slug: "francis_lai",
    midis: ["Love_Store_Francis_Lai", "un-homme-et-une-femme---francis-lai"],
  },
  {
    slug: "luiz_bonfa",
    midis: [
      "la-chanson-d-orphee-manha-do-carnaval---luis-bonfa",
      "l2004_03---la-chanson-d-orphee",
    ],
  },
  {
    slug: "joep_beving",
    midis: ["ala---joep-beving", "sleeping-lotus---joep-beving"],
    composerBirthYear: 1976,
    country: "Netherlands",
    genre: "Contemporary Classical",
  },
  {
    slug: "unsorted",
    midis: [
      "Alice_DJ_Better_Off_Alone",

      "Anders_Thue_Sonne",

      "Avicii_Wake_me_up",

      "Billie_s_Bounce_Billies_Bounce",

      "Blues_for_Alice",
      "Blues_in_the_Closet_Lead_sheet_",

      "Chris_Isaak_Wicked_Game",

      "Close_to_the_edge",
      "Coffin_dance",

      "Dream_a_little_dream_of_me",

      "Flight_Facilities_Crave_You",
      "Flight_Facilities_Crave_You_2",

      "Good_Bye_Hachiko",

      "How_long_blues",

      "Johnny_Cash_Hurt",

      "Jolene",
      "20th-century-fox-fanfare-piano-arr.",
      "rush-e-but-it-s-as-difficult-as-humanly-possible",

      "Krylya_Nautilus_duo",
      "Kyle_Landrys_Tetris_Theme_Variations_for_Piano_SoloKorobeiniki",
      "Lady_Gaga_Always_remember_us_this_way",

      "Liana_Flores_Rises_the_Moon",

      "Morphine_Cure_for_Pain",

      "Prlude_to_Act_1_of_Carmen_-_Piano_Solo_-_Bizet",

      "Sandu",

      "Sorcerers_doll___-_The_King_and_the_Jester___",

      "Super_Mario_Bros_Peaches",
      "Sviridov_Snowstorm_Waltz",
      "Sviridov_Time_Foward",
      "Sviridov_Time_Foward.1",
      "Sweet_Dreams",
      "Sweet_home_Chicago",

      "The_Prince_of_Silence____Nautilus_Pompilius",
      "The_Strokes_Reptilia",
      "The_Strokes_Reptilia_2",
      "The_Strokes_Reptilia_3",
      "The_Weeknd_Blinding_Lights",
      "Titanic",
      "To_be_over",

      "Vangelis_Chariots_of_fire",

      "Walking_On_a_dream",

      "alexey_bychkov_s_trio_goby_waltz",
      "all-major-scales-arpeggios",
      "all_of_the_girls_you_loved_before_taylor_swift",
      "alto_sax_natural_minor_scales_and_arpeggios",
      "as_it_was_harry_styles",

      "cheek_to_cheek",

      "classical_music_mashup",
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

      "god_only_knows_bioshock_infinite_2013",
      "gotye_feat_kimbra_somebody_that_i_used_to_know",
      "hanna-montana---poshlaya-molli-hannamontana---poshlaya-molli",
      "hannamontana---poshlaya-molli-agga",

      // "he_s_a_pirate_easy_piano",
      // "he_s_a_pirate_from_pirates_of_the_caribbean",
      // "he_s_a_pirate_hans_zimmer_klaus_badelt",
      // "he_s_a_pirate_hard_version",
      // "he_s_a_pirate_klaus_badelt_pirates_of_the_caribbean_ost_rock_version",
      // "he_s_a_pirate_ost_kalimba_cover",
      "hojnacki_1",

      "idotdotdot---yiruma",

      "kars_1_tigran_hamasyan",

      "kimigayo_national_anthem_of_japan",
      "korobeiniki-tetris",
      "kukla_kolduna",
      "mahler_4_3",
      "major_diatonic_chords",

      "malenkiy-princ",

      "mesecina",
      "mihail-krug-vladimirskiy-central",

      "motion-sickness---phoebe-bridgers",

      "mpaintoyska",
      "my_wild_irish_rose",
      "never_gunna_give_you_up_barbershop",
      "now_voyager_suite_max_steiner",
      "opa-cupa",

      "piano_tutorial",
      // "pirate_melody_16measures_chromatic",
      // "pirate_melody_16measures_scales",
      // "pirate_melody_16measures_transpositions",
      // "pirate_melody_16measures_whole_tone",
      // "pirates_5ch",
      // "pirates_of_the_caribbean_easy_piano",
      // "pirates_of_the_caribbean_easy_piano_capa",
      // "pirates_of_the_caribbean_for_alto_saxophone",
      // "pirates_of_the_caribbean_hans_zimmer_virtuosic_piano_solo_movement_3",
      // "pirates_of_the_caribbean_he_s_a_pirate_hard_version",
      // "pirates_of_the_caribbean_main_theme",
      // "pirates_of_the_carribean_beginner",
      // "pirati_dei_caraibi_per_trio_di_flauti_pirates_of_the_carribean_for_flute_trio",
      "pizzicati-from-sylvia-act-iii-no.-20---leo-delibes---1876",
      "pornofilmy-prosti_proshyay_privet",
      "pornofilmy-prosti_proshyay_privet.1",
      "pornofilmy-prosti_proshyay_privet.2",
      "pornofilmy-ya_tak_soskuchilsya",
      "pornofilmy-ya_tak_soskuchilsya.1",
      "pornofilmy-ya_tak_soskuchilsya.2",

      "prelude_in_c_major_bach_piano_solo",

      "pyos",

      "sadness-and-sorrow",

      "sasha_2",
      "scott-joplin-s-new-rag---revised-edition---c1914----piano-tutorial",

      "skyrim-theme-for-piano",

      "sonatina-in-c-major---dennis-alexander",

      "sorcerer_s_puppet_the_king_and_the_jester",
      "steve-reich---piano-phase",

      "string_quartet_no_8_in_e_minor_opus_59_rasumovsky_no_2",

      "symphony_8_1",
      "symphony_no_1_k_16_2nd_movement",

      "the-four-chord-song---axis-of-awesome",

      "the-washington-post-piano-john-philip-sousa",

      "the_lamp_is_low",

      "this_charming_man_the_smiths_piano_vocal_guitar",
      "tipichnaya_vecherinka_s_basseynom",
      "tomorrow---giovanni-allevi",

      "white_christmas",
      "wonder-wave-by-david-lanz",
      "something-human---muse",
      "priboi",

      "maromis-theme---smoke",

      "zappaguri",

      "genesis-that-s-all-piano",
      "home---edward-sharpe-and-the-magnetic-zeros-home---edward-sharpe",
    ],
  },
];
