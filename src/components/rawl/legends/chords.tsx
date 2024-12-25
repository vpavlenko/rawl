import React from "react";

export const CHORDS = {
  i: [0, 3, 7],
  biiio7: [3, 6, 9, 0],
  "#ivo7": [6, 9, 0, 3],
  vio7: [9, 0, 3, 6],
  iiio7: [4, 7, 10, 1],
  vo7: [7, 10, 1, 4],
  bviio7: [10, 1, 4, 7],
  ivo7: [5, 8, 11, 2],
  bvio7: [8, 11, 2, 5],
  ii: [2, 5, 9],
  II: [2, 6, 9],
  II7: [2, 6, 9, 0],
  ii7: [2, 5, 9, 0],
  iii: [4, 7, 11],
  III: [4, 8, 11],
  iii7: [4, 7, 11, 2],
  iv: [5, 8, 0],
  iv7: [5, 8, 0, 3],
  I: [0, 4, 7],
  "V7/IV": [0, 4, 7, 10],
  "V7/iv": [0, 4, 7, 10],
  I7: [0, 4, 7, 10],
  vi: [9, 0, 4],
  VI: [9, 1, 4],
  vi7: [9, 0, 4, 7],
  IV: [5, 9, 0],
  IV7: [5, 9, 0, 3],
  V: [7, 11, 2],
  V7: [7, 11, 2, 5],
  V43: [2, 5, 7, 11],
  V9: [7, 11, 2, 5, 9],
  V13: [7, 11, 2, 5, 9, 0, 4],
  V7b9: [7, 11, 2, 5, 8],
  "V/V": [2, 6, 9],
  "V7/V": [2, 6, 9, 0],
  "V/V/V": [9, 1, 4],
  "V/ii": [9, 1, 4],
  "V7/ii": [9, 1, 4, 7],
  "V/iii": [11, 3, 6],
  "V7/iii": [11, 3, 6, 9],
  "V/vi": [4, 8, 11],
  "V7/vi": [4, 8, 11, 2],
  Vsus4: [7, 0, 2],
  Imaj7: [0, 4, 7, 11],
  IVmaj7: [5, 9, 0, 4],
  I5: [0, 7],
  IV5: [5, 0],
  V5: [7, 2],
  v: [7, 10, 2],
  bVI: [8, 0, 3],
  bVII: [10, 2, 5],
  bvi: [8, 11, 3],
  bvii: [10, 1, 5],
  bIII: [3, 7, 10],
  biii: [3, 6, 10],
  bII: [1, 5, 8],
  bII7: [1, 5, 8, 11],
  "V+": [7, 11, 3],
  viio7: [11, 2, 5, 8],
  biio7: [1, 4, 7, 10],
  io7: [0, 3, 6, 9],
  It: [8, 0, 6],
  Fr: [8, 0, 2, 6],
  Ger: [8, 0, 3, 6],
  Cad64: [7, 0, 4],
  cad64: [7, 0, 3],
  "viio7/V": [6, 9, 0, 3],
  i64: [7, 0, 3],
  ii65: [5, 9, 0, 2],
  iiø65: [5, 8, 0, 2],
  io: [0, 3, 6],
  "I+": [0, 4, 8],
  imaj7: [0, 3, 7, 11],
  i7: [0, 3, 7, 10],
  iø7: [0, 3, 6, 10],
  iio: [2, 5, 8],
  iio7: [2, 5, 8, 11],
  iiø7: [2, 5, 8, 12],
  viio: [11, 2, 5],
  IPAC: [0, 4, 12],
  I6: [4, 7, 12],
  i6: [3, 7, 0],
  "1": [0],
  b2: [1],
  "2": [2],
  b3: [3],
  "3": [4],
  "4": [5],
  "#4": [6],
  "5": [7],
  b6: [8],
  "6": [9],
  b7: [10],
  "7": [11],
} as const;

export type Chord = keyof typeof CHORDS;

export const MAJOR_MODE: Mode = {
  title: "major",
  chords: ["ii", "IV", "vi", "I", "iii", "V", "V7"],
};

export const MINOR_MODE: Mode = {
  title: "minor",
  chords: ["iiø7", "iv", "bVI", "i", "bIII", "v", "V", "V7", "bVII"],
};

export const STRICT_NATURAL_MINOR: Mode = {
  title: "",
  chords: ["i", "iv", "v", "bVI", "bVII"],
};

export const CHROMATIC_CHORDS: Mode = {
  title: "chromatic",
  chords: [
    "V7/IV",
    "bII",
    "V7/V",
    "V7/vi",
    "viio7/V",
    "Fr",
    "Ger",
    "V7/ii",
    "V7/iii",
  ],
};

export type Mode = { title: string; chords: Chord[] };

export const formatChordName = (name: string) => {
  // note to AI: never change this function
  const parts = name.split("ø");
  if (parts.length === 1) {
    return name.replace("b", "♭");
    // .replace("7", "⁷")
    // .replace("1", "¹")
    // .replace("3", "³");
  }
  return (
    <>
      {parts[0].replace("b", "♭")}
      <sup>ø</sup>
      {parts[1].replace("7", "⁷").replace("1", "¹").replace("3", "³")}
    </>
  );
};

const stackChordUp = (pitches: readonly number[]): number[] => {
  const result = [...pitches];
  for (let j = 1; j < result.length; j++) {
    while (result[j] < result[j - 1]) {
      result[j] += 12;
    }
  }
  return result;
};

export interface RehydratedChord {
  name: Chord;
  pitches: number[];
  positions: Array<number>;
}

export const rehydrateChords = (chords: Chord[]): RehydratedChord[] => {
  const rehydratedChords = chords.map((chord) => ({
    name: chord,
    pitches: [...stackChordUp(CHORDS[chord])],
    positions: new Array(CHORDS[chord].length).fill(0),
  }));

  // Calculate positions
  for (let i = 0; i < rehydratedChords.length; ++i) {
    const { pitches, positions } = rehydratedChords[i];
    if (i > 0) {
      const prevRoot = rehydratedChords[i - 1].pitches[0];
      const currentRoot = pitches[0];

      // Calculate the two possible minimal distances
      const distanceUp =
        (prevRoot < currentRoot ? 0 : 12) + currentRoot - prevRoot;
      const distanceDown = 12 - distanceUp;

      // Choose whether to place the root up or down
      if (distanceUp <= distanceDown) {
        positions[0] = rehydratedChords[i - 1].positions[0] + distanceUp;
      } else {
        positions[0] = rehydratedChords[i - 1].positions[0] - distanceDown;
      }
    } else {
      positions[0] = 0;
    }

    // Stack the rest of the notes above the root
    for (let j = 1; j < positions.length; ++j) {
      positions[j] =
        positions[j - 1] + ((pitches[j] - pitches[j - 1] + 12) % 12);
    }
  }

  return rehydratedChords;
};
