import { HarmonyGrid, HarmonyNote } from "./harmony";

// midi-file's parser is intentionally tolerant of missing end-of-track markers.
// Reject SMPTE, honor tempo/meter changes, and keep source pitches intact.
export function harmonyMidi(midi: any): {
  notes: HarmonyNote[];
  grid: HarmonyGrid;
  warnings: string[];
} {
  const ppq = midi.header.ticksPerBeat;
  if (!Number.isFinite(ppq) || ppq <= 0)
    throw new Error("SMPTE MIDI timing is unsupported.");
  const events: any[] = [];
  let lastTick = 0;
  midi.tracks.forEach((track: any[], trackIndex: number) => {
    let tick = 0,
      port = 0;
    for (const event of track) {
      if (!Number.isFinite(event.deltaTime) || event.deltaTime < 0)
        throw new Error("Invalid MIDI delta time.");
      tick += event.deltaTime;
      if (event.type === "midiPort") port = event.port;
      events.push({ ...event, tick, trackIndex, port });
    }
    lastTick = Math.max(lastTick, tick);
  });
  events.sort((a, b) => a.tick - b.tick || a.trackIndex - b.trackIndex);
  const tempos = [{ tick: 0, time: 0, secondsPerTick: 0.5 / ppq }];
  for (const event of events)
    if (event.type === "setTempo" && event.microsecondsPerBeat > 0) {
      const prev = tempos[tempos.length - 1];
      tempos.push({
        tick: event.tick,
        time: prev.time + (event.tick - prev.tick) * prev.secondsPerTick,
        secondsPerTick: event.microsecondsPerBeat / 1e6 / ppq,
      });
    }
  const seconds = (tick: number) => {
    let lo = 0,
      hi = tempos.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (tempos[mid].tick <= tick) lo = mid;
      else hi = mid - 1;
    }
    const t = tempos[lo];
    return t.time + (tick - t.tick) * t.secondsPerTick;
  };
  const channels = [
    ...new Set(
      events
        .filter((e) => e.type === "noteOn")
        .map((e) => e.port * 16 + e.channel),
    ),
  ].sort((a, b) => a - b);
  const notes: HarmonyNote[] = [],
    active = new Map<string, any[]>(),
    sustain = new Map<number, boolean>(),
    released = new Map<number, any[]>();
  const close = (n: any, tick: number) => {
    if (tick > n.tick)
      notes.push({
        start: seconds(n.tick),
        end: seconds(tick),
        pitch: n.noteNumber,
        voice: channels.indexOf(n.port * 16 + n.channel),
        isDrum: n.channel === 9,
      });
  };
  const flush = (channel: number, tick: number) => {
    for (const n of released.get(channel) || []) close(n, tick);
    released.delete(channel);
  };
  for (const e of events) {
    if (e.channel == null) continue;
    const channel = e.port * 16 + e.channel,
      key = `${channel}:${e.noteNumber}`;
    if (e.type === "noteOn" && e.velocity > 0) {
      const queue = active.get(key) || [];
      queue.push(e);
      active.set(key, queue);
    } else if (
      e.type === "noteOff" ||
      (e.type === "noteOn" && e.velocity === 0)
    ) {
      const queue = active.get(key),
        n = queue?.shift();
      if (!queue?.length) active.delete(key);
      if (n) {
        if (sustain.get(channel) && e.channel !== 9) {
          const held = released.get(channel) || [];
          held.push(n);
          released.set(channel, held);
        } else close(n, e.tick);
      }
    } else if (e.type === "controller") {
      if (e.controllerType === 64) {
        sustain.set(channel, e.value >= 64);
        if (e.value < 64) flush(channel, e.tick);
      }
      if ([120, 123].includes(e.controllerType)) {
        flush(channel, e.tick);
        for (const [key, queue] of active)
          if (key.startsWith(`${channel}:`)) {
            queue.forEach((n) => close(n, e.tick));
            active.delete(key);
          }
      }
    }
  }
  const warnings: string[] = [];
  const unclosed = [...active.values()].flat();
  if (unclosed.length)
    warnings.push(
      `${unclosed.length} unterminated note(s) closed at the MIDI end.`,
    );
  unclosed.forEach((n) => close(n, lastTick));
  for (const channel of released.keys()) flush(channel, lastTick);
  const signatures = [
    { tick: 0, numerator: 4, denominator: 4 },
    ...events.filter((e) => e.type === "timeSignature"),
  ];
  signatures.sort((a, b) => a.tick - b.tick);
  const measures = [0],
    beats: number[] = [];
  let tick = 0,
    index = 0;
  while (tick < lastTick) {
    if (measures.length > 5001)
      throw new Error("MIDI exceeds the 5,000-measure analysis limit.");
    while (index + 1 < signatures.length && signatures[index + 1].tick <= tick)
      index++;
    const meter = signatures[index],
      unit = (ppq * 4) / meter.denominator,
      length = unit * meter.numerator;
    if (!Number.isFinite(length) || length <= 0)
      throw new Error("Invalid MIDI meter.");
    const end = Math.min(
      tick + length,
      signatures[index + 1]?.tick ?? Infinity,
    );
    for (let beat = tick + unit; beat < end; beat += unit)
      beats.push(seconds(beat));
    tick = end;
    measures.push(seconds(tick));
  }
  return {
    notes: notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch),
    grid: { measures, beats },
    warnings,
  };
}
