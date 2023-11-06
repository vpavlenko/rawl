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

export type ChipStateDump = {
  type: "nes" | "midi";
  data: any;
};

export const parseNotes = ({ type, data }: ChipStateDump): Note[][] => {
  if (type === "nes") {
    return parseNES(data);
  }
  if (type === "midi") {
    return parseMIDI(data);
  }
  return [];
};
