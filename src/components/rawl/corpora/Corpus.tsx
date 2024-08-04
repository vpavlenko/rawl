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
    slug: "bill_evans",
    midis: ["bill-evans-on-autunm-leaves-from-the-album-portrait-in-jazz"],
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
    // https://musescore.com/user/68853055
    slug: "greek_music",
    midis: [
      "m.-theodorakis---ena-to-helidoni---greek-music-001",
      "g.-katsaros---kathe-limani-kai-kaimos---greek-music-002",
      "m.-loizos---o-dromos---greek-music-003",
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
    ],
  },
  {
    // https://musescore.com/user/24069/sets/4869434
    slug: "rachmaninoff",
    midis: ["rachmaninoff-piano-concerto-no.-2-1st-mvmt.-arr.-for-2-pianos"],
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
    slug: "john_philip_sousa",
    midis: ["the-liberty-bell-march---john-philip-sousa---1893", ""],
  },
  {
    slug: "white_star_line_1912",
    // https://musescore.com/user/64608175/sets/7661602
    midis: [
      "the-quaker-girl-valse---lionel-monckton-carl-kiefert-1910", // iiø-V->V7/V
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
