/** Time-weighted chord occupancy, independent of instrument/program and tempo. */
type StrumNote = {
  span: [number, number];
  note: { midiNumber: number };
  isDrum: boolean;
};

export function measureChordOccupancy(
  notes: readonly StrumNote[],
  duration: number,
) {
  const events: { time: number; pitch: number; delta: number }[] = [];
  for (const note of notes) {
    const [start, end] = note.span;
    if (
      note.isDrum ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start
    )
      continue;
    events.push({ time: start, pitch: note.note.midiNumber, delta: 1 });
    events.push({ time: end, pitch: note.note.midiNumber, delta: -1 });
  }
  events.sort((a, b) => a.time - b.time);
  const pitches = new Map<number, number>();
  let previous = events[0]?.time ?? 0;
  let activeSeconds = 0;
  let chordSeconds = 0;
  let pitchSeconds = 0;
  for (const event of events) {
    const elapsed = event.time - previous;
    if (pitches.size > 0) activeSeconds += elapsed;
    if (pitches.size >= 3) chordSeconds += elapsed;
    pitchSeconds += elapsed * pitches.size;
    const count = (pitches.get(event.pitch) ?? 0) + event.delta;
    if (count > 0) pitches.set(event.pitch, count);
    else pitches.delete(event.pitch);
    previous = event.time;
  }
  return {
    activeSeconds,
    chordSeconds,
    chordFraction: activeSeconds ? chordSeconds / activeSeconds : 0,
    averagePolyphony: activeSeconds ? pitchSeconds / activeSeconds : 0,
    coverage: duration > 0 ? chordSeconds / duration : 0,
  };
}

/**
 * Classify each entire voice across the piece. All notes in a qualifying voice
 * share the same rendering, including its sparse passages.
 */
export function findStrumNotes(
  voices: readonly (readonly (StrumNote & { id: string })[])[],
): Set<string> {
  const result = new Set<string>();
  if (voices.filter((voice) => voice.length > 0).length < 3) return result;

  let start = Infinity;
  let end = -Infinity;
  for (const voice of voices) {
    for (const note of voice) {
      const [noteStart, noteEnd] = note.span;
      if (
        !Number.isFinite(noteStart) ||
        !Number.isFinite(noteEnd) ||
        noteEnd <= noteStart
      )
        continue;
      start = Math.min(start, noteStart);
      end = Math.max(end, noteEnd);
    }
  }
  if (!Number.isFinite(start) || !Number.isFinite(end)) return result;

  for (const voice of voices) {
    const metrics = measureChordOccupancy(voice, end - start);
    if (
      // Allow small MIDI articulation gaps around half-time chords / 2.5 pitches.
      metrics.chordFraction >= 0.48 &&
      metrics.averagePolyphony >= 2.45 &&
      metrics.coverage >= 0.15
    ) {
      for (const note of voice) {
        if (!note.isDrum) result.add(note.id);
      }
    }
  }
  return result;
}
