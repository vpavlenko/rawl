// Stage assignment uses the same chord segmentation/templates as the score
// ribbon. Major-key membership and human reviews remain separate decisions.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  zlib = require("zlib");
require("ts-node/register/transpile-only");
const {
  analyzeHarmony,
  HARMONY_VERSION,
} = require("../../src/harmony/harmony.ts");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const { harmonyAnnotationConfig } = require("../../src/harmony/settings.ts");
const { getModulations } = require("../../src/components/rawl/analysis.ts");
const {
  buildManualMeasuresAndBeats,
} = require("../../src/components/rawl/measures.ts");
const ROOT = path.resolve(__dirname, "../.."),
  SCALE = [0, 2, 4, 5, 7, 9, 11];
const POLICY = {
  version: "simple-major-segmental-2",
  dominantSeventhStage: 0,
  minimumChordEvidence: 0.6,
  minimumDegreeBeats: 1.5,
  minimumDegreeShare: 0.035,
  minimumCoverage: 0.5,
  minimumSeventhToneBeats: 0.5,
};
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const pc = (pitch) => ((pitch % 12) + 12) % 12;
const sidecars = new Map();
const artists = new Map(
  require("../../public/lakh-index.json").artists.map((a) => [a.name, a]),
);

function tempoMap(midi) {
  const ppq = midi.header.ticksPerBeat;
  const events = midi.tracks
    .flatMap((track) => {
      let tick = 0;
      return track.flatMap((e) => {
        tick += e.deltaTime;
        return e.type === "setTempo" && e.microsecondsPerBeat > 0
          ? [{ beat: tick / ppq, duration: e.microsecondsPerBeat / 1e6 }]
          : [];
      });
    })
    .sort((a, b) => a.beat - b.beat);
  const map = [{ beat: 0, time: 0, duration: 0.5 }];
  for (const e of events) {
    const p = map.at(-1);
    map.push({ ...e, time: p.time + (e.beat - p.beat) * p.duration });
  }
  const find = (value, field) => {
    let lo = 0,
      hi = map.length - 1;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      if (map[mid][field] <= value) lo = mid;
      else hi = mid - 1;
    }
    return map[lo];
  };
  return {
    toBeat: (time) => {
      const t = find(time, "time");
      return t.beat + (time - t.time) / t.duration;
    },
    toTime: (beat) => {
      const t = find(beat, "beat");
      return t.time + (beat - t.beat) * t.duration;
    },
  };
}

function soundingDuration(notes, toBeat) {
  let total = 0,
    end = -Infinity;
  for (const n of notes
    .filter((n) => !n.isDrum)
    .sort((a, b) => a.start - b.start)) {
    if (n.end > end) total += toBeat(n.end) - toBeat(Math.max(end, n.start));
    end = Math.max(end, n.end);
  }
  return total;
}

const seventhQualities = new Set(["7", "maj7", "min7", "hdim7"]);
function diatonicQuality(degree, quality) {
  if (quality === ["maj", "min", "min", "maj", "maj", "min", "dim"][degree])
    return true;
  if (
    quality === ["maj7", "min7", "min7", "maj7", "7", "min7", "hdim7"][degree]
  )
    return true;
  // Missing thirds and suspensions can establish a root in a major-key score;
  // they do not manufacture a seventh or a major/minor quality.
  if (quality === "5") return degree !== 6;
  const root = SCALE[degree];
  return (
    (quality === "sus2" && [2, 7].every((i) => SCALE.includes(pc(root + i)))) ||
    (quality === "sus4" && [5, 7].every((i) => SCALE.includes(pc(root + i))))
  );
}

