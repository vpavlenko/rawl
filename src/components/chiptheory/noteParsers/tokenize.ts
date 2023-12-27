import { Note, NotesInVoices } from ".";
import { MeasuresAndBeats } from "../measures";

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

const encodeCell = (cell: Cell): string[] => {
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

    // 4. Encode relative pitches
    let lastReferencePitch = chords[0].midiNumbers[0];
    result.push(`abs_${lastReferencePitch}`);
    for (let i = 0; i < chords.length; i++) {
      const { timeShift, midiNumbers } = chords[i];
      if (midiNumbers !== null) {
        let localReference = lastReferencePitch;
        midiNumbers.slice(i === 0 ? 1 : 0).forEach((midiNumber) => {
          result.push(`rel_${midiNumber - localReference}`);
          localReference = midiNumber;
        });

        lastReferencePitch = midiNumbers[0];
      }

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

const areCellsEqual = (cell1: Cell, cell2: Cell): boolean => {
  if (cell1.length !== cell2.length) {
    return false;
  }

  for (let i = 0; i < cell1.length; i++) {
    const note1 = cell1[i];
    const note2 = cell2[i];

    if (
      note1.midiNumber !== note2.midiNumber ||
      note1.isDrum !== note2.isDrum ||
      Math.abs(parseFloat(note1.onset) - parseFloat(note2.onset)) > EPSILON
    ) {
      return false;
    }
  }

  return true;
};

const areMidiNumbersEqual = (a: number[], b: number[]): boolean =>
  a.length === b.length && a.every((val, index) => val === b[index]);

const possiblyFindRepeat = (previousCells: Cell[], cell: Cell) => {
  if (previousCells.length === 0 || cell.length === 0) {
    return null;
  }

  for (let i = previousCells.length - 1; i >= 0; i--) {
    if (areCellsEqual(previousCells[i], cell)) {
      return [`repeat_${previousCells.length - i}`];
    }
  }

  return null;
};

const possiblyFindDoubling = (bottomCells: Cell[], cell: Cell) => {
  if (bottomCells.length === 0 || cell.length === 0) {
    return null;
  }

  for (let i = bottomCells.length - 1; i >= 0; i--) {
    if (areCellsEqual(bottomCells[i], cell)) {
      return [`doubling_${bottomCells.length - i}`];
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

export const tokenize = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): Tokens => {
  const measures = splitNotesIntoCells(notes, measuresAndBeats);

  // TODO: design cool strategies like encode repeated cells
  console.log("RAW ONSET COUNT:", countTokens(measures) * 2); // * 2 because every cell has pitch and time
  const withRepeats = measures.map((measure, measureIndex) =>
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
        BPE(encodeCell(cell)),
    ),
  );

  // TODO: refactor into a two-stage pipeline. First we process each channel separately, then we process all measures together

  // TODO: implement "repeat_rhythm" for repeated strumming as a trailing sequence of t_ and ts_.
  // TODO: implement "transpose" for total measure repetition from another abs_
  // TODO: implement "double" for doubling of another track in the same measure
  // TODO: implement "repeat_drum" for repeated pattern of a single drum from a previous measure
  // TODO: if last chord is repeated across the bar, don't repeat the notes

  // brainstorm: maybe hi-hats should be a single "instrument" for the purpose of time-shifts idk

  console.log("WITH REPEATS TOKENIZED:", countTokens(withRepeats));
  return withRepeats;
};
