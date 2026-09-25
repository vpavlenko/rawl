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

export function findStrumVoices(
  voices: readonly (readonly StrumNote[])[],
): Set<number> {
  const result = new Set<number>();
  if (voices.filter((voice) => voice.length > 0).length < 3) return result;
  let start = Infinity;
  let end = -Infinity;
  for (const voice of voices)
    for (const note of voice) {
      if (
        !Number.isFinite(note.span[0]) ||
        !Number.isFinite(note.span[1]) ||
        note.span[1] <= note.span[0]
      )
        continue;
      start = Math.min(start, note.span[0]);
      end = Math.max(end, note.span[1]);
    }
  voices.forEach((voice, index) => {
    const metrics = measureChordOccupancy(voice, end - start);
    if (
      // A majority of sounding time can be chordal even when a rhythmic part
      // alternates thick chords with single notes or dyads.
      metrics.chordFraction >= 0.5 &&
      metrics.averagePolyphony >= 2.5 &&
      metrics.coverage >= 0.15
    )
      result.add(index);
  });
  return result;
}
