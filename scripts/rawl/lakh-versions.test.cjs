const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("fs"),
  zlib = require("zlib");
require("ts-node/register/transpile-only");
const {
  versionFeatures,
  versionGroupFeatures,
  VERSION_FEATURE_NAMES,
} = require("../../src/lakh/versionFeatures.ts");
const { versionGroupId } = require("../../src/lakh/versionGroups.ts");
const { suggestedVersion, orderVersionKeys } = require("../../src/lakh/versionRanking.ts");
function part(
  channel,
  { name = "", port = 0, offset = 0, step = 480, chords = false } = {},
) {
  const events = [
    { tick: 0, type: "midiPort", port, meta: true },
    { tick: 0, type: "trackName", text: name, meta: true },
    {
      tick: 0,
      type: "programChange",
      programNumber: channel ? 33 : 73,
      channel,
    },
  ];
  for (let i = 0; i < 64; i++)
    for (const pitch of chords ? [60, 64, 67] : [60 + (i % 8)]) {
      events.push({
        tick: i * step + offset,
        type: "noteOn",
        channel,
        noteNumber: pitch,
        velocity: 90,
      });
      events.push({
        tick: i * step + offset + step / 2,
        type: "noteOff",
        channel,
        noteNumber: pitch,
        velocity: 0,
      });
    }
  events.sort((a, b) => a.tick - b.tick);
  let tick = 0;
  return events.map(({ tick: next, ...e }) => {
    const row = { ...e, deltaTime: next - tick };
    tick = next;
    return row;
  });
}
const midi = (...tracks) => ({
  header: { format: 1, ticksPerBeat: 480 },
  tracks,
});
const feature = (result, name) =>
  result.features[VERSION_FEATURE_NAMES.indexOf(name)];
