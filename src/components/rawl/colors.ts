import { createGlobalStyle } from "styled-components";
import { modulationOnsetStyles, nativeColorStyles } from "librawl/native";
export { RAWL_COLORS, pitchColor, interpolatedPitchColor, noteColorClass, notePitchDotClass, noteLetterColors } from "librawl/native";

export const RawlColorStyles = createGlobalStyle`${nativeColorStyles()}${modulationOnsetStyles}`;
