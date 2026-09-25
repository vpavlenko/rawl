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
 * Classify each voice independently in each measure. Returned IDs let rendering
 * reuse the result without doing analysis on playback frames or hover changes.
 */
export function findStrumNotes(
  voices: readonly (readonly (StrumNote & { id: string })[])[],
  measures: readonly number[],
): Set<string> {
  const result = new Set<string>();
  if (voices.filter((voice) => voice.length > 0).length < 3) return result;
  // No invented bar length when timing is unavailable. Include only valid,
  // increasing boundaries; the final boundary closes the final measure.
  const boundaries: number[] = [];
  for (const time of measures) {
    if (
      Number.isFinite(time) &&
      (!boundaries.length || time > boundaries[boundaries.length - 1])
    )
      boundaries.push(time);
  }
  if (boundaries.length < 2) return result;

  for (const voice of voices) {
    const buckets = new Map<number, (StrumNote & { id: string })[]>();
    for (const note of voice) {
      const [start, end] = note.span;
      if (
        note.isDrum ||
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start
      )
        continue;
      // Find the first overlapping measure in O(log M), then visit only the
      // measures touched by this note. Clip held notes at each bar boundary.
      let low = 0;
      let high = boundaries.length;
      while (low < high) {
        const middle = (low + high) >>> 1;
        if (boundaries[middle] <= start) low = middle + 1;
        else high = middle;
      }
      for (
        let index = Math.max(0, low - 1);
        index + 1 < boundaries.length && boundaries[index] < end;
        index++
      ) {
        const clippedStart = Math.max(start, boundaries[index]);
        const clippedEnd = Math.min(end, boundaries[index + 1]);
        if (clippedEnd <= clippedStart) continue;
        let bucket = buckets.get(index);
        if (!bucket) buckets.set(index, (bucket = []));
        bucket.push({ ...note, span: [clippedStart, clippedEnd] });
      }
    }
    for (const [index, notes] of buckets) {
      const metrics = measureChordOccupancy(
        notes,
        boundaries[index + 1] - boundaries[index],
      );
      if (
        // MIDI gates often release just before the grid. Allow a small margin
        // around half-time chords / 2.5 pitches so a sustained dyad plus a
        // pulsed third pitch does not fail solely on those articulation gaps.
        metrics.chordFraction >= 0.48 &&
        metrics.averagePolyphony >= 2.45 &&
        metrics.coverage >= 0.15
      ) {
        // A note crossing a barline is a single rendered shape: thin it if any
        // of the measures it overlaps qualifies, without splitting its timing.
        for (const note of notes) result.add(note.id);
      }
    }
  }
  return result;
}
