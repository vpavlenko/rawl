import { Note, NotesInVoices } from ".";
import { MeasuresAndBeats } from "../measures";
import { getAverageMidiNumber } from "../tags";

// All onsets should be rounded up.

const EPSILON = 1e-6;
const ONSET_PUSH_TO_RIGHT = 0.01; // onsets are shifted 10 ms to the right
const QUANTIZATION_LEVELS_INSIDE_BEAT = 8; // 3 * 4, allows to see swing and 16th, but not together

export type Token = string;
type CellOfTokens = Token[];
type MeasureOfTokens = CellOfTokens[];
export type ChannelOfTokens = CellOfTokens[];
export type Tokens = MeasureOfTokens[];

type CellNote = {
  midiNumber: number;
  isDrum: boolean;
  onset: string; // quantized, in relative coordinates, eg. 7/16
};

type Cell = CellNote[];

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

// A cell is measure+channel. Eg. m.20 ch.3.
// A tokenization is valid if it can be expanded back into the original
// array of notesInCells
const splitNotesIntoCells = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): Cell[][] => {
  const result = [];
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
    const newMeasure = [];
    for (let ch = 0; ch < notes.length; ++ch) {
      // TODO: maybe introduce epsilons
      newMeasure.push(
        convertNotesToCellNotes(
          // Caveat: on a very edge a note can get inside two adjacent measures.
          notes[ch].filter(
            (note) =>
              note.span[0] + ONSET_PUSH_TO_RIGHT >= measureStart &&
              note.span[0] + ONSET_PUSH_TO_RIGHT < measureEnd,
          ),
          [measureStart, ...beatsInMeasure, measureEnd],
        ),
      );
    }

    // TODO: check if this measure is an exact repetition of some previous one
    result.push(newMeasure);
  }
  return result;
};

const encodeCell = (cell: Cell, bassCell: Cell | null): string[] => {
  if (cell.length === 0) return [];

  const result = [];

  if (cell[0].isDrum) {
    const drums = {};
    cell.map(({ onset, midiNumber }) => {
      if (!drums[midiNumber]) {
        drums[midiNumber] = [onset];
      } else {
        drums[midiNumber].push(onset);
      }
    });

    Object.keys(drums)
      .sort()
      .forEach((drum) => {
        result.push(`drum_${drum}`);
        const onsets = drums[drum];
        result.push(`t_${onsets[0]}`);
        for (let i = 1; i < onsets.length; ++i) {
          result.push(toTimeShift(onsets[i - 1], onsets[i]));
        }
      });
  } else {
    // 1. First, we encode all notes that will be used inside these bars (a bag of words)
    // 2. Second, we encode their patterns of usage.

    const bagOfMidiNumbers = [
      ...new Set(cell.map((note) => note.midiNumber)),
    ].sort((a, b) => a - b);

    if (bassCell?.length > 0) {
      result.push(`brel_${bagOfMidiNumbers[0] - bassCell[0].midiNumber}`);
    } else {
      result.push(`abs_${bagOfMidiNumbers[0]}`);
    }

    for (let i = 1; i < bagOfMidiNumbers.length; ++i) {
      result.push(`rel_${bagOfMidiNumbers[i] - bagOfMidiNumbers[i - 1]}`);
    }

    const referToBagOfWords = (midiNumber: number): {} =>
      result.push(`n_${bagOfMidiNumbers.indexOf(midiNumber)}`);

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
        areMidiNumbersEqual(
          chords[lastChord].midiNumbers,
          chords[i].midiNumbers,
        )
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
        referToBagOfWords(midiNumber);
      });

      result.push(timeShift);
    }
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

const possiblyFindRepeat = (previousCells: Cell[], cell: Cell) => {
  if (previousCells.length === 0 || cell.length === 0) {
    return null;
  }

  for (let i = previousCells.length - 1; i >= 0; i--) {
    const delta = findTranspositionDelta(previousCells[i], cell);
    if (delta !== null) {
      return [
        delta === 0
          ? `repeat_${previousCells.length - i}`
          : `tr_${previousCells.length - i}_${delta}`,
      ];
    }
  }

  return null;
};

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

const wrapWithAffixes = (
  source: CellOfTokens,
  target: CellOfTokens,
  distance: number,
) => {
  let prefixLength = 0;
  while (
    prefixLength < source.length &&
    prefixLength < target.length &&
    source[prefixLength] === target[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;
  while (
    suffixLength < source.length &&
    suffixLength < target.length &&
    prefixLength + suffixLength < target.length &&
    source.at(-suffixLength - 1) === target.at(-suffixLength - 1)
  ) {
    suffixLength++;
  }

  let result = target;
  if (prefixLength >= 2) {
    result = [
      `prefix_${distance}_${prefixLength}`,
      ...result.slice(prefixLength),
    ];
  }
  if (suffixLength >= 2) {
    result = [
      ...result.slice(0, -suffixLength),
      `suffix_${distance}_${suffixLength}`,
    ];
  }
  return result;
};

const possiblyFindAffixes = (
  previousCellsOfTokens: ChannelOfTokens,
  cellOfTokens: CellOfTokens,
): CellOfTokens => {
  let shortestWrapping = cellOfTokens;

  for (let i = previousCellsOfTokens.length - 1; i >= 0; i--) {
    const wrapping = wrapWithAffixes(
      previousCellsOfTokens[i],
      cellOfTokens,
      previousCellsOfTokens.length - i,
    );
    if (wrapping.length < shortestWrapping.length) {
      shortestWrapping = wrapping;
    }
  }

  return shortestWrapping;
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

export const tokenize = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): Tokens => {
  const measures = splitNotesIntoCells(notes, measuresAndBeats);

  const bassChannel = notes
    .map((voice, voiceIndex) => ({
      average: getAverageMidiNumber(voice),
      voiceIndex,
    }))
    .sort((a, b) => b.average - a.average)
    .at(-2).voiceIndex;
  debugger;

  // TODO: design cool strategies like encode repeated cells
  console.log("RAW ONSET COUNT:", countTokens(measures) * 2); // * 2 because every cell has pitch and time
  let tokens = measures.map((measure, measureIndex) =>
    measure.map(
      (cell, channelIndex) =>
        possiblyFindRepeat(
          measures
            .map((measure) => measure[channelIndex])
            .slice(0, measureIndex),
          cell,
        ) ||
        possiblyFindDoubling(
          measures[measureIndex].slice(0, channelIndex),
          cell,
        ) ||
        BPE(
          encodeCell(
            cell,
            channelIndex !== bassChannel ? measure[bassChannel] : null,
          ),
        ),
    ),
  );

  tokens = tokens.map((measure, measureIndex) =>
    measure.map((cellOfTokens, channelIndex) =>
      possiblyFindAffixes(
        tokens.map((measure) => measure[channelIndex]).slice(0, measureIndex),
        cellOfTokens,
      ),
    ),
  );

  // brainstorm: maybe all three hi-hats (pedal/close/open) should be a single "instrument" for the purpose of time-shifts idk

  console.log("WITH REPEATS TOKENIZED:", countTokens(tokens));
  return tokens;
};
