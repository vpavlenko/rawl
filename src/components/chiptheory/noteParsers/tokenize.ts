import { Note, NotesInVoices } from ".";
import { MeasuresAndBeats } from "../measures";

// All onsets should be rounded up.

const MAX_NUM_MEASURES_TO_TOKENIZE = 12;
const EPSILON = 1e-6;

type Token = string;
type ChannelMeasureOfTokens = Token[];
type MeasureOfTokens = ChannelMeasureOfTokens[];
export type Tokens = MeasureOfTokens[];

type CellNote = {
  midiNumber: number;
  isDrum: boolean;
  onset: number; // quantized, in relative coordinates, eg. 7/16
};

type Cell = CellNote[];

const convertNotesToCellNotes = (notes: Note[], beats: number[]): CellNote[] =>
  notes.map((note) => {
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
      onset: i + (time - beats[i]) / (beats[i + 1] - beats[i]),
    };
  });

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
  return [];
};

export const tokenize = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
): Tokens => {
  const cells = splitNotesIntoCells(notes, measuresAndBeats);

  return [];
};
