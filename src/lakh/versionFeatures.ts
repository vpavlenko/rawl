// MIDI-only descriptors. Never use annotations, filenames or version numbers
// as inputs: the same extraction must work for unseen/unannotated files.
export const VERSION_FEATURE_VERSION = "lakh-version-features-1";
export const GM_FAMILIES = [
  "piano",
  "chromaticPercussion",
  "organ",
  "guitar",
  "bass",
  "strings",
  "ensemble",
  "brass",
  "reed",
  "pipe",
  "synthLead",
  "synthPad",
  "synthEffects",
  "ethnic",
  "percussive",
  "soundEffects",
];
export const VERSION_FEATURE_NAMES = [
  "vocal.namedPart",
  "vocal.namedNoteShare",
  "vocal.lyricsLogCount",
  "vocal.lyricsOnsetAgreement",
  "vocal.voiceProgramShare",
  "vocal.melodyCandidate",
  "vocal.melodicVoices",
  "vocal.melodyCoverage",
  "vocal.melodyStepShare",
  "arrangement.logNotes",
  "arrangement.logPitchedNotes",
  "arrangement.voices",
  "arrangement.pitchedVoices",
  "arrangement.activeTracks",
  "arrangement.programs",
  "arrangement.families",
  "arrangement.notesPerBeat",
  "arrangement.pitchedPerBeat",
  "arrangement.drumPerBeat",
  "arrangement.hasDrums",
  "arrangement.drumPitches",
  "arrangement.meanVoicesPerBar",
  "arrangement.voicesPerBarVariation",
  "arrangement.pitchRange",
  "arrangement.pitchEntropy",
  "arrangement.onsetEntropy",
  "arrangement.samePitchDoubling",
  "arrangement.exactDuplicateNotes",
  "arrangement.logBeats",
  "arrangement.trailingSilence",
  "grid.initialTempo",
  "grid.initialMeter",
  "grid.tempoChangeRate",
  "grid.tempoVariation",
  "grid.meterChangeRate",
  "grid.offBarMeterChanges",
  "grid.sixteenthError",
  "grid.subdivisionError",
  "grid.quantizedShare",
  "grid.drumSubdivisionError",
  "grid.strongBarOnsets",
  "grid.barPhaseOffset",
  "grid.barPhaseStrength",
  "timbre.explicitProgramShare",
  "timbre.nonDefaultBankShare",
  "timbre.programChangeRate",
  "timbre.velocityVariation",
  "timbre.quietShare",
  "timbre.loudShare",
  "timbre.expressionChannels",
  "timbre.expressionRate",
  "timbre.panSpread",
  "timbre.reverbChannels",
  "timbre.chorusChannels",
  "timbre.pitchBendChannels",
  "timbre.modulationChannels",
  "integrity.unmatchedOffShare",
  "integrity.unclosedNoteShare",
  ...GM_FAMILIES.map((name) => `timbre.family.${name}`),
];
export const VERSION_RANKING_FEATURE_VERSION = `${VERSION_FEATURE_VERSION}-relative-1`;
export const VERSION_RANKING_FEATURE_NAMES = [
  ...VERSION_FEATURE_NAMES.map((name) => `absolute.${name}`),
  ...VERSION_FEATURE_NAMES.map((name) => `relative.${name}`),
];
export function versionGroupFeatures(rows: number[][]) {
  const minima = VERSION_FEATURE_NAMES.map((_, i) =>
    rows.reduce((m, r) => Math.min(m, r[i]), Infinity),
  );
  const maxima = VERSION_FEATURE_NAMES.map((_, i) =>
    rows.reduce((m, r) => Math.max(m, r[i]), -Infinity),
  );
  return rows.map((r) => [
    ...r,
    ...r.map((x, i) =>
      maxima[i] > minima[i] ? (x - minima[i]) / (maxima[i] - minima[i]) : 0.5,
    ),
  ]);
}
type MidiNote = {
  start: number;
  end: number;
  pitch: number;
  velocity: number;
  voice: string;
  track: number;
  program: number;
  explicit: boolean;
  bank: number;
  drum: boolean;
};
export type VersionSummary = {
  notes: number;
  voices: number;
  pitchedVoices: number;
  vocal: "named" | "lyrics" | "melody" | "unverified";
  quantizedShare: number;
  tempoChanges: number;
  meterChanges: number;
};
const mean = (xs: number[]) =>
  xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
