import { createContext, useMemo } from "react";

type RegisterNote = (
  start: number,
  end: number,
  update: (playing: boolean) => void,
) => () => void;

export const NotePlaybackContext = createContext<RegisterNote | null>(null);

type Entry = {
  start: number;
  end: number;
  playing: boolean;
  update: (playing: boolean) => void;
};
type Boundary = { time: number; entry: Entry };

// Sort once after notes mount/change; ordinary frames visit only crossed edges.
// A seek reconciles all entries, including sustained notes spanning the target.
export const useNotePlaybackClock = () =>
  useMemo(() => {
    const entries = new Set<Entry>();
    let boundaries: Boundary[] = [];
    let dirty = true;
    let position: number | null = null;
    let cursor = 0;

    const reconcile = (entry: Entry, time: number) => {
      const playing = time >= entry.start && time < entry.end;
      if (playing !== entry.playing) {
        entry.playing = playing;
        entry.update(playing);
      }
    };
    const upperBound = (time: number) => {
      let low = 0;
      let high = boundaries.length;
      while (low < high) {
        const mid = (low + high) >>> 1;
        if (boundaries[mid].time <= time) low = mid + 1;
        else high = mid;
      }
      return low;
    };

    const register: RegisterNote = (start, end, update) => {
      const entry = { start, end, update, playing: false };
      entries.add(entry);
      dirty = true;
      // Also initialize replacements mounted while playback is paused.
      entry.playing = position !== null && position >= start && position < end;
      update(entry.playing);
      return () => {
        entries.delete(entry);
        dirty = true;
      };
    };

    return {
      register,
      reset: () => {
        position = null;
      },
      advance: (time: number) => {
        if (!Number.isFinite(time)) return;
        if (dirty) {
          boundaries = [];
          entries.forEach((entry) => {
            boundaries.push(
              { time: entry.start, entry },
              { time: entry.end, entry },
            );
          });
          boundaries.sort((a, b) => a.time - b.time);
          cursor = position === null ? 0 : upperBound(position);
          dirty = false;
        }
        if (position === null || time < position || time - position > 0.5) {
          entries.forEach((entry) => reconcile(entry, time));
          cursor = upperBound(time);
        } else {
          while (cursor < boundaries.length && boundaries[cursor].time <= time) {
            reconcile(boundaries[cursor++].entry, time);
          }
        }
        position = time;
      },
    };
  }, []);
