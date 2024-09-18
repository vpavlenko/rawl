import React from "react";
import { VoiceMask } from "./App";
import { Analysis } from "./rawl/analysis";
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

export type CurrentMidi = {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string | null;
  isHiddenRoute: boolean;
} | null;

export type AppContextType = {
  handleSongClick: (slug: string, isHiddenRoute?: boolean) => Promise<void>;
  rawlProps: RawlProps | null;
  analyses: Record<string, Analysis>;
  saveAnalysis: (analysis: Analysis) => void;
  resetMidiPlayerState: () => void;
  registerKeyboardHandler: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (id: string) => void;
  currentMidi: CurrentMidi;
  setCurrentMidi: (currentMidi: CurrentMidi) => void;
};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);
