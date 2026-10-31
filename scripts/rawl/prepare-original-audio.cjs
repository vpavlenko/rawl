#!/usr/bin/env node
// Prepare sample-accurate audio for publication with publish-original-audio.cjs.
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { execFileSync } = require("node:child_process");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--") || !args[i + 1])
      throw new Error("Expected --option value.");
    options[args[i].slice(2)] = args[++i];
  }
  for (const key of [
    "input",
    "output",
    "offset",
    "duration",
    "midi-id",
    "midi-sha256",
    "source-url",
  ]) {
    if (options[key] === undefined) throw new Error(`Missing --${key}`);
  }
  const offset = Number(options.offset),
    duration = Number(options.duration);
  if (
    !Number.isFinite(offset) ||
    offset < 0 ||
    !Number.isFinite(duration) ||
    duration <= 0
  )
    throw new Error("Invalid trim times.");
  if (!/^[a-f0-9]{64}$/.test(options["midi-sha256"]))
    throw new Error("Invalid MIDI SHA-256.");
  if (path.resolve(options.input) === path.resolve(options.output))
    throw new Error("Input and output must differ.");
  fs.mkdirSync(path.dirname(path.resolve(options.output)), { recursive: true });
  const probe = JSON.parse(
    execFileSync("ffprobe", [
      "-v",
      "error",
      "-show_streams",
      "-of",
      "json",
      options.input,
    ]),
  );
  const stream = probe.streams.find((s) => s.codec_type === "audio");
  if (!stream) throw new Error("No audio stream.");
  // Decode before trimming (no keyframe/packet seeking), then preserve the
  // source sample rate and channels. AAC priming is represented by MP4 edits.
  execFileSync(
    "ffmpeg",
    [
      "-nostdin",
      "-v",
      "error",
      "-y",
      "-i",
      options.input,
      "-map",
      "0:a:0",
      "-vn",
      "-af",
      `atrim=start=${offset},asetpts=PTS-STARTPTS,apad,atrim=duration=${duration}`,
      "-ar",
      String(stream.sample_rate),
      "-ac",
      String(stream.channels),
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-movflags",
      "+faststart",
      options.output,
    ],
    { stdio: "inherit" },
  );
  const bytes = fs.readFileSync(options.output),
    sha256 = hash(bytes);
  const measured = Number(
    execFileSync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=nw=1:nk=1",
        options.output,
      ],
      { encoding: "utf8" },
    ).trim(),
  );
  if (Math.abs(measured - duration) > 0.025)
    throw new Error(`Unexpected audio duration ${measured}.`);
  const asset = {
    sha256,
    midiSha256: options["midi-sha256"],
    durationSeconds: duration,
    sourceOffsetSeconds: offset,
    sourceUrl: options["source-url"],
    bytes: bytes.length,
    sampleRate: Number(stream.sample_rate),
    channels: stream.channels,
  };
  const report = {
    midiId: options["midi-id"],
    input: path.resolve(options.input),
    output: path.resolve(options.output),
    ...asset,
    published: false,
  };
  const reportPath = `${options.output}.json`;
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
