// Shared by the offline Lakh indexer and the score overlay. No React or MIDI
// reader dependencies: times can be seconds or beats, provided the grid agrees.
import structurePrior from "./structurePrior.json";
import {
  hasKeyModel,
  profileScores,
  rankedTonics,
  tonalFeatures,
} from "./keyRanker";
export const HARMONY_VERSION = "segmental-2";
export const PITCH_NAMES = [
  "C",
  "D♭",
  "D",
  "E♭",
  "E",
  "F",
  "F♯",
  "G",
  "A♭",
  "A",
  "B♭",
  "B",
];
export const QUALITIES = [
  "maj",
  "min",
  "dim",
  "aug",
  "sus2",
  "sus4",
  "7",
  "maj7",
  "min7",
  "hdim7",
  "dim7",
  "5",
] as const;
export type Quality = (typeof QUALITIES)[number];
const TONES: number[][] = [
  [0, 4, 7],
  [0, 3, 7],
  [0, 3, 6],
  [0, 4, 8],
  [0, 2, 7],
  [0, 5, 7],
  [0, 4, 7, 10],
  [0, 4, 7, 11],
  [0, 3, 7, 10],
  [0, 3, 6, 10],
  [0, 3, 6, 9],
  [0, 7],
];
const DEGREES = [
  "I",
  "♭II",
  "II",
  "♭III",
  "III",
  "IV",
  "♯IV",
  "V",
  "♭VI",
  "VI",
  "♭VII",
  "VII",
];
const PROFILES = [
  [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
];
const pc = (n: number) => ((n % 12) + 12) % 12;
const clamp = (n: number, low = 0, high = 1) =>
  Math.max(low, Math.min(high, n));
export type HarmonyNote = {
  start: number;
  end: number;
  pitch: number;
  voice: number;
  isDrum?: boolean;
};
export type HarmonyGrid = { measures: number[]; beats: number[] };
export type KeyRegion = {
  start: number;
  end: number;
  measure: number;
  tonic: number;
  mode: "major" | "minor";
  confidence: number;
  source: "inferred" | "reference";
};
export type HarmonyChord = {
  start: number;
  end: number;
  measure: number;
  root: number | null;
  quality: Quality | null;
  bass: number | null;
  confidence: number;
  keyConfidence: number;
  tonic: number;
  roman: string;
  alternatives: string[];
};
export type Boundary = {
  measure: number;
  time: number;
  strength: number;
  evidence: string;
};
export type StructurePrior = { phraseLengths: Record<number, number> };
export type HarmonyResult = {
  version: string;
  chords: HarmonyChord[];
  keys: KeyRegion[];
  inferredKeys: KeyRegion[];
  phrases: Boundary[];
  sections: Boundary[];
  warnings: string[];
};
export type HarmonyOptions = {
  referenceKeys?: { start: number; tonic: number }[];
  structurePrior?: StructurePrior;
};

// MIDI has no spelling. Follow the displayed Roman degree when a tonic is
// available, so iii in A reads C♯m rather than the unrelated spelling D♭m.
export function pitchName(pitch: number, tonic?: number) {
  if (tonic == null) return PITCH_NAMES[pc(pitch)];
  const letters = ["C", "D", "E", "F", "G", "A", "B"],
    natural = [0, 2, 4, 5, 7, 9, 11],
    degree = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6][pc(pitch - tonic)],
    letter = (letters.indexOf(PITCH_NAMES[pc(tonic)][0]) + degree) % 7,
    difference = pc(pitch - natural[letter]),
    accidental = difference > 6 ? difference - 12 : difference;
  return (
    letters[letter] +
    (accidental > 0 ? "♯".repeat(accidental) : "♭".repeat(-accidental))
  );
}

