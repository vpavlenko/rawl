export const TWELVE_TONE_COLORS = [
  "red",
  "maroon",
  "#ff60a0",
  "#fffd37",
  "#00ff59",
  "#00d5ff",
  "gray",
  "blue",
  "#ff7000",
  "#007000",
  "#9c5c02",
  "#a000ff",
];

const DARK_COLORS = [
  TWELVE_TONE_COLORS[0],
  TWELVE_TONE_COLORS[1],
  TWELVE_TONE_COLORS[6],
  TWELVE_TONE_COLORS[7],
  TWELVE_TONE_COLORS[8],
  TWELVE_TONE_COLORS[9],
  TWELVE_TONE_COLORS[10],
  TWELVE_TONE_COLORS[11],
];

export const getTextColorForBackground = (color) =>
  DARK_COLORS.indexOf(color) === -1 ? "black" : "white";
