import { createGlobalStyle } from "styled-components";

// The shared Rawl pitch palette, text contrast, and distinguishing dots.
export const RAWL_COLORS = [
  { background: "white", foreground: "black" },
  { background: "#820000", foreground: "white", dot: { color: "white", size: 1 } },
  { background: "red", foreground: "black" },
  { background: "#007000", foreground: "white" },
  { background: "#00fb47", foreground: "black" },
  { background: "#9500b3", foreground: "white" },
  { background: "#ea7eff", foreground: "black", dot: { color: "black", size: 2 } },
  { background: "#787878", foreground: "black" },
  { background: "#0000ff", foreground: "white" },
  { background: "#03b9d5", foreground: "black" },
  { background: "#ff7328", foreground: "white" },
  { background: "#ffff00", foreground: "black" },
];

export const pitchColor = (pitch: number) =>
  `var(--pitch-color-${((pitch % 12) + 12) % 12})`;

export const noteColorClass = (pitch: number | "default" | "drum") =>
  `noteColor_${pitch}_colors`;

export const noteLetterColors = (prefix = "") =>
  RAWL_COLORS.map(({ foreground }, pitch) => `
    ${prefix}.${noteColorClass(pitch)} {
      color: ${foreground} !important;
      background-color: ${pitchColor(pitch)} !important;
      --background-color: ${pitchColor(pitch)};
    }
  `).join("\n");

export const RawlColorStyles = createGlobalStyle`
  :root {
    ${RAWL_COLORS.map(({ background }, pitch) =>
      `--pitch-color-${pitch}: ${background};`,
    ).join("\n")}
  }

  .noteColor_default, .noteColor_default_colors {
    background-color: ${pitchColor(0)};
  }

  ${RAWL_COLORS.map(({ dot }, pitch) => `
    .${noteColorClass(pitch)} {
      background-color: ${pitchColor(pitch)} !important;
    }
    ${dot ? `
      .${noteColorClass(pitch)}::after {
        content: "";
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${dot.size}px;
        height: ${dot.size}px;
        background-color: ${dot.color} !important;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
    ` : ""}
  `).join("\n")}
`;
