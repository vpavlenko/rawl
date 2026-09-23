import { createContext, useMemo } from "react";

type RegisterDrum = (startSeconds: number, pulse: () => void) => () => void;
export const DrumPlaybackContext = createContext<RegisterDrum | null>(null);

// Index onsets directly; mounting a large score no longer causes a global sort
// on the first animation frame. Pitched notes also index overlapping sustains.
export const useDrumPlaybackClock = () =>
  useMemo(() => {
    const buckets = new Map<number, Set<{ start: number; pulse: () => void }>>();
    let previousPosition: number | null = null;
    let includePrevious = true;
    const register: RegisterDrum = (start, pulse) => {
      if (!Number.isFinite(start)) return () => {};
      const second = Math.floor(start);
      let bucket = buckets.get(second);
      if (!bucket) buckets.set(second, (bucket = new Set()));
      const entry = { start, pulse };
      bucket.add(entry);
      return () => {
        bucket!.delete(entry);
        if (!bucket!.size) buckets.delete(second);
      };
    };
    return {
      register,
      reset: () => { previousPosition = null; includePrevious = true; },
      advance: (time: number) => {
        if (!Number.isFinite(time)) return;
        const previous = previousPosition;
        previousPosition = time;
        if (previous === null || time < previous || time - previous > 0.5) {
          includePrevious = true;
          return;
        }
        if (time === previous) return;
        for (let second = Math.floor(previous); second <= Math.floor(time); second++) {
          buckets.get(second)?.forEach(({ start, pulse }) => {
            if ((includePrevious ? start >= previous : start > previous) && start <= time) pulse();
          });
        }
        includePrevious = false;
      },
    };
  }, []);
