import { createContext, useMemo } from "react";
import { createSectionPlaybackClock } from "./playbackIndex";

type RegisterNote = (
  start: number,
  end: number,
  update: (playing: boolean) => void,
  section?: readonly [number, number] | null,
) => () => void;

export const NotePlaybackContext = createContext<RegisterNote | null>(null);
// A sustained note can have copies in adjacent sections. Only the copy in the
// playhead's section participates in playback highlighting.
export const PlaybackSectionContext = createContext<readonly [number, number] | null>(null);
export const useNotePlaybackClock = () => useMemo(createSectionPlaybackClock, []);
