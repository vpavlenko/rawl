import { Note, NotesInVoices } from ".";
import { MeasuresAndBeats } from "../measures";

// All onsets should be rounded up.

const MAX_NUM_MEASURES_TO_TOKENIZE = 100;
const EPSILON = 1e-6;

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
          (time - beats[i]) / (beats[i + 1] - beats[i]) +
          EPSILON
        ).toFixed(3),
      };
    })
    .sort((i, j) =>
      i.onset !== j.onset
        ? parseFloat(i.onset) - parseFloat(j.onset)
        : i.midiNumber - j.midiNumber,
    );

// A cell is measure+channel. Eg. m.20 ch.3.
// A tokenization is valid if it can be expanded back into the original
// array of notesInCells
const splitNotesIntoCells = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): Cell[][] => {
  const result = [];
  const { measures, beats } = measuresAndBeats;

  for (
    let m = 0;
    m < Math.min(MAX_NUM_MEASURES_TO_TOKENIZE, measures.length);
    ++m
  ) {
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
          notes[ch].filter(
            (note) =>
              note.span[0] + EPSILON >= measureStart &&
              note.span[0] + EPSILON < measureEnd,
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
    // TODO: Drum encoding is different:
    // every drum is encoded separately (horizontally)
    cell.forEach(({ midiNumber, isDrum, onset }) =>
      result.push(`${midiNumber}_${isDrum ? "drum_" : ""}_${onset}`),
    );
  } else {
    // 1. Gather notes into chords
    const chords = [
      {
        onset: cell[0].onset,
        midiNumbers: [cell[0].midiNumber],
        timeShift: cell[0].onset,
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
      chords[i].timeShift = (
        parseFloat(chords[i].onset) - parseFloat(chords[i - 1].onset)
      ).toFixed(3);
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

      result.push(`ts_${timeShift}`);
    }
  }
  return result;
};

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

const possiblyFindCopy = (previousCells: Cell[], cell: Cell) => {
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
  console.log("RAW ONSET COUNT:", countTokens(measures));
  const withRepeats = measures.map((measure, measureIndex) =>
    measure.map(
      (cell, channelIndex) =>
        possiblyFindCopy(
          measures
            .map((measure) => measure[channelIndex])
            .slice(0, measureIndex),
          cell,
        ) || encodeCell(cell),
    ),
  );

  console.log("WITH REPEATS TOKENIZED:", countTokens(withRepeats));
  return withRepeats;
};