export function chordName(
  root: number | null,
  quality: Quality | null,
  tonic?: number,
) {
  if (root == null || quality == null) return "?";
  const suffix = {
    maj: "",
    min: "m",
    dim: "dim",
    aug: "+",
    sus2: "sus2",
    sus4: "sus4",
    "7": "7",
    maj7: "maj7",
    min7: "m7",
    hdim7: "m7♭5",
    dim7: "dim7",
    "5": "5",
  }[quality];
  return pitchName(root, tonic) + suffix;
}
export function romanNumeral(root: number, quality: Quality, tonic: number) {
  let degree = DEGREES[pc(root - tonic)];
  if (["min", "min7", "dim", "dim7", "hdim7"].includes(quality))
    degree = degree.toLowerCase();
  return (
    degree +
    {
      maj: "",
      min: "",
      dim: "°",
      aug: "+",
      sus2: "sus2",
      sus4: "sus4",
      "7": "7",
      maj7: "maj7",
      min7: "7",
      hdim7: "ø7",
      dim7: "°7",
      "5": "5",
    }[quality]
  );
}

export type QueryChord = { degree: number; quality: Quality };
export function parseProgression(query: string): QueryChord[] {
  const text = query
    .trim()
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/→|–|—|,/g, " ");
  if (!text) throw new Error("Enter a progression, such as IV bVII I.");
  return text.split(/\s+/).map((token) => {
    const match =
      /^([b#]?)(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(maj7|sus2|sus4|ø7|°7|dim7|dim|°|o7|o|\+|7|5)?$/.exec(
        token,
      );
    if (!match)
      throw new Error(
        `Unrecognized chord “${token}”. Use Roman numerals, for example IV bVII I or ii V7 I.`,
      );
    const [, accidental, numeral, suffix] = match;
    const diatonic = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 }[
      numeral.toUpperCase()
    ];
    const minor = numeral === numeral.toLowerCase();
    const quality: Quality =
      suffix === "maj7"
        ? "maj7"
        : suffix === "ø7"
        ? "hdim7"
        : ["°7", "o7", "dim7"].includes(suffix)
        ? "dim7"
        : ["°", "o", "dim"].includes(suffix)
        ? "dim"
        : suffix === "+"
        ? "aug"
        : suffix === "sus2"
        ? "sus2"
        : suffix === "sus4"
        ? "sus4"
        : suffix === "5"
        ? "5"
        : suffix === "7"
        ? minor
          ? "min7"
          : "7"
        : minor
        ? "min"
        : "maj";
    return {
      degree: pc(
        diatonic + (accidental === "b" ? -1 : accidental === "#" ? 1 : 0),
      ),
      quality,
    };
  });
}
export function chordToken(degree: number, quality: Quality) {
  return String.fromCharCode(
    65 + pc(degree) * QUALITIES.length + QUALITIES.indexOf(quality),
  );
}
export function qualityFamily(quality: Quality): Quality {
  return ["7", "maj7"].includes(quality)
    ? "maj"
    : quality === "min7"
    ? "min"
    : ["hdim7", "dim7"].includes(quality)
    ? "dim"
    : quality;
}
export function findProgression(
  sequence: string,
  certainty: string,
  query: QueryChord[],
  minConfidence = 0.6,
  families = true,
) {
  const projection: {
    token: string;
    score: string;
    start: number;
    end: number;
  }[] = [];
  const reduceFamilies =
    families &&
    query.every(
      (c) => !["7", "maj7", "min7", "hdim7", "dim7"].includes(c.quality),
    );
  for (let i = 0; i < sequence.length; i++) {
    const code = sequence.charCodeAt(i) - 65;
    const token =
      code < 0 || code >= 12 * QUALITIES.length
        ? "?"
        : reduceFamilies
        ? chordToken(
            Math.floor(code / QUALITIES.length),
            qualityFamily(QUALITIES[code % QUALITIES.length]),
          )
        : sequence[i];
    const previous = projection[projection.length - 1];
    if (previous?.token === token && token !== "?") {
      previous.end = i;
      previous.score = String.fromCharCode(
        Math.min(previous.score.charCodeAt(0), certainty.charCodeAt(i)),
      );
    } else projection.push({ token, score: certainty[i], start: i, end: i });
  }
  sequence = projection.map((p) => p.token).join("");
  certainty = projection.map((p) => p.score).join("");
  const matches: { index: number; endIndex: number; confidence: number }[] = [];
  for (let start = 0; start + query.length <= sequence.length; start++) {
    let confidence = 1,
      valid = true;
    for (let i = 0; i < query.length; i++) {
      const code = sequence.charCodeAt(start + i) - 65;
      if (code < 0 || code >= 12 * QUALITIES.length) {
        valid = false;
        break;
      }
      const degree = Math.floor(code / QUALITIES.length),
        quality = QUALITIES[code % QUALITIES.length];
      // An explicit seventh in a query is always exact, even in family mode.
      const expected = query[i];
      if (
        degree !== expected.degree ||
        (families &&
        !["7", "maj7", "min7", "hdim7", "dim7"].includes(expected.quality)
          ? qualityFamily(quality) !== expected.quality
          : quality !== expected.quality)
      ) {
        valid = false;
        break;
      }
      const value = (certainty.charCodeAt(start + i) - 33) / 90;
      if (!Number.isFinite(value) || value < minConfidence) {
        valid = false;
        break;
      }
      confidence = Math.min(confidence, value);
    }
    if (valid)
      matches.push({
        index: projection[start].start,
        endIndex: projection[start + query.length - 1].end,
        confidence,
      });
  }
  return matches;
}

