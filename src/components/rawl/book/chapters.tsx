import React from "react";
import styled from "styled-components";
import { Chord } from "../legends/chords";
import ChordStairs from "../legends/ChordStairs";
import { TOP_100_COMPOSERS } from "../top100Composers";

export const MODULATIONS_CHAPTER_TITLE =
  "Modulations in classical music: endless V7 to I and V7 to i";

const P = styled.div`
  margin-bottom: 30px;
  line-height: 1.6;
`;

const C = ({ c, title }: { c: Chord[]; title: string }) => (
  <span
    style={{
      display: "inline-block",
      position: "relative",
      top: "5px",
      padding: "3px 3px",
    }}
    title={title.replace(/b/g, "♭").replace(/#/g, "♯")}
  >
    <ChordStairs
      mode={{ title: "", chords: c }}
      scale={0.85}
      playbackMode="together"
    />
  </span>
);

const c = (strings: TemplateStringsArray) => {
  const chordString = strings[0].trim();
  const chords = chordString.split(/\s+/);
  return <C c={chords as Chord[]} title={chordString} />;
};

const a = (href: string, text: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "orange" }}
  >
    {text}
  </a>
);

const n = (text: TemplateStringsArray) => (
  <span style={{ whiteSpace: "nowrap" }}>{text}</span>
);

