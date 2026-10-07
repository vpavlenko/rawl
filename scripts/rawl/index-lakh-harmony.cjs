// node scripts/rawl/index-lakh-harmony.cjs [--workers 6] [--limit N]
// Inferred proposals are written to sidecars. Curated analyses are never edited.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
require("ts-node/register/transpile-only");
const { parseMidi } = require("midi-file");
const {
  analyzeHarmony,
  encodeHarmony,
  measureAt,
  HARMONY_VERSION,
} = require("../../src/harmony/harmony.ts");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const { analysisProposal } = require("../../src/harmony/proposals.ts");
const { harmonyAnnotationConfig } = require("../../src/harmony/settings.ts");
const { alignChart } = require("../../src/harmony/alignment.ts");
const {
  getPhraseStarts,
  getModulations,
} = require("../../src/components/rawl/analysis.ts");
const {
  buildManualMeasuresAndBeats,
} = require("../../src/components/rawl/measures.ts");
const root = path.resolve(__dirname, "../.."),
  destination = path.join(root, "public/harmony");
const analyses = require("../../src/corpus/analyses.json"),
  referenceArgument = process.argv.indexOf("--references"),
  references = !isMainThread
    ? workerData.references
    : referenceArgument >= 0
    ? JSON.parse(fs.readFileSync(process.argv[referenceArgument + 1]))
    : require("./harmony-references.json");
const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.\d+(?=\.mid$)/i, "")
    .replace(/\.mid$/i, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/^the/, "");
const songGroup = (artist, file) => `${normalize(artist)}/${normalize(file)}`;
const heldOut = (artist, file) =>
  parseInt(
    crypto
      .createHash("sha256")
      .update(songGroup(artist, file))
      .digest("hex")
      .slice(0, 8),
    16,
  ) %
    5 ===
  0;
function safePhrases(annotation, count) {
  const result = getPhraseStarts(annotation, count);
  return result.filter(
    (m, i) =>
      Number.isFinite(m) &&
      m >= 1 &&
      m < count &&
      (i === 0 || m > result[i - 1]),
  );
}

