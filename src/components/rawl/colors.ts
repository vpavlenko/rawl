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

export const interpolatedPitchColor = (pitch: number) => {
  const lower = Math.floor(pitch);
  const fraction = pitch - lower;
  return fraction === 0 ? pitchColor(lower)
    : `color-mix(in srgb, ${pitchColor(lower)} ${(1 - fraction) * 100}%, ${pitchColor(lower + 1)})`;
};

// Contrast against the same sRGB interpolation used by note fills/gradients.
export const contrastingPitchColor = (pitch: number): "black" | "white" => {
  const rgb = (index: number) => {
    const color = RAWL_COLORS[((index % 12) + 12) % 12].background;
    const hex = color === "white" ? "ffffff" : color === "red" ? "ff0000" : color.slice(1);
    return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
  };
  const lower = Math.floor(pitch);
  const fraction = pitch - lower;
  const from = rgb(lower);
  const to = rgb(lower + 1);
  const linear = from.map((channel, index) => {
    const mixed = channel * (1 - fraction) + to[index] * fraction;
    return mixed <= 0.04045 ? mixed / 12.92 : ((mixed + 0.055) / 1.055) ** 2.4;
  });
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return luminance > 0.179 ? "black" : "white";
};

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
