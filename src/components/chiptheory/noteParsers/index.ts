import { SecondsSpan } from "../Chiptheory";
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

export type NotesInNesChannels = {
  t: Note[];
  p1: Note[];
  p2: Note[];
  n: Note[];
};

export const parseNotes = ({ type, data }): NotesInNesChannels => {
  if (type === "nes") {
    return parseNES(data);
  }
  if (type === "midi") {
    return parseMIDI(data);
  }
  return { t: [], p1: [], p2: [], n: [] };
};
