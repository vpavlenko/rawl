#!/usr/bin/env node
// Publish prepared audio to a dedicated Firebase Hosting site. Existing assets
// remain in every release; MIDI blobs and annotation documents are never edited.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const zlib = require("node:zlib");
const admin = require("firebase-admin");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
  const options = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith("--") || !args[i + 1])
      throw new Error("Expected --option value.");
    options[args[i].slice(2)] = args[i + 1];
  }
  if (!options.manifest || !options.site)
    throw new Error("Required: --manifest PATH --site SITE_ID");
  const credential = admin.credential.cert(
    require(
      options.credentials ||
        path.resolve(__dirname, "../../src/config/firebaseConfigPrivate.json"),
    ),
  );
  admin.initializeApp({ credential });
  const db = admin.firestore();
  db.settings({ preferRest: true });
  const project = admin.app().options.credential.projectId;
  if (options.site === project)
    throw new Error(
      "Use a dedicated audio Hosting site, not the default project site.",
    );
  const token = (await credential.getAccessToken()).access_token;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const base = "https://firebasehosting.googleapis.com/v1beta1/";
  async function api(endpoint, method = "GET", body) {
    const response = await fetch(base + endpoint, {
      method,
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(`${method} ${endpoint}: ${JSON.stringify(data.error)}`);
    return data;
  }
  const site = options.site;
  await api(`projects/${project}/sites/${site}`);
  const entries = JSON.parse(fs.readFileSync(options.manifest, "utf8"));
  const prepared = [];
  for (const entry of entries) {
    const report = JSON.parse(fs.readFileSync(entry.report, "utf8"));
    const bytes = fs.readFileSync(report.output);
    if (hash(bytes) !== report.sha256)
      throw new Error(`Prepared audio changed: ${entry.key}`);
    const ref = db.collection("midis").doc(report.midiId),
      before = await ref.get();
    if (
      !before.exists ||
      hash(Buffer.from(before.get("blob"))) !== report.midiSha256
    )
      throw new Error(`MIDI identity changed: ${entry.key}`);
    const storagePath = `/original-audio/${report.midiId}/${report.sha256}.m4a`;
    const gzip = zlib.gzipSync(bytes, { level: 9 });
    prepared.push({
      entry,
      report,
      bytes,
      gzip,
      gzipHash: hash(gzip),
      storagePath,
      ref,
      before,
    });
  }
  const releases = await api(`sites/${site}/releases?pageSize=1`);
  const previousVersion = releases.releases?.[0]?.version?.name || null;
  const files = {};
  let config = {};
  if (previousVersion) {
    config = (await api(previousVersion)).config || {};
    let pageToken = "";
    do {
      const page = await api(
        `${previousVersion}/files?pageSize=1000${
          pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""
        }`,
      );
      for (const file of page.files || []) files[file.path] = file.hash;
      pageToken = page.nextPageToken;
    } while (pageToken);
  }
  for (const item of prepared) files[item.storagePath] = item.gzipHash;
  config.headers = [
    ...(config.headers || []).filter((h) => h.glob !== "/original-audio/**"),
    {
      glob: "/original-audio/**",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public,max-age=31536000,immutable",
        "Content-Type": "audio/mp4",
      },
    },
  ];
  const version = await api(`sites/${site}/versions`, "POST", {
    config,
    labels: { rawl: "original-audio" },
  });
  const populated = await api(`${version.name}:populateFiles`, "POST", {
    files,
  });
  for (const required of populated.uploadRequiredHashes || []) {
    const item = prepared.find((p) => p.gzipHash === required);
    if (!item)
      throw new Error(`Existing Hosting asset unavailable: ${required}`);
    const response = await fetch(`${populated.uploadUrl}/${required}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body: item.gzip,
    });
    if (!response.ok)
      throw new Error(`Audio upload failed (${response.status}).`);
  }
  await api(`${version.name}?updateMask=status`, "PATCH", {
    status: "FINALIZED",
  });
  const latest = await api(`sites/${site}/releases?pageSize=1`);
  if ((latest.releases?.[0]?.version?.name || null) !== previousVersion)
    throw new Error(
      "Hosting release changed concurrently; retry with its asset list.",
    );
  const release = await api(
    `sites/${site}/releases?versionName=${encodeURIComponent(version.name)}`,
    "POST",
    { message: "Original audio" },
  );
  for (const item of prepared) {
    const { report } = item;
    const originalAudio = {
      url: `https://${site}.web.app${item.storagePath}`,
      storagePath: item.storagePath,
      sha256: report.sha256,
      midiSha256: report.midiSha256,
      durationSeconds: report.durationSeconds,
      sourceOffsetSeconds: report.sourceOffsetSeconds,
      sourceUrl: report.sourceUrl,
      hostingSite: site,
      hostingVersion: version.name,
    };
    let verified = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const response = await fetch(originalAudio.url, {
        headers: { Origin: "https://rawl.rocks" },
      });
      if (
        response.ok &&
        hash(Buffer.from(await response.arrayBuffer())) === report.sha256 &&
        ["*", "https://rawl.rocks"].includes(
          response.headers.get("access-control-allow-origin"),
        )
      ) {
        verified = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
    if (!verified)
      throw new Error(
        `Public audio byte/CORS verification failed: ${item.entry.key}`,
      );
    await db.runTransaction(async (tx) => {
      const current = await tx.get(item.ref);
      if (hash(Buffer.from(current.get("blob"))) !== report.midiSha256)
        throw new Error("MIDI changed while publishing.");
      if (
        JSON.stringify(current.get("originalAudio") || null) !==
        JSON.stringify(item.before.get("originalAudio") || null)
      )
        throw new Error("Audio link changed concurrently.");
      tx.update(item.ref, { originalAudio });
    });
    const after = await item.ref.get();
    if (
      hash(Buffer.from(after.get("blob"))) !== report.midiSha256 ||
      after.get("originalAudio.sha256") !== report.sha256
    )
      throw new Error("Firestore read-back failed.");
    Object.assign(report, {
      originalAudio,
      release: release.name,
      published: true,
    });
    fs.writeFileSync(item.entry.report, JSON.stringify(report, null, 2) + "\n");
    console.log(
      JSON.stringify({ key: item.entry.key, originalAudio, published: true }),
    );
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
