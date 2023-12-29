import { Note, NotesInVoices } from ".";
import { MeasuresAndBeats } from "../measures";
import { getAverageMidiNumber } from "../tags";

// https://github.com/vpavlenko/study-music/blob/main/research/tokenizer.md#v2

// All onsets should be rounded up.

const EPSILON = 1e-6;
const ONSET_PUSH_TO_RIGHT = 0.01; // onsets are shifted 10 ms to the right
const QUANTIZATION_LEVELS_INSIDE_BEAT = 8; // 3 * 4, allows to see swing and 16th, but not together

type CellNote = {
  midiNumber: number;
  isDrum: boolean;
  onset: string; // quantized, in relative coordinates, eg. 7/16
};
type Cell = CellNote[];

type BagOfNotes = string[];
type Pattern = string[];

type TonalCellIR = {
  bagOfNotes: BagOfNotes;
  pattern: Pattern;
};

type Rhythm = string[]; // absolute onsets, TODO process?
type DrumCellIR = {
  [drum: number]: Rhythm;
};

type CellIR = TonalCellIR | DrumCellIR | null;
type IR = CellIR[][];

export type Token = string;
export type GridOfTokens = Token[][][];

const quantizedInsideBeat = (precisePositionInsideBeat: number): number =>
  Math.round(precisePositionInsideBeat * QUANTIZATION_LEVELS_INSIDE_BEAT) /
  QUANTIZATION_LEVELS_INSIDE_BEAT;

const convertNotesToCellNotes = (notes: Note[], beats: number[]): CellNote[] =>
  notes
    .map((note) => {
      const {
        note: { midiNumber },
        isDrum,
        span: [time],
      } = note;
      // let's encode onset
      // find our beat segment and encode relative coord
      let i = 0;

      while (beats[i + 1] <= time + EPSILON) {
        i++;
      }
      return {
        midiNumber,
        isDrum,
        onset: (
          i +
          quantizedInsideBeat((time - beats[i]) / (beats[i + 1] - beats[i])) +
          EPSILON
        ).toFixed(2),
      };
    })
    .sort((i, j) =>
      i.onset !== j.onset
        ? parseFloat(i.onset) - parseFloat(j.onset)
        : i.midiNumber - j.midiNumber,
    );

const toTimeShift = (onset1, onset2) =>
  `ts_${(parseFloat(onset2) - parseFloat(onset1)).toFixed(2)}`;

const splitNotesIntoCells = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): Cell[][] => {
  const voices = Array.from({ length: notes.length }, () => []);
  const { measures, beats } = measuresAndBeats;

  for (let m = 0; m < measures.length; ++m) {
    const measureStart = measures[m];
    const measureEnd =
      m + 1 < measures.length
        ? measures[m + 1]
        : measures[measures.length - 1] * 1.5 +
          measures[measures.length - 2] * 0.5;

    const beatsInMeasure = beats.filter(
      (beat) => measureStart < beat && beat < measureEnd,
    );
    for (let voice = 0; voice < notes.length; ++voice) {
      voices[voice].push(
        convertNotesToCellNotes(
          notes[voice].filter(
            (note) =>
              note.span[0] + ONSET_PUSH_TO_RIGHT >= measureStart &&
              note.span[0] + ONSET_PUSH_TO_RIGHT < measureEnd,
          ),
          [measureStart, ...beatsInMeasure, measureEnd],
        ),
      );
    }
  }
  return voices;
};

