// // https://github.com/vpavlenko/bat

// import { NotesInVoices } from ".";
// import { Cell } from "./tokenize";

// type Beat = {
//   measure: number;
//   beat: number;
//   drum: Cell;
//   bass: Cell;
//   chord: Cell;
//   melody: Cell;
// };

// type SemanticTrackMapping = {
//     drum: number;
//     bass: number;
//     chord: number;
//     melody: number;
// }

// const findSemanticTracks = (notes: NotesInVoices): SemanticTrackMapping {
//     // 1. Assume there's exactly one drum track. Ignore pitched drums
//     // 2. Then the lowest voice is the bass. Assert that the bass has at least
//     //   four different pitches and at least 40 notes. Inspect violations.
//     // 3. A chord track is the one with the biggest total note length.
//     // 4. A melody track is the one with 90% single-line, a longest among those.

// }

// type BeatFeatures =
//   | "bass:onset_at_start"
//   | "bass:more_than_one_note"
//   | "drum:kick_at_start"
//   | "drum:snare_at_start"
//   | "drum:hihat_at_start";

// type BinaryVector<T extends string> = {
//   [K in T]?: boolean;
// };

// type BeatFeaturesVector = BinaryVector<BeatFeatures>;

// const extractBeatFeatures = (beat: Beat): BeatFeaturesVector => {
//   const result: BeatFeaturesVector = {};
//   if (
//     beat.drum.filter(
//       (note) =>
//         [35, 36].includes(note.midiNumber) && note.onset.split(".")[1] === "00",
//     )
//   ) {
//     result["drum:kick_at_start"] = true;
//   }
//   return result;
// };

// const extractPairwiseFeatures = (a: Beat, b: Beat):  => {};
