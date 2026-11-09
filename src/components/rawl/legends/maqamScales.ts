// Inside Arabic Music (Farraj / Abu Shumays, 2019), chapters 14 and 24.
// Half semitones encode symbolic quarter-tone notation, not measured intonation.
export type MaqamScale = {
  name: string;
  tonic: number;
  lower: number[];
  // Optional practical subset; the original lower array remains source evidence.
  practicalLower?: number[];
  jins: number[];
  scale: number[];
  // Chapter 14 normal-size notes, starting at the tonic; remaining jins notes
  // are small auxiliary notes. Saba's six notes preserve its overlapping Hijaz.
  coreLength: number;
  // Chapter 14 normal-size open notes, relative to the tonic. Saba has two:
  // the melodic emphasis on degree 3 and modulation point on degree 6.
  ghammaz: number[];
  // Source figure bracket spans, inclusive sequence indices. These preserve
  // visual partitions; a shared jins endpoint can start the next bracket.
  scaleGroups: { label: string; start: number; end: number; row?: number }[];
  // Notehead positions in the cropped chapter 14 figure, as percentages.
  noteX: number[];
  figures: [string, string, string];
  pages: [number, number, number];
  // Source crop proportions reserve space before lazy images load.
  sayrSize: [number, number];
  alternateSource?: { name: string; figure: string; page: number };
};