const convertCellToIR = (
  cell: Cell,
  bassCell: Cell | null,
  previousCell: Cell | null,
): CellIR => {
  if (cell.length === 0) return null;

  if (cell[0].isDrum) {
    const drums: DrumCellIR = {};
    cell.map(({ onset, midiNumber }) => {
      if (!drums[midiNumber]) {
        drums[midiNumber] = [onset];
      } else {
        drums[midiNumber].push(onset);
      }
    });

    return drums;

    //   .forEach((drum) => {
    //     result.push(`drum_${drum}`);
    //     const onsets = drums[drum];
    //     result.push(`ts_${onsets[0]}`);
    //     for (let i = 1; i < onsets.length; ++i) {
    //       result.push(toTimeShift(onsets[i - 1], onsets[i]));
    //     }
    //   });
  }

  const result = { bagOfNotes: [], pattern: [] };

  // 1. First, we encode all notes that will be used inside these bars (a bag of words)
  // 2. Second, we encode their patterns of usage.

  const bagOfMidiNumbers = [
    ...new Set(cell.map((note) => note.midiNumber)),
  ].sort((a, b) => a - b);

  let pivot = null;
  const relateToBassBelow = bassCell?.length > 0;
  let numNotesToSkip = 0;
  let previousRelativeNote = null;

  if (relateToBassBelow) {
    const bass = bassCell[0].midiNumber;

    for (let octave = -7; octave < 8; ++octave) {
      const possiblePivot = bass + octave * 12;
      if (bagOfMidiNumbers.indexOf(possiblePivot) !== -1) {
        pivot = possiblePivot;
        break;
      }
    }
    if (pivot === null) {
      pivot = bass;
      while (pivot < Math.min(...bagOfMidiNumbers)) {
        pivot += 12;
      }
    }

    result.bagOfNotes.push(`oct_${Math.round((pivot - bass) / 12)}`);
    bagOfMidiNumbers.forEach((midiNumber) =>
      result.bagOfNotes.push(`vrel_${midiNumber - pivot}`),
    );
  } else {
    numNotesToSkip = 1;
    if (previousCell && previousCell.length > 0) {
      pivot = previousCell.at(-1).midiNumber;
      result.bagOfNotes.push(`crel_${cell[0].midiNumber - pivot}`);
    } else {
      pivot = cell[0].midiNumber;
      result.bagOfNotes.push(`abs_${pivot}`);
    }
  }

  const referToNote = (midiNumber: number): void => {
    if (numNotesToSkip) {
      numNotesToSkip--;
    } else {
      if (relateToBassBelow) {
        if (previousRelativeNote == null) {
          previousRelativeNote = bagOfMidiNumbers.indexOf(midiNumber);
          result.pattern.push(`n_${previousRelativeNote}`);
        } else {
          result.pattern.push(
            `nr_${bagOfMidiNumbers.indexOf(midiNumber) - previousRelativeNote}`,
          );
          previousRelativeNote = bagOfMidiNumbers.indexOf(midiNumber);
        }
      } else {
        result.pattern.push(`hrel_${midiNumber - pivot}`);
        pivot = midiNumber;
      }
    }
  };

  // 1. Gather notes into chords
  const chords = [
    {
      onset: cell[0].onset,
      midiNumbers: [cell[0].midiNumber],
      timeShift: `t_${cell[0].onset}`,
    },
  ];
  cell
    .slice(1)
    .map(({ onset, midiNumber }) =>
      onset === chords.at(-1).onset
        ? chords.at(-1).midiNumbers.push(midiNumber)
        : chords.push({ onset, midiNumbers: [midiNumber], timeShift: null }),
    );

  let lastChord = 0;
  for (let i = 1; i < chords.length; i++) {
    // 2. Remove redundant chord declarations
    if (
      areMidiNumbersEqual(chords[lastChord].midiNumbers, chords[i].midiNumbers)
    ) {
      chords[i].midiNumbers = null;
    } else {
      lastChord = i;
    }

    // 3. Switch to time shifts
    chords[i].timeShift = toTimeShift(chords[i - 1].onset, chords[i].onset);
  }

  // 4. Encode local pitches
  for (let i = 0; i < chords.length; i++) {
    const { timeShift, midiNumbers } = chords[i];
    midiNumbers?.forEach((midiNumber) => {
      referToNote(midiNumber);
    });

    result.pattern.push(timeShift);
  }

  return result;
};

type DictionaryEntry = {
  src: string[];
  dest: string;
};

