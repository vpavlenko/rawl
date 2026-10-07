import type { HarmonyGrid, HarmonyNote } from "./harmony";
import { phraseFeatures, PHRASE_FEATURE_NAMES } from "./phraseFeatures";

// Candidate spans use zero-based, half-open bar indices. Only MIDI and its
// timing grid enter this extractor; no saved phrases, sections or tonics.
export const SECTION_FEATURE_VERSION = "section-features-1";
export const SECTION_LENGTHS = [
  ...Array.from({ length: 64 }, (_, i) => i + 1),
  96,
  128,
];
const log = (x: number) => Math.log1p(Math.max(0, x));
const cosine = (a: number[], b: number[]) => {
  const aa = a.reduce((s, x) => s + x * x, 0),
    bb = b.reduce((s, x) => s + x * x, 0);
  return aa && bb
    ? a.reduce((s, x, i) => s + x * b[i], 0) / Math.sqrt(aa * bb)
    : 0;
};
const mod = (x: number) => ((x % 12) + 12) % 12;
const profiles = [
  [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
];
const templates = [
  [0, 4, 7],
  [0, 3, 7],
  [0, 3, 6],
  [0, 4, 8],
  [0, 2, 7],
  [0, 5, 7],
  [0, 4, 7, 10],
  [0, 4, 7, 11],
  [0, 3, 7, 10],
];
function chord(chroma: number[]) {
  const total = chroma.reduce((s, x) => s + x, 0);
  if (!total) return { root: -1, quality: -1, confidence: 0 };
  let best = -Infinity,
    second = -Infinity,
    root = 0,
    quality = 0;
  for (let r = 0; r < 12; r++)
    for (let q = 0; q < templates.length; q++) {
      const weights = templates[q].map((p) => chroma[mod(r + p)] / total);
      const coverage = weights.reduce((s, x) => s + x, 0);
      const score =
        coverage -
        (1 - coverage) * 0.5 +
        Math.min(...weights) * 0.8 -
        (templates[q].length - 3) * 0.04;
      if (score > best) {
        second = best;
        best = score;
        root = r;
        quality = q;
      } else second = Math.max(second, score);
    }
  return {
    root,
    quality,
    confidence:
      Math.max(0, Math.min(1, best)) * Math.min(1, (best - second) * 8 + 0.15),
  };
}
type Tokens = Map<number, number>;
type Bar = {
  tokens: Tokens[];
  counts: number[];
  chroma: number[];
  quarters: number[][];
  downbeat: number[];
  bass: number;
  onsets: number[];
};
const emptyBar = (): Bar => ({
  tokens: [new Map(), new Map(), new Map()],
  counts: [0, 0, 0],
  chroma: Array(12).fill(0),
  quarters: Array.from({ length: 8 }, () => Array(12).fill(0)),
  downbeat: Array(12).fill(0),
  bass: 128,
  onsets: Array(4).fill(0),
});
const intersection = (a: Tokens, b: Tokens) => {
  let count = 0;
  (a.size < b.size ? a : b).forEach((value, key) => {
    count += Math.min(value, (a.size < b.size ? b : a).get(key) || 0);
  });
  return count;
};
const boundaryFields = [
  "hasDrums",
  "pitchedVoices",
  ...["pitch", "melody", "bass", "drum"].flatMap((stream) =>
    [
      "onsets",
      "nextOnsets",
      "relativeDensity",
      "densityChange",
      "quarter0",
      "quarter1",
      "quarter2",
      "quarter3",
      "lateAcceleration",
      "lateBurst",
      "endGap",
      "nextGap",
      "nextDownbeat",
      "meanDuration",
      "sustainAcross",
      "lateAccent",
      "onsetNovelty",
      "chromaNovelty",
      "contextOnsetNovelty",
      "contextChromaNovelty",
      "pitchStep",
    ].map((field) => `${stream}.${field}`),
  ),
  ...[2, 3, 4].flatMap((g) => [
    `drum.group${g}`,
    `drum.lateGroup${g}`,
    `drum.nextGroup${g}`,
  ]),
  "voices.endGapMean",
  "voices.entranceFraction",
  "voices.exitFraction",
];
const boundaryIndices = boundaryFields.map((name) =>
  PHRASE_FEATURE_NAMES.indexOf(name),
);
const entranceFields = [
  "hasDrums",
  "pitch.nextGap",
  "pitch.nextDownbeat",
  "pitch.onsetNovelty",
  "pitch.chromaNovelty",
  "pitch.contextOnsetNovelty",
  "pitch.contextChromaNovelty",
  "voices.entranceFraction",
  "voices.exitFraction",
];
const entranceIndices = entranceFields.map((name) =>
  PHRASE_FEATURE_NAMES.indexOf(name),
);
const drumFields = [
  "onsets",
  "quarter0",
  "quarter1",
  "quarter2",
  "quarter3",
  "lateAcceleration",
  "lateBurst",
  "lateAccent",
  "group2",
  "group3",
  "group4",
  "lateGroup2",
  "lateGroup3",
  "lateGroup4",
];
const drumIndices = drumFields.map((field) =>
  PHRASE_FEATURE_NAMES.indexOf(`drum.${field}`),
);
const harmonyFields = [
  "noteCount",
  "quarter0Notes",
  "quarter1Notes",
  "quarter2Notes",
  "quarter3Notes",
  ...Array.from({ length: 12 }, (_, i) => `downbeatInterval${i}`),
  "firstRootDegree",
  "lastRootDegree",
  "firstQuality",
  "lastQuality",
  "firstConfidence",
  "lastConfidence",
  "harmonicChanges",
  "lateHarmonicChanges",
  "harmonyChange",
  "bassDegree",
  "keyMargin",
  "minor",
  "dominantTonicArrival",
  "tonicEnding",
];
const similarityFields = [
  "available",
  ...["pitchOnset", "pitchDuration", "rhythm"].flatMap((field) => [
    `${field}.dice`,
    `${field}.coverage`,
    `${field}.shiftedDice`,
  ]),
];
export const SECTION_FEATURE_NAMES = [
  "length.bars",
  "length.logBars",
  "length.fraction",
  "length.first",
  "length.last",
  ...["previous", "following"].flatMap((side) =>
    similarityFields.map((field) => `visual.${side}.${field}`),
  ),
  ...entranceFields.map((name) => `entrance.${name}`),
  ...boundaryFields.map((name) => `ending.${name}`),
  ...drumFields.map((name) => `firstDrum.${name}`),
  ...["first", "last"].flatMap((side) =>
    harmonyFields.map((name) => `events.${side}.${name}`),
  ),
  "cadence.harmonicMelodic",
  "cadence.harmonicDrum",
  "cadence.melodicDrum",
  "cadence.joint",
  "cadence.drumsAvailable",
];

export function sectionFeatureContext(input: HarmonyNote[], grid: HarmonyGrid) {
  const count = Math.max(0, grid.measures.length - 1);
  const notes = input
    .filter(
      (n) =>
        Number.isFinite(n.start) &&
        Number.isFinite(n.end) &&
        n.end > n.start &&
        Number.isInteger(n.pitch) &&
        n.pitch >= 0 &&
        n.pitch < 128 &&
        n.start < grid.measures[count],
    )
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const bars = Array.from({ length: count }, emptyBar);
  let onsetBar = 0;
  for (const n of notes) {
    while (onsetBar < count && grid.measures[onsetBar + 1] <= n.start + 1e-6)
      onsetBar++;
    if (onsetBar >= count || n.start < grid.measures[0]) continue;
    if (n.isDrum) continue;
    const bar = bars[onsetBar],
      length = grid.measures[onsetBar + 1] - grid.measures[onsetBar],
      phase = (n.start - grid.measures[onsetBar]) / length;
    const bin = Math.min(15, Math.max(0, Math.floor(phase * 16 + 1e-5)));
    const duration = Math.min(
      16,
      Math.max(1, Math.round(((n.end - n.start) / length) * 16)),
    );
    [n.pitch * 16 + bin, (n.pitch * 16 + bin) * 17 + duration, bin].forEach(
      (token, i) => {
        bar.tokens[i].set(token, (bar.tokens[i].get(token) || 0) + 1);
        bar.counts[i]++;
      },
    );
    bar.onsets[Math.min(3, Math.floor(phase * 4))]++;
    if (phase < 1 / 16) {
      bar.downbeat[n.pitch % 12]++;
      bar.bass = Math.min(bar.bass, n.pitch);
    }
    for (let m = onsetBar; m < count && grid.measures[m] < n.end; m++) {
      const barLength = grid.measures[m + 1] - grid.measures[m];
      for (let q = 0; q < 8; q++) {
        const overlap =
          Math.max(
            0,
            Math.min(n.end, grid.measures[m] + ((q + 1) / 8) * barLength) -
              Math.max(n.start, grid.measures[m] + (q / 8) * barLength),
          ) / barLength;
        bars[m].quarters[q][n.pitch % 12] += overlap;
        bars[m].chroma[n.pitch % 12] += overlap;
      }
    }
  }
  const extension = count
    ? grid.measures[count] + grid.measures[count] - grid.measures[count - 1]
    : 1;
  const boundaries = phraseFeatures(notes, {
    measures: [...grid.measures, extension],
    beats: grid.beats,
  });
  const harmonies = bars.map((bar, m) => {
    const local = Array(12).fill(0);
    for (let j = Math.max(0, m - 8); j < Math.min(count, m + 5); j++)
      bars[j].chroma.forEach((x, p) => {
        local[p] += x;
      });
    const candidates = profiles
      .flatMap((profile, minor) =>
        Array.from({ length: 12 }, (_, tonic) => ({
          tonic,
          minor,
          score: cosine(
            local,
            profile.map((_, p) => profile[mod(p - tonic)]),
          ),
        })),
      )
      .sort((a, b) => b.score - a.score);
    const key = candidates[0],
      chords = bar.quarters.map(chord),
      first = chords[0],
      last = chords[7];
    let changes = 0,
      lateChanges = 0;
    for (let q = 1; q < 8; q++)
      if (
        chords[q].root !== chords[q - 1].root ||
        chords[q].quality !== chords[q - 1].quality
      ) {
        changes++;
        if (q >= 4) lateChanges++;
      }
    const relative = (root: number) => (root < 0 ? -1 : mod(root - key.tonic));
    const bass = bar.bass < 128 ? bar.bass % 12 : first.root;
    const downbeatTotal = Math.max(
      1,
      bar.downbeat.reduce((s, x) => s + x, 0),
    );
    const dominantArrival =
      chords.slice(0, -1).some((c) => relative(c.root) === 7) &&
      relative(last.root) === 0
        ? last.confidence
        : 0;
    return [
      log(bar.counts[0]),
      ...bar.onsets.map(log),
      ...Array.from(
        { length: 12 },
        (_, p) => bar.downbeat[mod(p + bass)] / downbeatTotal,
      ),
      relative(first.root),
      relative(last.root),
      first.quality,
      last.quality,
      first.confidence,
      last.confidence,
      changes / 7,
      lateChanges / 4,
      1 - cosine(bar.quarters[0], bar.quarters[7]),
      relative(bass),
      key.score - candidates[1].score,
      key.minor,
      dominantArrival,
      relative(last.root) === 0 ? last.confidence : 0,
    ];
  });
  const prefixes = [0, 1, 2].map((kind) => [
    0,
    ...bars.map((b) => b.counts[kind]),
  ]);
  prefixes.forEach((xs) => {
    for (let i = 1; i < xs.length; i++) xs[i] += xs[i - 1];
  });
  const diagonals = new Map<number, number[][]>();
  const correlation = (lag: number) => {
    if (!diagonals.has(lag)) {
      const xs = [0, 1, 2].map(() => Array(count + 1).fill(0));
      for (let m = lag; m < count; m++)
        for (let kind = 0; kind < 3; kind++)
          xs[kind][m + 1] =
            xs[kind][m] +
            intersection(bars[m].tokens[kind], bars[m - lag].tokens[kind]);
      diagonals.set(lag, xs);
    }
    return diagonals.get(lag)!;
  };
  function compare(a: number, b: number, c: number, d: number) {
    const size = Math.min(b - a, d - c),
      lag = c - a;
    if (size <= 0 || lag <= 0) return [0, ...Array(9).fill(0)];
    const xs = correlation(lag),
      result = [size / Math.max(b - a, d - c)];
    for (let kind = 0; kind < 3; kind++) {
      const totalA = prefixes[kind][b] - prefixes[kind][a],
        totalB = prefixes[kind][d] - prefixes[kind][c],
        common = xs[kind][c + size] - xs[kind][c];
      const dice = (2 * common) / Math.max(1, totalA + totalB),
        coverage = common / Math.max(1, totalB);
      let shifted = dice;
      for (const shift of [-2, -1, 1, 2]) {
        const loA = a + Math.max(0, -shift),
          loB = c + Math.max(0, shift),
          n = Math.min(b - loA, d - loB),
          offset = loB - loA;
        if (n > 0 && offset > 0) {
          const diag = correlation(offset)[kind];
          shifted = Math.max(
            shifted,
            (2 * (diag[loB + n] - diag[loB])) / Math.max(1, totalA + totalB),
          );
        }
      }
      result.push(dice, coverage, shifted);
    }
    return result;
  }
  function features(start: number, end: number) {
    if (!(0 <= start && start < end && end <= count))
      throw new Error("Invalid candidate section span");
    const length = end - start,
      first = harmonies[start],
      last = harmonies[end - 1],
      ending = boundaries[end],
      firstBar = boundaries[start + 1],
      entrance = boundaries[start];
    const get = (name: string) =>
      ending[PHRASE_FEATURE_NAMES.indexOf(name)] || 0;
    const harmonic = last[harmonyFields.indexOf("tonicEnding")],
      melodic = Math.min(
        1,
        get("melody.endGap") + get("melody.meanDuration") / 2,
      ),
      drum = Math.min(
        1,
        Math.max(0, get("drum.lateAcceleration")) / 4 +
          get("drum.lateGroup2") +
          get("drum.lateGroup3"),
      ),
      hasDrums = ending[0];
    return [
      length,
      log(length),
      length / Math.max(1, count),
      +(start === 0),
      +(end === count),
      ...compare(Math.max(0, start - length), start, start, end),
      ...compare(start, end, end, Math.min(count, end + length)),
      ...entranceIndices.map((i) => entrance[i]),
      ...boundaryIndices.map((i) => ending[i]),
      ...drumIndices.map((i) => firstBar[i]),
      ...first,
      ...last,
      harmonic * melodic,
      harmonic * drum,
      melodic * drum,
      harmonic * melodic * drum,
      hasDrums,
    ].map((x) => (Number.isFinite(x) ? x : 0));
  }
  return { count, features };
}
