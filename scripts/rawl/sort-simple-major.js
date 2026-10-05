// node scripts/rawl/sort-simple-major.js [--live] [--write] [--output report.json]
// Broad pedagogical ordering, using saved harmonic tags before MIDI estimates.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { parseMidi } = require("midi-file");
const {
  readNotes,
  readKeyRegions,
  keyAtBeat,
  isPickupNote,
} = require("./search-simple-major");
const root = path.resolve(__dirname, "../..");
const corpusPath = path.join(root, "src/components/rawl/corpora/corpora.tsx");
const scale = [0, 2, 4, 5, 7, 9, 11];
const sectionsPath = path.join(
  root,
  "src/components/rawl/corpora/simpleMajorSections.json",
);
const sectionDefinitions = JSON.parse(
  fs.readFileSync(sectionsPath, "utf8"),
).filter((section) => section.id !== "unclassified");
const groups = sectionDefinitions.map((section) => section.title);
const reviewedHarmony = require("./simple-major-reviewed-harmony.json");
function groupForDegrees(degrees, seventhDegrees = []) {
  if (seventhDegrees.length) return 5;
  if (degrees.includes(2) || degrees.includes(6)) return 4;
  if (degrees.includes(1)) return 3;
  if (degrees.includes(5)) return 2;
  if (degrees.includes(3)) return 1;
  return degrees.length ? 0 : null;
}
function primaryGroup(row, hasIVBass = false) {
  if (row.tags?.some((tag) => /^(pure_major:I_V|shuttle:I_V)$/.test(tag)))
    return 0;
  return row.tags?.includes("pure_major:I_IV_V") ||
    row.degrees?.includes(3) ||
    hasIVBass
    ? 1
    : 0;
}
function applyReviewedHarmony(row) {
  const review = reviewedHarmony[row.slug];
  if (!review) return row;
  const degrees = [
    ...new Set(
      review.exactDegrees || [
        ...(row.degrees || []),
        ...review.requiredDegrees,
      ],
    ),
  ].sort((a, b) => a - b);
  // Presence reviews set a minimum category; exclusive reviews also reject
  // extra degrees and sevenths. Preserve the raw estimate for comparison.
  const minimumGroup = groupForDegrees(degrees) ?? 0;
  return {
    ...row,
    estimatedDegrees: row.degrees || [],
    degrees,
    group: review.exactDegrees
      ? minimumGroup
      : Math.max(row.group ?? 0, minimumGroup),
    ...(review.exactDegrees
      ? {
          estimatedSeventhDegrees: row.seventhDegrees || [],
          seventhDegrees: [],
        }
      : {}),
    basis: `${
      review.exactDegrees
        ? "reviewed exclusive chord vocabulary"
        : "reviewed chord presence"
    }; ${row.basis}`,
    reviewedHarmony: review,
  };
}
function harmonicBoundaries(notes, accompaniment) {
  if (!notes.length) return [];
  const attacks = new Map();
  for (const n of notes.filter((n) => accompaniment.has(n.voice))) {
    const pitches = attacks.get(n.start) || [];
    pitches.push(n.pitch);
    attacks.set(n.start, pitches);
  }
  const onsets = [];
  for (const [beat, pitches] of [...attacks].sort((a, b) => a[0] - b[0])) {
    const previous = onsets.at(-1);
    // Rolled/strummed attacks are one harmonic event, not several root changes.
    if (
      previous &&
      beat - previous[0] <= 0.3 &&
      Math.min(...pitches) >= Math.max(...previous[1]) &&
      pitches.every((pitch) => !previous[1].some((p) => p % 12 === pitch % 12))
    )
      previous[1].push(...pitches);
    else onsets.push([beat, [...pitches]]);
  }
  const bassPitches = onsets.map(([, pitches]) => Math.min(...pitches));
  // Held or repeated bass roots can leap by more than a fourth. Distinguish
  // them from arpeggios by sustained pitch classes, allowing octave doubling.
  const sustainedRootLine =
    notes.some((n) => !accompaniment.has(n.voice)) &&
    onsets.length > 2 &&
    onsets.filter(([beat, pitches], i) => {
      const pc = Math.min(...pitches) % 12;
      return (
        pitches.every((pitch) => pitch % 12 === pc) &&
        (bassPitches[i - 1] % 12 === pc ||
          bassPitches[i + 1] % 12 === pc ||
          notes.some(
            (n) =>
              accompaniment.has(n.voice) &&
              n.start === beat &&
              n.pitch % 12 === pc &&
              n.end - n.start >= 1.5,
          ))
      );
    }).length /
      onsets.length >=
      0.8;
  // A narrow bass line carries roots rather than octave arpeggios. Its pitch
  // changes are boundaries even when there is no downward register reset.
  const narrowBass =
    Math.max(...bassPitches) - Math.min(...bassPitches) < 12 &&
    !bassPitches.some((pitch, i) => i && pitch - bassPitches[i - 1] >= 5);
  const boundaries = new Set([notes[0].start]);
  for (let i = 0; i < onsets.length; i++) {
    const [beat, pitches] = onsets[i];
    const bass = Math.min(...pitches);
    const previous = i ? Math.min(...onsets[i - 1][1]) : Infinity;
    const next = onsets[i + 1] && Math.min(...onsets[i + 1][1]);
    // Block-chord attacks and bass-register resets begin a new harmony.
    // A third in an Alberti pattern is not a reset: the following rise must
    // reach at least a fourth. This also allows slow root-fifth-octave patterns.
    if (
      new Set(pitches.map((pitch) => pitch % 12)).size >= 2 ||
      ((narrowBass || sustainedRootLine) && bass % 12 !== previous % 12) ||
      (bass <= previous && next != null && next - bass >= 5)
    )
      boundaries.add(beat);
  }
  // Normalized key regions must never share a harmony window.
  for (let i = 1; i < notes.length; i++)
    if (notes[i].key !== notes[i - 1].key) boundaries.add(notes[i].start);
  const end = Math.max(...notes.map((n) => n.end));
  return [...boundaries, end].sort((a, b) => a - b);
}
function estimateHarmonicRhythm(notes, accompaniment) {
  const boundaries = harmonicBoundaries(notes, accompaniment);
  // The final note release is not an observed harmonic change.
  const intervals = boundaries
    .slice(1, -1)
    .map((end, i) => end - boundaries[i]);
  const candidates = [0.5, 1, 1.5, 2, 3, 4, 6, 8];
  const ranked = candidates
    .map((beats) => {
      // Directly recurring change intervals outweigh their shorter divisors.
      // Allow compound rhythm (e.g. alternating two- and four-beat harmonies).
      const direct = intervals.filter(
        (gap) => Math.abs(gap - beats) <= beats * 0.12,
      ).length;
      const compatible = intervals.filter((gap) => {
        const multiple = Math.round(gap / beats);
        return (
          multiple >= 1 && Math.abs(gap - multiple * beats) <= beats * 0.12
        );
      }).length;
      return { beats, direct, compatible, score: direct * 2 + compatible };
    })
    .sort(
      (a, b) => b.score - a.score || b.direct - a.direct || a.beats - b.beats,
    );
  const best = ranked[0];
  return {
    beats: best?.direct ? best.beats : 4,
    phase: boundaries[0] ?? 0,
    confidence: best?.direct ? best.direct / Math.max(3, intervals.length) : 0,
    supportingIntervals: best?.direct ?? 0,
    observedIntervals: intervals.length,
  };
}
function harmonicWindows(
  notes,
  accompaniment,
  rhythm = estimateHarmonicRhythm(notes, accompaniment),
) {
  const starts = harmonicBoundaries(notes, accompaniment);
  return starts.slice(0, -1).flatMap((start, i) => {
    const windows = [];
    // Keep observed changes, including off-grid ones. Use the estimated pulse
    // only to split otherwise unresolved spans; never bridge a known change.
    const ceiling = Math.min(8, rhythm.beats * 2);
    for (let beat = start; beat < starts[i + 1]; beat += ceiling)
      windows.push({
        start: beat,
        end: Math.min(beat + ceiling, starts[i + 1]),
      });
    return windows;
  });
}
function estimateTexture(notes, start, end, accompaniment) {
  const ns = notes.filter(
    (n) => accompaniment.has(n.voice) && n.start < end && n.end > start,
  );
  if (!ns.length) return { kind: "unknown", confidence: 0 };
  const bass = Math.min(...ns.map((n) => n.pitch));
  const pcs = [...new Set(ns.map((n) => (n.pitch - bass + 12) % 12))];
  const separateMelody = notes.some((n) => !accompaniment.has(n.voice));
  if (pcs.length === 1)
    return {
      kind: separateMelody || bass < 55 ? "bass" : "melody",
      confidence: separateMelody ? 0.9 : 0.5,
    };
  if (pcs.length === 2 && pcs.includes(7))
    return { kind: "power-chord", confidence: 0.85 };
  const attacks = [];
  for (const n of ns
    .filter((n) => n.start >= start)
    .sort((a, b) => a.start - b.start)) {
    const previous = attacks.at(-1);
    if (previous && n.start - previous.start <= 0.0625)
      previous.pitches.add(n.pitch % 12);
    else attacks.push({ start: n.start, pitches: new Set([n.pitch % 12]) });
  }
  if (attacks.some((a) => a.pitches.size >= 3))
    return { kind: "block-chord", confidence: 0.85 };
  const first = attacks[0]?.start;
  const rolled = attacks.filter((a) => a.start - first <= 0.3);
  if (
    rolled.length >= 3 &&
    new Set(rolled.flatMap((a) => [...a.pitches])).size >= 3
  )
    return { kind: "strummed-chord", confidence: 0.75 };
  if (pcs.length <= 4 && (separateMelody || bass < 55))
    return { kind: "arpeggiated-chord", confidence: 0.65 };
  return { kind: "mixed", confidence: 0.3 };
}
function estimateHarmony(notes, tonic) {
  const voices = [...new Set(notes.map((n) => n.voice))].map((voice) => {
    const ns = notes.filter((n) => n.voice === voice);
    return { voice, mean: ns.reduce((sum, n) => sum + n.pitch, 0) / ns.length };
  });
  const lowestMean = Math.min(...voices.map((v) => v.mean));
  const accompaniment = new Set(
    voices.filter((v) => v.mean <= lowestMean + 8).map((v) => v.voice),
  );
  const counts = Array(7).fill(0);
  const sevenths = Array(7).fill(0);
  let recognized = 0;
  // 1. Infer a likely harmonic pulse before interpreting pitch combinations.
  const harmonicRhythm = estimateHarmonicRhythm(notes, accompaniment);
  const windows = harmonicWindows(notes, accompaniment, harmonicRhythm);
  const textures = {};
  const bassCounts = Array(7).fill(0);
  // Within the primary-chord stages, an IV root in a separate bass part is
  // enough evidence for adding IV even when its third is missing in the MIDI.
  const ivBassEvidence =
    voices.length > 1
      ? notes
          .filter(
            (n) =>
              accompaniment.has(n.voice) &&
              (n.pitch - tonic + 12) % 12 === 5 &&
              n.end - n.start >= 0.5 &&
              !notes.some(
                (other) =>
                  accompaniment.has(other.voice) &&
                  other.pitch < n.pitch &&
                  other.start <= n.start &&
                  other.end > n.start + 0.0625,
              ),
          )
          .map((n) => ({ start: n.start, end: n.end, pitch: n.pitch }))
      : [];
  const chordEvidence = [];
  // Evaluate each inferred harmonic span once, weighted by its beat duration.
  // Bass and lower-register chord tones carry more weight than the melody.
  for (const { start, end } of windows) {
    // 2. Infer the local voicing texture; pieces may change texture mid-score.
    const texture = estimateTexture(notes, start, end, accompaniment);
    textures[texture.kind] = (textures[texture.kind] || 0) + 1;
    const sounding = notes.filter((n) => n.start < end && n.end > start);
    if (!sounding.length) continue;
    const bass = Math.min(...sounding.map((n) => n.pitch));
    // 3. Bass-only harmony can establish a degree without a third or fifth.
    // Do not reinterpret an inversion of an otherwise complete chord as this.
    if (texture.kind === "bass") {
      const degree = scale.indexOf((bass - tonic + 12) % 12);
      const bassDuration = sounding
        .filter((n) => accompaniment.has(n.voice) && n.pitch % 12 === bass % 12)
        .reduce(
          (sum, n) => sum + Math.min(n.end, end) - Math.max(n.start, start),
          0,
        );
      const minimumBassDuration = Math.max(
        0.5,
        Math.min(2, harmonicRhythm.beats / 2),
      );
      if (degree >= 0 && degree !== 6 && bassDuration >= minimumBassDuration) {
        bassCounts[degree]++;
        if (
          chordEvidence.filter(
            (e) => e.degree === degree && e.texture === "bass",
          ).length < 3
        )
          chordEvidence.push({
            start,
            end,
            degree,
            texture: "bass",
            confidence: texture.confidence,
          });
      }
    }
    const weights = Array(12).fill(0);
    for (const n of sounding) {
      const overlap = Math.min(n.end, end) - Math.max(n.start, start);
      const weight =
        overlap *
        (accompaniment.has(n.voice)
          ? 1
          : texture.kind === "bass"
          ? 0.08
          : texture.kind === "mixed"
          ? 0.15
          : 0.1) *
        (n.pitch <= bass + 24 ? 1 : 0.5);
      const pc = (n.pitch - tonic + 12) % 12;
      weights[pc] = Math.max(weights[pc], weight);
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let best;
    for (let degree = 0; degree < 7; degree++) {
      const triad = [
        scale[degree],
        scale[(degree + 2) % 7],
        scale[(degree + 4) % 7],
      ];
      if (triad.some((pc) => weights[pc] < 0.15)) continue;
      const bassIsRoot = (bass - tonic + 12) % 12 === triad[0];
      const seventh = scale[(degree + 6) % 7];
      // A fleeting melody tone must not turn every triad into a seventh chord.
      const bassAtStart = sounding.filter(
        (n) => n.start <= start + 0.125 && n.end > start,
      );
      const startsOnRoot =
        bassAtStart.length &&
        (Math.min(...bassAtStart.map((n) => n.pitch)) - tonic + 12) % 12 ===
          triad[0];
      const hasSeventh =
        bassIsRoot &&
        startsOnRoot &&
        weights[seventh] >= 0.6 &&
        weights[seventh] >= Math.min(...triad.map((pc) => weights[pc])) * 0.6;
      const chord = hasSeventh ? [...triad, seventh] : triad;
      const coverage = chord.reduce((sum, pc) => sum + weights[pc], 0) / total;
      const score =
        coverage + (bassIsRoot ? 0.18 : 0) - (hasSeventh ? 0.08 : 0);
      if (coverage >= 0.75 && (!best || score > best.score))
        best = { degree, hasSeventh, score };
    }
    if (best) {
      const weight = (end - start) / 0.5;
      recognized += weight;
      counts[best.degree] += weight;
      if (best.hasSeventh) sevenths[best.degree] += weight;
      if (
        chordEvidence.filter(
          (e) =>
            e.degree === best.degree &&
            !!e.seventh === best.hasSeventh &&
            e.texture === texture.kind,
        ).length < 3
      )
        chordEvidence.push({
          start,
          end,
          degree: best.degree,
          seventh: best.hasSeventh,
          texture: texture.kind,
          confidence: texture.confidence,
        });
    }
  }
  const threshold = Math.max(3, recognized * 0.035);
  const degrees = counts
    .map((count, i) => (count >= threshold ? i : -1))
    .filter((i) => i >= 0);
  const seventhDegrees = sevenths
    .map((count, i) => (count >= threshold ? i : -1))
    .filter((i) => i >= 0);
  // A missing third does not make a root-position power chord disappear.
  // Use accompaniment alone: melody notes must neither supply nor invalidate
  // the dyad. Require root and fifth in the same harmonic span, no
  // other pitch classes, and three independent occurrences.
  const powerChordCounts = Array(7).fill(0);
  for (const voice of accompaniment) {
    const ns = notes.filter((n) => n.voice === voice);
    for (const { start, end } of windows) {
      const window = ns.filter((n) => n.start < end && n.end > start);
      const rootNote = window.find((n) => n.start === start);
      if (!rootNote) continue;
      const degree = scale.indexOf((rootNote.pitch - tonic + 12) % 12);
      if (degree < 0 || degree === 6) continue; // vii has a diminished fifth.
      if (
        window.some(
          (n) =>
            n.pitch < rootNote.pitch ||
            ![0, 7].includes((n.pitch - rootNote.pitch) % 12),
        ) ||
        ![0, 7].every((interval) =>
          window.some(
            (n) =>
              n.pitch === rootNote.pitch + interval &&
              Math.min(n.end, end) - Math.max(n.start, start) >= 0.3,
          ),
        )
      )
        continue;
      powerChordCounts[degree]++;
      if (
        chordEvidence.filter(
          (e) => e.degree === degree && e.texture === "power-chord",
        ).length < 3
      )
        chordEvidence.push({
          start,
          end,
          degree,
          texture: "power-chord",
          confidence: 0.85,
        });
    }
  }
  const powerChordDegrees = powerChordCounts
    .map((count, degree) => (count >= 3 ? degree : -1))
    .filter((degree) => degree >= 0);
  for (const degree of powerChordDegrees)
    if (!degrees.includes(degree)) degrees.push(degree);
  const bassDegrees = bassCounts
    .map((count, degree) => (count ? degree : -1))
    .filter((degree) => degree >= 0);
  for (const degree of bassDegrees)
    if (!degrees.includes(degree)) degrees.push(degree);
  degrees.sort((a, b) => a - b);
  let group = groupForDegrees(degrees, seventhDegrees);
  if ((group == null || group === 0) && ivBassEvidence.length) {
    if (!degrees.includes(3)) degrees.push(3);
    degrees.sort((a, b) => a - b);
    group = 1;
  }
  return {
    group,
    degrees,
    seventhDegrees,
    recognized,
    harmonicRhythm,
    textures,
    bassDegrees,
    chordEvidence,
    ivBassEvidence: ivBassEvidence.slice(0, 3),
    ...(powerChordDegrees.length
      ? { powerChordDegrees, powerChordCounts }
      : {}),
  };
}
async function main() {
  const text = fs.readFileSync(corpusPath, "utf8");
  const source = ts.createSourceFile(
    corpusPath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let array;
  function visit(n) {
    if (
      ts.isObjectLiteralExpression(n) &&
      n.properties.some(
        (p) =>
          p.name?.getText(source) === "slug" &&
          p.initializer?.text === "simple_major",
      )
    )
      array = n.properties.find(
        (p) => p.name?.getText(source) === "midis",
      ).initializer;
    ts.forEachChild(n, visit);
  }
  visit(source);
  const slugs = array.elements.map((n) => n.text);
  const annotations = require("../../src/corpus/analyses.json");
  const previousRows = JSON.parse(
    fs.readFileSync(
      path.join(root, "scripts/rawl/simple-major-complexity.json"),
    ),
  ).tracks;
  let index = require("../../src/midis/midis.json").midis;
  let app;
  let db;
  if (process.argv.includes("--live")) {
    const admin = require("firebase-admin");
    app = admin.initializeApp({
      credential: admin.credential.cert(
        require("../../src/config/firebaseConfigPrivate.json"),
      ),
    });
    db = app.firestore();
    index = (await db.collection("indexes").doc("midis").get()).data().midis;
  }
  const rows = [];
  try {
    for (const [position, slug] of slugs.entries()) {
      const annotation = annotations["f/" + slug];
      const tags = [
        ...(annotation?.tags || []),
        ...(annotation?.snippets || []).map((s) => s.tag),
      ];
      const entry = index.find((e) => e.slug === slug || e.id === slug);
      const backup =
        entry?.id && path.join(root, "src/midis", entry.id + ".json");
      let data;
      let error;
      let evidence;
      let tonic = Object.values(annotation?.modulations || {})[0];
      try {
        if (backup && fs.existsSync(backup))
          data = JSON.parse(fs.readFileSync(backup));
        else if (db && entry?.id) {
          data = (await db.collection("midis").doc(entry.id).get()).data();
          if (data?.blob)
            data.blobBase64 = Buffer.from(data.blob).toString("base64");
        }
        if (!data?.blobBase64) throw new Error("No available MIDI backup");
        const midi = parseMidi(Buffer.from(data.blobBase64, "base64"));
        const notes = readNotes(midi);
        const keyRegions = readKeyRegions(midi, notes, annotation);
        if (tonic == null) {
          const weights = Array(12).fill(0);
          notes.forEach((n) => (weights[n.pitch % 12] += n.end - n.start));
          tonic = Array.from({ length: 12 }, (_, key) => key).sort(
            (a, b) =>
              scale.reduce((sum, pc) => sum + weights[(b + pc) % 12], 0) -
              scale.reduce((sum, pc) => sum + weights[(a + pc) % 12], 0),
          )[0];
        }
        // Normalize every section to the initial tonic before ranking harmony.
        evidence = estimateHarmony(
          notes
            .filter((n) => !isPickupNote(n, keyRegions))
            .map((n) => ({
              ...n,
              pitch:
                n.pitch -
                ((keyAtBeat(keyRegions, n.start, tonic) - tonic + 12) % 12),
              key: keyAtBeat(keyRegions, n.start, tonic),
            })),
          tonic,
        );
      } catch (e) {
        error = e.message;
      }
      let group = evidence?.group;
      let basis = "MIDI estimate";
      if (tags.some((t) => /^seventh_chords:|^extensions:|^V:9$/.test(t))) {
        group = 5;
        basis = "saved seventh/extended-chord annotation";
      } else if (
        tags.some((t) =>
          /^pure_major:iii|^chord_scale:iii$|^progression:pachelbels_canon$/.test(
            t,
          ),
        )
      ) {
        group = 4;
        basis = "saved iii annotation";
      } else if (
        tags.some((t) => /^pure_major:I_(?:IV_)?V$|^shuttle:I_V$/.test(t))
      ) {
        group = primaryGroup({ tags, degrees: [] });
        basis =
          group === 0 ? "saved I/V annotation" : "saved I/IV/V annotation";
      }
      if (tags.includes("progression:I_vi_IV_V") && group < 5) {
        group = 2;
        basis = "saved I-vi-IV-V progression annotation";
      }
      if (slug === "stand-by-me") {
        group = 2;
        basis = "known I-vi-IV-V progression; sparse MIDI voicing";
      }
      if (slug === "ii-v-i-warmup") {
        group = 5;
        basis = "MIDI review: opening ii9 arpeggio";
      }
      if (basis === "MIDI estimate" && evidence && !evidence.degrees.length) {
        // Absence of recognized chords is not evidence for I/IV/V. Retain the
        // last category and make the inconclusive result visible in the report.
        group = previousRows.find((row) => row.slug === slug)?.group;
        basis =
          "previous category retained; insufficient adaptive chord evidence";
      }
      const row = applyReviewedHarmony({
        slug,
        basis,
        tonic,
        ...(evidence || {}),
        group,
        position,
        tags,
        ...(error ? { error } : {}),
      });
      if (row.group == null)
        throw new Error(
          `${slug}: no evidence for harmonic ordering (${error})`,
        );
      rows.push(row);
    }
  } finally {
    if (app) await app.delete();
  }
  rows.sort(
    (a, b) =>
      a.group - b.group ||
      Number(b.basis === "saved I/V annotation") -
        Number(a.basis === "saved I/V annotation") ||
      Number(!a.recognized) - Number(!b.recognized) ||
      (a.degrees?.length ?? 7) - (b.degrees?.length ?? 7) ||
      a.position - b.position,
  );
  fs.writeFileSync(
    process.argv.includes("--output")
      ? path.resolve(process.argv[process.argv.indexOf("--output") + 1])
      : path.join(root, "scripts/rawl/simple-major-complexity.json"),
    JSON.stringify(
      {
        method:
          "Estimate harmonic rhythm from recurring accompaniment changes, classify texture in each span (bass, power chord, block chord, strummed chord, arpeggiated chord or mixed), then estimate harmony with texture-dependent melody weights. Bass-only spans can establish a degree without a complete triad; reviewed chord-presence constraints and saved annotations take precedence. Unresolved spans use twice the estimated harmonic period, capped at eight beats. Not a definitive harmonic transcription.",
        groups: groups.map((label, group) => ({
          label,
          count: rows.filter((r) => r.group === group).length,
        })),
        tracks: rows,
      },
      null,
      2,
    ) + "\n",
  );
  if (process.argv.includes("--write")) {
    // Store the section boundaries alongside the reordered flat MIDI list.
    // The frontend and the sorter share titles, descriptions and stable IDs.
    const sections = sectionDefinitions.flatMap((section, group) => {
      const first = rows.find((row) => row.group === group);
      return first ? [{ ...section, startsAtMidi: first.slug }] : [];
    });
    fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + "\n");
    const lines = [];
    for (let group = 0; group < groups.length; group++) {
      const selected = rows.filter((r) => r.group === group);
      if (!selected.length) continue;
      lines.push(`      // ${groups[group]}.`);
      lines.push(...selected.map((r) => `      ${JSON.stringify(r.slug)},`));
    }
    fs.writeFileSync(
      corpusPath,
      text.slice(0, array.getStart(source)) +
        "[\n" +
        lines.join("\n") +
        "\n    ]" +
        text.slice(array.end),
    );
  }
  console.log(
    groups
      .map(
        (label, group) =>
          `${label}: ${rows.filter((r) => r.group === group).length}`,
      )
      .join("\n"),
  );
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = {
  estimateHarmony,
  harmonicWindows,
  estimateHarmonicRhythm,
  estimateTexture,
  applyReviewedHarmony,
  groupForDegrees,
  primaryGroup,
};