type Frame = {
  start: number;
  end: number;
  weights: number[];
  bass: number[];
  voices: number[];
  activity: number;
};
function makeFrames(notes: HarmonyNote[], grid: HarmonyGrid): Frame[] {
  const points = [...new Set([...grid.measures, ...grid.beats])]
    .filter(Number.isFinite)
    .sort((a, b) => a - b);
  const times: number[] = [];
  for (let i = 0; i < points.length - 1; i++)
    times.push(points[i], (points[i] + points[i + 1]) / 2);
  times.push(points[points.length - 1]);
  const voiceInfo = new Map<
    number,
    { total: number; duration: number; count: number; pitch: number }
  >();
  for (const n of notes) {
    const v = voiceInfo.get(n.voice) || {
      total: 0,
      duration: 0,
      count: 0,
      pitch: 0,
    };
    v.total += n.end - n.start;
    v.count++;
    v.pitch += n.pitch;
    v.duration = Math.max(v.duration, n.end);
    voiceInfo.set(n.voice, v);
  }
  const highest = Math.max(
    ...[...voiceInfo.values()].map((v) => v.pitch / v.count),
  );
  const voiceWeight = (voice: number) => {
    const v = voiceInfo.get(voice)!;
    return v.total / Math.max(v.duration, 0.001) >= 1.7
      ? 1
      : v.pitch / v.count >= highest - 3 && voiceInfo.size > 1
      ? 0.35
      : 0.8;
  };
  const frames: Frame[] = [];
  let cursor = 0;
  let active: HarmonyNote[] = [];
  for (let i = 0; i < times.length - 1; i++) {
    const start = times[i],
      end = times[i + 1];
    while (cursor < notes.length && notes[cursor].start < end)
      active.push(notes[cursor++]);
    active = active.filter((n) => n.end > start);
    const byVoice = new Map<number, number[]>(),
      bass = Array(12).fill(0);
    let lowest = Infinity;
    for (const n of active) lowest = Math.min(lowest, n.pitch);
    for (const n of active) {
      const overlap = Math.max(
        0,
        Math.min(end, n.end) - Math.max(start, n.start),
      );
      if (!byVoice.has(n.voice)) byVoice.set(n.voice, Array(12).fill(0));
      byVoice.get(n.voice)![pc(n.pitch)] += overlap;
      if (n.pitch === lowest) bass[pc(n.pitch)] += overlap;
    }
    const weights = Array(12).fill(0);
    const voices: number[] = [];
    for (const [voice, w] of byVoice) {
      voices[voice] = w.reduce((a, b) => a + b, 0) / (end - start);
      for (let p = 0; p < 12; p++)
        weights[p] += Math.min(w[p], end - start) * voiceWeight(voice);
    }
    frames.push({
      start,
      end,
      weights,
      bass,
      voices,
      activity: weights.reduce((a, b) => a + b, 0),
    });
  }
  return frames;
}