const BPE_DICTIONARY: DictionaryEntry[] = [
  {
    src: [
      "t_0.00",
      "ts_0.50",
      "ts_0.50",
      "ts_0.50",
      "ts_0.50",
      "ts_0.50",
      "ts_0.50",
      "ts_0.50",
    ],
    dest: "8x_ts_0.5",
  },
  { src: ["ts_0.25", "ts_0.25", "ts_0.25", "ts_0.25"], dest: "4x_ts_0.25" },
  {
    src: [
      "t_0.00",
      "4x_ts_0.25",
      "4x_ts_0.25",
      "4x_ts_0.25",
      "ts_0.25",
      "ts_0.25",
      "ts_0.25",
    ],
    dest: "16x_ts_0.25",
  },
  { src: ["t_0.00", "ts_1.00", "ts_1.00", "ts_1.00"], dest: "4x_ts_1" },
  { src: ["ts_0.50", "ts_0.50", "ts_0.50", "ts_0.50"], dest: "4x_ts_0.5" },
  { src: ["ts_0.50", "ts_1.00", "ts_1.00", "ts_1.00"], dest: "1-2-2-2" },
];

const BPE = (tokens: string[]): string[] => {
  let madeReplacement: boolean;

  do {
    madeReplacement = false;

    for (const entry of BPE_DICTIONARY) {
      const { src, dest } = entry;
      const index = findSubsequenceIndex(tokens, src);

      if (index !== -1) {
        tokens.splice(index, src.length, dest);
        madeReplacement = true;
        break; // Restart the search after each replacement
      }
    }
  } while (madeReplacement);

  return tokens;
};

function findSubsequenceIndex(tokens: string[], subsequence: string[]): number {
  for (let i = 0; i <= tokens.length - subsequence.length; i++) {
    let match = true;
    for (let j = 0; j < subsequence.length; j++) {
      if (tokens[i + j] !== subsequence[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return i;
    }
  }
  return -1;
}

const findTranspositionDelta = (cell1: Cell, cell2: Cell): number | null => {
  if (
    cell1.length !== cell2.length ||
    cell1.length == 0 ||
    cell2.length == 0 ||
    cell1[0].isDrum !== cell2[0].isDrum ||
    cell1[0].onset !== cell2[0].onset
  ) {
    return null;
  }

  const delta = cell2[0].midiNumber - cell1[0].midiNumber;

  for (let i = 0; i < cell1.length; i++) {
    const note1 = cell1[i];
    const note2 = cell2[i];

    if (
      note2.midiNumber - note1.midiNumber !== delta ||
      note1.onset !== note2.onset
    ) {
      return null;
    }
  }

  return delta;
};

const areMidiNumbersEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((val, index) => val === b[index]);

const areTokenArraysEqual = (
  a: string[] | undefined,
  b: string[] | undefined,
): boolean =>
  (a == undefined && b == undefined) ||
  (a != undefined &&
    b != undefined &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]));

const possiblyFindDoubling = (bottomCells: Cell[], cell: Cell) => {
  if (bottomCells.length === 0 || cell.length === 0) {
    return null;
  }

  for (let i = bottomCells.length - 1; i >= 0; i--) {
    const delta = findTranspositionDelta(bottomCells[i], cell);
    if (delta !== null) {
      return [
        delta === 0
          ? `dbl_${bottomCells.length - i}`
          : `dbl_tr_${bottomCells.length - i}_${delta}`,
      ];
    }
  }

  return null;
};

const countTokens = (_3d) => {
  let sum = 0;
  for (let i = 0; i < _3d.length; ++i) {
    for (let j = 0; j < _3d[i].length; ++j) {
      sum += _3d[i][j].length;
    }
  }
  return sum;
};

const convertCellsToIR = (cells: Cell[][], bassVoiceIndex): IR =>
  cells.map((voice, voiceIndex) =>
    voice.map((cell, measureIndex) =>
      convertCellToIR(
        cell,
        voiceIndex !== bassVoiceIndex
          ? cells[bassVoiceIndex][measureIndex]
          : null,
        cells[voiceIndex][measureIndex - 1],
      ),
    ),
  );

const irToTokens = (cell: CellIR): Token[] => {
  if (cell === null) {
    return [];
  }
  if ("bagOfNotes" in cell) {
    return [...cell.bagOfNotes, ...cell.pattern];
  }
  return Object.entries(cell).flatMap(([drum, onsets]) => [
    `drum_${drum}`,
    ...onsets.map((onset) => `t_${onset}`),
  ]);
};

