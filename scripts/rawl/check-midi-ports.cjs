// Run: node scripts/rawl/check-midi-ports.cjs [optional MIDI path]
// Exercise the production parser, transformation, sequencer, and WASM synth.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { writeMidi } = require("midi-file");
const MIDIFile = require("midifile");
const root = path.resolve(__dirname, "../..");
const quietConsole = { ...console, debug() {}, log() {} };
const synthErrors = [];
const wasmScope = vm.createContext({
  console: quietConsole,
  WebAssembly,
  TextDecoder,
  TextEncoder,
  URL,
  setTimeout,
  clearTimeout,
  performance,
  fetch,
});
vm.runInContext(
  fs
    .readFileSync(path.join(root, "src/chip-core.js"), "utf8")
    .replace("export default CHIP_CORE;", "") + ";this.factory=CHIP_CORE;",
  wasmScope,
);
const factory = () =>
  wasmScope.factory({
    wasmBinary: fs.readFileSync(path.join(root, "public/chip-core.wasm")),
    print() {},
    printErr: (message) => synthErrors.push(message),
  });
const cache = new Map();
function load(filename) {
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const code = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      allowJs: true,
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
  }).outputText;
  const localRequire = (name) => {
    if (name.endsWith("chip-core")) return factory;
    // auto-bind ships as ESM; this small interop shim only binds methods.
    if (name === "auto-bind")
      return (object) => {
        for (
          let proto = Object.getPrototypeOf(object);
          proto && proto !== Object.prototype;
          proto = Object.getPrototypeOf(proto)
        ) {
          for (const key of Object.getOwnPropertyNames(proto)) {
            if (key !== "constructor" && typeof object[key] === "function")
              object[key] = object[key].bind(object);
          }
        }
        return object;
      };
    if (!name.startsWith(".")) return require(name);
    const base = path.resolve(path.dirname(filename), name);
    const target = [
      base,
      `${base}.js`,
      `${base}.ts`,
      path.join(base, "index.js"),
    ].find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
    return load(target);
  };
  vm.runInNewContext(
    "(function(require,module,exports){" + code + "\n})",
    {
      console: quietConsole,
      performance,
      setTimeout,
      clearTimeout,
    },
    { filename },
  )(localRequire, module, module.exports);
  return module.exports;
}
const transform = load(
  path.join(root, "src/components/rawl/transformMidi.ts"),
).default;
const FilePlayer = load(
  path.join(root, "src/players/MIDIFilePlayer.js"),
).default;
const PortSynth = load(path.join(root, "src/players/MIDIPortSynth.js")).default;
const event = (type, fields = {}, deltaTime = 0) => ({
  type,
  deltaTime,
  ...fields,
});
const track = (port, program, note, channel = 14) => [
  ...(port === undefined ? [] : [event("portPrefix", { port })]),
  event("programChange", { channel, programNumber: program }),
  event("noteOn", { channel, noteNumber: note, velocity: 100 }, 480),
  event("noteOff", { channel, noteNumber: note, velocity: 0 }, 480),
  event("endOfTrack"),
];
const bytes = (tracks) =>
  new Uint8Array(
    writeMidi({ header: { format: 1, ticksPerBeat: 480 }, tracks }),
  );