type Candidate = {
  root: number;
  quality: Quality;
  score: number;
  fit: number;
  coverage: number;
};
function rankChords(weights: number[], bass: number[]): Candidate[] {
  const total = weights.reduce((a, b) => a + b, 0),
    max = Math.max(...weights),
    bassTotal = bass.reduce((a, b) => a + b, 0);
  if (total <= 1e-8) return [];
  const ranked: Candidate[] = [];
  for (let root = 0; root < 12; root++)
    for (let q = 0; q < QUALITIES.length; q++) {
      const tones = TONES[q];
      let inside = 0,
        coverage = 0;
      for (const tone of tones) {
        const value = weights[pc(root + tone)];
        inside += value;
        coverage += clamp(value / Math.max(max * 0.24, 1e-8));
      }
      const fit = inside / total;
      coverage /= tones.length;
      const rootPresence = clamp(weights[root] / Math.max(max * 0.3, 1e-8));
      const third = tones[1],
        thirdPresence = clamp(
          weights[pc(root + third)] / Math.max(max * 0.24, 1e-8),
        );
      // Extensions need audible support, otherwise triads remain preferable.
      const extensionPenalty =
        tones.length === 4
          ? 0.18 +
            0.65 *
              (1 -
                clamp(weights[pc(root + tones[3])] / Math.max(max * 0.4, 1e-8)))
          : 0;
      const powerPenalty = q === 11 ? 0.32 : 0;
      const score =
        2.7 * fit +
        0.9 * coverage +
        0.45 * (bass[root] / Math.max(bassTotal, 1e-8)) +
        0.12 * rootPresence -
        0.6 * (1 - thirdPresence) -
        extensionPenalty -
        powerPenalty;
      const candidate = { root, quality: QUALITIES[q], score, fit, coverage };
      const at = ranked.findIndex((c) => c.score < score);
      if (at >= 0) ranked.splice(at, 0, candidate);
      else if (ranked.length < 3) ranked.push(candidate);
      if (ranked.length > 3) ranked.pop();
    }
  return ranked;
}

