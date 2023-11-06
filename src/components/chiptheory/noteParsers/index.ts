import { SecondsSpan } from "../Chiptheory";
import { parseNES } from "./nes";

export type Note = {
  note: {
    midiNumber: number;
    name: string;
  };
  span: SecondsSpan;
  chipState: any;
};

export const parseNotes = ({ type, data }) => {
  if (type === "nes") {
    return parseNES(data);
  }
  return {};
};
