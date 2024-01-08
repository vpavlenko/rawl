import { SecondsSpan } from "../Chiptheory";
import { MeasuresAndBeats } from "../SystemLayout";
import { parseMIDI } from "./midi";

export type Note = {
  note: {
    midiNumber: number;
    name: string;
  };
  isDrum: boolean;
  id: number;
  span: SecondsSpan;
  chipState: any;
};

export type NotesInVoices = Note[][];

export type ChipStateDump = {
  data: any;
};

export type ParsingResult = {
  notes: NotesInVoices;
  measuresAndBeats?: MeasuresAndBeats;
};

export const parseNotes = ({ data }: ChipStateDump): ParsingResult =>
  parseMIDI(data);
