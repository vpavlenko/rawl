import type { Note, PitchBendPoint } from "./parseMidi";
import type { SecondsSpan } from "./Rawl";

export const pitchBendToSemitones = (value: number) =>
  (Math.max(0, Math.min(16383, value)) - 8192) / 4096;

// The parser can retain inherited state and a new bend at the same onset.
// Match the final value at each timestamp in both the ribbon and hover reference.
export function getPitchBendSamples(points: PitchBendPoint[], span: SecondsSpan) {
  const byTime = new Map<number, number>();
  points.filter((point) => Number.isFinite(point.time) && Number.isFinite(point.value))
    .sort((a, b) => a.time - b.time)
    .forEach((point) => {
      if (point.time < span[1])
        byTime.set(Math.max(span[0], point.time), pitchBendToSemitones(point.value));
    });
  const samples = Array.from(byTime, ([time, bend]) => ({ time, bend }));
  if (!samples.length || samples[0].time > span[0])
    samples.unshift({ time: span[0], bend: 0 });
  samples.push({ time: span[1], bend: samples[samples.length - 1].bend });
  return samples;
}

export function getNotePitchAtTime(note: Note, time = note.span[0]) {
  if (note.isDrum || !note.pitchBend?.length) return note.note.midiNumber;
  const samples = getPitchBendSamples(note.pitchBend, note.span);
  const clampedTime = Math.max(note.span[0], Math.min(note.span[1], time));
  const next = samples.findIndex((sample) => sample.time > clampedTime);
  if (next < 0) return note.note.midiNumber + samples[samples.length - 1].bend;
  const before = samples[Math.max(0, next - 1)];
  const after = samples[next];
  const fraction = after.time === before.time ? 0
    : (clampedTime - before.time) / (after.time - before.time);
  return note.note.midiNumber + before.bend + fraction * (after.bend - before.bend);
}
