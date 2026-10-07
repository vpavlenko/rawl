import type { HarmonyGrid, HarmonyNote } from "./harmony";

// Features describe the end of the preceding bar and the following entrance.
// They never consume phrase labels, section labels, tonic labels or bar modulo.
export const PHRASE_FEATURE_VERSION = "phrase-features-1";
const safeLog = (n: number) => Math.log1p(Math.max(0, n));
const ratio = (a: number, b: number) =>
  Math.max(-4, Math.min(4, Math.log((a + 0.5) / (b + 0.5))));
function cosine(a: number[], b: number[]) {
  let dot = 0,
    aa = 0,
    bb = 0;
  a.forEach((x, i) => {
    const y = b[i] || 0;
    dot += x * y;
    aa += x * x;
    bb += y * y;
  });
  return aa && bb ? dot / Math.sqrt(aa * bb) : aa === bb ? 1 : 0;
}
const drumGroup = (pitch: number) =>
  [35, 36].includes(pitch)
    ? 0
    : [38, 40].includes(pitch)
    ? 1
    : [41, 43, 45, 47, 48, 50].includes(pitch)
    ? 2
    : [49, 52, 55, 57].includes(pitch)
    ? 3
    : [42, 44, 46].includes(pitch)
    ? 4
    : 5;