const findLongestRepetition = (voice: TonalCellIR[], rightStart: number) => {
  let longestBagOfNotesStartDelta = -1,
    longestBagOfNotesLength = 0,
    longestPatternStartDelta = -1,
    longestPatternLength = 0,
    longestTotalStartDelta = -1,
    longestTotalLength = 0;
  for (let leftStart = 0; leftStart < rightStart; ++leftStart) {
    let bagOfNotesLength = 0;
    while (
      leftStart + bagOfNotesLength < rightStart &&
      rightStart + bagOfNotesLength < voice.length &&
      areTokenArraysEqual(
        voice[leftStart + bagOfNotesLength]?.bagOfNotes,
        voice[rightStart + bagOfNotesLength]?.bagOfNotes,
      )
    ) {
      bagOfNotesLength++;
    }
    if (bagOfNotesLength > longestBagOfNotesLength) {
      longestBagOfNotesLength = bagOfNotesLength;
      longestBagOfNotesStartDelta = rightStart - leftStart;
    }

    let patternLength = 0;
    while (
      leftStart + patternLength < rightStart &&
      rightStart + patternLength < voice.length &&
      areTokenArraysEqual(
        voice[leftStart + patternLength]?.pattern,
        voice[rightStart + patternLength]?.pattern,
      )
    ) {
      patternLength++;
    }
    if (patternLength > longestPatternLength) {
      longestPatternLength = patternLength;
      longestPatternStartDelta = rightStart - leftStart;
    }

    let totalLength = 0;
    while (
      leftStart + totalLength < rightStart &&
      rightStart + totalLength < voice.length &&
      areTokenArraysEqual(
        voice[leftStart + totalLength]?.bagOfNotes,
        voice[rightStart + totalLength]?.bagOfNotes,
      ) &&
      areTokenArraysEqual(
        voice[leftStart + totalLength]?.pattern,
        voice[rightStart + totalLength]?.pattern,
      )
    ) {
      totalLength++;
    }
    if (totalLength > longestTotalLength) {
      longestTotalLength = totalLength;
      longestTotalStartDelta = rightStart - leftStart;
    }
  }

  return {
    longestBagOfNotesStartDelta,
    longestBagOfNotesLength,
    longestPatternStartDelta,
    longestPatternLength,
    longestTotalStartDelta,
    longestTotalLength,
  };
};

const findDrumRepetitions = (
  voice: DrumCellIR[],
  rightStart: number,
  coveredDrums: Set<string>,
): { tokens: string[]; newCoverage: { [drum: number]: number } } => {
  const cell = voice[rightStart];
  const longestStartDelta = Object.fromEntries(
    Object.keys(cell).map((drum) => [drum, -1]),
  );
  const longestLength = Object.fromEntries(
    Object.keys(cell).map((drum) => [drum, 0]),
  );
  for (const drum in cell) {
    if (coveredDrums.has(drum)) {
      continue;
    }
    for (let leftStart = 0; leftStart < rightStart; ++leftStart) {
      if (!voice[leftStart] || !(drum in voice[leftStart])) {
        continue;
      }

      let length = 0;
      while (
        leftStart + length < rightStart &&
        rightStart + length < voice.length &&
        areTokenArraysEqual(
          voice[leftStart + length]?.[drum],
          voice[rightStart + length]?.[drum],
        )
      ) {
        length++;
      }
      if (length > longestLength[drum]) {
        longestStartDelta[drum] = rightStart - leftStart;
        longestLength[drum] = length;
      }
    }
  }
  const tokens: string[] = [];

  for (const drum in cell) {
    if (coveredDrums.has(drum)) {
      continue;
    }
    if (longestLength[drum] > 0) {
      tokens.push(
        `drep_${drum}_D${longestStartDelta[drum]}_L${longestLength[drum]}`,
      );
    } else {
      tokens.push(`drum_${drum}`, ...cell[drum].map((t) => `t_${t}`));
    }
  }
  const newCoverage = Object.fromEntries(
    Object.entries(longestLength).filter(([drum, length]) => length > 0),
  );

  // TODO: don't repeat drums that are covered by declarations before
  return { tokens, newCoverage };
};

