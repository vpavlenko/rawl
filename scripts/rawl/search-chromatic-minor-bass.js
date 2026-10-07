// Search the local MIDI backups for a descending chromatic bass from minor i.
// Run `node scripts/rawl/search-chromatic-minor-bass.js` to check annotated
// examples, or pass --save-top to scan all backups and refresh the review page.
// No annotations are used by the detector. They are used for evaluation,
// exclusion, and the phrase marks in frozen review snippets.
const fs = require("fs");
const path = require("path");
const { parseMidi } = require("midi-file");
const { fitLinearRanker, overlap } = require("./chromatic-minor-bass-ranker");
require("ts-node/register/transpile-only");
const { getPhraseStarts, getModulations, getTonicAtTime } =
  require("../../src/components/rawl/analysis.ts");

const root = path.join(__dirname, "../..");
const midiDir = path.join(root, "src/midis");
const { CHROMATIC_MINOR_TAGS, LEGACY_CHROMATIC_MINOR_TAG } =
  require("../../src/components/rawl/corpora/chromaticMinorBassTags.ts");
const tag = CHROMATIC_MINOR_TAGS[0];
const positiveTags = [...CHROMATIC_MINOR_TAGS, LEGACY_CHROMATIC_MINOR_TAG];
const negativeTag = "search_feedback:chromatic_line_down_from_minor_i_negative";
const saveTop = process.argv.includes("--save-top");
const all = process.argv.includes("--all") || saveTop;
const json = process.argv.includes("--json");
const index = JSON.parse(fs.readFileSync(path.join(midiDir, "midis.json"))).midis;
const analyses = JSON.parse(fs.readFileSync(path.join(root, "src/corpus/analyses.json")));
const feedback = JSON.parse(fs.readFileSync(path.join(root, "src/corpus/chromaticMinorBassFeedback.json")));
const previousResults = JSON.parse(fs.readFileSync(path.join(root, "src/corpus/chromaticMinorBassTop100.json")));
const tagged = new Map();
const negativeTagged = new Map();
for (const [key, analysis] of Object.entries(analyses)) {
  const snippets = (analysis.snippets || []).filter((s) => positiveTags.includes(s.tag));
  if (snippets.length) tagged.set(key.replace(/^f\//, ""), snippets);
  const negatives = (analysis.snippets || []).filter((s) => s.tag === negativeTag);
  if (negatives.length) negativeTagged.set(key.replace(/^f\//, ""), negatives);
}
const previousSnippets = [...previousResults.candidates, ...previousResults.taggedSnippets];
for (const [labels, destination, snippetTag] of [
  [feedback.positives, tagged, tag],
  [feedback.negatives, negativeTagged, negativeTag],
]) {
  for (const { slug, from, to } of labels) {
    const previous = previousSnippets.find((row) =>
      row.slug === slug && row.from === from && row.to === to);
    if (!previous) throw new Error(`No frozen snippet for feedback label ${slug} ${from}-${to}`);
    const snippets = destination.get(slug) || [];
    if (!snippets.some((snippet) => snippet.measuresSpan[0] === from && snippet.measuresSpan[1] === to)) {
      snippets.push({ ...previous.snippet, tag: snippetTag });
    }
    destination.set(slug, snippets);
  }
}
for (const { slug, from, to } of feedback.trainingOnlyPositives) {
  const snippets = tagged.get(slug) || [];
  if (!snippets.some((snippet) => snippet.measuresSpan[0] === from && snippet.measuresSpan[1] === to)) {
    // These live annotations are in a different part of an already indexed
    // piece; their frozen notes are unavailable in the downloaded review set.
    snippets.push({ tag, measuresSpan: [from, to] });
  }
  tagged.set(slug, snippets);
}

function annotatedPhraseStarts(annotation, measureCount) {
  if (!annotation) return null;
  // Manual remeasuring can put a phrase patch beyond the raw MIDI bar count.
  const throughPatch = Math.max(0, ...(annotation.phrasePatch || []).map(({ measure }) => measure + 4));
  return new Set(getPhraseStarts(annotation, Math.max(measureCount, throughPatch)));
}

function annotatedKeyAtCandidate(candidate, annotation, bars, tickToSeconds) {
  if (!annotation?.modulations) return null;
  const measureTimes = bars.map((bar) => tickToSeconds(bar.start));
  const modulations = getModulations(annotation, measureTimes);
  if (!modulations.length || modulations[0].time > tickToSeconds(candidate.starts[0])) return null;
  const key = getTonicAtTime(tickToSeconds(candidate.starts[0]), modulations, true);
  return Number.isInteger(key) && key >= 0 && key < 12 ? key : null;
}

function circularKeyDistance(tonic, annotatedKey) {
  if (annotatedKey == null) return null;
  const difference = Math.abs(tonic - annotatedKey);
  return Math.min(difference, 12 - difference);
}

function readMidi(file) {
  const data = JSON.parse(fs.readFileSync(file));
  if (!data.blobBase64) throw new Error("Missing blobBase64");
  return parseMidi(Buffer.from(data.blobBase64, "base64"));
}

function notesAndBars(midi) {
  const ticksPerBeat = midi.header.ticksPerBeat;
  if (!ticksPerBeat) throw new Error("SMPTE time division is unsupported");
  const notes = [];
  const signatures = [{ tick: 0, numerator: 4, denominator: 4 }];
  const tempos = [{ tick: 0, microsecondsPerBeat: 500000 }];
  let lastTick = 0;
  midi.tracks.forEach((track, trackIndex) => {
    let tick = 0;
    const active = new Map();
    for (const event of track) {
      tick += event.deltaTime;
      if (event.type === "timeSignature") {
        signatures.push({ tick, numerator: event.numerator, denominator: event.denominator });
      }
      if (event.type === "setTempo") {
        tempos.push({ tick, microsecondsPerBeat: event.microsecondsPerBeat });
      }
      if (event.channel == null || event.channel === 9) continue;
      const key = `${event.channel}:${event.noteNumber}`;
      if (event.type === "noteOn" && event.velocity > 0) {
        // A repeated note ends the previous instance even if its noteOff is absent.
        const previous = active.get(key);
        if (previous != null && tick > previous) {
          notes.push({ start: previous, end: tick, pitch: event.noteNumber, track: trackIndex });
        }
        active.set(key, tick);
      } else if (event.type === "noteOff" || (event.type === "noteOn" && event.velocity === 0)) {
        const start = active.get(key);
        if (start != null && tick > start) {
          notes.push({ start, end: tick, pitch: event.noteNumber, track: trackIndex });
        }
        active.delete(key);
      }
    }
    lastTick = Math.max(lastTick, tick);
  });
  signatures.sort((a, b) => a.tick - b.tick);
  const bars = [];
  let tick = 0;
  let signatureIndex = 0;
  while (tick < lastTick && bars.length < 10000) {
    while (signatureIndex + 1 < signatures.length && signatures[signatureIndex + 1].tick <= tick) {
      signatureIndex++;
    }
    const meter = signatures[signatureIndex];
    const length = ticksPerBeat * 4 * meter.numerator / meter.denominator;
    if (!Number.isFinite(length) || length <= 0) break;
    const nextChange = signatures[signatureIndex + 1]?.tick;
    const end = nextChange != null && nextChange < tick + length ? nextChange : tick + length;
    bars.push({ start: tick, end, numerator: meter.numerator, denominator: meter.denominator });
    tick = end;
  }
  tempos.sort((a, b) => a.tick - b.tick);
  const tempoSegments = [{ tick: 0, seconds: 0, microsecondsPerBeat: 500000 }];
  for (const tempo of tempos) {
    const previous = tempoSegments.at(-1);
    const seconds = previous.seconds +
      (tempo.tick - previous.tick) * previous.microsecondsPerBeat / (ticksPerBeat * 1000000);
    if (tempo.tick === previous.tick) {
      previous.microsecondsPerBeat = tempo.microsecondsPerBeat;
    } else {
      tempoSegments.push({ tick: tempo.tick, seconds, microsecondsPerBeat: tempo.microsecondsPerBeat });
    }
  }
  const tickToSeconds = (position) => {
    let low = 0;
    let high = tempoSegments.length - 1;
    while (low < high) {
      const middle = Math.ceil((low + high) / 2);
      if (tempoSegments[middle].tick <= position) low = middle;
      else high = middle - 1;
    }
    const segment = tempoSegments[low];
    return segment.seconds +
      (position - segment.tick) * segment.microsecondsPerBeat / (ticksPerBeat * 1000000);
  };
  return { notes, bars, ticksPerBeat, tickToSeconds };
}

function deltaCode(values) {
  return values.map((value, index) => index ? value - values[index - 1] : value);
}

function freezeSnippet(candidate, notes, bars, ticksPerBeat, tickToSeconds, annotation) {
  const start = bars[candidate.from - 1].start;
  const end = bars[candidate.to - 1].end;
  const startSeconds = tickToSeconds(start);
  const centiseconds = (tick) => Math.round((tickToSeconds(tick) - startSeconds) * 100);
  const voices = new Map();
  for (const note of notes) {
    if (note.start >= end || note.end <= start) continue;
    if (!voices.has(note.track)) voices.set(note.track, {});
    const voice = voices.get(note.track);
    const length = Math.max(1, Math.round((tickToSeconds(note.end) - tickToSeconds(note.start)) * 100));
    const starts = voice[length] ||= {};
    (starts[note.pitch] ||= []).push(centiseconds(note.start));
  }
  const notesInVoices = [...voices.values()].map((voice) => {
    for (const pitches of Object.values(voice)) {
      for (const [pitch, starts] of Object.entries(pitches)) {
        const uniqueStarts = starts.sort((a, b) => a - b)
          .filter((value, index, sorted) => index === 0 || value !== sorted[index - 1]);
        pitches[pitch] = deltaCode(uniqueStarts);
      }
    }
    return voice;
  });
  const measures = bars.slice(candidate.from - 1, candidate.to).map((bar) => centiseconds(bar.start));
  measures.push(centiseconds(end));
  const beats = [];
  for (const bar of bars.slice(candidate.from - 1, candidate.to)) {
    for (let tick = bar.start; tick < bar.end; tick += ticksPerBeat) beats.push(centiseconds(tick));
  }
  return {
    tag: "search:chromatic_minor_bass_candidate",
    measuresSpan: [candidate.from, candidate.to],
    // Match FrozenNotesLayout: freeze phrase starts from the piece analysis.
    // Unannotated pieces have no trusted phrase marks to display.
    phraseStarts: [...(annotatedPhraseStarts(annotation, bars.length + 1) || [])].filter(
      (measure) => measure >= candidate.from && measure <= candidate.to,
    ),
    frozenNotes: {
      notesInVoices,
      analysis: {
        modulations: { 1: candidate.pitches[0] % 12 },
        measuresAndBeats: { measures: deltaCode(measures), beats: deltaCode(beats) },
      },
    },
  };
}

function bassByBar(notes, bars, ticksPerBeat) {
  // For each bar choose the lowest pitch with enough sounding time to be a
  // structural bass, so a short grace note does not define the harmony.
  const ordered = notes.slice().sort((a, b) => a.start - b.start);
  let next = 0;
  let active = [];
  return bars.map((bar, index) => {
    while (next < ordered.length && ordered[next].start < bar.end) active.push(ordered[next++]);
    active = active.filter((note) => note.end > bar.start);
    const occupancy = new Map();
    const activeNotes = [];
    for (const note of active) {
      const duration = Math.max(0, Math.min(note.end, bar.end) - Math.max(note.start, bar.start));
      if (!duration) continue;
      occupancy.set(note.pitch, (occupancy.get(note.pitch) || 0) + duration);
      activeNotes.push({ ...note, duration });
    }
    const threshold = Math.min(bar.end - bar.start, ticksPerBeat) * 0.08;
    const pitches = [...occupancy].filter(([, duration]) => duration >= threshold).map(([pitch]) => pitch);
    return { measure: bar.measure || index + 1, start: bar.start, end: bar.end,
      pitch: pitches.length ? Math.min(...pitches) : null, activeNotes };
  });
}

function minorSupport(bar, tonic) {
  const classes = new Set(bar.activeNotes.filter((n) => n.duration >= (bar.end - bar.start) * 0.08)
    .map((n) => n.pitch % 12));
  return Number(classes.has((tonic + 3) % 12)) + Number(classes.has((tonic + 7) % 12));
}

function majorThirdDominates(bar, tonic, ticksPerBeat, minimumBeats = 0.5) {
  // Presence alone is misleading: a brief minor third can coexist with a
  // sustained major chord. Compare sounding time in the opening measure.
  let minorThirdTicks = 0;
  let majorThirdTicks = 0;
  const minNoteDuration = (bar.end - bar.start) * 0.08;
  for (const note of bar.activeNotes) {
    if (note.duration < minNoteDuration) continue;
    const interval = (note.pitch - tonic + 12) % 12;
    if (interval === 3) minorThirdTicks += note.duration;
    if (interval === 4) majorThirdTicks += note.duration;
  }
  return majorThirdTicks >= ticksPerBeat * minimumBeats && majorThirdTicks > minorThirdTicks;
}

function descendsFromMajor(barSummaries, startMeasure, startPitch, ticksPerBeat) {
  // Do not relabel the tail of a major-led chromatic descent as a new minor-i
  // passage merely by starting the match one or two bars later. A repeated
  // bass before the match is allowed; the major chord must precede an actual
  // downward step into the candidate.
  let nextPitch = startPitch;
  let descent = 0;
  for (let measure = startMeasure - 1; measure >= Math.max(1, startMeasure - 4); measure--) {
    const previous = barSummaries[measure - 1];
    if (previous?.pitch == null) break;
    const step = (previous.pitch - nextPitch + 120) % 12;
    if (step > 2 || descent + step > 4) break;
    descent += step;
    if (descent > 0 && majorThirdDominates(previous, previous.pitch % 12, ticksPerBeat, 1.5)) {
      return true;
    }
    nextPitch = previous.pitch;
  }
  return false;
}

function evenHarmonicRhythm(starts, ticksPerBeat) {
  const intervals = starts.slice(1).map((start, index) =>
    (start - starts[index]) / ticksPerBeat);
  const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  const pulses = [...new Set([
    ...intervals.flatMap((interval) => [interval, interval / 2]),
    Math.round(mean * 2) / 2,
  ])]
    .filter((pulse) => pulse >= 1);
  const maxDoubledGaps = Math.max(1, Math.floor(intervals.length / 4));
  const fits = pulses.flatMap((pulse) => {
    const tolerance = Math.max(0.16, pulse * 0.16);
    let doubledGaps = 0;
    let error = 0;
    for (const interval of intervals) {
      const singleError = Math.abs(interval - pulse);
      const doubleError = Math.abs(interval - 2 * pulse);
      if (singleError <= tolerance) error += singleError / pulse;
      else if (doubleError <= 2 * tolerance) {
        doubledGaps++;
        error += doubleError / (2 * pulse);
      } else return [];
    }
    return doubledGaps <= maxDoubledGaps ? [{ pulse, doubledGaps, error }] : [];
  });
  return fits.sort((a, b) => a.doubledGaps - b.doubledGaps ||
    a.error - b.error || b.pulse - a.pulse)[0] || null;
}

function isStrongBeat(tick, bars, ticksPerBeat) {
  let low = 0;
  let high = bars.length - 1;
  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (tick < bars[middle].end) high = middle;
    else low = middle + 1;
  }
  const bar = bars[low];
  if (!bar) return false;
  const accents = [bar.start, bar.end];
  if (bar.numerator >= 4 && bar.numerator % 2 === 0) {
    accents.push((bar.start + bar.end) / 2);
  }
  return accents.some((accent) => Math.abs(tick - accent) <= ticksPerBeat * 0.3);
}

function searchGrid(notes, grid, bars, ticksPerBeat) {
  const bass = bassByBar(notes, grid, ticksPerBeat);
  const barSummaries = bassByBar(notes, bars, ticksPerBeat);
  const notesByPitch = new Map();
  for (const note of notes) {
    if (!notesByPitch.has(note.pitch)) notesByPitch.set(note.pitch, []);
    notesByPitch.get(note.pitch).push(note);
  }
  const candidates = [];
  for (let start = 0; start < bass.length; start++) {
    if (bass[start].pitch == null) continue;
    const sequence = [bass[start]];
    let semitones = 0;
    let skipped = 0;
    let last = bass[start].pitch;
    for (let i = start + 1; i < bass.length &&
      bass[i].start - bass[start].start < ticksPerBeat * 48; i++) {
      const current = bass[i];
      if (current.pitch == null) break;
      // Treat octave doubling as the same bass pitch class while preserving a
      // register-continuous descent. A held/repeated bass may occupy two bars.
      const possibilities = [current.pitch - 12, current.pitch, current.pitch + 12];
      const pitch = possibilities.find((p) => p === last || p === last - 1 || p === last - 2);
      if (pitch == null) break;
      // The tagged gesture normally spans a fourth or somewhat more; a rapid
      // two-octave chromatic run is a different feature.
      if (sequence[0].pitch - pitch > 12) break;
      if (pitch === last) {
        if (i - start > 8 * sequence.length) break;
        continue;
      }
      if (pitch === last - 2) {
        // A weak chromatic passing bass can be obscured by the per-bar summary.
        // Credit it when it actually occurs between the two structural notes.
        const passing = (notesByPitch.get(last - 1) || []).some((n) =>
          n.start >= bass[i - 1].start && n.start < current.end &&
          n.end - n.start >= ticksPerBeat * 0.08);
        if (passing) semitones += 2;
        else skipped++;
      } else semitones++;
      if (skipped > 2) break;
      sequence.push({ ...current, pitch, sourcePitch: current.pitch });
      last = pitch;
    }
    if (sequence.length < 3 || semitones < 2) continue;
    const openingBar = barSummaries[bass[start].measure - 1];
    const tonic = bass[start].pitch % 12;
    if (majorThirdDominates(openingBar, tonic, ticksPerBeat)) continue;
    if (descendsFromMajor(barSummaries, bass[start].measure, bass[start].pitch, ticksPerBeat)) continue;
    const support = minorSupport(openingBar, tonic);
    if (support < 1 && sequence.length < 5) continue;
    const triggerNotes = sequence.map((step) => {
      const note = step.activeNotes
        .filter((active) => active.pitch === (step.sourcePitch ?? step.pitch) &&
          Math.abs(active.start - step.start) <= ticksPerBeat * 0.3 &&
          isStrongBeat(active.start, bars, ticksPerBeat))
        .sort((a, b) => Math.abs(a.start - step.start) - Math.abs(b.start - step.start) ||
          b.duration - a.duration)[0];
      return note && { start: note.start, pitch: note.pitch };
    });
    if (triggerNotes.some((note) => !note)) continue;
    const rhythm = evenHarmonicRhythm(triggerNotes.map((note) => note.start), ticksPerBeat);
    if (!rhythm) continue;
    const score = sequence.length * 2 + semitones + support * 2 - skipped * 2 - rhythm.doubledGaps;
    const bassNotes = sequence.length;
    candidates.push({ from: sequence[0].measure, to: sequence.at(-1).measure,
      pitches: sequence.map((x) => x.pitch), starts: triggerNotes.map((x) => x.start),
      triggerNotes, bassNotes, semitones, skipped, minorSupport: support,
      harmonicPulseBeats: rhythm.pulse, doubledGaps: rhythm.doubledGaps, score });
  }
  return candidates;
}

function search(notes, bars, ticksPerBeat) {
  const halfBarGrid = bars.flatMap((bar, index) => {
    const middle = (bar.start + bar.end) / 2;
    return [{ start: bar.start, end: middle, measure: index + 1 },
      { start: middle, end: bar.end, measure: index + 1 }];
  });
  const beatGrid = bars.flatMap((bar, index) => {
    const grid = [];
    for (let tick = bar.start; tick < bar.end; tick += ticksPerBeat) {
      grid.push({ start: tick, end: Math.min(bar.end, tick + ticksPerBeat), measure: index + 1 });
    }
    return grid;
  });
  const candidates = [...searchGrid(notes, bars, bars, ticksPerBeat),
    ...searchGrid(notes, halfBarGrid, bars, ticksPerBeat),
    ...searchGrid(notes, beatGrid, bars, ticksPerBeat)];
  // A long run generates shorter suffixes. Keep the strongest overlapping run.
  return candidates.sort((a, b) => b.score - a.score).filter((c, i, arr) =>
    !arr.slice(0, i).some((other) => other.from <= c.from && other.to >= c.to));
}

function thirdRatios(candidate, notes, bars, ticksPerBeat) {
  const start = bars[candidate.from - 1].start;
  const end = bars[candidate.to - 1].end;
  const tonic = candidate.pitches[0] % 12;
  const bassTriggers = new Set(candidate.triggerNotes.map((note) => `${note.start}:${note.pitch}`));
  let minorAttacks = 0;
  let majorAttacks = 0;
  let minorDuration = 0;
  let majorDuration = 0;
  for (const note of notes) {
    if (note.start >= end || note.end <= start ||
      bassTriggers.has(`${note.start}:${note.pitch}`)) continue;
    const interval = (note.pitch - tonic + 12) % 12;
    if (interval !== 3 && interval !== 4) continue;
    const duration = Math.min(note.end, end) - Math.max(note.start, start);
    if (interval === 3) {
      minorDuration += duration;
      if (note.start >= start) minorAttacks++;
    } else {
      majorDuration += duration;
      if (note.start >= start) majorAttacks++;
    }
  }
  return {
    // A half-share with no third evidence; one pseudo-note per class keeps
    // sparse excerpts from receiving extreme scores.
    minorThirdAttackShare: (minorAttacks + 1) / (minorAttacks + majorAttacks + 2),
    minorThirdDurationShare: (minorDuration + ticksPerBeat) /
      (minorDuration + majorDuration + 2 * ticksPerBeat),
    minorThirdAttacks: minorAttacks,
    majorThirdAttacks: majorAttacks,
  };
}

function openingMinorPlausibility(candidate, notes, ticksPerBeat) {
  const start = candidate.starts[0];
  const end = Math.min(candidate.starts[1], start + 4 * ticksPerBeat);
  const tonic = candidate.pitches[0] % 12;
  const sounding = Array(12).fill(0);
  for (const note of notes) {
    if (note.start >= end || note.end <= start) continue;
    const duration = Math.min(note.end, end) - Math.max(note.start, start);
    if (duration < ticksPerBeat * 0.125) continue;
    const interval = (note.pitch - tonic + 12) % 12;
    sounding[interval] += duration;
  }
  // Cap octave doubling so a doubled root does not hide a dissonant pitch.
  const occupancy = sounding.map((duration) => Math.min(duration, end - start));
  const triad = [0, 3, 7].reduce((sum, interval) => sum + occupancy[interval], 0);
  const avoid = [1, 4, 6, 8].reduce((sum, interval) => sum + occupancy[interval], 0);
  return triad / Math.max(1, triad + avoid);
}

function saveTopCandidates(results, summary) {
  const bySlug = new Map(index.map((entry) => [entry.slug, entry]));
  const resultsBySlug = new Map(results.map((result) => [result.slug, result]));
  const ranked = results.flatMap((result) => result.matches.map((match) =>
    ({ slug: result.slug, ...match })));
  const ranker = fitLinearRanker(ranked, tagged, negativeTagged);
  ranked.sort((a, b) =>
    ranker.score(b) - ranker.score(a) || a.slug.localeCompare(b.slug) || a.from - b.from);
  ranked.forEach((candidate, index) => { candidate.rank = index + 1; });
  const usedSlugs = new Set();
  const top = [];
  for (const candidate of ranked) {
    // The review queue contains new pieces, not another occurrence from a
    // piece that already has a saved example of this tag.
    if (tagged.has(candidate.slug) || negativeTagged.has(candidate.slug)) continue;
    if (usedSlugs.has(candidate.slug)) continue;
    usedSlugs.add(candidate.slug);
    const entry = bySlug.get(candidate.slug);
    const { notes, bars, ticksPerBeat, tickToSeconds } = notesAndBars(readMidi(path.join(midiDir, `${entry.id}.json`)));
    const start = bars[candidate.from - 1]?.start;
    const end = bars[candidate.to - 1]?.end;
    if (start == null || end == null) continue;
    const startSeconds = tickToSeconds(start);
    const bassTriggers = [...new Set(candidate.triggerNotes.filter(Boolean).map((note) =>
      `${note.pitch}:${Math.round((tickToSeconds(note.start) - startSeconds) * 100)}`))]
      .map((key) => key.split(":").map(Number));
    top.push({
      rank: candidate.rank,
      slug: candidate.slug,
      title: entry.title,
      from: candidate.from,
      to: candidate.to,
      bassNotes: candidate.bassNotes,
      minorSupport: candidate.minorSupport,
      harmonicPulseBeats: candidate.harmonicPulseBeats,
      doubledGaps: candidate.doubledGaps,
      skipped: candidate.skipped,
      score: candidate.score,
      rankingScore: Number(ranker.score(candidate).toFixed(4)),
      rankingBreakdown: ranker.breakdown(candidate),
      minorThirdAttackShare: Number(candidate.minorThirdAttackShare.toFixed(3)),
      minorThirdDurationShare: Number(candidate.minorThirdDurationShare.toFixed(3)),
      minorThirdAttacks: candidate.minorThirdAttacks,
      majorThirdAttacks: candidate.majorThirdAttacks,
      openingMinorPlausibility: Number(candidate.openingMinorPlausibility.toFixed(3)),
      detectedTonic: candidate.pitches[0] % 12,
      annotatedKey: candidate.annotatedKey,
      annotatedKeyDistance: candidate.annotatedKeyDistance,
      phraseStart: candidate.phraseStart,
      bassTriggers,
      snippet: freezeSnippet(candidate, notes, bars, ticksPerBeat, tickToSeconds,
        analyses[`f/${candidate.slug}`]),
    });
    if (top.length === 100) break;
  }
  const labeledSnippets = [
    ...[...tagged].flatMap(([slug, snippets]) => snippets.filter((snippet) => snippet.frozenNotes)
      .map((snippet) => ({ slug, snippet, negative: false }))),
    ...[...negativeTagged].flatMap(([slug, snippets]) => snippets.map((snippet) => ({ slug, snippet, negative: true }))),
  ];
  const taggedSnippets = labeledSnippets.map(({ slug, snippet, negative }) => {
    const entry = bySlug.get(slug);
    const result = resultsBySlug.get(slug);
    const [from, to] = snippet.measuresSpan;
    const match = result && ranked.find((candidate) => candidate.slug === slug &&
      overlap(candidate, [from, to]));
    const status = negative ? "negative" : !entry || !result ? "unscanned" : match ? "pass" : "fail";
    let bassTriggers = [];
    if (match) {
      const { bars, tickToSeconds } = notesAndBars(readMidi(path.join(midiDir, `${entry.id}.json`)));
      const start = tickToSeconds(bars[from - 1].start);
      bassTriggers = match.triggerNotes.filter((note) => note &&
        note.start >= bars[from - 1].start && note.start < bars[to - 1].end)
        .map((note) => [note.pitch, Math.round((tickToSeconds(note.start) - start) * 100)]);
    }
    return {
      slug, title: entry?.title || slug, from, to, status,
      scanned: Boolean(entry && result),
      rank: match?.rank ?? null,
      rankingScore: match ? Number(ranker.score(match).toFixed(4)) : null,
      rankingBreakdown: match ? ranker.breakdown(match) : null,
      minorThirdAttackShare: match ? Number(match.minorThirdAttackShare.toFixed(3)) : null,
      minorThirdDurationShare: match ? Number(match.minorThirdDurationShare.toFixed(3)) : null,
      minorThirdAttacks: match?.minorThirdAttacks ?? null,
      majorThirdAttacks: match?.majorThirdAttacks ?? null,
      openingMinorPlausibility: match ? Number(match.openingMinorPlausibility.toFixed(3)) : null,
      detectedTonic: match ? match.pitches[0] % 12 : null,
      annotatedKey: match?.annotatedKey ?? null,
      annotatedKeyDistance: match?.annotatedKeyDistance ?? null,
      bassNotes: match?.bassNotes ?? null,
      minorSupport: match?.minorSupport ?? null,
      harmonicPulseBeats: match?.harmonicPulseBeats ?? null,
      doubledGaps: match?.doubledGaps ?? null,
      skipped: match?.skipped ?? null,
      phraseStart: match?.phraseStart ?? null,
      bassTriggers, snippet,
    };
  });
  const output = path.join(root, "src/corpus/chromaticMinorBassTop100.json");
  fs.writeFileSync(output, `${JSON.stringify({
    description: "Descending chromatic bass from minor i, with onsets on strong beats: new MIDI candidates",
    ranking: "Detected passages are ranked by a linear score using bass-note count, minor-chord support, skipped and doubled steps, chromatic-step ratio, harmonic pulse, excerpt-wide minor-third attack share, opening minor-chord plausibility, and distance from the annotated key when available; one excerpt per new MIDI. Annotated phrase starts are recorded separately because they are unavailable for most new MIDI files",
    ranker: ranker.report,
    scanned: summary.searched,
    negativeSnippets: labeledSnippets.filter((item) => item.negative).length,
    candidates: top,
    taggedSnippets,
  })}\n`);
  console.log(`Saved ${top.length} new candidates and ${taggedSnippets.length} tagged snippets to ${path.relative(root, output)}`);
  require("./record-model-training.cjs").recordTrainingRun({
    model: "chromaticBass", status: "promoted", command: [process.execPath, ...process.argv.slice(1)], artifact: ranker.report, evaluation: ranker.report,
    inputFiles: ["src/corpus/analyses.json", "src/corpus/chromaticMinorBassFeedback.json"],
    metadata: { candidateOutput: path.relative(root, output), candidates: ranked.length, scanned: summary.searched, normalization: "Means/scales fitted on all candidate features, including held-out rows; cross-validation is diagnostic", holdout: "Four folds by slug hash; additional factors were manually tuned" },
  });
}

function main() {
  const entries = all ? index : index.filter((entry) => tagged.has(entry.slug));
  const indexedSlugs = new Set(index.map((entry) => entry.slug));
  const unindexedTagged = [...tagged.keys()].filter((slug) => !indexedSlugs.has(slug));
  const results = [];
  let missing = 0;
  let failures = 0;
  for (const entry of entries) {
    const file = path.join(midiDir, `${entry.id}.json`);
    if (!fs.existsSync(file)) { missing++; continue; }
    try {
      const midi = readMidi(file);
      const { notes, bars, ticksPerBeat, tickToSeconds } = notesAndBars(midi);
      const annotation = analyses[`f/${entry.slug}`];
      const phraseStarts = annotatedPhraseStarts(annotation, bars.length + 1);
      const matches = search(notes, bars, ticksPerBeat).map((match) => ({
        ...match,
        ...thirdRatios(match, notes, bars, ticksPerBeat),
        openingMinorPlausibility: openingMinorPlausibility(match, notes, ticksPerBeat),
        annotatedKey: annotatedKeyAtCandidate(match, annotation, bars, tickToSeconds),
        phraseStart: phraseStarts ? phraseStarts.has(match.from) : null,
      })).map((match) => ({ ...match,
        annotatedKeyDistance: circularKeyDistance(match.pitches[0] % 12, match.annotatedKey),
      }));
      const expected = (tagged.get(entry.slug) || []).map((s) => s.measuresSpan);
      const hits = expected.map(([a, b]) => matches.some((m) =>
        Math.max(0, Math.min(m.to, b) - Math.max(m.from, a) + 1) >= Math.min(2, b - a + 1)));
      results.push({ slug: entry.slug, expected, hits, matches });
    } catch (error) {
      failures++;
      if (!json) console.error(`${entry.slug}: ${error.message}`);
    }
  }
  const expectedCount = results.reduce((n, r) => n + r.expected.length, 0);
  const hitCount = results.reduce((n, r) => n + r.hits.filter(Boolean).length, 0);
  const summary = { files: entries.length, searched: results.length, missing, failures,
    taggedSnippets: expectedCount, retrievedSnippets: hitCount,
    filesWithMatches: results.filter((r) => r.matches.length).length, unindexedTagged };
  if (saveTop) saveTopCandidates(results, summary);
  if (json) console.log(JSON.stringify({ summary, results }, null, 2));
  else if (saveTop) console.log(JSON.stringify(summary));
  else {
    console.log(JSON.stringify(summary));
    for (const result of results) {
      if (!result.expected.length && !result.matches.length) continue;
      const status = result.expected.length ? result.hits.map((hit) => hit ? "HIT" : "MISS").join(",") : "candidate";
      const matches = result.matches.slice(0, 5).map((m) =>
        `${m.from}-${m.to} [${m.pitches.join(",")}] score=${m.score}`).join("; ");
      console.log(`${status}\t${result.slug}\ttag=${JSON.stringify(result.expected)}\t${matches}`);
    }
  }
}

main();
