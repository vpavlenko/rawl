import React from "react";
import { VoiceMask } from "./App";
import { Analyses, Analysis } from "./rawl/analysis";
import { ParsingResult } from "./rawl/parseMidi";

export type RawlProps = {
  parsingResult: ParsingResult | null;
  getCurrentPositionMs: () => number;
  savedAnalysis: Analysis | null;
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

export interface CurrentMidi {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string | null;
}

interface AppContextProps {
  handleSongClick: (url: string) => void;
  rawlProps: RawlProps | null;
  analyses: Analyses;
  saveAnalysis: (analysis: Analysis) => void;
  resetMidiPlayerState: () => void; // Add this line
  registerKeyboardHandler: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (id: string) => void;
  currentMidi: CurrentMidi | null;
  setCurrentMidi: (midi: CurrentMidi | null) => void;
}

export const AppContext = React.createContext<AppContextProps>({
  handleSongClick: () => {},
  rawlProps: null,
  analyses: {},
  saveAnalysis: () => {},
  resetMidiPlayerState: () => {}, // Add this line
  registerKeyboardHandler: () => {},
  unregisterKeyboardHandler: () => {},
  currentMidi: null,
  setCurrentMidi: () => {},
});
