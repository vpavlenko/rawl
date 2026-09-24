import type { Note } from "./rawl/parseMidi";

export type ModulationMarker = { timeMs: number; pitchClass: number };
export type BassBar = {
  startMs: number;
  endMs: number;
  pitchClass: number | "default" | "drum";
};
export type TimeSliderData = {
  sectionStartTimesMs: number[];
  modulationMarkers: ModulationMarker[];
  bassBars: BassBar[];
};
export const EMPTY_TIME_SLIDER_DATA: TimeSliderData = {
  sectionStartTimesMs: [], modulationMarkers: [], bassBars: [],
};

// Only the time slider subscribes. Publishing geometry never updates App state.
export function createTimeSliderStore() {
  let snapshot = EMPTY_TIME_SLIDER_DATA;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    publish(next: TimeSliderData) {
      if (snapshot === next) return;
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
  };
}
export type TimeSliderStore = ReturnType<typeof createTimeSliderStore>;

// Retained across component remounts in this tab, released with parsed MIDI.
// Bound annotation variants so editing cannot grow a song's cache indefinitely.
const cache = new WeakMap<object, Map<string, Promise<TimeSliderData>>>();
export function cachedTimeSliderData(
  song: object, key: string, build: () => Promise<TimeSliderData>,
): Promise<TimeSliderData> {
  let variants = cache.get(song);
  if (!variants) cache.set(song, (variants = new Map()));
  let data = variants.get(key);
  if (!data) {
    data = build();
    if (variants.size >= 8) variants.delete(variants.keys().next().value);
    variants.set(key, data);
    const pending = data;
    data.catch(() => {
      if (variants!.get(key) === pending) variants!.delete(key);
    });
  }
  return data;
}

function onsetBound(notes: Note[], time: number, inclusive: boolean) {
  let low = 0;
  let high = notes.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (notes[mid].span[0] < time || (inclusive && notes[mid].span[0] === time))
      low = mid + 1;
    else high = mid;
  }
  return low;
}

// Yield between bounded batches during a cache miss so playback/UI callbacks
// can run even while indexing a large score. Cache hits do no indexing work.
const yieldToPlayback = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
export async function selectBassNotes(notes: Note[], measures: number[]) {
  await yieldToPlayback();
  let sorted: Note[] = [];
  for (let i = 0; i < notes.length; i++) {
    if (!notes[i].isDrum) sorted.push(notes[i]);
    if (i % 2048 === 2047) await yieldToPlayback();
  }
  const compare = (a: Note, b: Note) =>
    a.span[0] - b.span[0] || a.note.midiNumber - b.note.midiNumber;
  // A yielding merge sort avoids one large synchronous Array.sort call.
  let scratch = new Array<Note>(sorted.length);
  let work = 0;
  for (let width = 1; width < sorted.length; width *= 2) {
    for (let left = 0; left < sorted.length; left += 2 * width) {
      const middle = Math.min(left + width, sorted.length);
      const right = Math.min(left + 2 * width, sorted.length);
      let a = left;
      let b = middle;
      for (let out = left; out < right; out++) {
        scratch[out] = a < middle && (b >= right || compare(sorted[a], sorted[b]) <= 0)
          ? sorted[a++] : sorted[b++];
        if (++work % 8192 === 0) await yieldToPlayback();
      }
    }
    [sorted, scratch] = [scratch, sorted];
  }
  // Per-pitch prefix maxima answer sustain queries without scanning old notes.
  const byPitch = new Map<number, { notes: Note[]; longest: Note[] }>();
  for (let i = 0; i < sorted.length; i++) {
    const note = sorted[i];
    const pitch = note.note.midiNumber;
    let bucket = byPitch.get(pitch);
    if (!bucket) byPitch.set(pitch, (bucket = { notes: [], longest: [] }));
    const previous = bucket.longest[bucket.longest.length - 1];
    bucket.notes.push(note);
    bucket.longest.push(previous && previous.span[1] >= note.span[1] ? previous : note);
    if (i % 2048 === 2047) await yieldToPlayback();
  }
  const pitches = [...byPitch.keys()].sort((a, b) => a - b);
  const result: { start: number; end: number; note: Note }[] = [];
  const epsilon = 0.05;
  for (let i = 0; i + 1 < measures.length; i++) {
    if (i % 128 === 0) await yieldToPlayback();
    const start = measures[i];
    const end = measures[i + 1];
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const first = onsetBound(sorted, start - epsilon, false);
    const last = onsetBound(sorted, start + epsilon, true);
    let lowest: Note | undefined;
    for (let j = first; j < last; j++) {
      if (!lowest || sorted[j].note.midiNumber < lowest.note.midiNumber) lowest = sorted[j];
      if (++work % 8192 === 0) await yieldToPlayback();
    }
    if (!lowest) {
      for (const pitch of pitches) {
        const bucket = byPitch.get(pitch)!;
        const index = onsetBound(bucket.notes, start + epsilon, true) - 1;
        const held = bucket.longest[index];
        if (held && held.span[1] > start - epsilon) {
          lowest = held;
          break;
        }
      }
    }
    if (!lowest) {
      const firstInBar = sorted[onsetBound(sorted, start, false)];
      if (firstInBar && firstInBar.span[0] < end) lowest = firstInBar;
    }
    if (lowest) result.push({ start, end, note: lowest });
  }
  return result;
}