export const MAQAM_SCALES: MaqamScale[] = [
  {
    name: "Ajam",
    sayrSize: [800, 351],
    tonic: 0,
    lower: [-3, -1],
    jins: [0, 2, 4, 5, 7, 9],
    scale: [0, 2, 4, 5, 7, 9, 11, 12, 10, 9, 7],
    coreLength: 5,
    ghammaz: [7],
    scaleGroups: [
      { label: "Ajam 1", start: 0, end: 3 },
      { label: "Upper Ajam 5/8", start: 4, end: 7 },
      { label: "Nahawand 5", start: 8, end: 10 },
    ],
    noteX: [9.5, 21.6, 33.5, 45.5, 56.5, 67.5, 80, 91],
    figures: ["14.7", "24.57", "24.58"],
    pages: [213, 405, 405],
  },
  {
    name: "Hijaz",
    sayrSize: [786, 293],
    tonic: 2,
    lower: [-3.5, -2],
    jins: [0, 1, 4, 5, 7, 8],
    scale: [0, 1, 4, 5, 7, 8, 10, 12, 5, 7, 8.5, 10, 12],
    coreLength: 4,
    ghammaz: [5],
    scaleGroups: [
      { label: "Hijaz 1", start: 0, end: 2 },
      { label: "Nahawand 4", start: 3, end: 7 },
      { label: "Rast 4", start: 8, end: 12 },
    ],
    noteX: [12, 23, 35.7, 47, 58, 70, 80.5, 91],
    figures: ["14.12", "24.33", "24.34"],
    pages: [217, 393, 394],
  },
  {
    name: "Nikriz",
    sayrSize: [780, 500],
    tonic: 0,
    lower: [-2, -1],
    jins: [0, 2, 3, 6, 7, 8, 9, 10],
    // Figure 24.45 is printed descending; normalize to this page's ascending order.
    scale: [0, 2, 3, 6, 7, 9, 10, 12],
    coreLength: 5,
    ghammaz: [7],
    scaleGroups: [
      { label: "Nikriz 1", start: 0, end: 4 },
      { label: "Nahawand 5", start: 4, end: 7 },
    ],
    noteX: [7.3, 17.8, 29.8, 40.4, 51, 61.6, 72.5, 83.5, 88, 94.3],
    figures: ["14.5", "24.45", "24.46"],
    pages: [211, 399, 400],
  },
  {
    name: "Nahawand",
    sayrSize: [775, 401],
    tonic: 0,
    lower: [-4, -3, -1],
    jins: [0, 2, 3, 5, 7, 8],
    scale: [0, 2, 3, 5, 7, 8, 11, 12, 10, 8, 7],
    coreLength: 5,
    ghammaz: [7],
    scaleGroups: [
      { label: "Nahawand 1", start: 0, end: 3 },
      { label: "Hijaz 5", start: 4, end: 7 },
      { label: "Kurd 5", start: 8, end: 10 },
    ],
    noteX: [10, 16, 23.3, 35.2, 46, 58, 69, 81, 92],
    figures: ["14.3", "24.39", "24.40"],
    pages: [209, 397, 397],
  },
  {
    name: "Kurd",
    sayrSize: [785, 315],
    tonic: 2,
    lower: [-2],
    jins: [0, 1, 3, 5, 7, 8],
    scale: [0, 1, 3, 5, 7, 8, 10, 12],
    coreLength: 4,
    ghammaz: [5],
    scaleGroups: [
      { label: "Kurd 1", start: 0, end: 2 },
      { label: "Nahawand 4", start: 3, end: 7 },
    ],
    noteX: [10, 23.5, 36, 49.5, 64, 77, 90],
    figures: ["14.14", "24.51", "24.52"],
    pages: [219, 402, 402],
  },
  {
    name: "Rast",
    sayrSize: [775, 490],
    tonic: 0,
    lower: [-3, -1.5],
    jins: [0, 2, 3.5, 5, 7, 8, 9],
    scale: [0, 2, 3.5, 5, 7, 9, 10.5, 12, 10, 9, 7],
    coreLength: 5,
    ghammaz: [7],
    scaleGroups: [
      { label: "Rast 1", start: 0, end: 3 },
      { label: "Upper Rast 5/8", start: 4, end: 7 },
      { label: "Nahawand 5", start: 8, end: 10 },
    ],
    noteX: [8, 19.5, 31.2, 42, 53.5, 64.5, 76, 86.5, 92],
    figures: ["14.1", "24.1", "24.2"],
    pages: [207, 379, 379],
  },
  {
    name: "Bayati",
    sayrSize: [785, 474],
    tonic: 2,
    lower: [-3.5, -2],
    jins: [0, 1.5, 3, 5, 7, 8],
    scale: [0, 1.5, 3, 5, 7, 8, 10, 12, 5, 7, 8.5, 10, 12],
    coreLength: 4,
    ghammaz: [5],
    scaleGroups: [
      { label: "Bayati 1", start: 0, end: 2 },
      { label: "Nahawand 4", start: 3, end: 7 },
      { label: "Rast 4", start: 8, end: 12 },
    ],
    noteX: [10, 23, 36, 47, 58, 70, 80.5, 91],
    figures: ["14.10", "24.15", "24.16"],
    pages: [215, 385, 386],
  },
  {
    name: "Saba",
    sayrSize: [776, 485],
    tonic: 2,
    lower: [-3.5, -2],
    jins: [0, 1.5, 3, 4, 7, 8],
    scale: [0, 1.5, 3, 4, 7, 8, 10, 11, 12, 14, 15],
    coreLength: 6,
    ghammaz: [3, 8],
    scaleGroups: [
      { label: "Saba 1", start: 0, end: 4 },
      { label: "Ajam 6", start: 5, end: 8 },
      { label: "Hijaz 3", start: 2, end: 5, row: 1 },
      { label: "Nikriz 6", start: 5, end: 10, row: 1 },
    ],
    noteX: [14.5, 26, 38, 48.5, 59.5, 70.5, 81, 92],
    figures: ["14.16", "24.63", "24.64"],
    pages: [221, 408, 408],
  },
  {
    name: "Huzzam",
    sayrSize: [780, 480],
    tonic: 3.5,
    lower: [-3.5, -1.5, -0.5],
    practicalLower: [-3.5, -1.5],
    jins: [0, 1.5, 3.5, 4.5],
    scale: [0, 1.5, 3.5, 4.5, 7.5, 8.5, 10.5, 12, 3.5, 5.5, 7, 8.5, 10.5, 12],
    coreLength: 3,
    ghammaz: [3.5],
    scaleGroups: [
      { label: "Sikah 1", start: 0, end: 1 },
      { label: "Hijaz 3", start: 2, end: 4 },
      { label: "Rast 6", start: 5, end: 7 },
      { label: "Upper Rast 3/6", start: 8, end: 11 },
      { label: "Rast 6", start: 12, end: 13 },
    ],
    noteX: [12, 24, 31.5, 45, 60, 76, 90],
    figures: ["14.18", "24.21", "24.22"],
    pages: [223, 388, 388],
    alternateSource: { name: "Sikah", figure: "24.23", page: 389 },
  },
];

export const MAQAM_REFERENCE_SCALES = [
  "Ajam", "Rast", "Hijaz", "Kurd", "Nikriz", "Nahawand", "Bayati", "Saba", "Huzzam",
].map((name) => MAQAM_SCALES.find((maqam) => maqam.name === name)!);

export const maqamFigure = (
  maqam: MaqamScale,
  kind: "jins" | "scale" | "sayr",
) => `/maqam-figures/${maqam.name.toLowerCase()}-${kind}.png`;