function toneSupport(notes, start, end, root, quality, toBeat) {
  const sounding = notes.filter(
    (n) => !n.isDrum && n.start < end && n.end > start,
  );
  const bass = Math.min(...sounding.map((n) => n.pitch));
  const offsets =
    quality === "7"
      ? [0, 4, 10]
      : quality === "maj7"
      ? [0, 4, 11]
      : quality === "min7" || quality === "hdim7"
      ? [0, 3, 10]
      : [0];
  const durations = offsets.map((offset) => {
    const spans = sounding
      .filter((n) => pc(n.pitch - root) === offset && n.pitch <= bass + 24)
      .map((n) => ({
        start: Math.max(start, n.start),
        end: Math.min(end, n.end),
      }));
    return soundingDuration(spans, toBeat);
  });
  return {
    rootBeats: durations[0],
    seventhBeats: offsets.length === 3 ? Math.min(...durations) : 0,
  };
}

function summarizeChords(
  chords,
  { tonic, regions = [], toBeat = (n) => n, soundingBeats, sparse = {}, notes },
) {
  const counts = Array(7).fill(0),
    sevenths = Array(7).fill(0),
    evidence = [];
  let recognized = 0,
    incompatibleBeats = 0;
  const keys = regions.length ? regions : [{ start: 0, tonic }];
  for (const chord of chords) {
    if (
      chord.root == null ||
      !chord.quality ||
      chord.confidence < POLICY.minimumChordEvidence
    )
      continue;
    const cuts = [
      chord.start,
      ...keys
        .filter((k) => k.start > chord.start && k.start < chord.end)
        .map((k) => k.start),
      chord.end,
    ];
    for (let i = 0; i < cuts.length - 1; i++) {
      const start = cuts[i],
        end = cuts[i + 1];
      const key =
        keys.filter((k) => k.start <= start + 1e-8).at(-1)?.tonic ?? tonic;
      const degree = SCALE.indexOf(pc(chord.root - key)),
        beats = toBeat(end) - toBeat(start);
      if (degree < 0 || !diatonicQuality(degree, chord.quality)) {
        incompatibleBeats += beats;
        continue;
      }
      const support = notes
        ? toneSupport(notes, start, end, chord.root, chord.quality, toBeat)
        : { rootBeats: beats, seventhBeats: beats };
      const rootBeats = Math.min(beats, support.rootBeats);
      recognized += rootBeats;
      counts[degree] += rootBeats;
      const seventh = seventhQualities.has(chord.quality);
      // Count the actual duration of root/third/seventh support, not the entire
      // segment selected by a template. Inversions are valid; fleeting upper
      // melody tones must not promote a four-beat triad to four beats of V7.
      const seventhBeats =
        seventh && support.seventhBeats >= POLICY.minimumSeventhToneBeats
          ? Math.min(beats, support.seventhBeats)
          : 0;
      if (seventh) sevenths[degree] += seventhBeats;
      if (
        evidence.filter(
          (e) => e.degree === degree && e.quality === chord.quality,
        ).length < 3
      )
        evidence.push({
          start: toBeat(start),
          end: toBeat(end),
          degree,
          quality: chord.quality,
          seventh,
          rootBeats,
          seventhBeats,
          confidence: chord.confidence,
        });
    }
  }
  const threshold = Math.max(
    POLICY.minimumDegreeBeats,
    recognized * POLICY.minimumDegreeShare,
  );
  const degrees = counts.flatMap((count, degree) =>
    count >= threshold ? [degree] : [],
  );
  const seventhDegrees = sevenths.flatMap((count, degree) =>
    count >= threshold ? [degree] : [],
  );
  const sparseDegrees = [
    ...new Set([
      ...(sparse.powerChordDegrees || []),
      ...(sparse.bassDegrees || []),
    ]),
  ];
  for (const degree of sparseDegrees)
    if (!degrees.includes(degree)) degrees.push(degree);
  degrees.sort((a, b) => a - b);
  const coverage = Math.min(1, recognized / (soundingBeats || 1));
  const conclusive =
    coverage >= POLICY.minimumCoverage &&
    counts.some((count) => count >= threshold);
  const group = !conclusive
    ? null
    : seventhDegrees.some((degree) => degree !== 4)
    ? 5
    : degrees.includes(2) || degrees.includes(6)
    ? 4
    : degrees.includes(1)
    ? 3
    : degrees.includes(5)
    ? 2
    : degrees.includes(3)
    ? 1
    : 0;
  return {
    group,
    degrees,
    seventhDegrees,
    recognized,
    chordEvidence: evidence,
    segmental: {
      policy: POLICY,
      coverage,
      soundingBeats,
      incompatibleBeats,
      degreeBeats: counts,
      seventhBeats: sevenths,
      thresholdBeats: threshold,
      sparseDegrees,
      conclusive,
    },
  };
}