function inferChords(frames: Frame[], grid: HarmonyGrid): HarmonyChord[] {
  const prefixes = [Array(24).fill(0)];
  for (const f of frames)
    prefixes.push(
      prefixes[prefixes.length - 1].map(
        (v, p) => v + (p < 12 ? f.weights[p] : f.bass[p - 12]),
      ),
    );
  const costs = Array(frames.length + 1).fill(-Infinity);
  costs[0] = 0;
  const back: { start: number; ranked: Candidate[]; bass: number[] }[] = [];
  for (let end = 1; end <= frames.length; end++) {
    for (const length of [1, 2, 4, 8]) {
      const start = end - length;
      if (start < 0) continue;
      const sums = prefixes[end].map((v, p) => v - prefixes[start][p]);
      const weights = sums.slice(0, 12),
        bass = sums.slice(12);
      const ranked = rankChords(weights, bass);
      // Unknown/silence has its own segment; never bridge it with a chord.
      const silent = frames.slice(start, end).some((f) => f.activity < 1e-8);
      if (silent && length > 1) continue;
      const score =
        costs[start] + length * ((ranked[0]?.score ?? 2.5) - 2.4) - 0.8;
      if (score > costs[end]) {
        costs[end] = score;
        back[end] = { start, ranked, bass };
      }
    }
  }
  const segments: HarmonyChord[] = [];
  let end = frames.length;
  while (end > 0) {
    const { start, ranked, bass } = back[end],
      best = ranked[0],
      runner = ranked[1];
    let confidence = best
      ? clamp(
          0.36 +
            0.34 * best.fit +
            0.22 * best.coverage +
            0.5 * (best.score - runner.score) -
            0.28,
        )
      : 0;
    if (best?.quality === "5" || best?.coverage < 0.9)
      confidence = Math.min(confidence, 0.54);
    const accepted = best && best.coverage >= 0.63 && best.fit >= 0.58;
    const time = frames[start].start;
    segments.push({
      start: time,
      end: frames[end - 1].end,
      measure: measureAt(grid.measures, time),
      root: accepted ? best.root : null,
      quality: accepted ? best.quality : null,
      bass: Math.max(...bass) > 0 ? bass.indexOf(Math.max(...bass)) : null,
      confidence: accepted ? confidence : 0,
      keyConfidence: 0,
      tonic: 0,
      roman: "?",
      alternatives: ranked.slice(1, 3).map((c) => chordName(c.root, c.quality)),
    });
    end = start;
  }
  const merged: HarmonyChord[] = [];
  for (const c of segments.reverse()) {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.root === c.root &&
      last.quality === c.quality &&
      Math.abs(last.end - c.start) < 1e-7
    ) {
      last.confidence =
        (last.confidence * (last.end - last.start) +
          c.confidence * (c.end - c.start)) /
        (c.end - last.start);
      last.end = c.end;
    } else merged.push(c);
  }
  return merged;
}

export function measureAt(measures: number[], time: number) {
  let lo = 0,
    hi = measures.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    // Packed sidecars round seconds to four decimals. Absorb that sub-ms
    // quantization so a chord on a bar line keeps the correct measure number.
    if (measures[mid] <= time + 1e-4) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}