test("port/channel identity preserves separate arrangement voices", () => {
  const r = versionFeatures(midi(part(0), part(0, { port: 1 })));
  assert.equal(r.summary.voices, 2);
  assert.equal(r.summary.pitchedVoices, 2);
});
test("part names provide vocal evidence but format-0 song titles do not", () => {
  const tracks = [part(0, { name: "Lead Vox" })];
  assert.equal(versionFeatures(midi(...tracks)).summary.vocal, "named");
  const zero = versionFeatures({
    header: { format: 0, ticksPerBeat: 480 },
    tracks,
  });
  assert.equal(feature(zero, "vocal.namedPart"), 0);
});
test("polyphonic accompaniment alone is not labeled a melodic vocal candidate", () => {
  const r = versionFeatures(midi(part(0, { chords: true })));
  assert.equal(r.summary.vocal, "unverified");
});
test("triplets fit the beat subdivision grid while shifted attacks do not", () => {
  const exact = versionFeatures(midi(part(0, { step: 160 })));
  const shifted = versionFeatures(midi(part(0, { step: 160, offset: 70 })));
  assert.ok(feature(exact, "grid.subdivisionError") < 1e-10);
  assert.ok(feature(shifted, "grid.subdivisionError") > 0.04);
});
test("version grouping preserves composition identity across suffixes and spelling", () => {
  assert.equal(
    versionGroupId("ABBA", "S.O.S.12.mid"),
    versionGroupId("ABBA", "SOS.mid"),
  );
  assert.notEqual(
    versionGroupId("ABBA", "Waterloo.mid"),
    versionGroupId("ABBA", "Fernando.mid"),
  );
});
test("within-song features are independent of duplicate file copies", () => {
  const a = versionFeatures(midi(part(0))).features,
    b = versionFeatures(midi(part(0), part(1))).features;
  assert.deepEqual(
    versionGroupFeatures([a, b]).slice(0, 1),
    versionGroupFeatures([a, b, a]).slice(0, 1),
  );
});
test("missing and tied versions do not produce a fabricated preference", () => {
  const r = {
    modelVersion: "test",
    byKey: { a: { score: 1 }, b: { score: 1 } },
  };
  assert.equal(suggestedVersion(["a", "b"], r), undefined);
  assert.equal(suggestedVersion(["a", "missing"], r), undefined);
});
test("manual choice leads automatic ranking; missing files and ties keep a deterministic fallback", () => {
  const rankings = { byKey: {
    rich: { score: 2 }, manual: { score: -3 }, tied: { score: 2 }, simple: { score: 0 },
  }};
  const keys = ["missing", "simple", "rich", "tied", "manual"];
  assert.deepEqual(orderVersionKeys(keys, rankings, key => key === "manual"),
    ["manual", "rich", "tied", "simple", "missing"]);
  assert.deepEqual(orderVersionKeys(keys, null, key => key === "manual"),
    ["manual", "missing", "simple", "rich", "tied"]);
  assert.deepEqual(keys, ["missing", "simple", "rich", "tied", "manual"]);
});
test("song title opens the leading version while version links keep their original numbers", () => {
  const React = require("react"), { renderToStaticMarkup } = require("react-dom/server");
  const Discography = require("../../src/components/lakh/BeatlesDiscography.tsx").default;
  const files = ["Song.mid", "Song.1.mid", "Song.2.mid"];
  const rankings = { byKey: {
    "Song.mid": { score: -2 }, "Song.1.mid": { score: 1 }, "Song.2.mid": { score: 3 },
  }};
  const render = manual => renderToStaticMarkup(React.createElement(Discography, {
    files, allFiles: files, groupByAlbum: false,
    isAnnotated: file => file === manual,
    rankFiles: keys => orderVersionKeys(keys, rankings, file => file === manual),
    renderTrack: (file, label) => React.createElement("a", { href: `/test/${file}` }, label),
  }));
  const automatic = render(null);
  assert.match(automatic, /href="\/test\/Song\.2\.mid">Song<\/a>/);
  const links = Array.from(automatic.matchAll(/href="\/test\/([^\"]+)">([^<]+)<\/a>/g), m => [m[1], m[2]]);
  assert.deepEqual(links, [["Song.2.mid", "Song"], ["Song.2.mid", "2"], ["Song.1.mid", "1"], ["Song.mid", "0"]]);
  const chosen = render("Song.mid");
  assert.match(chosen, /href="\/test\/Song\.mid">Song<\/a>/);
  assert.doesNotMatch(chosen, /href="\/test\/Song\.2\.mid"/);
});
test("saved split groups and MIDI bytes stay outside other splits", () => {
  const data = JSON.parse(
    fs.readFileSync("reports/lakh-version-model/dataset.json"),
  );
  const labels = data.groups.filter((g) => g.accepted.length),
    seen = new Map(),
    hashes = new Map();
  for (const g of labels) {
    if (seen.has(g.splitGroup)) assert.equal(seen.get(g.splitGroup), g.split);
    seen.set(g.splitGroup, g.split);
    for (const r of g.rows) {
      if (hashes.has(r.midiHash)) assert.equal(hashes.get(r.midiHash), g.split);
      hashes.set(r.midiHash, g.split);
    }
  }
});
test("experimental scores match native Python held-out tree predictions", () => {
  const evaluation = JSON.parse(
    fs.readFileSync("reports/lakh-version-model/evaluation.json"),
  );
  const index = JSON.parse(
    zlib.gunzipSync(fs.readFileSync("reports/lakh-version-model/experimental-rankings.json.gz")),
  );
  assert.equal(index.modelVersion, evaluation.modelVersion);
  let count = 0;
  for (const group of evaluation.testPredictions)
    for (const row of group.ranked) {
      assert.ok(Math.abs(index.byKey[row.key].score - row.score) < 1e-10);
      count++;
    }
  assert.ok(count > 30);
});
test("deployed rankings preserve the evaluated scores and cover readable multi-version files", () => {
  const production = JSON.parse(zlib.gunzipSync(fs.readFileSync("public/lakh-version-rankings.json.gz")));
  const experimental = JSON.parse(zlib.gunzipSync(fs.readFileSync("reports/lakh-version-model/experimental-rankings.json.gz")));
  assert.deepEqual(production, experimental);
  const manifest = JSON.parse(fs.readFileSync("reports/lakh-version-model/dataset.json"));
  assert.equal(Object.keys(production.byKey).length, manifest.groups.reduce((n, group) => n + group.rows.length, 0));
});
