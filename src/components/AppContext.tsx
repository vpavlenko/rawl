import React from "react";
import { VoiceMask } from "./App";
import { Analysis } from "./rawl/analysis";
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
  webUrl: string | null;
};

export const AppContext = React.createContext<{
  handleSongClick: (url: string) => void;
  rawlProps: RawlProps | null;
}>({
  handleSongClick: () => {},
  rawlProps: null,
});