const findRepetitions = (ir: IR, voiceOrder: number[]): GridOfTokens => {
  // per-voice arrays
  const rightmostCoveredBagOfNotes = Array.from(
    { length: ir.length },
    () => -1,
  );
  const rightmostCoveredPattern = Array.from({ length: ir.length }, () => -1);

  const result = Array.from({ length: ir.length }, () =>
    Array.from({ length: ir[0].length }, () => []),
  );
  const drumCoverage: { [drum: number]: number } = {};
  for (let measureIndex = 0; measureIndex < ir[0].length; measureIndex++) {
    for (const voiceIndex of voiceOrder) {
      const cell = ir[voiceIndex][measureIndex];
      if (cell === null) {
        continue;
      }

      if ("bagOfNotes" in cell) {
        // cell.bagOfNotes.length == 0 happens in bass in mm.2-...
        let isBagOfNotesCovered =
          rightmostCoveredBagOfNotes[voiceIndex] >= measureIndex ||
          cell.bagOfNotes.length == 0;
        let isPatternCovered =
          rightmostCoveredPattern[voiceIndex] >= measureIndex;
        if (isBagOfNotesCovered && isPatternCovered) {
          continue;
        }
        let bagOfNotes = isBagOfNotesCovered ? [] : cell.bagOfNotes;
        let pattern = isPatternCovered ? [] : cell.pattern;

        const {
          longestBagOfNotesStartDelta,
          longestBagOfNotesLength,
          longestPatternStartDelta,
          longestPatternLength,
          longestTotalStartDelta,
          longestTotalLength,
        } = findLongestRepetition(
          ir[voiceIndex] as TonalCellIR[],
          measureIndex,
        );

        if (
          longestTotalLength >= 2 &&
          !isBagOfNotesCovered &&
          !isPatternCovered
        ) {
          result[voiceIndex][measureIndex] = [
            `repeat_D${longestTotalStartDelta}_L${longestTotalLength}`,
          ];
          rightmostCoveredBagOfNotes[voiceIndex] =
            measureIndex + longestTotalLength - 1;
          rightmostCoveredPattern[voiceIndex] =
            measureIndex + longestTotalLength - 1;
          continue;
        }

        if (!isBagOfNotesCovered && longestBagOfNotesLength > 0) {
          bagOfNotes = [
            `harmony_D${longestBagOfNotesStartDelta}_L${longestBagOfNotesLength}`,
          ];
          isBagOfNotesCovered = true;
          rightmostCoveredBagOfNotes[voiceIndex] =
            measureIndex + longestBagOfNotesLength - 1;
        }

        if (!isPatternCovered && longestPatternLength > 0) {
          pattern = [
            `pattern_D${longestPatternStartDelta}_L${longestPatternLength}`,
          ];
          isPatternCovered = true;
          rightmostCoveredPattern[voiceIndex] =
            measureIndex + longestPatternLength - 1;
        }

        result[voiceIndex][measureIndex] = [...bagOfNotes, ...pattern];

        continue;
      }

      const voice = ir[voiceIndex] as DrumCellIR[];
      for (const drum in drumCoverage) {
        if (drumCoverage[drum] < measureIndex) {
          delete drumCoverage[drum];
        }
      }
      const { tokens, newCoverage } = findDrumRepetitions(
        voice,
        measureIndex,
        new Set(Object.keys(drumCoverage)),
      );
      for (const drum in newCoverage) {
        drumCoverage[drum] = measureIndex + newCoverage[drum] - 1;
      }
      result[voiceIndex][measureIndex] = tokens;
    }
  }
  return result;
};

export const tokenize = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): GridOfTokens => {
  const cells = splitNotesIntoCells(notes, measuresAndBeats);

  const voiceOrder = notes
    .map((voice, voiceIndex) => ({
      average: getAverageMidiNumber(voice),
      voiceIndex,
    }))
    .sort((a, b) => b.average - a.average)
    .map(({ voiceIndex }) => voiceIndex);

  const bassVoiceIndex = voiceOrder.at(-2) ?? 0;

  const ir = convertCellsToIR(cells, bassVoiceIndex);
  const gridOfTokens = findRepetitions(ir, voiceOrder);

  console.log(
    "RAW ONSET COUNT:",
    notes.flatMap((voice) => voice.length).reduce((a, v) => a + v, 0) * 2,
  ); // * 2 because every cell has pitch and time

  console.log("AFTER SECOND PASS:", countTokens(gridOfTokens));
  return gridOfTokens;
};