type Bar = {
  count: number;
  bins: number[];
  chroma: number[];
  groups: number[];
  groupBins: number[];
  velocity: number;
  lateVelocity: number;
  lateCount: number;
  pitches: number[];
  last: number;
  first: number;
  duration: number;
  crossing: number;
};
const empty = (): Bar => ({
  count: 0,
  bins: Array(16).fill(0),
  chroma: Array(12).fill(0),
  groups: Array(6).fill(0),
  groupBins: Array(96).fill(0),
  velocity: 0,
  lateVelocity: 0,
  lateCount: 0,
  pitches: [],
  last: 0,
  first: 1,
  duration: 0,
  crossing: 0,
});
function describe(
  left: Bar,
  right: Bar,
  before: Bar[],
  after: Bar[],
  average: number,
) {
  const values: number[] = [],
    labels: string[] = [];
  const add = (name: string, value: number) => {
    labels.push(name);
    values.push(Number.isFinite(value) ? value : 0);
  };
  const quarter = Array.from({ length: 4 }, (_, q) =>
    left.bins.slice(q * 4, q * 4 + 4).reduce((s, x) => s + x, 0),
  );
  add("onsets", safeLog(left.count));
  add("nextOnsets", safeLog(right.count));
  add("relativeDensity", ratio(left.count, average));
  add("densityChange", ratio(right.count, left.count));
  for (let q = 0; q < 4; q++)
    add(`quarter${q}`, quarter[q] / Math.max(1, left.count));
  add(
    "lateAcceleration",
    ratio(quarter[3], (quarter[0] + quarter[1] + quarter[2]) / 3),
  );
  add("lateBurst", safeLog(Math.max(...left.bins.slice(12))));
  add("endGap", 1 - Math.min(1, left.last));
  add("nextGap", right.first);
  add("nextDownbeat", right.bins[0] / Math.max(1, right.count));
  add("meanDuration", left.duration / Math.max(1, left.count));
  add("sustainAcross", left.crossing / Math.max(1, left.count));
  add("velocity", left.velocity / Math.max(1, left.count) / 127);
  add(
    "lateAccent",
    left.lateVelocity / Math.max(1, left.lateCount) / 127 -
      left.velocity / Math.max(1, left.count) / 127,
  );
  add("onsetNovelty", 1 - cosine(left.bins, right.bins));
  add("chromaNovelty", 1 - cosine(left.chroma, right.chroma));
  const mean = (xs: Bar[], field: "bins" | "chroma" | "groups" | "groupBins") =>
    Array.from({ length: left[field].length }, (_, i) =>
      xs.reduce((s, bar) => s + bar[field][i], 0),
    );
  add(
    "contextOnsetNovelty",
    1 - cosine(mean(before, "bins"), mean(after, "bins")),
  );
  add(
    "contextChromaNovelty",
    1 - cosine(mean(before, "chroma"), mean(after, "chroma")),
  );
  add("groupNovelty", 1 - cosine(left.groupBins, right.groupBins));
  add(
    "contextGroupNovelty",
    1 - cosine(mean(before, "groupBins"), mean(after, "groupBins")),
  );
  add(
    "pitchRange",
    left.pitches.length
      ? (Math.max(...left.pitches) - Math.min(...left.pitches)) / 24
      : 0,
  );
  add(
    "pitchStep",
    left.pitches.length && right.pitches.length
      ? (right.pitches[0] - left.pitches[left.pitches.length - 1]) / 12
      : 0,
  );
  for (let group = 0; group < 6; group++) {
    add(`group${group}`, left.groups[group] / Math.max(1, left.count));
    add(
      `lateGroup${group}`,
      left.groupBins
        .slice(group * 16 + 12, group * 16 + 16)
        .reduce((s, x) => s + x, 0) / Math.max(1, left.count),
    );
    add(
      `nextGroup${group}`,
      right.groupBins[group * 16] / Math.max(1, right.count),
    );
  }
  for (let lag of [1, 2, 4]) {
    const previous = before[before.length - 1 - lag] || empty();
    add(`repeatOnset${lag}`, 1 - cosine(left.bins, previous.bins));
    add(`repeatChroma${lag}`, 1 - cosine(left.chroma, previous.chroma));
    add(`repeatGroups${lag}`, 1 - cosine(left.groupBins, previous.groupBins));
    add(`repeatDensity${lag}`, ratio(left.count, previous.count));
  }
  return { values, labels };
}
// Exported schema is derived from the exact same extraction code.
const schema = describe(empty(), empty(), [], [], 0).labels;
export const PHRASE_FEATURE_NAMES = [
  "hasDrums",
  "pitchedVoices",
  ...["pitch", "melody", "bass", "drum"].flatMap((prefix) =>
    schema.map((s) => `${prefix}.${s}`),
  ),
  "voices.endGapMean",
  "voices.endGapMax",
  "voices.entranceFraction",
  "voices.exitFraction",
  "voices.patternChangeMax",
];
export const DRUM_FEATURE_INDICES = PHRASE_FEATURE_NAMES.flatMap((name, i) =>
  name === "hasDrums" || name.startsWith("drum.") ? [i] : [],
);
export function withoutDrumFeatures(features: number[]): number[] {
  const result = features.slice();
  DRUM_FEATURE_INDICES.forEach((i) => {
    result[i] = 0;
  });
  return result;
}
export function phraseFeatures(
  notes: HarmonyNote[],
  grid: HarmonyGrid,
): number[][] {
  const count = Math.max(0, grid.measures.length - 1);
  if (!count) return [];
  const valid = notes
    .filter(
      (n) =>
        Number.isFinite(n.start) &&
        Number.isFinite(n.end) &&
        n.end > n.start &&
        Number.isInteger(n.pitch) &&
        n.pitch >= 0 &&
        n.pitch < 128,
    )
    .slice()
    .sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  const voices = new Map<number, HarmonyNote[]>();
  valid
    .filter((n) => !n.isDrum)
    .forEach((n) => {
      const list = voices.get(n.voice) || [];
      list.push(n);
      voices.set(n.voice, list);
    });
  const ordered = [...voices.keys()].sort((a, b) => {
    const mean = (v: number) =>
      voices.get(v)!.reduce((s, n) => s + n.pitch, 0) / voices.get(v)!.length;
    return mean(a) - mean(b);
  });
  const streams = [
    valid.filter((n) => !n.isDrum),
    voices.get(ordered[ordered.length - 1]) || [],
    voices.get(ordered[0]) || [],
    valid.filter((n) => n.isDrum),
  ];
  function barsFor(stream: HarmonyNote[]): Bar[] {
    const bars = Array.from({ length: count }, empty);
    let m = 0;
    for (const n of stream) {
      while (m < count && grid.measures[m + 1] <= n.start + 1e-6) m++;
      if (m >= count || n.start < grid.measures[0]) continue;
      const bar = bars[m],
        length = grid.measures[m + 1] - grid.measures[m],
        phase = (n.start - grid.measures[m]) / length;
      const bin = Math.min(15, Math.max(0, Math.floor(phase * 16 + 1e-5))),
        group = n.isDrum ? drumGroup(n.pitch) : 0;
      bar.count++;
      bar.bins[bin]++;
      bar.chroma[n.pitch % 12]++;
      bar.groups[group]++;
      bar.groupBins[group * 16 + bin]++;
      bar.pitches.push(n.pitch);
      bar.velocity += n.velocity ?? 80;
      if (phase >= 0.75) {
        bar.lateVelocity += n.velocity ?? 80;
        bar.lateCount++;
      }
      bar.duration += Math.min(4, (n.end - n.start) / length);
      bar.first = Math.min(bar.first, phase);
      // Drum note-off length is often arbitrary; drum gaps use onset timing.
      bar.last = Math.max(
        bar.last,
        n.isDrum ? phase : (n.end - grid.measures[m]) / length,
      );
      if (n.end > grid.measures[m + 1] + 0.01 * length) bar.crossing++;
    }
    return bars;
  }
  const allBars = streams.map(barsFor),
    voiceBars = [...voices.values()].map(barsFor);
  const averages = allBars.map(
    (bars) => bars.reduce((s, b) => s + b.count, 0) / count,
  );
  return Array.from({ length: count }, (_, m) => {
    const values = [streams[3].length ? 1 : 0, safeLog(voices.size)];
    allBars.forEach((bars, s) =>
      values.push(
        ...describe(
          bars[m - 1] || empty(),
          bars[m],
          bars.slice(Math.max(0, m - 5), m),
          bars.slice(m, m + 4),
          averages[s],
        ).values,
      ),
    );
    const gaps = voiceBars.map(
      (bars) => 1 - Math.min(1, (bars[m - 1] || empty()).last),
    );
    values.push(
      gaps.reduce((s, x) => s + x, 0) / Math.max(1, gaps.length),
      Math.max(0, ...gaps),
      voiceBars.filter((b) => b[m].count && !b[m - 1]?.count).length /
        Math.max(1, voices.size),
      voiceBars.filter((b) => !b[m].count && b[m - 1]?.count).length /
        Math.max(1, voices.size),
      Math.max(
        0,
        ...voiceBars.map(
          (b) => 1 - cosine((b[m - 1] || empty()).bins, b[m].bins),
        ),
      ),
    );
    if (!streams[3].length)
      DRUM_FEATURE_INDICES.forEach((i) => {
        values[i] = 0;
      });
    return values.map((x) => (Number.isFinite(x) ? x : 0));
  });
}
