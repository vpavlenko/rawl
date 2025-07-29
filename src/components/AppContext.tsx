import { User } from "firebase/auth";
import React from "react";
import { Analysis, MeasuresSpan } from "./rawl/analysis";
import { RawlProps } from "./rawl/Rawl";

export type CurrentMidi = {
  id: string;
  title: string;
  slug: string;
  sourceUrl: string | null;
} | null;

export interface AppContextType {
  handleSongClick: (slug: string) => Promise<void>;
  rawlProps: RawlProps | null;
  setRawlProps: (rawlProps: RawlProps | null) => void;
  analyses: Record<string, Analysis>;
  saveAnalysis: (analysis: Analysis) => void;
  resetMidiPlayerState: () => void;
  registerKeyboardHandler: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (id: string) => void;
  currentMidi: CurrentMidi | null;
  setCurrentMidi: (currentMidi: CurrentMidi | null) => void;
  user: User | null;
  seek: (seekMs: number) => void;
  currentPlaybackTime: number | null;
  eject: () => void;
  currentMidiBuffer: ArrayBuffer | null;
  hoveredMeasuresSpan: MeasuresSpan | null;
  setHoveredMeasuresSpan: (span: MeasuresSpan | null) => void;
  togglePause: () => void;
  handleLogin: () => void;
  handleLogout: () => void;
  handleToggleManualRemeasuring: () => void;
  enableManualRemeasuring: boolean;
  playSongBuffer: (
    filepath: string,
    buffer: ArrayBuffer | Uint8Array,
    shouldAutoPlay?: boolean,
  ) => Promise<void>;
  latencyCorrectionMs: number;
  tempo: number;
}

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);
