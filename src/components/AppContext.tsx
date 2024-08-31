import React from "react";
import { VoiceMask } from "./App";
import { Analyses, Analysis } from "./rawl/analysis";
import { ParsingResult } from "./rawl/parseMidi";

export type RawlProps = {
  parsingResult: ParsingResult | null;
  getCurrentPositionMs: () => number;
  savedAnalysis: Analysis | undefined;
  saveAnalysis: (analysis: Analysis) => void;
  voiceNames: string[];
  voiceMask: VoiceMask;
  setVoiceMask: (mask: VoiceMask) => void;
  showAnalysisBox: boolean;
  seek: (ms: number) => void;
  artist: string;
  song: string;
  latencyCorrectionMs: number;
  registerKeyboardHandler: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (id: string) => void;
  sourceUrl: string | null;
};

export const AppContext = React.createContext<{
  handleSongClick: (url: string) => void;
  rawlProps: RawlProps | null;
  analyses: Analyses;
  saveAnalysis: (analysis: Analysis) => void;
}>({
  handleSongClick: () => {},
  rawlProps: null,
  analyses: {},
  saveAnalysis: () => {},
});
