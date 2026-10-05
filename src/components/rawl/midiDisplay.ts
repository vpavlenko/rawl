import type { Analysis } from "./analysis";
import type { NotesInVoices } from "./parseMidi";

// Optional, portable display hints. These never change MIDI playback events.
export type MidiDisplayOptions = {
  version: 1;
  legato: boolean;
  measures: number[];
  beatsPerMeasure: number;
  gridSubdivisions?: number;
  legatoAcrossVoices?: number[];
  legatoEndingVoices?: number[];
  legatoEndingMeasures?: number[];
  capAtRepeatedAttack?: boolean;
  analysis?: Analysis;
};

export function readMidiDisplayOptions(events: any[]): MidiDisplayOptions | undefined {
  for (const event of events) {
    if (event.type !== 255 || event.subtype !== 1 || !event.data) continue;
    const text = Array.from(event.data as ArrayLike<number>, (c) => String.fromCharCode(c)).join("");
    if (!text.startsWith("RAWL_DISPLAY:")) continue;
    try {
      const value = JSON.parse(text.slice("RAWL_DISPLAY:".length));
      if (value.version !== 1 || typeof value.legato !== "boolean" ||
          !Number.isInteger(value.beatsPerMeasure) || value.beatsPerMeasure < 1 || value.beatsPerMeasure > 16 ||
          !Array.isArray(value.measures) || value.measures.length < 2 || value.measures.length > 10000 ||
          !value.measures.every((t: number, i: number) => Number.isFinite(t) && t >= 0 && (!i || t > value.measures[i - 1]))) continue;
      // Only these structural defaults may be supplied by a MIDI file.
      const analysis = value.analysis && {
        modulations: value.analysis.modulations || {},
        phrasePatch: value.analysis.phrasePatch || [],
        sections: value.analysis.sections || [],
        comment: "", tags: [], form: {},
      };
      return { version: 1, legato: value.legato, measures: value.measures,
        beatsPerMeasure: value.beatsPerMeasure,
        gridSubdivisions: Number.isInteger(value.gridSubdivisions) && value.gridSubdivisions >= 1 && value.gridSubdivisions <= 32 ? value.gridSubdivisions : undefined,
        legatoAcrossVoices: validIndices(value.legatoAcrossVoices),
        legatoEndingVoices: validIndices(value.legatoEndingVoices),
        legatoEndingMeasures: validIndices(value.legatoEndingMeasures),
        capAtRepeatedAttack: value.capAtRepeatedAttack === true,
        analysis };
    } catch {
      // Ordinary or malformed metadata must not interfere with playing a file.
    }
  }
}

function validIndices(value: unknown): number[] | undefined {
  return Array.isArray(value) && value.every((n) => Number.isInteger(n) && n >= 0)
    ? value : undefined;
}

export function withVisualLegato(notes: NotesInVoices, measures: number[], subdivisions?: number, options?: MidiDisplayOptions): NotesInVoices {
  const finish = measures[measures.length - 1];
  const barAt = (time: number) => {
    const next = measures.findIndex((t) => t > time + 0.000001);
    return next < 0 ? measures.length - 2 : Math.max(0, next - 1);
  };
  const displayStart = (time: number) => {
    if (!subdivisions) return time;
    const bar = barAt(time);
    const step = (measures[bar + 1] - measures[bar]) / subdivisions;
    return Math.min(finish - step, measures[bar] + Math.round((time - measures[bar]) / step) * step);
  };
  return notes.map((voice, voiceIndex) => {
    const acrossBars = options?.legatoAcrossVoices?.includes(voiceIndex);
    const endingMeasures = options?.legatoEndingVoices?.includes(voiceIndex)
      ? options.legatoEndingMeasures ?? [] : [];
    const sorted = [...voice].sort((a, b) => a.span[0] - b.span[0]);
    const groups: typeof sorted[] = [];
    for (const note of sorted) {
      const last = groups[groups.length - 1];
      if (last && (subdivisions
        ? Math.abs(displayStart(note.span[0]) - displayStart(last[0].span[0])) < 0.000001
        : note.span[0] - last[0].span[0] <= 0.045)) last.push(note);
      else groups.push([note]);
    }
    const spans = new Map<string, [number, number]>();
    groups.forEach((group, i) => {
      const start = displayStart(group[0].span[0]);
      const bar = barAt(start);
      const barEnd = measures[bar + 1] ?? finish;
      const barLength = barEnd - measures[bar];
      const next = groups[i + 1] ? displayStart(groups[i + 1][0].span[0]) : finish;
      // Bridge articulation gaps, but retain rests between distant gestures.
      const end = next - start <= (acrossBars ? 4 : 1.5) * barLength ? next : barEnd;
      // Pedal may sustain the audio beyond the next attack. The visual gesture
      // ends at that attack (and always at the barline), avoiding overlap.
      const ending = endingMeasures.find((m) =>
        measures[m - 1] !== undefined && measures[m + 1] !== undefined &&
        start >= measures[m - 1] - barLength * 0.4 && start < measures[m + 1]);
      group.forEach((note) => {
        let displayEnd = acrossBars ? end : Math.min(barEnd, end);
        if (ending !== undefined) {
          // A closing chord can keep sounding while another chord tone attacks.
          // A genuine repetition of this pitch still starts a separate span.
          const repeated = groups.slice(i + 1).find((g) =>
            g.some((n) => n.note.midiNumber === note.note.midiNumber));
          displayEnd = Math.min(measures[ending + 1], repeated ? displayStart(repeated[0].span[0]) : finish);
        }
        if (options?.capAtRepeatedAttack) {
          const repeated = sorted.find((other) =>
            other.note.midiNumber === note.note.midiNumber && other.span[0] > note.span[0] + 0.000001);
          if (repeated) displayEnd = Math.min(displayEnd, repeated.span[0]);
        }
        spans.set(note.id, [displayStart(note.span[0]), displayEnd]);
      });
    });
    return voice.map((note) => note.isDrum ? note : ({ ...note, displaySpan: spans.get(note.id) }));
  });
}
