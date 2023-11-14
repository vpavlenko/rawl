import { SecondsSpan } from "../Chiptheory";
import { MeasuresAndBeats } from "../measures";
import { parseMIDI } from "./midi";
import { parseNES } from "./nes";

export type Note = {
  note: {
    midiNumber: number;
    name: string;
  };
  span: SecondsSpan;
  chipState: any;
};

export type FileType = "nes" | "midi";

export type ChipStateDump = {
  type: FileType;
  data: any;
};

export type ParsingResult = {
  notes: Note[][];
  measuresAndBeats?: MeasuresAndBeats;
};

export const parseNotes = ({ type, data }: ChipStateDump): ParsingResult => {
  if (type === "nes") {
    return parseNES(data);
  }
  if (type === "midi") {
    return parseMIDI(data);
  }
};
