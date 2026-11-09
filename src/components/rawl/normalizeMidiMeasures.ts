import { MidiEvent, parseMidi, writeMidi } from "midi-file";

// A time-signature event starts a bar. MuseScore can place one after a
// shortened bar (notably a movement pause/pickup) without encoding that bar's
// length. Make that length explicit; never move playback events to fit a grid.
export function normalizeMidiMeasures(input: Uint8Array): Uint8Array {
  const midi = parseMidi(input);
  const ppq = midi.header.ticksPerBeat;
  if (!ppq || midi.header.format === 2) return input;
  const signatures = new Map<
    number,
    { numerator: number; denominator: number }
  >();
  let conflict = false;
  midi.tracks.forEach((track) => {
    let tick = 0;
    track.forEach((event) => {
      tick += event.deltaTime;
      if (event.type !== "timeSignature") return;
      const existing = signatures.get(tick);
      if (
        existing &&
        (existing.numerator !== event.numerator ||
          existing.denominator !== event.denominator)
      )
        conflict = true;
      signatures.set(tick, event);
    });
  });
  // Conflicting meters and independent sequences need source adjudication.
  if (conflict || !signatures.size) return input;
  const repairs = new Map<number, { numerator: number; denominator: number }>();
  let start = 0;
  let meter = { numerator: 4, denominator: 4 };
  for (const [tick, next] of [...signatures].sort((a, b) => a[0] - b[0])) {
    const barTicks = (ppq * 4 * meter.numerator) / meter.denominator;
    if (!(barTicks > 0)) return input;
    const wholeBars = Math.floor((tick - start) / barTicks);
    const partialStart = start + wholeBars * barTicks;
    const remaining = tick - partialStart;
    if (remaining > 1e-7) {
      let shortMeter: { numerator: number; denominator: number } | undefined;
      for (
        let denominator = meter.denominator;
        denominator <= 128;
        denominator *= 2
      ) {
        const numerator = (remaining * denominator) / (ppq * 4);
        if (
          numerator >= 1 &&
          numerator <= 255 &&
          Math.abs(numerator - Math.round(numerator)) < 1e-7
        ) {
          shortMeter = { numerator: Math.round(numerator), denominator };
          break;
        }
      }
      // Do not approximate an unrepresentable boundary or emit fractional ticks.
      if (!shortMeter || !Number.isInteger(partialStart)) return input;
      repairs.set(partialStart, shortMeter);
    }
    start = tick;
    meter = next;
  }
  if (!repairs.size) return input;
  const pending = new Map(repairs);
  midi.tracks = midi.tracks.map((track) => {
    let tick = 0;
    return track.map((event) => {
      tick += event.deltaTime;
      const replacement = repairs.get(tick);
      if (event.type !== "timeSignature" || !replacement) return event;
      pending.delete(tick);
      return { ...event, ...replacement };
    });
  });
  // Put new global metadata on a track long enough to contain it; retain every
  // source event's tick, ordering, and end-of-track time. An insertion precedes events at
  // the same tick, so the reader sees the meter before processing that beat.
  const ends = midi.tracks.map((track) =>
    track.reduce((sum, event) => sum + event.deltaTime, 0),
  );
  const target = ends.indexOf(Math.max(...ends));
  let tick = 0;
  const events = midi.tracks[target].map((event) => {
    tick += event.deltaTime;
    return { tick, event, inserted: false };
  });
  for (const [at, repair] of pending) {
    events.push({
      tick: at,
      inserted: true,
      event: {
        deltaTime: 0,
        meta: true,
        type: "timeSignature",
        ...repair,
        metronome: 24,
        thirtyseconds: 8,
      } as MidiEvent,
    });
  }
  events.sort(
    (a, b) => a.tick - b.tick || Number(b.inserted) - Number(a.inserted),
  );
  let previous = 0;
  midi.tracks[target] = events.map(({ tick: at, event }) => {
    const result = { ...event, deltaTime: at - previous };
    previous = at;
    return result;
  });
  return new Uint8Array(writeMidi(midi));
}