function keyScores(weights: number[], bass: number[]): number[] {
  const mean = weights.reduce((a, b) => a + b, 0) / 12,
    norm = Math.sqrt(weights.reduce((s, v) => s + (v - mean) ** 2, 0));
  const bassTotal = bass.reduce((a, b) => a + b, 0);
  return Array.from({ length: 24 }, (_, k) => {
    const tonic = k % 12,
      profile = PROFILES[Math.floor(k / 12)],
      pm = profile.reduce((a, b) => a + b, 0) / 12;
    let dot = 0,
      pn = 0;
    for (let p = 0; p < 12; p++) {
      const v = profile[pc(p - tonic)] - pm;
      dot += (weights[p] - mean) * v;
      pn += v * v;
    }
    return (
      dot / Math.max(norm * Math.sqrt(pn), 1e-8) +
      (0.22 * bass[tonic]) / Math.max(bassTotal, 1e-8)
    );
  });
}
function inferKeys(
  frames: Frame[],
  grid: HarmonyGrid,
  notes: HarmonyNote[],
  chords: HarmonyChord[],
): KeyRegion[] {
  const count = grid.measures.length - 1;
  const weights = Array.from({ length: count }, () => Array(24).fill(0));
  for (const frame of frames) {
    const m = Math.min(count - 1, measureAt(grid.measures, frame.start) - 1);
    for (let p = 0; p < 12; p++) {
      weights[m][p] += frame.weights[p];
      weights[m][p + 12] += frame.bass[p];
    }
  }
  const tonicRankings: ReturnType<typeof rankedTonics>[] = [];
  const emissions = weights.map((_, m) => {
    if (hasKeyModel) {
      const groups = tonalFeatures(
        notes,
        chords,
        grid.measures[Math.max(0, m - 2)],
        grid.measures[Math.min(count, m + 3)],
      );
      const base = profileScores(groups),
        ranked = rankedTonics(groups);
      tonicRankings[m] = ranked;
      return base.map(
        (score, k) =>
          ranked.find((r) => r.tonic === k % 12)!.score +
          0.3 * (score - Math.max(base[k % 12], base[(k % 12) + 12])),
      );
    }
    const sums = Array(24).fill(0);
    for (let j = Math.max(0, m - 2); j < Math.min(count, m + 3); j++)
      for (let p = 0; p < 24; p++) sums[p] += weights[j][p];
    return keyScores(sums.slice(0, 12), sums.slice(12));
  });
  const back: number[][] = [],
    costs: number[][] = [];
  for (let m = 0; m < count; m++) {
    back[m] = [];
    costs[m] = [];
    for (let k = 0; k < 24; k++) {
      let best = -Infinity,
        previous = k;
      for (let p = 0; p < 24; p++) {
        const score = m === 0 ? 0 : costs[m - 1][p] - (p === k ? 0 : 1.6);
        if (score > best) {
          best = score;
          previous = p;
        }
      }
      costs[m][k] = best + emissions[m][k];
      back[m][k] = previous;
    }
  }
  const states: number[] = [];
  let k = costs[count - 1].indexOf(Math.max(...costs[count - 1]));
  for (let m = count - 1; m >= 0; m--) {
    states[m] = k;
    k = back[m][k];
  }
  const regions: KeyRegion[] = [];
  for (let m = 0; m < count; m++) {
    const state = states[m],
      others = emissions[m].filter((_, p) => p !== state),
      value = emissions[m][state];
    const confidence = hasKeyModel
      ? tonicRankings[m].find((r) => r.tonic === state % 12)!.confidence
      : clamp(
          0.4 +
            Math.max(0, value - 0.5) * 0.5 +
            Math.max(0, value - Math.max(...others)) * 2,
          0,
          0.95,
        );
    const last = regions[regions.length - 1];
    if (
      last &&
      last.tonic === state % 12 &&
      last.mode === (state < 12 ? "major" : "minor")
    ) {
      last.confidence =
        (last.confidence * (m - last.measure + 1) + confidence) /
        (m - last.measure + 2);
      last.end = grid.measures[m + 1];
    } else
      regions.push({
        start: grid.measures[m],
        end: grid.measures[m + 1],
        measure: m + 1,
        tonic: state % 12,
        mode: state < 12 ? "major" : "minor",
        confidence,
        source: "inferred",
      });
  }
  return regions;
}
function cosine(a: number[], b: number[]) {
  let dot = 0,
    aa = 0,
    bb = 0;
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = a[i] || 0,
      y = b[i] || 0;
    dot += x * y;
    aa += x * x;
    bb += y * y;
  }
  return aa && bb ? dot / Math.sqrt(aa * bb) : aa === bb ? 1 : 0;
}
function inferStructure(
  frames: Frame[],
  chords: HarmonyChord[],
  grid: HarmonyGrid,
  prior?: StructurePrior,
) {
  const count = grid.measures.length - 1;
  const bars = Array.from({ length: count }, () => ({
    chroma: Array(12).fill(0),
    voices: [] as number[],
    activity: 0,
  }));
  for (const f of frames) {
    const bar =
      bars[Math.min(count - 1, measureAt(grid.measures, f.start) - 1)];
    for (let p = 0; p < 12; p++) bar.chroma[p] += f.weights[p];
    for (let v = 0; v < f.voices.length; v++)
      bar.voices[v] = (bar.voices[v] || 0) + (f.voices[v] || 0);
    bar.activity += f.activity;
  }
  const meanVector = (from: number, to: number, field: "chroma" | "voices") => {
    const out: number[] = [];
    for (let m = from; m < to; m++)
      bars[m][field].forEach((v, p) => (out[p] = (out[p] || 0) + v));
    return out;
  };
  const strengths = bars.map((bar, m) => {
    if (!m) return 1;
    const lo = Math.max(0, m - 4),
      hi = Math.min(count, m + 4);
    const harmony =
      1 - cosine(meanVector(lo, m, "chroma"), meanVector(m, hi, "chroma"));
    const texture =
      1 - cosine(meanVector(lo, m, "voices"), meanVector(m, hi, "voices"));
    const density = Math.abs(
      Math.log((bars[m - 1].activity + 0.01) / (bar.activity + 0.01)),
    );
    return clamp(
      harmony * 0.55 + texture * 0.8 + Math.min(1, density / 3) * 0.25,
    );
  });
  // A phrase prior is learned only from training-song annotations. Cadence,
  // rest and novelty evidence can move boundaries away from a regular grid.
  const costs = Array(count + 1).fill(-Infinity),
    back = Array(count + 1).fill(0);
  costs[0] = 0;
  const starts = chords.filter((c) => c.root != null);
  const boundary = (m: number) => {
    const time = grid.measures[m];
    const next = starts.find((c) => c.start >= time - 1e-6);
    const cadence =
      next && next.start < grid.measures[m + 1] && next.root === next.tonic
        ? 0.15
        : 0;
    const rest =
      bars[m - 1]?.activity < 0.05 && bars[m]?.activity > 0.05 ? 0.5 : 0;
    return (strengths[m] || 0) + cadence + rest;
  };
  const maxPrior = Math.max(
    1,
    ...Object.values(prior?.phraseLengths || { 4: 1 }),
  );
  for (let end = 1; end <= count; end++)
    for (let length = 2; length <= 8; length++) {
      const start = end - length;
      if (start < 0) continue;
      const lengthPrior = prior
        ? Math.log(0.05 + (prior.phraseLengths[length] || 0) / maxPrior) * 0.12
        : length === 4
        ? 0
        : -0.18 * Math.abs(length - 4);
      const score =
        costs[start] + (start ? boundary(start) : 0) + lengthPrior - 0.16;
      if (score > costs[end]) {
        costs[end] = score;
        back[end] = start;
      }
    }
  const phraseMeasures = [1];
  let end = count;
  if (Number.isFinite(costs[end]))
    while (end > 0) {
      const start = back[end];
      if (start) phraseMeasures.push(start + 1);
      end = start;
    }
  phraseMeasures.sort((a, b) => a - b);
  const phrases = phraseMeasures.map((measure) => ({
    measure,
    time: grid.measures[measure - 1],
    strength: measure === 1 ? 1 : clamp(boundary(measure - 1)),
    evidence:
      measure === 1
        ? "start"
        : "phrase-length prior, cadence, rest and novelty",
  }));
  const sections: Boundary[] = [
    { measure: 1, time: grid.measures[0], strength: 1, evidence: "start" },
  ];
  for (let m = 4; m < count - 2; m++)
    if (
      strengths[m] >= 0.46 &&
      strengths[m] >= strengths[m - 1] &&
      strengths[m] >= strengths[m + 1] &&
      m + 1 - sections[sections.length - 1].measure >= 4
    ) {
      sections.push({
        measure: m + 1,
        time: grid.measures[m],
        strength: strengths[m],
        evidence: "sustained harmony or instrumentation change",
      });
    }
  return { phrases, sections };
}

