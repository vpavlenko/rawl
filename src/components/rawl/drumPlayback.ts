import { createContext, useMemo } from "react";

type RegisterDrum = (startSeconds: number, pulse: () => void) => () => void;

export const DrumPlaybackContext = createContext<RegisterDrum | null>(null);

// Share one audio-clock update across all mounted drums without React state.
export const useDrumPlaybackClock = () =>
  useMemo(() => {
    const drums = new Map<() => void, number>();
    let sortedDrums: [() => void, number][] = [];
    let dirty = true;
    let previousPosition: number | null = null;

    const register: RegisterDrum = (startSeconds, pulse) => {
      drums.set(pulse, startSeconds);
      dirty = true;
      return () => {
        drums.delete(pulse);
        dirty = true;
      };
    };

    return {
      register,
      reset: () => {
        previousPosition = null;
      },
      advance: (positionSeconds: number) => {
        const previous = previousPosition;
        previousPosition = positionSeconds;
        // Skip backwards/large jumps and catch onsets between display frames,
        // even when the entire MIDI hit falls between those frames.
        if (
          previous === null ||
          positionSeconds <= previous ||
          positionSeconds - previous > 0.5
        ) return;
        if (dirty) {
          sortedDrums = [...drums.entries()].sort((a, b) => a[1] - b[1]);
          dirty = false;
        }
        let low = 0;
        let high = sortedDrums.length;
        while (low < high) {
          const mid = (low + high) >>> 1;
          if (sortedDrums[mid][1] < previous) low = mid + 1;
          else high = mid;
        }
        for (
          let i = low;
          i < sortedDrums.length && sortedDrums[i][1] < positionSeconds;
          i++
        ) {
          sortedDrums[i][0]();
        }
      },
    };
  }, []);
