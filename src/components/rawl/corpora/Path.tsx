// only solo pianos for now

// colorful analysis of Western harmony

const path: {
  topic: string;
  midis: string[];
}[] = [
  { topic: "five notes", midis: [] },
  { topic: "chromatic harmony", midis: [] },
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
      "old-black-joe-by-stephen-foster",
      "tf2---mannrobics---piano", // pure, simple, power chords, no 7^
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
    topic: "simple harmonic minor",
    midis: ["your-precious-moon---mike-morasky-wheatley-boss-fight-ending"],
  },

  {
    topic: "V minor",
    midis: [
      "heroes-of-might-and-magic-iii----waiting-theme", // two chords
      "misfortune-teller---valve-studio-orchestra-.", // mm. 1-36
      "you-are-not-part-of-the-control-group", // simple
    ],
  },

  { topic: "diatonic circle of fifths", midis: ["am-abend---manfred-schmitz"] },

  {
    topic: "V7 minor",
    midis: [
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
    topic: "Vsus4",
    midis: [
      "andrea---manfred-schmitz",
      "theme-from-schindler-s-list---piano-solo",
    ],
  },

  {
    topic: "V7 minor with bIII",
    midis: [
      "duet-princessy-i-korolya---gennadiy-gladkov-duet-princessy-i-korolya",
      "andrea---manfred-schmitz",
      "theme-from-schindler-s-list---piano-solo",
    ],
  },
  {
    topic: "V7/iv",
    midis: [
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
    topic: "V7/V",
    midis: [
      "stephen-foster---hard-times-come-again-no-more",

      "pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki---gennadiy-gladkov-pesnya-atamanshi-i-razboynikov-govoryat-my-byaki-buki-g.-gladkov", // with relative minor
    ],
  },
  {
    topic: "V7/vi",
    midis: [
      "jeanie-with-the-light-brown-hair---stephen-foster",
      "beautiful-dreamer---stephen-foster", // ii6
    ],
  },
  {
    topic: "V7/ii",
    midis: [
      "no.9-esther-s-waltz---esther-abrami", // Cad64, relative
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
    topic: "o7 break",
    midis: ["your-precious-moon---mike-morasky-wheatley-boss-fight-ending"],
  },
  { topic: "augmented tonic", midis: ["music-of-the-spheres"] },

  { topic: "bII", midis: [] },
  {
    topic: "blues scale",
    midis: [
      "team-fortress-2-main-theme---mike-morasky-team-fortress-2-piano-solo", // pure

      "rocket-jump-waltz-piano-solo",
    ],
  },

  {
    topic: "minimalism",
    midis: [
      "you-are-not-part-of-the-control-group",
      "glassworks-opening-1---philip-glass-opening-1---philip-glass",
    ],
  },
  { topic: "simple natural minor", midis: [] },
  { topic: "natural minor with bIII tonicization", midis: [] },

  {
    topic: "dorianish natural minor",
    midis: [
      "heroes-of-might-and-magic-2--sorceress-town---paul-anthony-romero",
    ],
  },

  {
    topic: "alterated dominants",
    midis: [
      "prosnis-i-poy---gennadiy-gladkov", // Iadd6, chain of dominants, V7b9, V9
    ],
  },

  {
    topic: "constant structures",
    midis: [
      "am-abend---manfred-schmitz", // Iadd9
      "barkarole---manfred-schmitz",
      "e.t.-end-credits-piano-solo",
    ],
  },

  { topic: "idiosyncratic", midis: ["e.t.-theme---ywcm"] },

  {
    topic: "symmetric chromatic",
    midis: ["le-carnaval-des-animaux---aquarium"],
  },

  {
    topic: "complex chromatic/modulatory vgm",
    midis: [
      "misfortune-teller---valve-studio-orchestra-.", // IV7 vibes, simple
      "team-fortress---rise-of-the-living-bread---mike-morasky",
    ],
  },

  { topic: "vgm non-functional diatonic", midis: ["Sweden_Minecraft"] },

  { topic: "episodic dorian", midis: ["andrea---manfred-schmitz"] },

  { topic: "picardy third", midis: ["you-are-not-part-of-the-control-group"] },

  {
    topic: "sentence",
    midis: [
      "theme-from-schindler-s-list---piano-solo", // 2x + 2x
    ],
  },
];

// foster processed until soiree polka
// gladkov till prosnis-i-poy
// schmitz till andrea
// popular classics till hungarian dance 5
// john williams till ywcm
