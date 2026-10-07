// Score candidates with the same feature extractor and exported trees as UI.
const fs = require("fs"),
  path = require("path"),
  zlib = require("zlib"),
  crypto = require("crypto"),
  { Worker, isMainThread, workerData, parentPort } = require("worker_threads");
require("ts-node/register/transpile-only");
const { loadInput, root } = require("./section-training-data.cjs");
const {
  sectionFeatureContext,
} = require("../../src/harmony/sectionFeatures.ts");
const {
  candidateSections,
  sectionTreeScore,
} = require("../../src/harmony/sectionDecoder.ts");
if (!isMainThread) {
  const models = JSON.parse(fs.readFileSync(workerData.models));
  const snapshot = JSON.parse(fs.readFileSync(workerData.annotations)),
    annotations = snapshot.analyses || snapshot;
  const result = [];
  for (const s of workerData.songs) {
    const input = loadInput(s.key, annotations[s.key]),
      context = sectionFeatureContext(input.notes, input.grid);
    if (
      input.midiHash !== s.midiHash ||
      crypto
        .createHash("sha256")
        .update(JSON.stringify(annotations[s.key]))
        .digest("hex") !== s.annotationHash
    )
      throw new Error(`Training reference changed: ${s.key}`);
    const spans = candidateSections(s.count).map(([start, end]) => {
      const features = context.features(start, end);
      return [
        start,
        end,
        ...Object.values(models).map((model) =>
          sectionTreeScore(features, model),
        ),
      ];
    });
    result.push({ key: s.key, spans });
    if (result.length % 20 === 0)
      parentPort.postMessage({ progress: result.length });
  }
  fs.writeFileSync(workerData.output, zlib.gzipSync(JSON.stringify(result)));
  parentPort.postMessage({ done: true, output: workerData.output });
} else {
  const arg = (name) => {
    const i = process.argv.indexOf(name);
    return i < 0 ? null : process.argv[i + 1];
  };
  const split = arg("--split") || "validation",
    output =
      arg("--output") ||
      `/private/tmp/rawl-section-training/${split}-scores.json.gz`;
  const data = JSON.parse(
      fs.readFileSync(path.join(root, "reports/section-model/dataset.json")),
    ),
    songs = data.files.filter((s) => s.split === split);
  const models =
      arg("--models") || "/private/tmp/rawl-section-training/models.json",
    annotations = arg("--annotations") || path.join(root, data.annotations);
  const workers = Math.min(4, songs.length),
    jobs = [];
  for (let i = 0; i < workers; i++)
    jobs.push(
      new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: {
            models,
            annotations,
            songs: songs.filter((_, j) => j % workers === i),
            output: `${output}.${i}`,
          },
        });
        worker.on("message", (m) =>
          m.done
            ? resolve(m.output)
            : console.log(`Worker ${i}: ${m.progress} ${split} files scored`),
        );
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code) reject(new Error(`Worker ${i} exited ${code}`));
        });
      }),
    );
  Promise.all(jobs)
    .then((parts) => {
      const scored = parts.flatMap((p) =>
        JSON.parse(zlib.gunzipSync(fs.readFileSync(p))),
      );
      fs.writeFileSync(
        output,
        zlib.gzipSync(
          JSON.stringify({
            models: Object.keys(JSON.parse(fs.readFileSync(models))),
            modelsHash: crypto
              .createHash("sha256")
              .update(fs.readFileSync(models))
              .digest("hex"),
            songs: scored,
          }),
        ),
      );
      parts.forEach((p) => fs.unlinkSync(p));
      console.log(`Scored ${scored.length} ${split} files → ${output}`);
    })
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
}
