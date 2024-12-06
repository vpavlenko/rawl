import * as React from "react";
import ChordStairs, { Mode } from "./ChordStairs";

const FUNCTIONS: Mode[] = [
  {
    title: "S1",
    chords: ["V7/vi", "vi"],
  },
  {
    title: "S2",
    chords: ["V7/vi", "V7/ii", "ii", "io7"],
  },
  {
    title: "S3",
    chords: ["V7/IV", "IV", "iv", "io7"],
  },
  {
    title: "S4",
    chords: ["io7"],
  },
  { title: "K", chords: ["I6", "Cad64"] },
  {
    title: "D1",
    chords: ["V7/ii", "V7/V", "V7"],
  },
  {
    title: "D2",
    chords: ["vi", "V7/V", "V7"],
  },
  {
    title: "D3",
    chords: ["V7/ii", "ii", "V7"],
  },
  {
    title: "T",
    chords: ["IPAC"],
  },
];

const Pirate = () => {
  return (
    <div>
      <div>Cadences in Scott Joplin: SKDT</div>
      <div>
        {FUNCTIONS.map((f) => (
          <ChordStairs mode={f} />
        ))}
      </div>
    </div>
  );
};

export default Pirate;
