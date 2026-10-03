import { corpora } from "./corpora";

// Ranking rows that represent the works selected in musescore_instrumental_top.
// These are checked work matches, not guesses based on similar words in a title.
const selectedWorks: Record<number, string> = {
  1: "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
  2: "Canon_in_D",
  3: "Clair_de_Lune__Debussy",
  4: "Fr_Elise",
  5: "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
  8: "Gymnopdie_No._1__Satie",
  10: "Interstellar",
  12: "Undertale_-_Megalovania_Piano_ver._3",
  15: "passacaglia---handel-halvorsen",
  16: "Liebestraum_No._3_in_A_Major",
  17: "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
  18: "game-of-thrones-main-piano",
  24: "mariage-d-amour---paul-de-senneville-marriage-d-amour",
  25: "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
  32: "wa-mozart-marche-turque-turkish-march-fingered",
  42: "the_entertainer_scott_joplin",
  44: "Gravity_Falls_Opening",
  47: "Omori_Duet",
  51: "solas---jamie-duffy",
  53: "Disney_Pixar_Up_Theme",
  57: "Super_Mario_Bros_Main_Theme",
  59: "Yann_Tiersen_Amelie",
  60: "Sweden_Minecraft",
  73: "g-minor-bach-original",
  77: "sadness-and-sorrow-for-piano-solo",
  80: "mii-channel-piano",
  84: "minuet-bwv-anhang-114-in-g-major",
  93: "Dawn_Pride_and_Prejudice",
  109: "ylang-ylang---fkj-transcribed-by-lilroo",
  120: "dance-of-the-sugar-plum-fairy",
  126: "old-doll-puppet---ib-mad-father-old-doll",
  127: "idea-22---gibran-alcocer",
  130: "flight-of-the-bumblebee",
  132: "vivaldi---summer---piano",
  133: "the-office",
  136: "theme-from-schindler-s-list---piano-solo",
  142: "take-five",
  160: "Godfather",
  161: "Misty_piano_solo",
  167: "flower-dance-dj-okawari",
  168: "solo-violin-caprice-no.-24-in-a-minor---n.-paganini-op.-1-no.-24",
  170: "yuri-on-ice---piano-theme-full",
  178: "czardas-by-vittorio-monti",
  179: "succession-main-theme",
  193: "stranger-things-theme",
  196: "hungarian-dance-no-5-in-g-minor",
  197: "can-you-hear-the-music---ludwig-goransson-from-oppenheimer",
  204: "forest-gump---main-title-feather-theme",
  206: "fairy-tail-main-theme",
  217: "hollow-knight-main-theme---christopher-larkin",
  221: "Tetris_Theme",
  222: "libertango",
  230: "dearly-beloved-piano-collections-kingdom-hearts",
  250: "Gershwin_Rhapsody_in_Blue_Piano_solo",
  270: "for-the-damaged-coda---blonde-redhead",
  272: "in-the-hall-of-the-mountain-king-dovregubbens-hall",
  281: "chasing-kou---hidekazu-sakamoto-drowning-love---ni-rerunaihu-mule-bbajin-naipeu-ost",
  287: "evgeny-grinko---valse",
  296: "le-cygne-the-swan",
  298: "lavender-town-pokemon-r-b-y",
  315: "liebesleid-piano-solo---kreisler-rachmaninoff-alt-wiener-tanzweisen",
  320: "genshin-impact-main-theme",
  333: "kass-theme--full-the-legend-of-zelda-breath-of-the-wild",
  337: "victory-piano-solo---two-steps-from-hell",
  339: "a-wanderer-s-song-zigeunerweisen-gypsy-airs-op.20",
  150: "Pink_Panther",
  355: "Avril_14_Aphex_Twin",
  370: "time-travel-theme-by-jay-chou-from-secret-2007-film",
  330: "~beethoven-virus~",
  417: "to-the-moon-for-river-johnny-s-version",
  442: "can-can",
  443: "adagio-in-g-minor---for-solo-piano",
  451: "Axel_F_Beverly_Hills_Cop_III",
  477: "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
  950: "Test_Drive_How_to_Train_Your_Dragon",
  1115: "my-lie-watashi-no-uso---your-lie-in-april",
  1617: "Requiem_for_a_Dream",
};

const instrumentalCorpus = corpora.find(
  (corpus) => corpus.slug === "musescore_instrumental_top",
);
export const representedRankToSlug: Record<number, string> = Object.fromEntries(
  Object.entries(selectedWorks).filter(
    ([, slug]) => instrumentalCorpus?.midis.includes(slug),
  ),
);

