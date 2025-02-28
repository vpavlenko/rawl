import { Mode } from "../book/chapters";
import { Chord } from "../legends/chords";

// Define the chapter groups (how they're organized in the UI)
export const EDITOR_CHAPTER_GROUPS: Record<string, [number, number]> = {
  all: [1, 3], // All 3 chapters are in a single group
};

// Define the editor chapters
export const EDITOR_CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode | Mode[];
  description?: string;
  scores: string[];
}> = [
  {
    title: "Schubert Dances",
    titleChords: ["V7", "I"],
    description: "Schubert's dances featuring V7-I progressions",
    scores: [
      "schubert_d365_09",
      "wima.e480-schubert_de.-tanz-d.365.25",
      "wima.1124-schubert_de.-tanz-d.365.26",
      "wima.4be9-schubert_de.-tanz-d.365.28",
    ],
  },
  {
    title: "Natural Minor",
    titleChords: ["bVI", "iv", "i", "bVII"],
    description: "Gibran Alcocer's compositions in natural minor",
    scores: [
      "idea-22---gibran-alcocer",
      "idea-n.10---gibran-alcocer",
      "idea-20---gibran-alcocer",
      "idea-15---gibran-alcocer",
    ],
  },
  {
    title: "Miscellaneous",
    titleChords: ["Imaj7", "i7"],
    description: "A collection of various musical pieces",
    scores: [
      "der-flohwalzer",
      "Gravity_Falls_Opening",
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "chopsticks",
      "the-two-happy-coons---theodore-h.-northrup-1891",
      "passacaglia---handel-halvorsen",
      "boogie-woogie-jump---pete-johnson",
    ],
  },
];