function matchBoundaries(predicted, reference, tolerance = 1) {
  const remaining = new Set(reference),
    matched = [];
  for (const p of predicted) {
    const candidates = [...remaining]
      .filter((r) => Math.abs(p - r) <= tolerance)
      .sort((a, b) => Math.abs(a - p) - Math.abs(b - p));
    if (candidates.length) {
      remaining.delete(candidates[0]);
      matched.push(p);
    }
  }
  return {
    matched: matched.length,
    predicted: predicted.length,
    reference: reference.length,
  };
}
function scan(artist, file) {
  const key = `c/MIDI/${artist.name}/${file}`,
    annotation = analyses[key];
  const bytes = fs.readFileSync(
    path.join(root, "public/lakh-data", artist.name, file),
  );
  const input = harmonyMidi(parseMidi(bytes));
  const allNotes = input.notes;
  const excluded = new Set(annotation?.excludedVoices || []),
    drums = new Set(annotation?.drumVoices || []);
  input.notes = input.notes
    .filter((n) => !excluded.has(n.voice))
    .map((n) => (drums.has(n.voice) ? { ...n, isDrum: true } : n));
  if (annotation?.measures && allNotes.length) {
    input.grid = buildManualMeasuresAndBeats(
      annotation.measures,
      allNotes.map((n) => ({ span: [n.start, n.end] })),
    );
  }
  const inferred = analyzeHarmony(input.notes, input.grid);
  if (!inferred.chords.length)
    throw new Error(
      [...input.warnings, ...inferred.warnings].join(" ") ||
        "No analyzable notes.",
    );
  const referenceKeys = annotation
    ? getModulations(annotation, input.grid.measures)
        .filter((k) => Number.isInteger(k.tonic))
        .map((k) => ({ start: k.time, tonic: k.tonic }))
    : [];
  // Do not rerun the decoder with labels. Only Roman-numeral interpretation
  // uses a saved tonic; the independent inference remains in its own field.
  const result = referenceKeys.length
    ? {
        ...inferred,
        keys: referenceKeys.map((k, i) => ({
          ...k,
          end: referenceKeys[i + 1]?.start ?? input.grid.measures.at(-1),
          measure: measureAt(input.grid.measures, k.start),
          mode:
            inferred.inferredKeys.find(
              (r) => r.start <= k.start && r.end > k.start,
            )?.mode || "major",
          confidence: 1,
          source: "reference",
        })),
        chords: inferred.chords.flatMap((c) => {
          const cuts = [
            c.start,
            ...referenceKeys
              .filter((k) => k.start > c.start && k.start < c.end)
              .map((k) => k.start),
            c.end,
          ];
          return cuts.slice(0, -1).map((start, i) => {
            const k = referenceKeys.filter((k) => k.start <= start).at(-1);
            if (!k) return { ...c, start, end: cuts[i + 1] };
            const { romanNumeral } = require("../../src/harmony/harmony.ts");
            return {
              ...c,
              start,
              end: cuts[i + 1],
              measure: measureAt(input.grid.measures, start),
              tonic: k.tonic,
              keyConfidence: 1,
              roman:
                c.root == null ? "?" : romanNumeral(c.root, c.quality, k.tonic),
            };
          });
        }),
      }
    : inferred;
  const encoded = encodeHarmony(result);
  const barPosition = (time) => {
    const m = Math.min(
      input.grid.measures.length - 2,
      measureAt(input.grid.measures, time) - 1,
    );
    return (
      Math.round(
        (m +
          1 +
          (time - input.grid.measures[m]) /
            (input.grid.measures[m + 1] - input.grid.measures[m])) *
          100,
      ) / 100
    );
  };
  const url = `/lakh/${artist.slug}/${artist.trackSlugs[file]}`;
  const index = {
    artist: artist.name,
    title: file.replace(/\.mid$/i, ""),
    url,
    sequence: encoded.sequence,
    certainty: encoded.certainty,
    starts: encoded.starts.map(barPosition),
    ends: encoded.ends.map(barPosition),
    keySource: referenceKeys.length ? "saved" : "inferred",
  };
  const detail = {
    version: HARMONY_VERSION,
    annotationConfig: harmonyAnnotationConfig(annotation),
    sourceHash: crypto.createHash("sha256").update(bytes).digest("hex"),
    chords: result.chords.map((c) => [
      +c.start.toFixed(4),
      +c.end.toFixed(4),
      c.root,
      c.quality,
      c.bass,
      +c.confidence.toFixed(3),
      c.tonic,
      +c.keyConfidence.toFixed(3),
    ]),
    keys: result.keys,
    inferredKeys: inferred.inferredKeys,
    phrases: result.phrases,
    phraseModelVersion: result.phraseModelVersion,
    sections: result.sections,
    warnings: [...input.warnings, ...result.warnings],
    proposal: analysisProposal(inferred, input.grid.measures),
  };
  let evaluation;
  if (annotation && heldOut(artist.name, file)) {
    const keys = getModulations(annotation, input.grid.measures).filter((k) =>
      Number.isInteger(k.tonic),
    );
    let duration = 0,
      correct = 0,
      highDuration = 0,
      highCorrect = 0;
    for (let m = 0; m < input.grid.measures.length - 1; m++) {
      const time = (input.grid.measures[m] + input.grid.measures[m + 1]) / 2,
        reference = keys.filter((k) => k.time <= time).at(-1),
        actual = inferred.keys.find((k) => k.start <= time && k.end > time);
      if (reference && actual) {
        const d = input.grid.measures[m + 1] - input.grid.measures[m];
        duration += d;
        if (reference.tonic === actual.tonic) correct += d;
        if (actual.confidence >= 0.6) {
          highDuration += d;
          if (reference.tonic === actual.tonic) highCorrect += d;
        }
      }
    }
    const phrases = safePhrases(annotation, input.grid.measures.length);
    const sections = (annotation.sections || [])
      .map((s) => phrases[s])
      .filter((m) => m > 1);
    evaluation = {
      url,
      song: songGroup(artist.name, file),
      correct,
      duration,
      highDuration,
      highCorrect,
      phrases: annotation.phrasePatch?.length
        ? matchBoundaries(
            inferred.phrases.map((b) => b.measure).filter((m) => m > 1),
            phrases.filter((m) => m > 1),
          )
        : null,
      sections:
        annotation.sections?.length > 1
          ? matchBoundaries(
              inferred.sections.map((b) => b.measure).filter((m) => m > 1),
              sections,
            )
          : null,
      modulations:
        keys.length > 1
          ? matchBoundaries(
              inferred.keys.slice(1).map((k) => k.measure),
              keys.slice(1).map((k) => k.measure + 1),
            )
          : null,
    };
  }
  const chartAlignments = references
    .filter(
      (ref) =>
        songGroup(ref.artist, ref.title) === songGroup(artist.name, file),
    )
    .map((ref) => ({
      reference: ref.id,
      url,
      ...alignChart(inferred.chords, ref),
    }));
  return { index, detail, evaluation, chartAlignments };
}
if (!isMainThread) {
  parentPort.on("message", (artist) => {
    const rows = [],
      details = {},
      evaluations = [],
      alignments = [],
      errors = [];
    for (const file of artist.tracks) {
      try {
        const r = scan(artist, file);
        rows.push(r.index);
        details[file] = r.detail;
        if (r.evaluation) evaluations.push(r.evaluation);
        alignments.push(...r.chartAlignments);
      } catch (error) {
        errors.push({
          artist: artist.name,
          file,
          error: error.message || String(error),
        });
      }
    }
    fs.writeFileSync(
      path.join(destination, "details", `${artist.slug}.json`),
      JSON.stringify(details),
    );
    parentPort.postMessage({ rows, evaluations, alignments, errors });
  });
} else {
  (async () => {
    const args = process.argv.slice(2),
      argument = (name, fallback) => {
        const i = args.indexOf(name);
        return i < 0 ? fallback : Number(args[i + 1]);
      };
    const workers = argument("--workers", 6),
      limit = argument("--limit", Infinity);
    if (
      !Number.isInteger(workers) ||
      workers < 1 ||
      workers > 16 ||
      !(limit > 0)
    )
      throw new Error("Invalid --workers or --limit.");
    const catalog = require("../../public/lakh-index.json");
    fs.mkdirSync(path.join(destination, "details"), { recursive: true });
    const queue = [];
    let included = 0;
    for (const artist of catalog.artists) {
      const tracks = artist.tracks.slice(0, limit - included);
      if (tracks.length) queue.push({ ...artist, tracks });
      included += tracks.length;
      if (included >= limit) break;
    }
    queue.sort((a, b) => b.tracks.length - a.tracks.length);
    const rows = [],
      evaluations = [],
      alignments = [],
      errors = [];
    let done = 0;
    await Promise.all(
      Array.from(
        { length: Math.min(workers, queue.length) },
        () =>
          new Promise((resolve, reject) => {
            const worker = new Worker(__filename, {
              workerData: { references },
            });
            worker.on("error", reject);
            const next = () => {
              const artist = queue.shift();
              if (artist) worker.postMessage(artist);
              else worker.terminate().then(resolve);
            };
            worker.on("message", (result) => {
              rows.push(...result.rows);
              evaluations.push(...result.evaluations);
              alignments.push(...result.alignments);
              errors.push(...result.errors);
              done += result.rows.length + result.errors.length;
              if (done % 100 < result.rows.length || !queue.length)
                console.log(
                  `Analyzed ${done}/${included} MIDI files (${errors.length} skipped).`,
                );
              next();
            });
            next();
          }),
      ),
    );
    rows.sort((a, b) => a.url.localeCompare(b.url));
    const sum = (field) =>
      evaluations.reduce(
        (total, row) => {
          const v = row[field];
          if (v) {
            total.matched += v.matched;
            total.predicted += v.predicted;
            total.reference += v.reference;
          }
          return total;
        },
        { matched: 0, predicted: 0, reference: 0 },
      );
    const metrics = (field) => {
      const v = sum(field),
        precision = v.matched / (v.predicted || 1),
        recall = v.matched / (v.reference || 1);
      return {
        ...v,
        precision,
        recall,
        f1: (2 * precision * recall) / (precision + recall || 1),
      };
    };
    const report = {
      version: HARMONY_VERSION,
      generatedAt: new Date().toISOString(),
      attempted: included,
      indexed: rows.length,
      skipped: errors,
      phraseModelVersion: require("../../src/harmony/phraseModel.json").version,
      phraseEvaluationNote:
        "Phrase training uses a separate corpus-wide title split. Use reports/phrase-model/evaluation.json for held-out phrase accuracy.",
      heldOutSongs: new Set(evaluations.map((e) => e.song)).size,
      heldOutFiles: evaluations.length,
      highConfidenceTonicAccuracy:
        evaluations.reduce((s, e) => s + e.highCorrect, 0) /
        (evaluations.reduce((s, e) => s + e.highDuration, 0) || 1),
      highConfidenceTonicCoverage:
        evaluations.reduce((s, e) => s + e.highDuration, 0) /
        (evaluations.reduce((s, e) => s + e.duration, 0) || 1),
      tonicDurationAccuracy:
        evaluations.reduce((s, e) => s + e.correct, 0) /
        (evaluations.reduce((s, e) => s + e.duration, 0) || 1),
      phrases: metrics("phrases"),
      sections: metrics("sections"),
      modulations: metrics("modulations"),
      chartAlignments: alignments,
      evaluations,
      limitations: [
        "Tonic accuracy compares pitch class only: saved annotations do not label mode.",
        "Phrase references include an implicit four-bar grid and are incomplete labels.",
        "Section and modulation metrics use only files with explicit boundaries; no negative-boundary ground truth.",
        "Chart excerpt alignment is weak supervision, not measured chord accuracy.",
        "Chord confidence remains heuristic; tonic scores use a separate training-song calibration split. Overall search evidence is not a calibrated probability.",
      ],
    };
    fs.writeFileSync(
      path.join(destination, "index.json"),
      JSON.stringify({
        version: HARMONY_VERSION,
        generatedAt: report.generatedAt,
        attempted: included,
        indexed: rows.length,
        skipped: errors.length,
        tracks: rows,
      }),
    );
    const packed = require("./pack-harmony.cjs")(destination);
    console.log(
      `Packed harmony assets: ${(packed.packedBytes / 1e6).toFixed(1)} MB.`,
    );
    fs.mkdirSync(path.join(root, "reports/lakh-harmony"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "reports/lakh-harmony/evaluation.json"),
      JSON.stringify(report, null, 2),
    );
    console.log(
      JSON.stringify(
        {
          ...report,
          skipped: errors.length,
          evaluations: undefined,
          chartAlignments: alignments.length,
        },
        null,
        2,
      ),
    );
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