// Other arrangements of these same works also need no new corpus upload.
const workVariants: Array<[RegExp, string]> = [
  [
    /merry.go.round of life/i,
    "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
  ],
  [/(?:canon in d|pachelbel.s canon)/i, "Canon_in_D"],
  [/clair de lune/i, "Clair_de_Lune__Debussy"],
  [/f[uü]r elise/i, "Fr_Elise"],
  [
    /nocturne.*op\.?\s*9.*no\.?\s*2|nocturne.*e.flat.*op\.?\s*9/i,
    "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
  ],
  [/gymnop[eé]die.*(?:no\.?\s*)?1\b/i, "Gymnopdie_No._1__Satie"],
  [/megalovania/i, "Undertale_-_Megalovania_Piano_ver._3"],
  [/he.s a pirate/i, "Pirates_of_the_Caribbean_-_Hes_a_Pirate"],
  [
    /game of thrones.*(?:main )?theme|game of thrones, easy piano/i,
    "game-of-thrones-main-piano",
  ],
  [
    /mariage d.amour|marriage d.amour/i,
    "mariage-d-amour---paul-de-senneville-marriage-d-amour",
  ],
  [/the entertainer/i, "the_entertainer_scott_joplin"],
  [/mii channel/i, "mii-channel-piano"],
  [/super mario bros.*main theme/i, "Super_Mario_Bros_Main_Theme"],
  [/g minor bach/i, "g-minor-bach-original"],
  [/ylang ylang/i, "ylang-ylang---fkj-transcribed-by-lilroo"],
  [/dance of the sugar plum fairy/i, "dance-of-the-sugar-plum-fairy"],
  [/flight of the bumblebee/i, "flight-of-the-bumblebee"],
  [/for the damaged coda/i, "for-the-damaged-coda---blonde-redhead"],
  [/flower dance.*(?:dj okawari|piano)/i, "flower-dance-dj-okawari"],
  [/pink panther/i, "Pink_Panther"],
  [/take five/i, "take-five"],
  [
    /can you hear the music/i,
    "can-you-hear-the-music---ludwig-goransson-from-oppenheimer",
  ],
  [
    /test drive.*how to train your dragon/i,
    "Test_Drive_How_to_Train_Your_Dragon",
  ],
  [/comptine d.un autre [eé]t[eé]/i, "Yann_Tiersen_Amelie"],
  [/\bczardas\b/i, "czardas-by-vittorio-monti"],
  [/\blibertango\b/i, "libertango"],
  [
    /chasing kou|drowning love/i,
    "chasing-kou---hidekazu-sakamoto-drowning-love---ni-rerunaihu-mule-bbajin-naipeu-ost",
  ],
  [
    /isabella.s lullaby/i,
    "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
  ],
  [/requiem for a dream/i, "Requiem_for_a_Dream"],
];

export function representedSlug(
  rank: number,
  title: string,
): string | undefined {
  const slug =
    representedRankToSlug[rank] ||
    workVariants.find(([pattern]) => pattern.test(title))?.[1];
  return slug && instrumentalCorpus?.midis.includes(slug) ? slug : undefined;
}

// Known songs with lyrics. This also catches piano arrangements of the songs.
// A score with a wordless choir or an ambiguous title stays visible for review.
const vocalWork =
  /\b(?:golden hour|je te laisserai des mots|hallelujah|bohemian rhapsody|someone you loved|runaway|piano man|fly me to the moon|someone like you|believer|my heart will go on|mad world|viva la vida|all of me|all i want for christmas is you|imagine|lovely|the scientist|a thousand years|never gonna give you up|despacito|when i was your man|the winner takes it all|congratulations|can.t help falling in love|gurenge|skyfall|let her go|snowman|your reality|nothing else matters|sparkle|take on me|don.t stop believin|we are number one|sign of the times|love like you|yoru ni kakeru|from the start|easy on me|stay|somewhere only we know|shape of you|i see the light|africa|the night we met|hit the road jack|wellerman|you are the reason|drivers license|hall of fame|welcome to the black parade|bad guy|fix you|demons|a sky full of stars|how far i.ll go|jingle bell rock|great balls of fire|glimpse of us|i need u|in the end|unravel|senorita|ocean eyes|set fire to the rain|turning page|ophelia|lost boy|golden brown|i.m not the only one|falling by harry styles|beautiful in white|i.m still standing|blinding lights|creep|take me to church|counting stars|mamma mia|yellow|no time to die|see you again|to build a home|fake love|photograph|until i found you|let you break my heart again|peaches|when the party.s over|washing machine heart|shallow|we don.t talk about bruno|mystery of love|love is gone|right here waiting|hello|thinking out loud|chasing cars|love me again|o holy night|arcade|lose yourself|baby shark|die with a smile|dream a little dream of me|make you feel my love|my love mine all mine|titanium|all star|sound of silence|i will survive|mockingbird|still with you|a whole new world|let it go|love of my life|feliz navidad|back to black|only we know|another love|perfect|what was i made for|seven nation army|blue bird|your song|love story|la vie en rose|it.s been so long|shinzou wo sasageyo|amazing grace)\b/i;
const additionalVocalWork =
  /\b(?:carol of the bells|autumn leaves|still d\.?r\.?e\.?|dragonborn|guren no yumiya|bella ciao|it.s been a long long time|happy birthday|once upon a december|pok[eé]mon theme|old town road|a thousand miles|blue da ba dee|hit the road jack|tango por una cabeza|bink.s sake|bink.s rum|national anthem|greensleeves|alan walker.{0,20}alone|clocks|chiquitita|vienna.billy joel|stand by me|7 years|always with me|happier|just the two of us|blue.yung kai|where is my mind|a cruel angel.s thesis|fairytale by alexander rybak|i.m not the only one|something just like this|orange.your lie in april|everglow|moon river|pure imagination|house of the rising sun|red swan|idontwannabeyouanymore|hikaru nara|my war|the truth untold|you are my sunshine|habanera from carmen|seasons.wave to earth|love story|my heart will go on|i.m blue)\b/i;

export function isKnownVocal(title: string, arrangement: string): boolean {
  if (/love story\s*-?\s*richard clayderman/i.test(title)) return false;
  const plainTitle = title.replace(/[’‘]/g, "'");
  const words = plainTitle.replace(/[^\p{L}\p{N}]+/gu, " ");
  return (
    vocalWork.test(plainTitle) ||
    vocalWork.test(words) ||
    additionalVocalWork.test(plainTitle) ||
    additionalVocalWork.test(words) ||
    /\b(?:lyrics?|piano.voice|vocal|choir|lead sheet|karaoke)\b/i.test(
      `${title} ${arrangement}`,
    )
  );
}
