// https://github.com/vpavlenko/bat

import { Cell } from "./tokenize";

type Beat = {
  measure: number;
  beat: number;
  drum: Cell;
  bass: Cell;
  chord: Cell;
  melody: Cell;
};

type BeatFeatures =
  | "bass:onset_at_start"
  | "bass:more_than_one_note"
  | "drum:kick_at_start"
  | "drum:snare_at_start"
  | "drum:hihat_at_start";

type BinaryVector<T extends string> = {
  [K in T]?: boolean;
};

type BeatFeaturesVector = BinaryVector<BeatFeatures>;

const extractBeatFeatures = (beat: Beat): BeatFeaturesVector => {
  const result: BeatFeaturesVector = {};
  if (
    beat.drum.filter(
      (note) =>
        [35, 36].includes(note.midiNumber) && note.onset.split(".")[1] === "00",
    )
  ) {
    result["drum:kick_at_start"] = true;
  }
  return result;
};

const extractPairwiseFeatures = (a, b) => {};