export function analyzeHarmony(
  input: HarmonyNote[],
  grid: HarmonyGrid,
  options: HarmonyOptions = {},
): HarmonyResult {
  const empty: HarmonyResult = {
    version: HARMONY_VERSION,
    chords: [],
    keys: [],
    inferredKeys: [],
    phrases: [],
    sections: [],
    warnings: [],
  };
  if (grid.measures.length < 2)
    return { ...empty, warnings: ["No complete measure grid."] };
  if (
    grid.measures.some(
      (v, i) => !Number.isFinite(v) || (i > 0 && v <= grid.measures[i - 1]),
    )
  )
    return { ...empty, warnings: ["Invalid measure grid."] };
  const notes = input
    .filter(
      (n) =>
        !n.isDrum &&
        Number.isFinite(n.start) &&
        Number.isFinite(n.end) &&
        n.end > n.start &&
        Number.isInteger(n.pitch) &&
        n.pitch >= 0 &&
        n.pitch < 128,
    )
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  if (!notes.length) return { ...empty, warnings: ["No pitched notes."] };
  const frames = makeFrames(notes, grid);
  if (!frames.length || frames.length > 20000)
    return { ...empty, warnings: ["Unsupported analysis grid size."] };
  const rawChords = inferChords(frames, grid);
  const inferredKeys = inferKeys(frames, grid, notes, rawChords);
  const references = (options.referenceKeys || [])
    .filter(
      (k) =>
        Number.isFinite(k.start) &&
        Number.isInteger(k.tonic) &&
        k.tonic >= 0 &&
        k.tonic < 12,
    )
    .sort((a, b) => a.start - b.start);
  const keys = references.length
    ? references.map(
        (k, i): KeyRegion => ({
          start: k.start,
          end:
            references[i + 1]?.start ?? grid.measures[grid.measures.length - 1],
          measure: measureAt(grid.measures, k.start),
          tonic: k.tonic,
          mode:
            inferredKeys.find((r) => r.start <= k.start && r.end > k.start)
              ?.mode ?? "major",
          confidence: 1,
          source: "reference",
        }),
      )
    : inferredKeys;
  const chords: HarmonyChord[] = [];
  for (const chord of rawChords) {
    const cuts = [
      chord.start,
      ...keys
        .filter((k) => k.start > chord.start && k.start < chord.end)
        .map((k) => k.start),
      chord.end,
    ];
    for (let i = 0; i < cuts.length - 1; i++) {
      const start = cuts[i],
        key =
          keys.filter((k) => k.start <= start + 1e-8).slice(-1)[0] ||
          inferredKeys[0];
      chords.push({
        ...chord,
        start,
        end: cuts[i + 1],
        measure: measureAt(grid.measures, start),
        tonic: key.tonic,
        keyConfidence: key.confidence,
        roman:
          chord.root == null
            ? "?"
            : romanNumeral(chord.root, chord.quality, key.tonic),
      });
    }
  }
  const structure = inferStructure(
    frames,
    chords,
    grid,
    options.structurePrior || structurePrior,
  );
  return {
    version: HARMONY_VERSION,
    chords,
    keys,
    inferredKeys,
    ...structure,
    warnings: [],
  };
}