const parser = (data, synth) => {
  data = new Uint8Array(data);
  const player = new FilePlayer({
    synth,
    output: { send() {} },
    sampleRate: 44100,
  });
  const result = player.load(
    new MIDIFile(
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
    ),
  );
  return { player, result };
};
async function main() {
  const primary = await factory();
  const ports = new PortSynth(primary, 44100);
  const core = ports.core;
  core._tp_init(44100);
  core._tp_set_reverb(0);
  core._fluid_synth_set_chorus_on(core._tp_get_fluid_synth(), false);
  primary.FS.writeFile(
    "/font.sf2",
    fs.readFileSync(path.join(root, "public/2MBGMGS.SF2")),
  );
  assert.notEqual(
    core.ccall("tp_load_soundfont", "number", ["string"], ["/font.sf2"]),
    -1,
  );
  await ports.prepare([14, 30, 41]);
  const synth = {
    noteOn: core._tp_note_on,
    noteOff: core._tp_note_off,
    programChange: core._tp_program_change,
    controlChange: core._tp_control_change,
    pitchBend: core._tp_pitch_bend,
    render: core._tp_render,
    panic: core._tp_panic,
    panicChannel: core._tp_panic_channel,
    reset: core._tp_reset,
    getValue: core.getValue,
  };
  const data = bytes([
    track(undefined, 59, 60),
    track(1, 45, 67),
    track(2, 0, 36, 9),
  ]);
  const { player, result } = parser(transform(data), synth);
  assert.deepEqual(
    Object.keys(player.channelsInUse)
      .filter((ch) => player.channelsInUse[ch])
      .map(Number),
    [14, 30, 41],
  );
  assert.deepEqual(
    Array.from(result.notes, (notes) => notes[0].note.midiNumber),
    [60, 67, 36],
  );
  assert.equal(result.notes[2][0].isDrum, true);
  assert.equal(player.channelProgramNums[14], 59);
  assert.equal(player.channelProgramNums[30], 45);
  const buffer = core._malloc(2048 * 4);
  const render = () => {
    core._tp_render(buffer, 2048);
    return primary.HEAPF32.slice(buffer >> 2, (buffer >> 2) + 2048);
  };
  const audible = (pcm) => pcm.some((sample) => Math.abs(sample) > 0.001);
  // Changing the program on port 1 must leave the port 0 trumpet PCM identical.
  const trumpet = (otherProgram) => {
    core._tp_reset();
    core._tp_program_change(14, 59);
    core._tp_program_change(30, otherProgram);
    core._tp_note_on(14, 60, 100);
    return render();
  };
  assert.deepEqual(trumpet(45), trumpet(0));
  assert.ok(audible(trumpet(45)));
  // Muting the same channel on port 0 cannot silence the held note on port 1.
  core._tp_reset();
  core._tp_program_change(30, 45);
  core._tp_note_on(30, 67, 100);
  player.setChannelMute(14, true);
  assert.ok(audible(render()));
  core._tp_control_change(30, 120, 0);
  core._tp_note_on(41, 36, 100);
  assert.ok(audible(render()), "Drums must sound on additional ports");
  // Seek restores independent programs/controllers/bends, including backwards.
  player.setPosition(700);
  assert.equal(player.channelProgramNums[14], 59);
  assert.equal(player.channelProgramNums[30], 45);
  player.setPosition(100);
  assert.equal(player.channelProgramNums[14], 59);
  player.resume();
  player.processPlaySynth(buffer, 1024);
  // Piano hands sharing one pair still split; another port's same channel stays independent.
  const split = transform(
    bytes([track(1, 0, 48, 0), track(1, 0, 72, 0), track(2, 59, 60, 0)]),
  );
  const splitResult = parser(split, synth);
  assert.equal(splitResult.result.notes.length, 3);
  assert.deepEqual(
    Array.from(
      splitResult.result.notes,
      (notes) => notes[0].note.midiNumber,
    ).sort(),
    [48, 60, 72],
  );
  // Controllers and pitch bend must restore on their own ports when seeking.
  const state = new Map();
  const recording = {
    ...synth,
    reset() {
      state.clear();
      synth.reset();
    },
    programChange(ch, value) {
      state.set(`program:${ch}`, value);
      synth.programChange(ch, value);
    },
    controlChange(ch, cc, value) {
      state.set(`cc:${ch}:${cc}`, value);
      synth.controlChange(ch, cc, value);
    },
    pitchBend(ch, value) {
      state.set(`bend:${ch}`, value);
      synth.pitchBend(ch, value);
    },
  };
  const changes = bytes([
    [
      event("programChange", { channel: 14, programNumber: 59 }),
      event("controller", { channel: 14, controllerType: 64, value: 0 }),
      event("controller", { channel: 14, controllerType: 64, value: 127 }, 480),
      event("pitchBend", { channel: 14, value: 2048 }),
      event("programChange", { channel: 14, programNumber: 56 }),
      event("endOfTrack", {}, 480),
    ],
    [
      event("portPrefix", { port: 1 }),
      event("programChange", { channel: 14, programNumber: 45 }),
      event("controller", { channel: 14, controllerType: 64, value: 0 }),
      event("pitchBend", { channel: 14, value: -2048 }, 480),
      event("endOfTrack", {}, 480),
    ],
  ]);
  const seeking = parser(changes, recording).player;
  seeking.setPosition(750);
  assert.equal(state.get("program:14"), 56);
  assert.equal(state.get("program:30"), 45);
  assert.equal(state.get("cc:14:64"), 127);
  assert.equal(state.get("cc:30:64"), 0);
  assert.equal(state.get("bend:14"), 10240);
  assert.equal(state.get("bend:30"), 6144);
  seeking.setPosition(100);
  assert.equal(state.get("program:14"), 59);
  assert.equal(state.get("cc:14:64"), 0);
  assert.equal(state.get("bend:14"), 8192);
  assert.equal(state.get("bend:30"), 8192);
  // Changing port numbers between files reuses synths and discards old tails.
  const instanceCount = ports.cores.size;
  await ports.prepare([14, 78, 89]);
  assert.equal(ports.cores.size, instanceCount);
  core._tp_program_change(78, 59);
  core._tp_note_on(78, 60, 100);
  assert.ok(audible(render()));
  await ports.prepare([14, 30, 41]);

  // Optional real-world fixture: 33 active pairs, plus one piano-hand split.
  if (process.argv[2]) {
    const actual = parser(
      transform(new Uint8Array(fs.readFileSync(process.argv[2]))),
      synth,
    );
    assert.ok(actual.result.notes.length >= 33);
    assert.equal(actual.player.channelProgramNums[13], 59);
    assert.equal(actual.player.channelProgramNums[29], 45);
    console.log(
      `Real MIDI: ${actual.result.notes.length} independent voices; trumpet=59, pizzicato=45.`,
    );
  }
  // The bundled fast font already warns about these unused invalid generators.
  assert.deepEqual(
    synthErrors.filter(
      (message) => !message.includes("Some invalid generators were discarded"),
    ),
    [],
  );
  console.log(
    "MIDI port parsing, synthesis, mute, drums, seeking, and hand-split checks passed.",
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