const deviation = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)));
};
const entropy = (xs: number[]) => {
  const total = xs.reduce((a, b) => a + b, 0);
  return total
    ? -xs.reduce((s, x) => (x ? s + (x / total) * Math.log2(x / total) : s), 0)
    : 0;
};
const subdivisionError = (beat: number) =>
  Math.min(
    Math.abs(beat * 4 - Math.round(beat * 4)) / 4,
    Math.abs(beat * 3 - Math.round(beat * 3)) / 3,
  );
const vocalName =
  /\b(vocals?|vox|voice|singer|singing|gesang|canto|voz|voix|voci|coro)\b/i;
const melodyName = /\b(melody|melodie|lead|theme|tune)\b/i;

export function versionFeatures(midi: any): {
  features: number[];
  summary: VersionSummary;
} {
  const ppq = midi.header.ticksPerBeat;
  if (!Number.isFinite(ppq) || ppq <= 0)
    throw new Error("Unsupported SMPTE timing");
  if (midi.header.format === 2)
    throw new Error("Independent format-2 sequences");
  const events: any[] = [],
    names = new Map<number, string[]>();
  let fileEnd = 0;
  midi.tracks.forEach((track: any[], trackIndex: number) => {
    let tick = 0,
      port = 0;
    for (const e of track) {
      if (!Number.isFinite(e.deltaTime) || e.deltaTime < 0)
        throw new Error("Invalid MIDI delta time");
      tick += e.deltaTime;
      if (e.type === "midiPort") port = e.port;
      if (e.type === "trackName" || e.type === "instrumentName")
        names.set(trackIndex, [...(names.get(trackIndex) || []), e.text || ""]);
      events.push({ ...e, tick, track: trackIndex, port });
    }
    fileEnd = Math.max(fileEnd, tick);
  });
  events.sort((a, b) => a.tick - b.tick || a.track - b.track);
  const active = new Map<string, any[]>(),
    programs = new Map<string, number>(),
    banks = new Map<string, number>(),
    controllerChannels = new Map<number, Set<string>>(),
    pans = new Map<string, number>(),
    trackVoices = new Map<number, Set<string>>();
  const notes: MidiNote[] = [],
    tempos = [{ beat: 0, bpm: 120 }],
    meters = [{ beat: 0, numerator: 4, denominator: 4 }],
    lyrics: number[] = [];
  let unmatchedOff = 0,
    onCount = 0,
    unclosed = 0,
    expressionEvents = 0,
    programEvents = 0;
  let initialTempo = false,
    initialMeter = false;
  const close = (n: any, tick: number) => {
    if (tick > n.tick)
      notes.push({
        start: n.tick / ppq,
        end: tick / ppq,
        pitch: n.noteNumber,
        velocity: n.velocity,
        voice: n.voice,
        track: n.track,
        program: n.program,
        explicit: n.explicit,
        bank: n.bank,
        drum: n.channel === 9,
      });
  };
  for (const e of events) {
    const beat = e.tick / ppq;
    if (e.type === "setTempo" && e.microsecondsPerBeat > 0) {
      initialTempo ||= e.tick === 0;
      const row = { beat, bpm: 60e6 / e.microsecondsPerBeat };
      if (tempos.at(-1).beat === beat) tempos[tempos.length - 1] = row;
      else if (tempos.at(-1).bpm !== row.bpm) tempos.push(row);
    }
    if (e.type === "timeSignature" && e.numerator > 0 && e.denominator > 0) {
      initialMeter ||= e.tick === 0;
      const row = { beat, numerator: e.numerator, denominator: e.denominator };
      if (meters.at(-1).beat === beat) meters[meters.length - 1] = row;
      else if (
        meters.at(-1).numerator !== row.numerator ||
        meters.at(-1).denominator !== row.denominator
      )
        meters.push(row);
    }
    if (e.type === "lyrics" && (e.text || "").trim() && !/^@/.test(e.text))
      lyrics.push(beat);
    if (e.channel == null) continue;
    const voice = `${e.port}:${e.channel}`,
      key = `${voice}:${e.noteNumber}`;
    if (e.type === "programChange") {
      programs.set(voice, e.programNumber);
      programEvents++;
    }
    if (e.type === "controller") {
      const c = e.controllerType;
      if (c === 0)
        banks.set(voice, e.value * 128 + ((banks.get(voice) || 0) % 128));
      if (c === 32)
        banks.set(
          voice,
          Math.floor((banks.get(voice) || 0) / 128) * 128 + e.value,
        );
      controllerChannels.set(
        c,
        new Set([...(controllerChannels.get(c) || []), voice]),
      );
      if (c === 10) pans.set(voice, e.value);
      if (c === 11) expressionEvents++;
    }
    if (e.type === "pitchBend")
      controllerChannels.set(
        -1,
        new Set([...(controllerChannels.get(-1) || []), voice]),
      );
    if (e.type === "noteOn" && e.velocity > 0) {
      onCount++;
      const queue = active.get(key) || [];
      queue.push({
        ...e,
        voice,
        program: programs.get(voice) ?? 0,
        explicit: programs.has(voice),
        bank: banks.get(voice) || 0,
      });
      active.set(key, queue);
      if (e.channel !== 9)
        trackVoices.set(
          e.track,
          new Set([...(trackVoices.get(e.track) || []), voice]),
        );
    } else if (
      e.type === "noteOff" ||
      (e.type === "noteOn" && e.velocity === 0)
    ) {
      const queue = active.get(key),
        n = queue?.shift();
      if (n) close(n, e.tick);
      else unmatchedOff++;
      if (!queue?.length) active.delete(key);
    }
  }
  for (const queue of active.values())
    for (const n of queue) {
      unclosed++;
      close(n, fileEnd);
    }
  if (notes.length < 8) throw new Error("Fewer than eight completed notes");
  const pitched = notes.filter((n) => !n.drum),
    drums = notes.filter((n) => n.drum);
  if (!pitched.length) throw new Error("No pitched notes");
  const duration = notes.reduce((end, n) => Math.max(end, n.end), 1);
  const barBases = [0];
  for (let i = 1; i < meters.length; i++) {
    const previous = meters[i - 1];
    barBases.push(
      barBases[i - 1] +
        Math.ceil(
          (meters[i].beat - previous.beat) /
            ((previous.numerator * 4) / previous.denominator),
        ),
    );
  }
  const barAt = (beat: number) => {
    let lo = 0,
      hi = meters.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (meters[mid].beat <= beat) lo = mid;
      else hi = mid - 1;
    }
    const meter = meters[lo],
      position =
        (beat - meter.beat) / ((meter.numerator * 4) / meter.denominator);
    return {
      index: barBases[lo] + Math.floor(position),
      phase: position - Math.floor(position),
    };
  };
  const barCount = Math.max(1, barAt(duration - 1e-6).index + 1);
  const voiceNotes = new Map<string, MidiNote[]>();
  for (const n of notes) {
    if (!voiceNotes.has(n.voice)) voiceNotes.set(n.voice, []);
    voiceNotes.get(n.voice).push(n);
  }
  const pitchedVoices = [...voiceNotes].filter(([, ns]) => !ns[0].drum);
  const namedVoices = new Set<string>(),
    melodyNamed = new Set<string>();
  // A format-0 track name is usually the song title, not a part label.
  if (midi.header.format !== 0)
    for (const [track, voices] of trackVoices) {
      if (voices.size !== 1) continue;
      const text = (names.get(track) || []).join(" "),
        voice = [...voices][0];
      if (vocalName.test(text)) namedVoices.add(voice);
      if (melodyName.test(text)) melodyNamed.add(voice);
    }
  const candidates = pitchedVoices
    .map(([voice, ns]) => {
      const onsets = new Map<number, MidiNote[]>();
      for (const n of ns)
        onsets.set(n.start, [...(onsets.get(n.start) || []), n]);
      const heads = [...onsets]
        .sort(([a], [b]) => a - b)
        .map(([, rows]) => rows.reduce((a, b) => (a.pitch > b.pitch ? a : b)));
      const soloShare =
        [...onsets.values()].filter((rows) => rows.length === 1).length /
        onsets.size;
      const steps =
        heads.slice(1).filter((n, i) => Math.abs(n.pitch - heads[i].pitch) <= 5)
          .length / Math.max(1, heads.length - 1);
      const rangeShare =
        ns.filter((n) => n.pitch >= 48 && n.pitch <= 88).length / ns.length;
      const coverage =
        new Set(ns.map((n) => barAt(n.start).index)).size / barCount;
      const diverse = new Set(ns.map((n) => n.pitch)).size >= 5 ? 1 : 0.25;
      const score =
        soloShare *
        rangeShare *
        diverse *
        Math.min(1, ns.length / 64) *
        Math.min(1, coverage / 0.35);
      return {
        voice,
        score,
        coverage,
        steps,
        named: namedVoices.has(voice),
        melodyNamed: melodyNamed.has(voice),
      };
    })
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const barVoices = Array.from(
    { length: Math.min(25000, barCount) },
    () => new Set<string>(),
  );
  for (const n of pitched)
    for (
      let b = barAt(n.start).index;
      b <= barAt(Math.max(n.start, n.end - 1e-6)).index && b < barVoices.length;
      b++
    )
      barVoices[b].add(n.voice);
  const counts = barVoices.map((v) => v.size),
    pitches = Array(128).fill(0),
    rhythms = Array(12).fill(0);
  const families = Array(16).fill(0),
    programsUsed = new Set<number>(),
    activeTracks = new Set<number>(),
    duplicates = new Set<string>(),
    simultaneous = new Map<string, number>();
  let exactDuplicates = 0;
  for (const n of notes) {
    activeTracks.add(n.track);
    const id = `${n.voice}:${n.start}:${n.end}:${n.pitch}`;
    if (duplicates.has(id)) exactDuplicates++;
    duplicates.add(id);
    if (!n.drum) {
      pitches[n.pitch]++;
      rhythms[Math.round(n.start * 12) % 12]++;
      families[Math.floor(n.program / 8)]++;
      programsUsed.add(n.program);
      const key = `${n.start}:${n.pitch}`;
      simultaneous.set(key, (simultaneous.get(key) || 0) + 1);
    }
  }
  const onsets = new Set(pitched.map((n) => Math.round(n.start * 24)));
  const lyricMatches = lyrics.filter((b) =>
    [-1, 0, 1].some((shift) => onsets.has(Math.round(b * 24) + shift)),
  ).length;
  let tempoTotal = 0,
    tempoSq = 0;
  for (let i = 0; i < tempos.length; i++) {
    const span = Math.max(
      0,
      Math.min(duration, tempos[i + 1]?.beat ?? duration) - tempos[i].beat,
    );
    tempoTotal += span * tempos[i].bpm;
    tempoSq += span * tempos[i].bpm ** 2;
  }
  const tempoMean = tempoTotal / duration;
  let offBarMeters = 0;
  for (let i = 1; i < meters.length; i++) {
    const prev = meters[i - 1],
      bars =
        (meters[i].beat - prev.beat) /
        ((prev.numerator * 4) / prev.denominator);
    if (Math.abs(bars - Math.round(bars)) > 0.01) offBarMeters++;
  }
  const accents = Array(16).fill(0);
  for (const n of notes)
    if (
      (n.drum && [35, 36, 49, 57].includes(n.pitch)) ||
      (!n.drum && n.pitch < 55)
    )
      accents[Math.round(barAt(n.start).phase * 16) % 16] += n.velocity;
  const peak = accents.indexOf(Math.max(...accents)),
    accentTotal = accents.reduce((a, b) => a + b, 0);
  const vel = pitched.map((n) => n.velocity),
    channelFraction = (c: number) =>
      pitchedVoices.filter(([voice]) => controllerChannels.get(c)?.has(voice))
        .length / Math.max(1, pitchedVoices.length);
  const panValues = pitchedVoices.map(([voice]) => pans.get(voice) ?? 64);
  const errors = pitched.map((n) => subdivisionError(n.start));
  const f: Record<string, number> = {
    "vocal.namedPart": Number(namedVoices.size > 0),
    "vocal.namedNoteShare":
      pitched.filter((n) => namedVoices.has(n.voice)).length / pitched.length,
    "vocal.lyricsLogCount": Math.log1p(lyrics.length),
    "vocal.lyricsOnsetAgreement": lyricMatches / Math.max(1, lyrics.length),
    "vocal.voiceProgramShare":
      pitched.filter((n) => [52, 53, 54, 85, 91].includes(n.program)).length /
      pitched.length,
    "vocal.melodyCandidate": best?.score ?? 0,
    "vocal.melodicVoices": candidates.filter(
      (c) => c.score > 0.5 || c.melodyNamed,
    ).length,
    "vocal.melodyCoverage": best?.coverage ?? 0,
    "vocal.melodyStepShare": best?.steps ?? 0,
    "arrangement.logNotes": Math.log1p(notes.length),
    "arrangement.logPitchedNotes": Math.log1p(pitched.length),
    "arrangement.voices": voiceNotes.size,
    "arrangement.pitchedVoices": pitchedVoices.length,
    "arrangement.activeTracks": activeTracks.size,
    "arrangement.programs": programsUsed.size,
    "arrangement.families": families.filter(Boolean).length,
    "arrangement.notesPerBeat": notes.length / duration,
    "arrangement.pitchedPerBeat": pitched.length / duration,
    "arrangement.drumPerBeat": drums.length / duration,
    "arrangement.hasDrums": Number(drums.length > 0),
    "arrangement.drumPitches": new Set(drums.map((n) => n.pitch)).size,
    "arrangement.meanVoicesPerBar": mean(counts),
    "arrangement.voicesPerBarVariation": deviation(counts),
    "arrangement.pitchRange":
      pitched.reduce((p, n) => Math.max(p, n.pitch), 0) -
      pitched.reduce((p, n) => Math.min(p, n.pitch), 127),
    "arrangement.pitchEntropy": entropy(pitches),
    "arrangement.onsetEntropy": entropy(rhythms),
    "arrangement.samePitchDoubling":
      [...simultaneous.values()].reduce((s, n) => s + n - 1, 0) /
      pitched.length,
    "arrangement.exactDuplicateNotes": exactDuplicates / notes.length,
    "arrangement.logBeats": Math.log1p(duration),
    "arrangement.trailingSilence":
      Math.max(0, fileEnd / ppq - duration) / duration,
    "grid.initialTempo": Number(initialTempo),
    "grid.initialMeter": Number(initialMeter),
    "grid.tempoChangeRate": (Math.max(0, tempos.length - 1) * 100) / duration,
    "grid.tempoVariation":
      Math.sqrt(Math.max(0, tempoSq / duration - tempoMean ** 2)) /
      Math.max(1, tempoMean),
    "grid.meterChangeRate": (Math.max(0, meters.length - 1) * 100) / duration,
    "grid.offBarMeterChanges": offBarMeters / Math.max(1, meters.length - 1),
    "grid.sixteenthError": mean(
      pitched.map((n) => Math.abs(n.start * 4 - Math.round(n.start * 4)) / 4),
    ),
    "grid.subdivisionError": mean(errors),
    "grid.quantizedShare":
      errors.filter((e) => e < 0.02).length / errors.length,
    "grid.drumSubdivisionError": mean(
      drums.map((n) => subdivisionError(n.start)),
    ),
    "grid.strongBarOnsets": accents[0] / Math.max(1, accentTotal),
    "grid.barPhaseOffset": Math.min(peak, 16 - peak) / 16,
    "grid.barPhaseStrength": accents[peak] / Math.max(1, accentTotal),
    "timbre.explicitProgramShare":
      pitched.filter((n) => n.explicit).length / pitched.length,
    "timbre.nonDefaultBankShare":
      pitched.filter((n) => n.bank !== 0).length / pitched.length,
    "timbre.programChangeRate": (programEvents * 100) / duration,
    "timbre.velocityVariation": deviation(vel) / Math.max(1, mean(vel)),
    "timbre.quietShare": vel.filter((v) => v < 30).length / vel.length,
    "timbre.loudShare": vel.filter((v) => v >= 120).length / vel.length,
    "timbre.expressionChannels": channelFraction(11),
    "timbre.expressionRate": (expressionEvents * 100) / duration,
    "timbre.panSpread": deviation(panValues) / 64,
    "timbre.reverbChannels": channelFraction(91),
    "timbre.chorusChannels": channelFraction(93),
    "timbre.pitchBendChannels": channelFraction(-1),
    "timbre.modulationChannels": channelFraction(1),
    "integrity.unmatchedOffShare": unmatchedOff / Math.max(1, onCount),
    "integrity.unclosedNoteShare": unclosed / Math.max(1, onCount),
  };
  families.forEach((n, i) => {
    f[`timbre.family.${GM_FAMILIES[i]}`] = n / pitched.length;
  });
  const features = VERSION_FEATURE_NAMES.map((name) => f[name]);
  if (!features.every(Number.isFinite))
    throw new Error("Non-finite version feature");
  return {
    features,
    summary: {
      notes: notes.length,
      voices: voiceNotes.size,
      pitchedVoices: pitchedVoices.length,
      vocal: namedVoices.size
        ? "named"
        : lyrics.length >= 8
        ? "lyrics"
        : (best?.score ?? 0) > 0.5
        ? "melody"
        : "unverified",
      quantizedShare: f["grid.quantizedShare"],
      tempoChanges: tempos.length - 1,
      meterChanges: meters.length - 1,
    },
  };
}