// Unknown spans and tonic changes terminate matches. Consecutive repeated
// harmonies collapse, with the minimum evidence score retained for retrieval.
export function encodeHarmony(result: HarmonyResult) {
  let sequence = "",
    certainty = "";
  const starts: number[] = [],
    ends: number[] = [];
  let previous: string | null = null,
    tonic: number | null = null;
  for (const chord of result.chords) {
    if (tonic !== null && tonic !== chord.tonic) {
      sequence += "?";
      certainty += "!";
      starts.push(chord.start);
      ends.push(chord.start);
      previous = null;
    }
    tonic = chord.tonic;
    const token =
      chord.root == null
        ? "?"
        : chordToken(pc(chord.root - chord.tonic), chord.quality);
    const score = String.fromCharCode(
      33 + Math.floor(90 * Math.min(chord.confidence, chord.keyConfidence)),
    );
    if (token === previous) {
      certainty =
        certainty.slice(0, -1) +
        String.fromCharCode(
          Math.min(
            certainty.charCodeAt(certainty.length - 1),
            score.charCodeAt(0),
          ),
        );
      ends[ends.length - 1] = chord.end;
    } else {
      sequence += token;
      certainty += score;
      starts.push(chord.start);
      ends.push(chord.end);
      previous = token;
    }
  }
  return { sequence, certainty, starts, ends };
}
