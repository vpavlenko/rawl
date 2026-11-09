// Rebuild both parts of /corpus/simple_major, preserving a stage-change audit.
// node scripts/rawl/recompute-simple-major-stages.cjs [--workers N]
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  ts = require("typescript");
const { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, "../.."),
  sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p)));
function assignments(
  readText = (p) => fs.readFileSync(path.join(ROOT, p), "utf8"),
) {
  const file = "src/components/rawl/corpora/corpora.tsx",
    text = readText(file);
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let slugs;
  function visit(n) {
    if (
      ts.isObjectLiteralExpression(n) &&
      n.properties.some(
        (p) =>
          p.name?.getText(source) === "slug" &&
          p.initializer?.text === "simple_major",
      )
    )
      slugs = n.properties
        .find((p) => p.name?.getText(source) === "midis")
        .initializer.elements.map((n) => n.text);
    ts.forEachChild(n, visit);
  }
  visit(source);
  if (!slugs) throw Error("simple_major corpus missing");
  const sections = JSON.parse(
    readText("src/components/rawl/corpora/simpleMajorSections.json"),
  );
  const rows = slugs.map((slug, index) => ({
    key: "f/" + slug,
    stage: sections.findLast((s) => {
      const start = slugs.indexOf(s.startsAtMidi);
      return start >= 0 && index >= start;
    })?.id,
  }));
  for (const [stage, pieces] of Object.entries(
    JSON.parse(
      readText("src/components/rawl/corpora/simpleMajorLakhPieces.json"),
    ),
  ))
    rows.push(
      ...pieces.map((p) => ({
        key: `c/MIDI/${p.artist}/${p.filename}`,
        stage,
      })),
    );
  if (new Set(rows.map((r) => r.key)).size !== rows.length)
    throw Error("Duplicate arrangement across stages");
  return rows;
}
function counts(rows) {
  const result = {};
  for (const { key, stage } of rows) {
    result[stage] ||= { f: 0, lakh: 0 };
    result[stage][key.startsWith("f/") ? "f" : "lakh"]++;
  }
  return result;
}
function main() {
  const refArgument = process.argv.indexOf("--baseline-ref"),
    baselineRef =
      refArgument < 0
        ? null
        : execFileSync("git", ["rev-parse", process.argv[refArgument + 1]], {
            cwd: ROOT,
            encoding: "utf8",
          }).trim();
  const startedAt = new Date().toISOString(),
    before = assignments(
      baselineRef
        ? (p) =>
            execFileSync("git", ["show", `${baselineRef}:${p}`], {
              cwd: ROOT,
              encoding: "utf8",
              maxBuffer: 10e6,
            })
        : undefined,
    );
  const inputPaths = [
    "src/corpus/analyses.json",
    "src/midis/midis.json",
    "public/lakh-index.json",
    "src/harmony/harmony.ts",
    "src/harmony/midi.ts",
    "src/harmony/keyModel.json",
    "scripts/rawl/simple-major-segmental.cjs",
    "scripts/rawl/simple-major-reviewed-harmony.json",
    "scripts/rawl/sort-simple-major.js",
    "scripts/rawl/scan-lakh-simple-major.js",
  ];
  const inputHashes = Object.fromEntries(
    inputPaths.map((p) => [p, sha(fs.readFileSync(path.join(ROOT, p)))]),
  );
  const workers = process.argv.indexOf("--workers"),
    workerCount = workers < 0 ? "4" : process.argv[workers + 1];
  const commands = [
    ["scripts/rawl/sort-simple-major.js", "--write"],
    ["scripts/rawl/scan-lakh-simple-major.js", "--workers", workerCount],
  ];
  for (const command of commands)
    execFileSync(process.execPath, command, { cwd: ROOT, stdio: "inherit" });
  const after = assignments(),
    previous = new Map(before.map((r) => [r.key, r.stage])),
    current = new Map(after.map((r) => [r.key, r.stage]));
  const f = read("scripts/rawl/simple-major-complexity.json"),
    lakh = read("reports/lakh-simple-major/results.json");
  if (lakh.completed !== lakh.total) throw Error("Lakh scan incomplete");
  const evidence = new Map([
    ...f.tracks.map((r) => ["f/" + r.slug, r]),
    ...lakh.matches.map((r) => [`c/MIDI/${r.artist}/${r.filename}`, r]),
  ]);
  const outputPaths = [
    "src/components/rawl/corpora/corpora.tsx",
    "src/components/rawl/corpora/simpleMajorSections.json",
    "src/components/rawl/corpora/simpleMajorLakhPieces.json",
    "scripts/rawl/simple-major-complexity.json",
    "reports/lakh-simple-major/results.json",
    "public/lakh-simple-major-review.html",
  ];
  const report = {
    format: "rawl-simple-major-stage-refresh-1",
    startedAt,
    completedAt: new Date().toISOString(),
    command: [process.execPath, ...process.argv.slice(1)],
    commands,
    modelTraining: false,
    harmonyVersion: f.harmonyVersion,
    stagePolicy: f.stagePolicy,
    inputHashes,
    baselineRef,
    before: counts(before),
    after: counts(after),
    beforeAssignments: before,
    assignments: after.map((r) => ({
      ...r,
      sourceHash: evidence.get(r.key)?.sourceHash,
    })),
    changes: after
      .filter((r) => previous.has(r.key) && previous.get(r.key) !== r.stage)
      .map((r) => ({
        ...r,
        previousStage: previous.get(r.key),
        basis: evidence.get(r.key)?.basis,
        harmonySource: evidence.get(r.key)?.harmonySource,
      })),
    added: after.filter((r) => !previous.has(r.key)),
    removed: before.filter((r) => !current.has(r.key)),
    retained: [...evidence]
      .filter(
        ([, r]) =>
          r.stageFallback ||
          r.error ||
          r.basis?.startsWith("previous category retained"),
      )
      .map(([key, r]) => ({
        key,
        reason: r.error || r.stageFallback || r.basis,
      })),
    lakhScan: {
      attempted: lakh.total,
      completed: lakh.completed,
      matches: lakh.matches.length,
      excluded: lakh.excluded,
      inconclusive: lakh.inconclusive.length,
      failures: lakh.failures.length,
      harmonicSources: Object.fromEntries(
        [...new Set(lakh.matches.map((r) => r.harmonySource))].map((source) => [
          source,
          lakh.matches.filter((r) => r.harmonySource === source).length,
        ]),
      ),
    },
    outputHashes: Object.fromEntries(
      outputPaths.map((p) => [p, sha(fs.readFileSync(path.join(ROOT, p)))]),
    ),
    limitations: [
      "Stages are provisional harmonic vocabulary estimates, not new gold labels.",
      "Saved tags and explicit chord reviews take precedence. Low-coverage cases retain the previous category or estimator.",
      "The existing conservative major-key membership screen is retained; its false exclusions and annotation limitations remain.",
      "Chord evidence is heuristic, not calibrated probability. No model was fitted and no source MIDI or saved analysis was changed.",
    ],
  };
  const directory = path.join(ROOT, "reports/simple-major-stages");
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, startedAt.replace(/[:.]/g, "-") + ".json");
  fs.writeFileSync(file, JSON.stringify(report, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(
    JSON.stringify(
      {
        report: path.relative(ROOT, file),
        changed: report.changes.length,
        added: report.added.length,
        removed: report.removed.length,
        retained: report.retained.length,
        stages: report.after,
      },
      null,
      2,
    ),
  );
}
if (require.main === module) main();
module.exports = { assignments };
