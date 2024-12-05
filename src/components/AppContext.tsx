import { User } from "firebase/auth";
import React from "react";
import { Analysis } from "./rawl/analysis";
import { RawlProps } from "./rawl/Rawl";

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
  user: User | null;
  seek: (seekMs: number) => void;
  currentPlaybackTime: number | null;
  eject: () => void;
};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined,
);