function readSidecar(artist, filename, sourceHash, annotationConfig) {
  const catalogArtist = artists.get(artist);
  if (!catalogArtist) return null;
  if (!sidecars.has(artist)) {
    const file = path.join(
      ROOT,
      "public/harmony/details",
      catalogArtist.slug + ".json.gz",
    );
    if (!fs.existsSync(file)) return null;
    if (sidecars.size >= 12) sidecars.delete(sidecars.keys().next().value);
    sidecars.set(artist, JSON.parse(zlib.gunzipSync(fs.readFileSync(file))));
  }
  const detail = sidecars.get(artist)[filename];
  if (
    detail?.version !== HARMONY_VERSION ||
    detail.sourceHash !== sourceHash ||
    detail.annotationConfig !== annotationConfig
  )
    return null;
  return detail.chords.map(([start, end, root, quality, bass, confidence]) => ({
    start,
    end,
    root,
    quality,
    bass,
    confidence,
  }));
}

function estimateSegmentalStages({
  midi,
  bytes,
  annotation,
  tonic,
  keyRegions = [],
  artist,
  filename,
  legacy = {},
}) {
  const input = harmonyMidi(midi),
    allNotes = input.notes,
    tempo = tempoMap(midi);
  const excluded = new Set(annotation?.excludedVoices || []),
    drums = new Set(annotation?.drumVoices || []);
  input.notes = input.notes
    .filter((n) => !excluded.has(n.voice))
    .map((n) => (drums.has(n.voice) ? { ...n, isDrum: true } : n));
  if (annotation?.measures && allNotes.length)
    input.grid = buildManualMeasuresAndBeats(
      annotation.measures,
      allNotes.map((n) => ({ span: [n.start, n.end] })),
    );
  const savedKeys = annotation
    ? getModulations(annotation, input.grid.measures)
        .filter((k) => Number.isInteger(k.tonic))
        .map((k) => ({ start: k.time, tonic: k.tonic }))
    : [];
  const referenceKeys = savedKeys.length
    ? savedKeys
    : keyRegions.length
    ? keyRegions.map((k) => ({ start: tempo.toTime(k.start), tonic: k.tonic }))
    : [{ start: 0, tonic }];
  const sourceHash = sha(bytes),
    annotationConfig = harmonyAnnotationConfig(annotation, !!annotation);
  let chords =
    artist && readSidecar(artist, filename, sourceHash, annotationConfig);
  const harmonySource = chords
    ? "verified harmonic sidecar"
    : "fresh MIDI chord analysis";
  if (!chords)
    chords = analyzeHarmony(input.notes, input.grid, {
      referenceKeys,
      includeStructure: false,
    }).chords;
  const evidence = summarizeChords(chords, {
    tonic,
    regions: referenceKeys,
    toBeat: tempo.toBeat,
    soundingBeats: soundingDuration(input.notes, tempo.toBeat),
    sparse: legacy,
    notes: input.notes,
  });
  return {
    ...legacy,
    ...evidence,
    sourceHash,
    harmonySource,
    harmonyVersion: HARMONY_VERSION,
    annotationConfigHash: sha(annotationConfig),
    keyBasis: savedKeys.length ? "saved tonics" : "major-key membership screen",
    legacyEstimate: {
      group: legacy.group,
      degrees: legacy.degrees,
      seventhDegrees: legacy.seventhDegrees,
    },
    ...(evidence.group == null
      ? {
          group: legacy.group,
          stageFallback:
            "Insufficient segmental coverage; retained previous stage estimator",
        }
      : {}),
  };
}
module.exports = {
  POLICY,
  summarizeChords,
  diatonicQuality,
  tempoMap,
  estimateSegmentalStages,
};
