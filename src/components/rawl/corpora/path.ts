// only solo pianos for now

// colorful analysis of Western harmony

const path: {
  chapter: string;
  topics: {
    topic: string;
    midis: string[];
  }[];
}[] = [
  {
    chapter: "Major",
    topics: [
      {
        topic: "I ii V7 major",
        midis: [
          "soiree-polka---stephen-c.-foster---1850",
          "mickey-mouse---manfred-schmitz",
          "jurassic-park-theme---john-williams-jurrasic-park-theme---john-williams",
        ],
      },
      {
        topic: "I vi IV V7 major",
        midis: [
          "tf2---mannrobics---piano",
          "awakening---vicenzo-piano",
          "old-black-joe-by-stephen-foster",
          "winter---lucia-salieri-vicenzo-piano",
          "letter-to-my-mother---vicenzo-piano",
          "cara-mia-addio---full-piano-cover",
        ],
      },
      {
        topic: "major with iii",
        midis: ["somewhere-in-my-memory-by-john-williams"],
      },
      {
        topic: "iv in major",
        midis: ["heroes-of-might-and-magic-iii---main-menu-theme"],
      },
    ],
  },
  {
    chapter: "V7 Minor",
    topics: [
      {
        topic: "simple harmonic minor",
        midis: [
          "your-precious-moon---mike-morasky-wheatley-boss-fight-ending",
          "heroes-of-might-magic-iii---tower-town-theme",
        ],
      },
      {
        topic: "V minor",
        midis: [
          "heroes-of-might-and-magic-iii----waiting-theme",
          "farewell---vicenzo-piano",
          "misfortune-teller---valve-studio-orchestra-.",
          "you-are-not-part-of-the-control-group",
        ],
      },
      {
        topic: "V7 minor",
        midis: [
          "the-golden-waltz---vicenzo-piano",
          "the-midnight-waltz---vicenzo-piano",
          "interstellar---vicenzo-piano",
          "introspection---vicenzo-piano",
          "brawl-stars---lose-theme",
          "brawl-stars-ost---battle-8",
          "counter-strike-2---main-menu-theme---mike-morasky-counter-strike-2---main-menu-theme-for-solo-piano",
          "rocket-jump-waltz-piano-solo",
          "soldier-of-dance",
          "team-fortress---upgrade-station-piano---mike-morasky",
          "thirty-seven-after-six",
        ],
      },
      {
        topic: "V7 minor with bIII",
        midis: [
          "duet-princessy-i-korolya---gennadiy-gladkov-duet-princessy-i-korolya",
          "andrea---manfred-schmitz",
          "theme-from-schindler-s-list---piano-solo",
          "ya-tebya-nikogda-ne-zabudu---o.-ribnikov",
          "main---alexey-rybnikov-golovna-tema---oleksiy-ribnikov",
          "belyy-shipovnik---o.-ribnikov",
        ],
      },
      {
        topic: "diatonic circle of fifths",
        midis: ["am-abend---manfred-schmitz"],
      },
      {
        topic: "minor with chromatic bass",
        midis: [
          "half-life-alyx---ending-triumph",
          "overcooked---menu-theme",
          "zimniy-vecher-winter-evening---manfred-shmitc-manfred-schmitz",
        ],
      },
      {
        topic: "Vsus4",
        midis: [
          "andrea---manfred-schmitz",
          "theme-from-schindler-s-list---piano-solo",
          "heroes-of-might-and-magic-vi-unknown-title",
          "brawl-stars-metropolis-theme",
          "cyril-scott-summerland-playtime-op.-54-no.1",
        ],
      },
      {
        topic: "Vsus4 unresolved",
        midis: ["volki-gonyat-olenya---a.-zacepin"],
      },
    ],
  },
  {
    chapter: "Modulations",
    topics: [
      {
        topic: "parallel modulation",
        midis: [
          "pisnya-kota-bazilio-ta-lisici-alisi---o.-ribnikov",
          "volshebnik-nedouchka---aleksandr-zacepin",
          "souvenirs-d-andalousie-1855",
        ],
      },
      {
        topic: "rapid modulations",
        midis: ["tema-mriy---oleksiy-ribnikov-dream-theme-alexey-rybnikov"],
      },
      {
        topic: "relative symmetry",
        midis: [
          "no.1-a-minor-waltz---esther-abrami-no-1-a-minor-waltz",
          "manfred-schmitz---kleine-pop-romanze-short-pop-romance",
        ],
      },
      {
        topic: "smooth modulation",
        midis: ["main---alexey-rybnikov-golovna-tema---oleksiy-ribnikov"],
      },
      {
        topic: "functional modulations",
        midis: ["meeting-a.-rybnikov---zustrich-o.-ribnikov"],
      },
    ],
  },
  {
    chapter: "Applied Chords",
    topics: [
      {
        topic: "V7/iv",
        midis: [
          "pisnya-kota-bazilio-ta-lisici-alisi---o.-ribnikov",
          "island-of-misfortune-ostrov-nevezeniya---o.-zacepin",
          "no.2-remembering-her---esther-abrami",
        ],
      },
      {
        topic: "V7/V",
        midis: [
          "stephen-foster---hard-times-come-again-no-more",
          "misyachna-pisnya---o.-ribnikov",
          "pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki---gennadiy-gladkov-pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki-g.-gladkov",
          "brawl-stars-metropolis-theme",
        ],
      },
      {
        topic: "circle of fifhts with V7/V",
        midis: [
          "hudozhniki---a.-zacepin",
          "proshchay---a.-zacepin",
          "lunnaya-serenada---a.-zacepin",
          "volshebnik-nedouchka---aleksandr-zacepin",
        ],
      },
      {
        topic: "II passing in major",
        midis: ["poslednyaya-poema-the-last-poem---aleksey-rybnikov"],
      },
      {
        topic: "V7/vi",
        midis: [
          "jeanie-with-the-light-brown-hair---stephen-foster",
          "beautiful-dreamer---stephen-foster",
          "pesnjakrasnoishapochki",
          "day-off---vicenzo-piano",
        ],
      },
      {
        topic: "V7/ii",
        midis: [
          "a-dream-i-had---vicenzo-piano",
          "no.9-esther-s-waltz---esther-abrami",
        ],
      },
      {
        topic: "ii_V7/iv",
        midis: [
          "pesenka-o-medvedyah---a.-zacepin",
          "hudozhniki---a.-zacepin",
          "tango-do-k-f-12-stulev---o.-zacepin",
        ],
      },
      {
        topic: "applied circle of fifths",
        midis: ["hungarian-dance-no-5-in-g-minor"],
      },
    ],
  },
  {
    chapter: "Other Chromatic Chords",
    topics: [
      {
        topic: "bII",
        midis: ["haven-theme-piano-form-heroes-of-might-and-magic-v"],
      },
      {
        topic: "III in major",
        midis: ["pesnjakrasnoishapochki"],
      },
      {
        topic: "functional diminished chords",
        midis: ["elegie---manfred-schmitz"],
      },
      {
        topic: "Fr",
        midis: ["theme-from-schindler-s-list---piano-solo"],
      },
      {
        topic: "iiø7 in major",
        midis: ["valse---coppelia---piano-solo---arr.-leo-delibes"],
      },
    ],
  },
  {
    chapter: "American & Jazz Harmony",
    topics: [
      {
        topic: "chain_of_dominants",
        midis: ["pesnya-genialnogo-syshchika---gennadiy-gladkov"],
      },
      {
        topic: "rich ragtime major",
        midis: [
          "ataturk-marsi---ahmed-adnan-saygun",
          "the-dying-swan-1870",
          "cyril-scott-summerland-playtime-op.-54-no.1",
        ],
      },

      {
        topic: "alterated dominants",
        midis: [
          "s-lyubovyu-vstretitsya---a.-zacepin",
          "prosnis-i-poy---gennadiy-gladkov",
          "proshchay---a.-zacepin",
          "lunnaya-serenada---a.-zacepin",
        ],
      },
      {
        topic: "bII with alterations",
        midis: [
          "kak-zhe-mne-teper-tebya-lyubit---a.-zacepin",
          "Super_Mario_Bros_Main_Theme",
        ],
      },
      {
        topic: "diatonic sevenths chords",
        midis: ["volki-gonyat-olenya---a.-zacepin", "proshchay---a.-zacepin"],
      },
      {
        topic: "iadd6",
        midis: ["pesenka-o-medvedyah---a.-zacepin"],
      },
    ],
  },
  {
    chapter: "Modern Diatonic / Modal Interchange",
    topics: [
      {
        topic: "parallel chords mix",
        midis: ["heroes-of-might-magic-iii---castle-town-theme"],
      },
      {
        topic: "minimalism",
        midis: [
          "you-are-not-part-of-the-control-group",
          "glassworks-opening-1---philip-glass-opening-1---philip-glass",
        ],
      },
      {
        topic: "major pentatonic",
        midis: [
          "afacan-kedi---ahmed-adnan-saygun",
          "etude-op.-10-no.-5-black-keys-pentatonic-arrangement",
          "han-gong-chun-li-chun-ri---song-yu-ning",
        ],
      },
      {
        topic: "minor pentatonic",
        midis: [
          "brawl-stars---menu-theme",
          "brawl-stars---footbrawl-theme",
          "lotus-land",
        ],
      },
      {
        topic: "stack of perfect fifths",
        midis: ["kocaman-bebek---ahmed-adnan-saygun"],
      },
      {
        topic: "blues scale",
        midis: [
          "team-fortress-2-main-theme---mike-morasky-team-fortress-2-piano-solo",
          "brawl-stars-metropolis-theme",
          "rocket-jump-waltz-piano-solo",
        ],
      },

      {
        topic: "mario cadence",
        midis: ["Super_Mario_Bros_Main_Theme", "brawl-stars---win-theme-piano"],
      },
      {
        topic: "simple natural minor",
        midis: [
          "guild-wars-factions-theme",
          "inci---ahmed-adnan-saygun",
          "ayse-m",
          "ninni---ahmed-adnan-saygun",
        ],
      },
      {
        topic: "simple epic natural minor with episodic IV",
        midis: [
          "call-of-magic-nerevar-rising---the-elder-scrolls-morrowind-jeremy-soule",
          "dragonborn---skyrim-theme-song-piano-solo",
          "secunda-the-elder-scrolls-v-skyrim",
          "fear-not-this-night-guild-wars-2-piano-version",
          "ashford-abbey---jeremy-soule-guild-wars",
          "overture-from-guild-wars-2",
          "heroes-of-might-and-magic-2--sorceress-town---paul-anthony-romero",
          "brawl-stars---draw-theme",
          "brawl-stars-ost---battle-8",
        ],
      },
      {
        topic: "mixed minor",
        midis: ["academy-order-theme---heroes-and-might-and-magic-iv"],
      },
      {
        topic: "double tonic relative",
        midis: ["dirt-theme-hope---heroes-of-might-and-magic-iv---celtic-harp"],
      },

      {
        topic: "mixolydian",
        midis: ["happy-hogwarts-from-harry-potter-and-the-philosopher-s-stone"],
      },
      {
        topic: "vgm non-functional diatonic",
        midis: ["Sweden_Minecraft"],
      },
      {
        topic: "episodic IV",
        midis: [
          "andrea---manfred-schmitz",
          "heroes-of-might-magic-vi-unknown-title",
          "s-lyubovyu-vstretitsya---a.-zacepin",
        ],
      },
      {
        topic: "picardy third",
        midis: ["you-are-not-part-of-the-control-group"],
      },
    ],
  },

  {
    chapter: "Modern Chromatic Harmony",
    topics: [
      {
        topic: "augmented",
        midis: [
          "music-of-the-spheres",
          "heroes-of-might-magic-iii---fortress-town-theme",
        ],
      },
      {
        topic: "diminished",
        midis: ["your-precious-moon---mike-morasky-wheatley-boss-fight-ending"],
      },
      {
        topic: "whole-tone",
        midis: ["lotus-land"],
      },
      {
        topic: "constant structures",
        midis: [
          "am-abend---manfred-schmitz",
          "barkarole---manfred-schmitz",
          "e.t.-end-credits-piano-solo",
          "volki-gonyat-olenya---a.-zacepin",
          "brawl-stars---win-theme-piano",
          "lotus-land",
        ],
      },
      {
        topic: "symmetric chromatic",
        midis: [
          "le-carnaval-des-animaux---aquarium",
          "grande-tarantelle---gottschalk-1872",
        ],
      },
      {
        topic: "chromatic stacks",
        midis: ["proshchay---a.-zacepin"],
      },
      {
        topic: "yellow black",
        midis: ["heroes-of-might-and-magic-3---necropolis-town-theme"],
      },
      {
        topic: "bvi in minor",
        midis: [
          "inferno-theme-by-paul-romero-from-heroes-of-might-and-magic-3",
          "guild-wars-2-trailer---jeremy-soule",
        ],
      },
      {
        topic: "locrian",
        midis: ["guild-wars-2-trailer---jeremy-soule"],
      },
      {
        topic: "V+",
        midis: ["haven-theme-piano-form-heroes-of-might-and-magic-v"],
      },
      {
        topic: "idiosyncratic",
        midis: [
          "e.t.-theme---ywcm",
          "ruya---ahmed-adnan-saygun",
          "horon-for-bb-clarinet-and-piano---ahmed-adnan-saygun",
          "lotus-land",
        ],
      },
      {
        topic: "complex chromatic/modulatory vgm",
        midis: [
          "misfortune-teller---valve-studio-orchestra-.",
          "team-fortress---rise-of-the-living-bread---mike-morasky",
          "harry-potter-ii-game-main-menu---jeremy-soule",
        ],
      },
    ],
  },
  {
    chapter: "Form",
    topics: [
      {
        topic: "sentence",
        midis: [
          "misyachna-pisnya---o.-ribnikov",
          "theme-from-schindler-s-list---piano-solo",
        ],
      },
    ],
  },
];

// foster processed until soiree polka
// gladkov till prosnis-i-poy
// schmitz till andrea
// popular classics till hungarian dance 5
// john williams till ywcm
// rybnikov till tema mriy
// gottschalk till andalousie

export default path;
