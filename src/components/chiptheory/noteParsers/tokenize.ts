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
export type Cell = CellNote[];

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
  lowerCells: Cell[],
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
  }

  const result = { bagOfNotes: [], pattern: [] };

  // 1. First, we encode all notes that will be used inside these bars (a bag of words)
  // 2. Second, we encode their patterns of usage.

  const bagOfMidiNumbers = [
    ...new Set(cell.map((note) => note.midiNumber)),
  ].sort((a, b) => a - b);

  let pivot = null;

  const bass = lowerCells.filter(
    (cell) => cell.length > 0 && !cell[0].isDrum,
  )?.[0]?.[0]?.midiNumber;

  const relateToLowestVoice = bass > 0;
  let numNotesToSkip = 0;
  let previousRelativeNote = null;

  if (relateToLowestVoice) {
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
      pivot = cell[0].midiNumber;
      result.bagOfNotes.push(
        `crel_${cell[0].midiNumber - previousCell.at(-1).midiNumber}`,
      );
    } else {
      pivot = cell[0].midiNumber;
      result.bagOfNotes.push(`abs_${pivot}`);
    }
  }

  const referToNote = (midiNumber: number): void => {
    if (numNotesToSkip) {
      numNotesToSkip--;
    } else {
      if (relateToLowestVoice) {
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

const countTokens = (_3d) => {
  let sum = 0;
  for (let i = 0; i < _3d.length; ++i) {
    for (let j = 0; j < _3d[i].length; ++j) {
      sum += _3d[i][j].length;
    }
  }
  return sum;
};

const convertCellsToIR = (cells: Cell[][], voiceOrder: number[]): IR =>
  cells.map((voice, voiceIndex) =>
    voice.map((cell, measureIndex) =>
      convertCellToIR(
        cell,
        voiceOrder
          .slice(0, voiceOrder.indexOf(voiceIndex))
          .map((lowerVoice) => cells[lowerVoice][measureIndex]),
        cells[voiceIndex][measureIndex - 1],
      ),
    ),
  );

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

// I'm not sure that doubling should be made on IR and not on low-level Cells
//
// const findLongestDoubling = (
//   voice: TonalCellIR[],
//   ir: IR,
//   lowerVoiceOrder: number[],
//   measureIndex,
// ) => {
//   let longestDoublingLength = 0;
//   let voiceOfLongestDoubling = -1;

//   for (const lowerVoiceIndex of lowerVoiceOrder) {
//     const lowerVoice = ir[lowerVoiceIndex];
//     if (lowerVoice[measureIndex] == null || lowerVoice ) let length = 0;
//     const i = measureIndex + length;
//     while (
//       i < voice.length &&
//       voice[i] != null &&
//       lowerVoice[i] != null &&
//       !lowerVoice[i][0].isDrum &&
//       areTokenArraysEqual(voice[i].bagOfNotes, lowerVoice[i].bagOfNotes) &&
//       areTokenArraysEqual(voice[i].pattern, lowerVoice[i].pattern)
//     ) {
//       length++;
//     }
//     if (length > longestDoublingLength) {
//       voiceOfLongestDoubling = lowerVoice;
//     }
//   }
// };

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

const areCellsEqual = (a: Cell, b: Cell): boolean =>
  a.length === b.length &&
  a.every(
    (val, index) =>
      val.midiNumber === b[index].midiNumber && val.onset === b[index].onset,
  );

const findRepetitions = (
  ir: IR,
  voiceOrder: number[],
  cells: Cell[][],
): GridOfTokens => {
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

      let riffLength = 0;
      if (
        measureIndex > 0 &&
        rightmostCoveredBagOfNotes[voiceIndex] < measureIndex &&
        rightmostCoveredPattern[voiceIndex] < measureIndex &&
        "bagOfNotes" in cell
      ) {
        while (
          measureIndex + riffLength < ir[voiceIndex].length &&
          areCellsEqual(
            cells[voiceIndex][measureIndex - 1],
            cells[voiceIndex][measureIndex + riffLength],
          )
        ) {
          riffLength++;
        }
        if (riffLength > 0) {
          result[voiceIndex][measureIndex] = [`riff_D${riffLength}`];

          // TODO: start drum riff per single drum at the point of definition, not in the next cell
          if (cells[voiceIndex][measureIndex][0].isDrum) {
            Object.keys(cell).forEach(
              (drum) =>
                (drumCoverage[drum] = Math.max(
                  measureIndex + riffLength - 1,
                  drumCoverage[drum],
                )),
            );
          }
          rightmostCoveredBagOfNotes[voiceIndex] =
            measureIndex + riffLength - 1;
          rightmostCoveredPattern[voiceIndex] = measureIndex + riffLength - 1;

          continue;
        }
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

        // if (!isBagOfNotesCovered && !isPatternCovered) {
        //   const { doublingLength, doublingVoice } = findLongestDoubling(
        //     ir[voiceIndex] as TonalCellIR[],
        //     ir,
        //     voiceOrder.slice(0, voiceOrder.indexOf(voiceIndex)),
        //     measureIndex,
        //   );
        // }

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
    .sort((a, b) => a.average - b.average)
    .map(({ voiceIndex }) => voiceIndex);

  const ir = convertCellsToIR(cells, voiceOrder);
  const gridOfTokens = findRepetitions(ir, voiceOrder, cells);

  console.log(
    "RAW ONSET COUNT:",
    notes.flatMap((voice) => voice.length).reduce((a, v) => a + v, 0) * 2,
  ); // * 2 because every cell has pitch and time

  console.log("AFTER SECOND PASS:", countTokens(gridOfTokens));
  return gridOfTokens;
};
