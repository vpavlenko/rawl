// Scan the local clean Lakh corpus without changing curated corpus membership.
// node scripts/rawl/scan-lakh-simple-major.js [--limit N] [--workers N]
const fs = require("fs");
const path = require("path");
const { Worker, isMainThread, parentPort } = require("worker_threads");
const { parseMidi } = require("midi-file");
const {
  readNotes,
  classify,
  readKeyRegions,
  keyAtBeat,
  isPickupNote,
} = require("./search-simple-major");
const {
  estimateHarmony,
  applyReviewedHarmony,
} = require("./sort-simple-major");
const reviews = require("./simple-major-reviewed-harmony.json");
const root = path.resolve(__dirname, "../..");
const output = path.join(root, "reports/lakh-simple-major");

// Duration-weighted major/minor key profiles. Used only for the relaxed review
// tier; its candidates must still pass the chromatic-harmony/ornament checks.
function estimateKey(notes) {
  const weights = Array(12).fill(0);
  for (const n of notes) weights[n.pitch % 12] += n.end - n.start;
  return keyFromWeights(weights);
}
function keyFromWeights(weights) {
  const profiles = {
    major: [
      6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
    ],
    minor: [
      6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
    ],
  };
  const mean = weights.reduce((a, b) => a + b, 0) / 12;
  const ranked = Object.entries(profiles)
    .flatMap(([mode, profile]) => {
      const pm = profile.reduce((a, b) => a + b, 0) / 12;
      return Array.from({ length: 12 }, (_, tonic) => {
        let dot = 0,
          a = 0,
          b = 0;
        for (let pc = 0; pc < 12; pc++) {
          const x = weights[(pc + tonic) % 12] - mean,
            y = profile[pc] - pm;
          dot += x * y;
          a += x * x;
          b += y * y;
        }
        return { tonic, mode, score: dot / Math.sqrt(a * b || 1) };
      });
    })
    .sort((a, b) => b.score - a.score);
  return { ...ranked[0], margin: ranked[0].score - ranked[1].score };
}

