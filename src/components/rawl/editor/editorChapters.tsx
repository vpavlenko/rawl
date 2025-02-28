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
  detailedDescription?: string[];
  scores: string[];
}> = [
  {
    title: "Introduction",
    titleChords: ["I"],
    description: "Introduction to the book",
    scores: ["intro"],
  },
  {
    title: "Schubert Dances",
    titleChords: ["V7", "I"],
    description: "Schubert's dances featuring V7-I progressions",
    detailedDescription: [
      "Franz Schubert composed hundreds of dances, primarily waltzes, for piano. These charming miniatures showcase his gift for melody and harmonic invention.",
      "The pieces collected here demonstrate his characteristic use of V7-I cadential progressions, which create a strong sense of resolution and finality. Despite their brevity, these dances contain sophisticated harmonic movements and melodic invention.",
      "Notice how Schubert creates interest by varying the texture and register while maintaining the fundamental waltz rhythm and harmonic structure. These works represent some of the earliest examples of the Viennese waltz style that would later flourish throughout the 19th century.",
    ],
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
    detailedDescription: [
      "Gibran Alcocer's compositions explore the rich harmonic landscape of the natural minor scale. Unlike the harmonic minor that introduces a raised 7th degree, the natural minor retains all the notes of its relative major scale.",
      "The progression bVI-iv-i-bVII is particularly significant in this context, representing a modal cadential pattern that differs from the traditional V-i of common practice harmony. The subdominant emphasis creates a distinctive sound that characterizes many folk and popular music traditions.",
      "These pieces showcase how contemporary composers can create compelling harmonic movements within a modal framework, challenging conventional tonal expectations while maintaining a sense of coherence and direction.",
    ],
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
