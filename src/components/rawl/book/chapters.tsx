import React from "react";
import { Chord } from "../legends/chords";
import ChordStairs from "../legends/ChordStairs";
import { TOP_100_COMPOSERS } from "../top100Composers";

export const MODULATIONS_CHAPTER_TITLE =
  "Modulations in classical music: endless V7 to I and V7 to i";

const C = ({ c }: { c: Chord[] }) => (
  <span
    style={{
      display: "inline-block",
      position: "relative",
      top: "5px",
      padding: "5px 3px",
    }}
  >
    <ChordStairs
      mode={{ title: "", chords: c }}
      scale={0.8}
      playbackMode="together"
    />
  </span>
);

const c = (strings: TemplateStringsArray) => {
  const chords = strings[0].trim().split(/\s+/);
  return <C c={chords as Chord[]} />;
};

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
  },
  {
    title: "Four-chord progressions in major",
    titleChords: ["I", "V", "vi", "IV"],
    mode: {
      title: "6 common triads in a major mode",
      chords: ["ii", "IV", "vi", "I", "iii", "V"],
    },
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
    titleChords: ["bVI", "V", "i"],
    mode: {
      title: "",
      chords: ["i", "bVI", "V"],
    },
    pretext: (
      <>
        These songs exploit an endless loop of {c`i i bVI V`}. So, they don't
        fit within the natural minor scale, since {c`V`} uses a note {c`7`}. The
        pair {c`V i`} acts as a dominant-to-tonic motion. As we'll see later,{" "}
        {c`V`} is resolved to tonic chord ({c`i`} or {c`I`}) in both minor and
        major modes.
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
    mode: {
      title: "circle of fifths",
      chords: ["i", "iv", "bVII", "bIII", "bVI", "iio7", "bII", "V7"],
    },
    composers: [
      "passacaglia---handel-halvorsen",
      "g-minor-bach-original",
      "vivaldi---summer---piano",
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
    ],
  },
  {
    title: "Minor with V",
    titleChords: ["V7", "i"],
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
      "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
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
    title: "About",
    composers: [],
  },
];

export type Mode = { title: string; chords: Chord[] };