// Require two consecutive 16-beat blocks supporting each major key, then
// refine the lift at actual note onsets. A brief secondary dominant cannot
// establish a destination key. Every inferred section still passes classify.
function inferTruckDriverRegions(notes) {
  if (!notes.length) return [];
  const scale = [0, 2, 4, 5, 7, 9, 11];
  const end = Math.max(...notes.map((n) => n.end));
  const blocks = Array.from({ length: Math.ceil(end / 16) }, () =>
    Array(12).fill(0),
  );
  for (const n of notes)
    for (let i = Math.floor(n.start / 16); i * 16 < n.end; i++) {
      blocks[i][n.pitch % 12] +=
        Math.min(n.end, (i + 1) * 16) - Math.max(n.start, i * 16);
    }
  const keys = blocks.map((weights) => {
    const key = keyFromWeights(weights),
      total = weights.reduce((a, b) => a + b, 0);
    const inside = scale.reduce(
      (s, pc) => s + weights[(key.tonic + pc) % 12],
      0,
    );
    return key.mode === "major" &&
      key.margin >= 0.04 &&
      total > 0 &&
      inside / total >= 0.98
      ? key.tonic
      : null;
  });
  const stable = [];
  for (let i = 0; i < keys.length - 1; i++)
    if (keys[i] != null && keys[i] === keys[i + 1]) {
      const last = stable.at(-1);
      if (last?.tonic === keys[i]) last.end = (i + 2) * 16;
      else stable.push({ tonic: keys[i], start: i * 16, end: (i + 2) * 16 });
    }
  if (stable.length < 2 || stable[0].start > 16) return [];
  const regions = [{ start: 0, tonic: stable[0].tonic }];
  for (let i = 1; i < stable.length; i++) {
    const previous = stable[i - 1],
      next = stable[i];
    if (![1, 2].includes((next.tonic - previous.tonic + 12) % 12)) return [];
    const lo = Math.max(previous.start + 16, previous.end - 16),
      hi = next.start + 16;
    if (hi - lo > 64) return [];
    const nearby = notes.filter((n) => n.start >= lo && n.start < hi);
    const candidates = [...new Set(nearby.map((n) => n.start))];
    let best;
    for (const start of candidates) {
      let outside = 0;
      for (const n of nearby)
        if (
          !scale.includes(
            (n.pitch - (n.start < start ? previous.tonic : next.tonic) + 12) %
              12,
          )
        )
          outside += n.end - n.start;
      // Prefer a destination tonic bass attack when several boundaries have
      // the same scale fit (e.g. shared-tone lead-ins).
      const attack = nearby.filter((n) => n.start === start);
      const tonicBass =
        Math.min(...attack.map((n) => n.pitch)) % 12 === next.tonic;
      if (
        !best ||
        outside < best.outside - 1e-6 ||
        (Math.abs(outside - best.outside) < 1e-6 &&
          tonicBass &&
          !best.tonicBass)
      )
        best = { start, outside, tonicBass };
    }
    if (!best || best.start <= regions.at(-1).start) return [];
    regions.push({ start: best.start, tonic: next.tonic });
  }
  return regions;
}
function scan(entry, analyses) {
  const midi = parseMidi(
    fs.readFileSync(
      path.join(root, "public/lakh-data", entry.artist, entry.filename),
    ),
  );
  const notes = readNotes(midi);
  const annotation = analyses[`c/MIDI/${entry.artist}/${entry.filename}`];
  let regions = readKeyRegions(midi, notes, annotation);
  let match = classify(notes, annotation, regions);
  let tier = "strict tonic ending";
  const keyProfile = estimateKey(notes);
  if (!match && reviews[entry.slug]) {
    const tonic = reviews[entry.slug].tonic ?? keyProfile.tonic;
    match = classify(notes, { modulations: { 1: tonic } }, [], {
      requireTonicEnding: false,
    });
    tier = "manually reviewed";
  }
  if (!match && keyProfile.mode === "major" && keyProfile.margin >= 0.04) {
    const annotatedTonic = Object.values(annotation?.modulations || {})[0];
    if (annotatedTonic == null || annotatedTonic === keyProfile.tonic) {
      match = classify(
        notes,
        annotation || { modulations: { 1: keyProfile.tonic } },
        regions,
        { requireTonicEnding: false },
      );
      tier = "key-profile candidate; tonic ending not required";
    }
  }
  if (!match && regions.length < 2) {
    const inferred = inferTruckDriverRegions(notes);
    if (inferred.length > 1) {
      const localAnnotation = {
        modulations: Object.fromEntries(
          inferred.map((r, i) => [i + 1, r.tonic]),
        ),
      };
      match = classify(notes, localAnnotation, inferred, {
        requireTonicEnding: false,
      });
      if (match) {
        regions = inferred;
        tier = "inferred truck-driver modulation; review local keys";
      }
    }
  }
  if (!match) return { status: "excluded" };
  const normalized = notes
    .filter((n) => !isPickupNote(n, regions))
    .map((n) => ({
      ...n,
      pitch:
        n.pitch -
        ((keyAtBeat(regions, n.start, match.tonic) - match.tonic + 12) % 12),
      key: keyAtBeat(regions, n.start, match.tonic),
    }));
  const harmony = applyReviewedHarmony({
    slug: entry.slug,
    basis: "MIDI estimate",
    ...estimateHarmony(normalized, match.tonic),
  });
  return {
    status: harmony.group == null ? "inconclusive" : "match",
    ...entry,
    tier,
    tonic: match.tonic,
    ...(regions.length > 1 ? { keyRegions: regions } : {}),
    keyProfile,
    chromaticNotes: match.chromaticNotes,
    noteCount: notes.length,
    ...harmony,
  };
}
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
function writeReport(report) {
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(
    path.join(output, "results.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  const corpusSections = require("../../src/components/rawl/corpora/simpleMajorSections.json");
  if (report.completed === report.total)
    fs.writeFileSync(
      path.join(root, "src/components/rawl/corpora/simpleMajorLakhPieces.json"),
      JSON.stringify(
        Object.fromEntries(
          corpusSections.map((section, group) => [
            section.id,
            report.matches
              .filter((t) => t.group === group)
              .map(({ artist, title, slug, filename }) => ({
                artist,
                title,
                slug,
                filename,
              })),
          ]),
        ),
        null,
        2,
      ) + "\n",
    );
  const names = [
    "C",
    "C♯",
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
  const sections = require("../../src/components/rawl/corpora/simpleMajorSections.json");
  const rows = sections
    .map((s, i) => {
      const tracks = report.matches.filter((t) => t.group === i);
      return `<section><h2>${esc(s.title)} <small>${
        tracks.length
      } arrangements</small></h2><table><thead><tr><th>Artist / piece</th><th>Key</th><th>Rhythm (beats)</th><th>Evidence tier</th></tr></thead><tbody>${tracks
        .map(
          (t) =>
            `<tr data-search="${esc(
              (t.artist + " " + t.title).toLowerCase(),
            )}"><td><a href="/${esc(
              t.slug,
            )}" target="_blank" rel="noopener">${esc(t.artist)} — ${esc(
              t.title,
            )}</a></td><td>${
              t.keyRegions?.length > 1
                ? t.keyRegions
                    .map(
                      (r) =>
                        `${names[r.tonic]} (beat ${Number(
                          r.start.toFixed(2),
                        )})`,
                    )
                    .join(" → ")
                : names[t.tonic]
            }</td><td>${t.harmonicRhythm.beats} <small>(${Math.round(
              t.harmonicRhythm.confidence * 100,
            )}% interval support)</small></td><td>${esc(t.tier)}</td></tr>`,
        )
        .join("")}</tbody></table></section>`;
    })
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Lakh simple-major scan</title><style>body{background:#111;color:#ddd;font:15px system-ui;margin:32px;max-width:1300px}a{color:#ffaa00}h2{color:#8acfff}small{color:#999;font-weight:normal}table{width:100%;border-collapse:collapse}td,th{text-align:left;padding:7px;border-bottom:1px solid #333}input{padding:10px;width:400px;max-width:90%;position:sticky;top:10px}section{margin:36px 0}p{line-height:1.5}</style></head><body><h1>Lakh simple-major scan</h1><p>${report.completed}/${report.total} arrangements scanned. ${report.matches.length} candidates; ${report.inconclusive.length} harmonically inconclusive; ${report.failures.length} read errors or timeouts. Arrangements remain separate.</p><p>Automated candidates for manual review. Strict matches pass diatonic/ornament checks and a major-tonic ending. The relaxed tier uses a major key profile and the same chromatic checks, without requiring a tonic ending. Truck-driver candidates infer sustained major keys a semitone or whole tone apart and validate harmony in each local key. Rhythm is in MIDI quarter-note beats, not bars. Interval support is not an overall classification confidence.</p><input aria-label="Filter scan results" placeholder="Filter by artist or piece"><p id="count"></p>${rows}<script>const input=document.querySelector('input');input.addEventListener('input',()=>{let n=0;document.querySelectorAll('tr[data-search]').forEach(r=>{r.hidden=!r.dataset.search.includes(input.value.toLowerCase());if(!r.hidden)n++});document.querySelector('#count').textContent=n+' visible arrangements';});</script></body></html>`;
  fs.writeFileSync(
    path.join(root, "public/lakh-simple-major-review.html"),
    html,
  );
}
async function main() {
  const index = require("../../public/lakh-index.json");
  const arg = (name, fallback) => {
    const i = process.argv.indexOf(name);
    return i < 0 ? fallback : Number(process.argv[i + 1]);
  };
  const entries = index.artists
    .flatMap((a) =>
      a.tracks.map((filename) => ({
        artist: a.name,
        filename,
        title: filename.replace(/\.mid$/i, ""),
        slug: `lakh/${a.slug}/${a.trackSlugs[filename]}`,
      })),
    )
    .slice(0, arg("--limit", Infinity));
  const report = {
    method:
      "Conservative major-key search, then rhythm/texture/harmony estimation. Two ending tiers plus sustained truck-driver key lifts; reviewed exclusive labels override spurious harmonies. No corpus membership changed.",
    total: entries.length,
    completed: 0,
    excluded: 0,
    matches: [],
    inconclusive: [],
    failures: [],
  };
  let next = 0;
  const start = Date.now();
  await Promise.all(
    Array.from(
      { length: Math.min(arg("--workers", 4), entries.length) },
      () =>
        new Promise((resolve) => {
          let worker, timer, current;
          const launch = () => {
            worker = new Worker(__filename);
            worker.on("message", (result) => {
              clearTimeout(timer);
              record(result);
              dispatch();
            });
            worker.on("error", (error) => {
              clearTimeout(timer);
              record({ status: "failure", error: error.message });
              worker.terminate();
              launch();
              dispatch();
            });
          };
          const record = (result) => {
            report.completed++;
            if (result.status === "match") report.matches.push(result);
            else if (result.status === "inconclusive")
              report.inconclusive.push(result);
            else if (result.status === "failure")
              report.failures.push({ ...current, error: result.error });
            else report.excluded++;
            if (report.completed % 250 === 0) {
              console.log(
                `${report.completed}/${report.total}: ${
                  report.matches.length
                } candidates, ${report.failures.length} failures (${Math.round(
                  (Date.now() - start) / 1000,
                )}s)`,
              );
              writeReport(report);
            }
          };
          const dispatch = () => {
            if (next >= entries.length) {
              worker.terminate();
              resolve();
              return;
            }
            current = entries[next++];
            worker.postMessage(current);
            timer = setTimeout(() => {
              record({
                status: "failure",
                error: "Exceeded 30-second per-file analysis limit",
              });
              worker.removeAllListeners();
              worker.terminate();
              launch();
              dispatch();
            }, 30000);
          };
          launch();
          dispatch();
        }),
    ),
  );
  report.matches.sort(
    (a, b) =>
      a.group - b.group ||
      a.artist.localeCompare(b.artist) ||
      a.title.localeCompare(b.title),
  );
  report.elapsedSeconds = Math.round((Date.now() - start) / 1000);
  report.groups =
    require("../../src/components/rawl/corpora/simpleMajorSections.json").map(
      (s, i) => ({
        label: s.title,
        count: report.matches.filter((t) => t.group === i).length,
      }),
    );
  writeReport(report);
  console.log(
    JSON.stringify(
      {
        completed: report.completed,
        matches: report.matches.length,
        excluded: report.excluded,
        inconclusive: report.inconclusive.length,
        failures: report.failures.length,
        groups: report.groups,
        elapsedSeconds: report.elapsedSeconds,
      },
      null,
      2,
    ),
  );
}
if (isMainThread) {
  if (require.main === module)
    main().catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
} else {
  const analyses = require("../../src/corpus/analyses.json");
  parentPort.on("message", (entry) => {
    try {
      parentPort.postMessage(scan(entry, analyses));
    } catch (e) {
      parentPort.postMessage({
        status: "failure",
        error: e.message || String(e),
      });
    }
  });
}
module.exports = { estimateKey, scan, inferTruckDriverRegions, writeReport };
