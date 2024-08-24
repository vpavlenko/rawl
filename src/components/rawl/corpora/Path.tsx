// only solo pianos for now

// colorful analysis of Western harmony

const path: {
  topic: string;
  midis: string[];
}[] = [
  { topic: "I V major", midis: [] },
  {
    topic: "I ii V7 major",
    midis: [
      "soiree-polka---stephen-c.-foster---1850",
      "mickey-mouse---manfred-schmitz",
      "jurassic-park-theme---john-williams-jurrasic-park-theme---john-williams",
    ],
  },
  { topic: "I IV V major", midis: [] },
  {
    topic: "I vi IV V7 major",
    midis: [
      "tf2---mannrobics---piano", // pure, simple, power chords, no 7^
      "awakening---vicenzo-piano", // iii
      "old-black-joe-by-stephen-foster",
      "winter---lucia-salieri-vicenzo-piano",
      "letter-to-my-mother---vicenzo-piano", // ii
      "cara-mia-addio---full-piano-cover", // bass 8-7-6
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

  { topic: "parallel symmetry", midis: [] },

  {
    topic: "parallel modulation",
    midis: [
      "pisnya-kota-bazilio-ta-lisici-alisi---o.-ribnikov",
      "volshebnik-nedouchka---aleksandr-zacepin",
      "souvenirs-d-andalousie-1855",
    ],
  },
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
      "heroes-of-might-and-magic-iii----waiting-theme", // two chords
      "farewell---vicenzo-piano", // very simple, just V7 and vi
      "misfortune-teller---valve-studio-orchestra-.", // mm. 1-36
      "you-are-not-part-of-the-control-group", // simple
    ],
  },

  {
    topic: "diatonic circle of fifths",
    midis: ["am-abend---manfred-schmitz"],
  },

  {
    topic: "V7 minor",
    midis: [
      "the-golden-waltz---vicenzo-piano",
      "the-midnight-waltz---vicenzo-piano",
      "interstellar---vicenzo-piano",
      "introspection---vicenzo-piano",
      "brawl-stars---lose-theme", // phrygian cadence
      "brawl-stars-ost---battle-8",
      "counter-strike-2---main-menu-theme---mike-morasky-counter-strike-2---main-menu-theme-for-solo-piano", // simple, VII
      "rocket-jump-waltz-piano-solo", // iv, vi, blues scale
      "soldier-of-dance", // simple, functional, iio, melodic minor, complex RH with thirds and chords
      "team-fortress---upgrade-station-piano---mike-morasky", // track driver V7 at the end
      "thirty-seven-after-six", // V-i ambiguous
    ],
  },
  {
    topic: "minor with chromatic bass",
    midis: [
      "half-life-alyx---ending-triumph",
      "overcooked---menu-theme", // idiosyncratic chords
      "zimniy-vecher-winter-evening---manfred-shmitc-manfred-schmitz",
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
    topic: "rapid modulations",
    midis: ["tema-mriy---oleksiy-ribnikov-dream-theme-alexey-rybnikov"],
  },

  {
    topic: "Vsus4",
    midis: [
      "andrea---manfred-schmitz",
      "theme-from-schindler-s-list---piano-solo",
      "heroes-of-might-and-magic-vi-unknown-title",
      "brawl-stars-metropolis-theme",
    ],
  },

  { topic: "Vsus4 unresolved", midis: ["volki-gonyat-olenya---a.-zacepin"] },

  {
    topic: "V7/iv",
    midis: [
      "pisnya-kota-bazilio-ta-lisici-alisi---o.-ribnikov",
      "island-of-misfortune-ostrov-nevezeniya---o.-zacepin",
      "no.2-remembering-her---esther-abrami", // viio->Cad64, can be explained as chromatic bass
    ],
  },

  {
    topic: "relative symmetry",
    midis: [
      "no.1-a-minor-waltz---esther-abrami-no-1-a-minor-waltz",
      "manfred-schmitz---kleine-pop-romanze-short-pop-romance", // ii, Vsus4, V/V,  V-IV
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

  {
    topic: "V7/V",
    midis: [
      "stephen-foster---hard-times-come-again-no-more",
      "misyachna-pisnya---o.-ribnikov",
      "pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki---gennadiy-gladkov-pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki-g.-gladkov", // with relative minor
      "brawl-stars-metropolis-theme",
    ],
  },

  {
    topic: "circle of fifhts with V7/V",
    midis: [
      "hudozhniki---a.-zacepin",
      "proshchay---a.-zacepin",
      "lunnaya-serenada---a.-zacepin", // autumn leaves
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
      "beautiful-dreamer---stephen-foster", // ii6
      "pesnjakrasnoishapochki",
      "day-off---vicenzo-piano",
    ],
  },
  {
    topic: "V7/ii",
    midis: [
      "a-dream-i-had---vicenzo-piano",
      "no.9-esther-s-waltz---esther-abrami", // Cad64, relative
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
  { topic: "Fr", midis: ["theme-from-schindler-s-list---piano-solo"] },
  {
    topic: "applied circle of fifths",
    midis: ["hungarian-dance-no-5-in-g-minor"],
  },
  {
    topic: "functional diminished chords",
    midis: ["elegie---manfred-schmitz"],
  },

  {
    topic: "iiø7 in major",
    midis: ["valse---coppelia---piano-solo---arr.-leo-delibes"],
  },
  {
    topic: "chain_of_dominants",
    midis: ["pesnya-genialnogo-syshchika---gennadiy-gladkov"],
  },
  {
    topic: "rich ragtime major",
    midis: ["ataturk-marsi---ahmed-adnan-saygun", "the-dying-swan-1870"],
  },

  {
    topic: "o7 break",
    midis: ["your-precious-moon---mike-morasky-wheatley-boss-fight-ending"],
  },
  {
    topic: "augmented tonic",
    midis: [
      "music-of-the-spheres",
      "heroes-of-might-magic-iii---fortress-town-theme",
    ],
  },
  {
    topic: "parallel chords mix",
    midis: ["heroes-of-might-magic-iii---castle-town-theme"],
  },

  { topic: "iadd6", midis: ["pesenka-o-medvedyah---a.-zacepin"] },
  {
    topic: "bII",
    midis: ["haven-theme-piano-form-heroes-of-might-and-magic-v"],
  },

  { topic: "III in major", midis: ["pesnjakrasnoishapochki"] },

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
    midis: ["brawl-stars---menu-theme", "brawl-stars---footbrawl-theme"],
  },
  {
    topic: "stack of perfect fifths",
    midis: ["kocaman-bebek---ahmed-adnan-saygun"],
  },
  {
    topic: "blues scale",
    midis: [
      "team-fortress-2-main-theme---mike-morasky-team-fortress-2-piano-solo", // pure
      "brawl-stars-metropolis-theme",
      "rocket-jump-waltz-piano-solo",
    ],
  },

  {
    topic: "mario cadence",
    midis: ["Super_Mario_Bros_Main_Theme", "brawl-stars---footbrawl-theme"],
  },
  {
    topic: "VIIaug",
    midis: ["haven-theme-piano-form-heroes-of-might-and-magic-v"],
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
    midis: [
      "academy-order-theme---heroes-and-might-and-magic-iv", // IV
    ],
  },

  {
    topic: "double tonic relative",
    midis: ["dirt-theme-hope---heroes-of-might-and-magic-iv---celtic-harp"],
  },

  {
    topic: "alterated dominants",
    midis: [
      "s-lyubovyu-vstretitsya---a.-zacepin", // V7b9/IV
      "prosnis-i-poy---gennadiy-gladkov", // Iadd6, chain of dominants, V7b9, V9
      "proshchay---a.-zacepin",
      "lunnaya-serenada---a.-zacepin", // #9
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
    topic: "diationic sevenths chords",
    midis: ["volki-gonyat-olenya---a.-zacepin", "proshchay---a.-zacepin"],
  },

  {
    topic: "constant structures",
    midis: [
      "am-abend---manfred-schmitz", // Iadd9
      "barkarole---manfred-schmitz",
      "e.t.-end-credits-piano-solo",
      "volki-gonyat-olenya---a.-zacepin",
      "brawl-stars---win-theme-piano",
    ],
  },

  {
    topic: "idiosyncratic",
    midis: [
      "e.t.-theme---ywcm",
      "ruya---ahmed-adnan-saygun",
      "horon-for-bb-clarinet-and-piano---ahmed-adnan-saygun",
    ],
  },

  {
    topic: "symmetric chromatic",
    midis: [
      "le-carnaval-des-animaux---aquarium",
      "grande-tarantelle---gottschalk-1872",
    ],
  },

  { topic: "chromatic stacks", midis: ["proshchay---a.-zacepin"] },

  {
    topic: "complex chromatic/modulatory vgm",
    midis: [
      "misfortune-teller---valve-studio-orchestra-.", // IV7 vibes, simple
      "team-fortress---rise-of-the-living-bread---mike-morasky",
      "harry-potter-ii-game-main-menu---jeremy-soule",
    ],
  },

  {
    topic: "mixolydian",
    midis: ["happy-hogwarts-from-harry-potter-and-the-philosopher-s-stone"],
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

  { topic: "vgm non-functional diatonic", midis: ["Sweden_Minecraft"] },

  {
    topic: "episodic IV",
    midis: [
      "andrea---manfred-schmitz",
      "heroes-of-might-and-magic-vi-unknown-title",
      "s-lyubovyu-vstretitsya---a.-zacepin",
    ],
  },

  { topic: "picardy third", midis: ["you-are-not-part-of-the-control-group"] },

  {
    topic: "sentence",
    midis: [
      "misyachna-pisnya---o.-ribnikov",
      "theme-from-schindler-s-list---piano-solo", // 2x + 2x
    ],
  },

  { topic: "locrian", midis: ["guild-wars-2-trailer---jeremy-soule"] },
];

// foster processed until soiree polka
// gladkov till prosnis-i-poy
// schmitz till andrea
// popular classics till hungarian dance 5
// john williams till ywcm
// rybnikov till tema mriy
// gottschalk till andalousie
