import { createContext, useMemo } from "react";

type RegisterDrum = (startSeconds: number, pulse: () => void) => () => void;

export const DrumPlaybackContext = createContext<RegisterDrum | null>(null);

// Share one audio-clock update across all mounted drums without React state.
export const useDrumPlaybackClock = () =>
  useMemo(() => {
    const drums = new Map<() => void, number>();
    let previousPosition: number | null = null;

    const register: RegisterDrum = (startSeconds, pulse) => {
      drums.set(pulse, startSeconds);
      return () => {
        drums.delete(pulse);
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
        drums.forEach((startSeconds, pulse) => {
          if (startSeconds >= previous && startSeconds < positionSeconds) pulse();
        });
      },
    };
  }, []);