export const CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode;
  pretext?: React.ReactNode;
  composers: (typeof TOP_100_COMPOSERS)[number]["slug"][];
}> = [
  {
    title: "Intro",
    composers: ["happy_birthday_bass_and_chords"],
    mode: {
      title: "",
      chords: ["I", "IV", "V"],
    },
    pretext: (
      <>
        <p>
          There are twelve notes in each octave of a piano:{" "}
          {c`1 b2 2 b3 3 4 #4 5 b6 6 b7 7`}
        </p>
        <p>
          Some pieces are built entirely on a subset of seven notes called a
          major scale: {c`1 2 3 4 5 6 7 1`}
        </p>
        <p>
          Each color is present several times on a piano keyboard – in different
          octaves: {c`1 3 5 1 3 5 1 3 5 1 3 5 1`}
        </p>
        <p>
          If you play three colors in a certain pattern, it's called a chord.
        </p>
        <p>
          This "Happy Birthday" arrangement uses three chords in the left hand:{" "}
          {c`I`}, {c`IV`} and {c`V`}{" "}
        </p>
      </>
    ),
  },
  {
    title: "Four-chord progressions in major",
    titleChords: ["I", "V", "vi", "IV"],
    mode: {
      title: "6 common triads in a major mode",
      chords: ["ii", "IV", "vi", "I", "iii", "V"],
    },
    pretext: (
      <>
        <p>In Western music, chords usually change at regular times.</p>
        <p>
          The easiest way of organizing chords is to put them in a loop. The
          most common length of the loop is four chords.
        </p>
        <p>
          There are six common chords that can be built on a major scale:{" "}
          {c`I ii iii IV V vi`}
        </p>
        <p>
          If you put {c`I`} on the first place, you can fill in the rest three
          distinct chords in {n`5 × 4 × 3 = 60`} ways.
        </p>
        <p>
          However, historically just a few of these hypothetical loops take up
          the majority of the songs. The most popular loops are:
          <ol>
            <li>
              {c`I vi IV V`} and {c`IV V I vi`} are two rotations of a{" "}
              {a(
                "https://en.wikipedia.org/wiki/%2750s_progression",
                "'50s progression",
              )}
            </li>
            <li>
              {c`I V vi IV`} and {c`vi IV I V`} are two rotations of a{" "}
              {a(
                "https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression",
                "I–V–vi–IV progression",
              )}
            </li>
            <li>{c`I iii vi IV`}</li>
          </ol>
        </p>
        <p>
          Listen to the songs below and analyze the loops they are built upon.
        </p>
        <h2>Historical context</h2>
        <p>
          Making tracks entirely of four-chord loops is a recent innovation – it
          gained popularity in the 1950s. Neither Mozart nor Chopin didn't do
          that.
        </p>
      </>
    ),
    composers: [
      "the-office---opening-titles-theme-song-for-piano",
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "doki-doki-literature-club-ost---your-reality",
      "Viva_La_Vida_Coldplay",
      "Ed_Sheeran_Perfect",
      "dont-stop-believing-piano",
      "Someone_Like_You_easy_piano",
      "Someone_You_Loved",
      "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
    ],
  },
  {
    title: "Natural minor",
    titleChords: ["bVI", "bVII", "i"],
    mode: {
      title: "natural minor",
      chords: ["iv", "bVI", "i", "bIII", "v", "bVII"],
    },
    pretext: (
      <>
        <h2>6 chords in natural minor</h2>
        <p>
          Tracks in a natural minor mode also use seven notes. There are six
          common chords that can be built on a natural minor scale:{" "}
          {c`i bIII iv v bVI bVII`}
        </p>
        <p>
          Some of these tracks have four-chord loops, while others have longer
          strings of chords. As you analyze them, try to find the most common
          pair of chords in natural minor that go together. Is there a frequent
          triplet of chords? A frequent four-chord loop/phrase?
        </p>
        <h2>Major and minor chords</h2>
        <p>
          There are two types of triads commonly used in Western music: major
          chords and minor chords.
        </p>
        <p>
          Here are pairs of minor vs major chords - not in any particular mode,
          just "in the air":
          <ul>
            <li>
              {c`i`} {c`I`}
            </li>
            <li>
              {c`ii`} {c`II`}
            </li>
            <li>
              {c`biii`} {c`bIII`}
            </li>
            <li>
              {c`iii`} {c`III`}
            </li>
            <li>
              {c`iv`} {c`IV`}
            </li>
            <li>
              {c`v`} {c`V`}
            </li>
            <li>
              {c`bvi`} {c`bVI`}
            </li>
            <li>
              {c`vi`} {c`VI`}
            </li>
            <li>
              {c`bvii`} {c`bVII`}
            </li>
          </ul>
        </p>
        <p>
          Minor chords have a smaller interval of three semitones at the bottom
          and a bigger interval of four semitones at the top.
        </p>
        <p>
          Major chords has a smaller interval of three semitones at the top and
          a bigger interval of four semitones at the bottom.
        </p>
        <p>
          This has nothing to do with major/minor modes. A mode is are a
          separate thing – coincidentally also named minor or major, though.
        </p>
        <h2>Major and minor chords in modes</h2>
        <p>
          Recall: six common chords in a natural minor mode are{" "}
          {c`i bIII iv v bVI
          bVII`}
          <ul>
            <li>
              Three minor chords in a minor mode are {c`i`}, {c`iv`} and {c`v`}
            </li>
            <li>
              Three major chords in a minor mode are {c`bIII`}, {c`bVI`} and{" "}
              {c`bVII`}
            </li>
          </ul>
        </p>
        <p>
          Recall: six common chords in a major mode are {c`I ii iii IV V vi`}
          <ul>
            <li>
              Three minor chords: {c`ii`}, {c`iii`} and {c`vi`}
            </li>
            <li>
              Three major chords: {c`I`}, {c`IV`} and {c`V`}
            </li>
          </ul>
        </p>
        <h2>Historical context</h2>
        <p>
          Throughout the 19th century, there was no such thing as a natural
          minor mode with solely {c`v`} chord and without any {c`7`} note in
          minor. No composers wrote that way.
        </p>
        <p>
          A modern natural minor is a recent invention – it gained popularity in
          1970s. So, all examples below are pretty modern.
        </p>
        <p>
          We'll look at the older version of minor in the next few chapters.
        </p>
      </>
    ),
    composers: [
      "still-dre---variation-composition",
      "Game_of_Thrones_Easy_piano",
      "Lovely_Billie_Eilish",
      "Let_Her_Go_Passenger",
      "Another_Love__-_Tom_Odell_Professional",
      "Im_Blue_Eiffel_65",
      "Never_Gonna_Give_You_Up",
      "sadness-and-sorrow-for-piano-solo",
      "Interstellar",
    ],
  },
  {
    title: "i ♭VI V",
    titleChords: ["i", "i", "bVI", "V"],
    mode: {
      title: "",
      chords: ["i", "bVI", "V"],
    },
    pretext: (
      <>
        <p>
          These songs exploit an endless loop of {c`i i bVI V`}. So, they don't
          fit within the natural minor scale {c`1 2 b3 4 5 b6 b7 1`}, since{" "}
          {c`V`} uses a note {c`7`}
        </p>
        <p>
          You might say that these songs are built on an extended minor scale:{" "}
          {c`1 2 b3 4 5 b6 b7 7 1`}
        </p>
        <p>
          Or you might say that the chord {c`V`} is drawn from a harmonic minor
          scale, unlike all other chords: {c`1 2 b3 4 5 b6 7 1`}
        </p>
        <p>
          Also,{" "}
          {a(
            "/f/road-trippin---red-hot-chili-peppers",
            "Red Hot Chili Peppers. Road trippin'",
          )}{" "}
          has the same vibe.
        </p>
        <h2>Historical context</h2>
        <p>
          Until a natural minor mode gained popularity, a minor mode mostly used{" "}
          {c`V`}. However, the examples below are modern, because they are made
          of an endless four-measure loop – which is also a modern thing. The
          truly old examples will appear in the next chapter.
        </p>
      </>
    ),
    composers: [
      "Requiem_for_a_Dream",
      "we-are-number-one-but-it-s-a-piano-transcript",
      "Believer_-_Imagine_Dragons",
    ],
  },
  {
    title: "Circle of fifths",
    titleChords: ["i", "iv", "bVII", "bIII"],
    pretext: (
      <>
        <p>
          If four-chord loops didn't quite appear throughout 17..19th centuries,
          eight-chord loops did. The most important loop since Baroque era was
          The Circle of Fifths progression.
        </p>
        <p>The model example: {c`i iv bVII bIII bVI iio V i`}</p>
        <p>
          The idea is to take the next chord's root three notes up from a
          previous chord's root, going around a scale.
        </p>
        <p>Here are the roots of these chords: {c`1 4 b7 b3 b6 2 5 1`}</p>
        <p>
          There are options. A rare {c`iio`} chord may be replaced with {c`iv`},
          which sounds "similar": these chords share two notes. This way we'll
          get {c`i iv bVII bIII bVI iv V i`}
        </p>
      </>
    ),
    mode: {
      title: "circle of fifths",
      chords: ["i", "iv", "bVII", "bIII", "bVI", "iio7", "bII", "V7"],
    },
    composers: [
      "passacaglia---handel-halvorsen",
      "g-minor-bach-original",
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
      "vivaldi---summer---piano",
    ],
  },
  {
    title: "Minor with V",
    titleChords: ["V7", "i"],
    pretext: (
      <>
        <p>
          So, an older version of a minor mode has these chords:{" "}
          {c`i bIII iv v V bVI bVII`}
        </p>
        <p>
          Most sections end with {c`V`} or {c`V i`} chords – you'll see a lot of{" "}
          {c`7`} notes at the right border of the scores.
        </p>
        <p>
          Some musicians call it "functional harmony". What does it mean? It
          implies that chords aren't just being put at completely random orders
          for each new piece.
        </p>
        <p>
          Sections most often start with {c`i`}. They most often end with{" "}
          {c`bVI bVII V i`}, {c`iv V i`}, {c`bVI V i`}.
        </p>
        <p>
          Chord pairs {c`V i`} and {c`V bVI`} are frequent, whereas {c`V iv`} or{" "}
          {`V bVII`} are rare.
        </p>
        <p>
          A {c`i bVII`} will most likely be continued with {c`bVI`}
        </p>
        <p>
          Some chord chunks are also frequent: {c`iv i V i`}, {c`i bVII bVI V`},{" "}
          {c`bVII bIII`}. They are used like formulas.
        </p>
        <p>
          Composers may use them consciously or subconsciously. All people learn
          to "hear" them as "better" chord sequences because they are very
          probably in music that we listened to throughout our whole life.
        </p>
        <p>
          And our hearing system constantly tries to predict what will happen
          next. So, if there are rules and any ways for a brain to memorize
          pieces faster, a brain will extract those rules in background - during
          our entire life.
        </p>
      </>
    ),
    mode: {
      title: "minor with V",
      chords: ["iv", "bVI", "i", "bIII", "v", "Vsus4", "V", "V7", "bVII"],
    },
    composers: [
      "Bella_Ciao",
      "Gravity_Falls_Opening",
      "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
      "Carol_of_the_Bells",
      "Hallelujah",
      "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
      "gurenge--demon-slayer-kimetsu-no-yaiba-op",
      "Pokemon_Theme_Song",
    ],
  },
  {
    title: "Functional major",
    titleChords: ["V7", "I"],
    mode: {
      title: "major",
      chords: ["ii", "IV", "vi", "I", "iii", "V", "V7"],
    },
    composers: [
      "Canon_in_D",
      "a-thousand-years",
      "John_Lennon_Imagine",
      "sign-of-the-times---harry-styles",
      "A_Thousand_Miles",
    ],
  },
  {
    title: "Dorian IV in minor",
    titleChords: ["i", "IV"],
    mode: {
      title: "dorian minor",
      chords: ["iv", "IV", "bVI", "i", "bIII", "v", "bVII"],
    },
    composers: [
      "nothing-else-matters---metallica",
      "dragonborn---skyrim-theme-song-piano-solo",
      "solas---jamie-duffy",
    ],
  },
  {
    title: "iv in major",
    titleChords: ["I", "iv"],
    composers: [
      "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
      "how-far-i-ll-go-~-moana-ost",
      "la-vie-en-rose-solo-accordion",
    ],
  },
  {
    title: "Seventh chords and extensions",
    titleChords: ["IVmaj7", "Imaj7"],
    mode: {
      title: "seventh chords and extensions in major",
      chords: ["ii7", "IVmaj7", "vi7", "Imaj7", "iii7", "V13"],
    },
    composers: [
      "Golden_Hour__JVKE_Updated_Ver.",
      "Sweden_Minecraft",
      "Gymnopdie_No._1__Satie",
      "yuri-on-ice---piano-theme-full",
    ],
  },
  {
    title: "Applied dominant: V7/V",
    titleChords: ["V7/V", "V"],
    mode: {
      title: "",
      chords: ["V7/V", "V7", "I"],
    },
    composers: [
      "piano-man-piano",
      "Disney_Pixar_Up_Theme",
      "Test_Drive_How_to_Train_Your_Dragon",
      "Dawn_Pride_and_Prejudice",
    ],
  },
  {
    title: "Other applied chords",
    titleChords: ["V/ii", "I7", "V/vi"],
    mode: {
      title: "applied chords",
      chords: ["V7/ii", "ii", "V7/iv", "iv", "V7/vi", "vi"],
    },
    composers: [
      "anastasia---once-upon-a-december",
      "Omori_Duet",
      "sia---snowman",
      "Cant_Help_Falling_In_Love",
      "your-song-piano",
      "my-lie-watashi-no-uso---your-lie-in-april",
      "abba--the-winner-takes-it-all",
      "All_I_Want_for_Christmas_is_You",
      "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
      "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
      "Love_Like_You_Steven_Universe",
      "my-heart-will-go-on",
    ],
  },
  {
    title: MODULATIONS_CHAPTER_TITLE,
    mode: {
      chords: ["V7", "I", "i"],
      title: "",
    },
    composers: [
      "minuet-bwv-anhang-114-in-g-major",
      "flight-of-the-bumblebee",
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "wa-mozart-marche-turque-turkish-march-fingered",
      "theme-from-schindler-s-list---piano-solo",
      "Fr_Elise",
      "the_entertainer_scott_joplin",
    ],
  },
  {
    title: "Blues scale and hexatonic minor",
    titleChords: ["1", "b3", "4", "#4", "5", "b7"],
    mode: {
      title: "blues scale",
      chords: ["1", "b3", "4", "#4", "5", "b7"],
    },
    composers: [
      "Undertale_-_Megalovania_Piano_ver._3",
      "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
      "fairy-tail-main-theme",
    ],
  },
  {
    title: "♭VII in major",
    titleChords: ["bVII", "I"],
    mode: {
      title: "Mario cadence",
      chords: ["bVI", "bVII", "I"],
    },
    composers: [
      "when-i-was-your-man---bruno-mars-600e3a",
      "Take_on_me",
      "kimi-no-na-wa---sparkle-theishter-2016",
      "Super_Mario_Bros_Main_Theme",
      "welcome-to-the-black-parade---my-chemical-romance",
    ],
  },
  {
    title: "ii V I jazz",
    titleChords: ["ii7", "V7", "Imaj7"],
    mode: {
      title: "jazz",
      chords: ["ii7", "V7", "Imaj7", "iiø7", "V7b9", "i7"],
    },
    composers: [
      "Fly_Me_to_the_Moon",
      "autumn-leaves-jazz-piano",
      "it-s-been-a-long-long-time---harry-james",
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
    ],
  },
  {
    title: "Four-chord progressions in minor / double-tonic",
    titleChords: ["I", "=", "bIII"],
    composers: [
      "despacito-piano-cover-peter-bence",
      "river-flows-in-you",
      "alan-walker---alone-piano",
      "Yann_Tiersen_Amelie",
      "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
      "Mad_world_Piano",
    ],
  },
  {
    title: "Misc",
    composers: [
      "Clair_de_Lune__Debussy",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
      "Liebestraum_No._3_in_A_Major",

      "mii-channel-piano",
      "ylang-ylang---fkj-transcribed-by-lilroo",
      "attack-on-titan-theme-guren-no-yumiya",
      "congratulations---mac-miller",
      "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
      "dance-of-the-sugar-plum-fairy",
      "africa---toto",
    ],
  },
  {
    title: "Style",
    pretext: (
      <>
        Here we present two most popular pieces by each composers. Can you see
        that pieces of the same composer look more similar to each other than to
        other composers?
      </>
    ),
    composers: [
      "Fr_Elise",
      "Sonate_No._14_Moonlight_1st_Movement",
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
      "One_Summers_Day_Spirited_Away",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
      "Waltz_in_A_MinorChopin",
      "Liebestraum_No._3_in_A_Major",
      "tude_S._1413_in_G_Minor_La_Campanella__Liszt",
      "river-flows-in-you",
      "Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019",
      "Sweden_Minecraft",
      "Wet_Hands_Minecraft",
      "Gravity_Falls_Opening",
      "eda-s-requiem---brad-breeck-piano",
      "the_entertainer_scott_joplin",
      "Maple_Leaf_Rag_Scott_Joplin",
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "kanye-west-homecoming-piano-cover",
      "Viva_La_Vida_Coldplay",
      "the-scientist---coldplay-piano-arrangement",
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
      "ballade-pour-adeline---richard-clayderman",
      "Undertale_-_Megalovania_Piano_ver._3",
      "Fallen_Down_Undertale",
      "Clair_de_Lune__Debussy",
      "arabesque-l.-66-no.-1-in-e-major",
      "Super_Mario_Bros_Main_Theme",
      "Zeldas_Lullaby",
      "Gymnopdie_No._1__Satie",
      "satie-e.---gnossienne-no.-1",
      "wa-mozart-marche-turque-turkish-march-fingered",
      "lacrimosa---requiem",
      "Lovely_Billie_Eilish",
      "Billie_Eilish_Bad_Guy",
      "Ed_Sheeran_Perfect",
      "Ed_Sheeran_Shape_of_you",
      "Golden_Hour__JVKE_Updated_Ver.",
      "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
      "dragonborn---skyrim-theme-song-piano-solo",
      "secunda-the-elder-scrolls-v-skyrim",
      "Dawn_Pride_and_Prejudice",
      "liz-on-top-of-the-world",
      "Canon_in_D",
      "pachelbel-chaconne-in-f-minor",
      "mii-channel-piano",
      "wii-sports-theme-piano",
    ],
  },
  {
    title: "About",
    composers: [],
  },
];

export type Mode = { title: string; chords: Chord[] };
