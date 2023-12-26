import { Note, ParsingResult } from ".";
import {
  NES_APU_NOTE_ESTIMATIONS,
  PAUSE,
  nesApuNoteEstimation,
} from "./nesApuNoteEstimations";

export const RESOLUTION_DUMPS_PER_SECOND = 100;
const RESOLUTION_MS = 1 / RESOLUTION_DUMPS_PER_SECOND;

type OscType = "pulse" | "triangle" | "noise";

function findNoteWithClosestPeriod(
  period: number,
  oscType: OscType,
): nesApuNoteEstimation {
  if (period === -1) {
    return PAUSE;
  }
  if (oscType === "noise") {
    const noise = period % 4;
    return {
      name: `${noise}_`, // pause
      midiNumber: noise + 90,
      frequency: 0,
      pianoNumber: null,
      apuIndex: null,
      pulsePeriod: null,
      pulseFrequency: null,
      pulseTuningError: null,
      trianglePeriod: null,
      triangleFrequency: null,
      triangleTuningError: null,
    };
  }
  let closestNote: nesApuNoteEstimation | null = null;
  let smallestDifference = Infinity;

  for (const note of NES_APU_NOTE_ESTIMATIONS) {
    const currentPeriod =
      oscType === "pulse"
        ? Number(note.pulsePeriod)
        : Number(note.trianglePeriod);
    if (currentPeriod == null) continue;

    const diff = Math.abs(period - currentPeriod);

    if (diff < smallestDifference) {
      smallestDifference = diff;
      closestNote = note;
    }
  }

  return closestNote!;
}

let id = 0;

const calculateNotesFromPeriods = (periods, oscType) => {
  if (periods === undefined) return [];

  const notes: Note[] = [];
  let timeInSeconds = 0;

  for (const period of periods) {
    const newNoteEstimation = findNoteWithClosestPeriod(period, oscType);
    const lastNote = notes[notes.length - 1];
    if (
      notes.length === 0 ||
      lastNote.note.midiNumber !== newNoteEstimation.midiNumber
    ) {
      if (notes.length > 0) {
        lastNote.span[1] = timeInSeconds;
      }
      notes.push({
        note: {
          midiNumber: period === -1 ? -1 : newNoteEstimation.midiNumber,
          name: newNoteEstimation.name,
        },
        isDrum: false,
        id,
        span: [timeInSeconds, 0],
        chipState: { period: period },
      });
      id++;
    }

    timeInSeconds += RESOLUTION_MS;
  }
  if (notes.length > 0) {
    notes[notes.length - 1].span[1] = timeInSeconds;
  }

  return notes.filter((note) => note.note.midiNumber !== -1);
};

export const parseNES = (data): ParsingResult => {
  return {
    notes: [
      calculateNotesFromPeriods(data.p1, "pulse"),
      calculateNotesFromPeriods(data.p2, "pulse"),
      calculateNotesFromPeriods(data.t, "triangle"),
      // calculateNotesFromPeriods(data.n, "noise"),
    ],
  };
};
