import { HarmonyChord, Quality, qualityFamily } from "./harmony";

export type ChartReference = {
  id: string;
  artist: string;
  title: string;
  section: string;
  chords: { root: number; quality: Quality }[];
  sources: { url: string; role: string }[];
  tonic: number;
  mode: string;
  notes: string;
};
// A chart normally describes a single section without timestamps. Local edit
// alignment tolerates arrangement insertions and transposition. Its score is
// evidence of a possible alignment, never a chord-accuracy measurement.
export function alignChart(chords: HarmonyChord[], reference: ChartReference) {
  const compact: { chord: HarmonyChord; index: number }[] = [];
  chords.forEach((chord, index) => {
    const prev = compact[compact.length - 1]?.chord;
    if (chord.root == null) {
      compact.push({ chord, index });
      return;
    }
    if (
      prev?.root !== chord.root ||
      qualityFamily(prev.quality) !== qualityFamily(chord.quality)
    )
      compact.push({ chord, index });
  });
  let best = {
    score: 0,
    coverage: 0,
    transpose: 0,
    start: 0,
    end: 0,
    matched: 0,
  };
  for (let transpose = 0; transpose < 12; transpose++) {
    const scores = Array.from({ length: reference.chords.length + 1 }, () =>
      Array(compact.length + 1).fill(0),
    );
    const paths = Array.from({ length: reference.chords.length + 1 }, () =>
      Array(compact.length + 1).fill(0),
    );
    for (let i = 1; i <= reference.chords.length; i++)
      for (let j = 1; j <= compact.length; j++) {
        const expected = reference.chords[i - 1],
          actual = compact[j - 1].chord;
        const match =
          actual.root != null &&
          (expected.root + transpose) % 12 === actual.root &&
          qualityFamily(expected.quality) === qualityFamily(actual.quality);
        const candidates = [
          0,
          scores[i - 1][j - 1] + (match ? 2 : -1.5),
          scores[i - 1][j] - 1.1,
          scores[i][j - 1] - 1.1,
        ];
        const value = Math.max(...candidates);
        scores[i][j] = value;
        paths[i][j] = candidates.indexOf(value);
        if (value > best.score) {
          let a = i,
            b = j,
            matched = 0;
          while (a > 0 && b > 0 && scores[a][b] > 0) {
            const direction = paths[a][b];
            if (direction === 1) {
              const x = reference.chords[a - 1],
                y = compact[b - 1].chord;
              if (
                y.root != null &&
                (x.root + transpose) % 12 === y.root &&
                qualityFamily(x.quality) === qualityFamily(y.quality)
              )
                matched++;
              a--;
              b--;
            } else if (direction === 2) a--;
            else if (direction === 3) b--;
            else break;
          }
          best = {
            score: value,
            coverage: matched / reference.chords.length,
            transpose,
            start: compact[b]?.chord.start ?? 0,
            end: compact[j - 1].chord.end,
            matched,
          };
        }
      }
  }
  return {
    ...best,
    normalizedScore: best.score / (2 * reference.chords.length),
    status:
      best.coverage === 1 && best.score / (2 * reference.chords.length) >= 0.85
        ? "candidate alignment"
        : "needs review",
  };
}
