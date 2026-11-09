const assert = require("node:assert/strict");
const { test } = require("node:test");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const root = path.resolve(__dirname, "../..");
const font = require("../../src/players/qanunSoundfont.json");

test("the real synth plays the cleaned qanun bank, preserves bends, tails and GM percussion", async () => {
  const errors = [];
  const scope = vm.createContext({ console, WebAssembly, TextDecoder, TextEncoder,
    URL, setTimeout, clearTimeout, performance, fetch });
  vm.runInContext(fs.readFileSync(path.join(root, "src/chip-core.js"), "utf8")
    .replace("export default CHIP_CORE;", "") + ";this.factory=CHIP_CORE;", scope);
  const core = await scope.factory({
    wasmBinary: fs.readFileSync(path.join(root, "public/chip-core.wasm")),
    print() {}, printErr: (message) => errors.push(message),
  });
  const data = fs.readFileSync(path.join(root, "public", font.file));
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"), font.sha256);
  core._tp_init(44100);
  core.FS.writeFile("/gm.sf2", fs.readFileSync(path.join(root, "public/2MBGMGS.SF2")));
  assert.notEqual(core.ccall("tp_load_soundfont", "number", ["string"], ["/gm.sf2"]), -1);
  const existingWarnings = new Set(errors);
  errors.length = 0;
  core.FS.writeFile("/qanun.sf2", data);
  assert.notEqual(core.ccall("tp_load_soundfont", "number", ["string"], ["/qanun.sf2"]), -1);
  core._tp_set_reverb(0);
  core._fluid_synth_set_chorus_on(core._tp_get_fluid_synth(), false);
  const samples = 4096;
  const buffer = core._malloc(samples * 4);
  const render = () => {
    core._tp_render(buffer, samples);
    const pcm = core.HEAPF32.slice(buffer >> 2, (buffer >> 2) + samples);
    assert.ok(pcm.every(Number.isFinite));
    return pcm;
  };
  const audible = (pcm) => pcm.some((value) => Math.abs(value) > 0.0001);
  const play = (program, bend = 8192, pitch = 64) => {
    core._tp_reset();
    core._tp_program_change(0, program);
    core._tp_pitch_bend(0, bend);
    core._tp_note_on(0, pitch, 100);
    return render();
  };
  assert.ok(audible(play(0)));
  for (const program of [6, 24, 40, 73, 127])
    assert.deepEqual(play(program), play(0), `program ${program} must stay qanun`);
  assert.notDeepEqual(play(0, 6144), play(0), "quartertone bends must change the rendered audio");
  for (const pitch of [53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87])
    assert.ok(audible(play(0, 8192, pitch)), `recorded pitch ${pitch} must sound`);
  // Measure actual output, so a nominal root-key label alone cannot pass.
  const calibration = require("../../public/audio/qanun/soundfont.json");
  for (const pitch of [60, 72, 74, 84]) {
    const zone = calibration.samples.find(({ keyRange }) =>
      keyRange[0] <= pitch && pitch <= keyRange[1]);
    const rate = 2 ** ((pitch - zone.midi + zone.tuningCorrectionCents / 100) / 12);
    const mono = [];
    const append = (pcm) => {
      for (let i = 0; i < pcm.length; i += 2)
        mono.push((pcm[i] + pcm[i + 1]) / 2);
    };
    append(play(0, 8192, pitch));
    while (mono.length < 44100) append(render());
    const begin = Math.round(0.08 * 44100 / rate);
    const end = Math.min(Math.round(0.8 * 44100 / rate),
      Math.round((zone.pcmSamples - 0.025 * 44100) / rate));
    const window = mono.slice(begin, end).map((value, i, values) =>
      value * 0.5 * (1 - Math.cos(2 * Math.PI * i / (values.length - 1))));
    const target = 440 * 2 ** ((pitch - 69) / 12);
    let measured = 0, strongest = -Infinity;
    for (let frequency = target * 2 ** (-45 / 1200);
      frequency <= target * 2 ** (45 / 1200); frequency += 0.04) {
      const coefficient = 2 * Math.cos(2 * Math.PI * frequency / 44100);
      let previous = 0, older = 0;
      for (const value of window) {
        const current = value + coefficient * previous - older;
        older = previous;
        previous = current;
      }
      const power = previous * previous + older * older - coefficient * previous * older;
      if (power > strongest) { strongest = power; measured = frequency; }
    }
    const cents = 1200 * Math.log2(measured / target);
    assert.ok(Math.abs(cents) < 1, `MIDI ${pitch}: ${cents.toFixed(2)} cents`);
  }
  play(0, 8192, 59);
  core._tp_note_off(0, 59);
  assert.ok(audible(render()), "short MIDI notes must retain the natural ringing tail");
  core._tp_control_change(0, 120, 0);
  assert.ok(!audible(render()), "mute/panic must stop the ringing tail");
  core._tp_reset();
  core._fluid_synth_bank_select(core._tp_get_fluid_synth(), 9, 128);
  core._tp_program_change(9, 0);
  core._tp_note_on(9, 36, 100);
  assert.ok(audible(render()), "native percussion must remain audible");
  assert.ok(errors.every((message) => existingWarnings.has(message)), errors.join("\n"));
});
