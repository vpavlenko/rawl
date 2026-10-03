import ChipCore from "../chip-core";

// The bundled synth has 16 channels. Give each MIDI port its own synth and
// mix their output, rather than folding independent instruments into 16 slots.
export default class MIDIPortSynth {
  constructor(primary, sampleRate) {
    this.primary = primary;
    this.sampleRate = sampleRate;
    this.cores = new Map([[0, primary]]);
    this.buffers = new Map();
    this.settings = new Map();
    this.soundfont = null;
    const channelFunctions = new Set([
      "_tp_note_on",
      "_tp_note_off",
      "_tp_program_change",
      "_tp_pitch_bend",
      "_tp_control_change",
      "_tp_channel_pressure",
      "_tp_panic_channel",
    ]);
    const settingsFunctions = new Set([
      "_tp_set_synth_engine",
      "_tp_set_reverb",
      "_tp_set_polyphony",
      "_tp_set_ch10_melodic",
    ]);
    this.core = new Proxy(primary, {
      get: (target, name) => {
        if (channelFunctions.has(name))
          return (voice, ...args) =>
            this.cores.get(Math.floor(voice / 16))[name](voice % 16, ...args);
        if (settingsFunctions.has(name))
          return (...args) => {
            this.settings.set(name, args);
            this.cores.forEach((core) => core[name](...args));
          };
        if (name === "_tp_reset" || name === "_tp_panic")
          return () => this.cores.forEach((core) => core[name]());
        if (name === "_fluid_synth_bank_select")
          return (_, voice, bank) => {
            const core = this.cores.get(Math.floor(voice / 16));
            return core[name](core._tp_get_fluid_synth(), voice % 16, bank);
          };
        if (
          name === "_fluid_synth_set_chorus" ||
          name === "_fluid_synth_set_chorus_on"
        )
          return (_, ...args) => {
            this.settings.set(name, args);
            this.cores.forEach((core) =>
              core[name](core._tp_get_fluid_synth(), ...args),
            );
          };
        if (name === "_tp_render") return this.render.bind(this);
        if (name === "ccall")
          return (fn, result, types, args) => {
            if (fn !== "tp_load_soundfont")
              return target.ccall(fn, result, types, args);
            this.soundfont = args[0];
            let status = 0;
            this.cores.forEach((core) => {
              this.copySoundfont(core);
              if (core.ccall(fn, result, types, args) === -1) status = -1;
            });
            return status;
          };
        return target[name];
      },
    });
  }

  copySoundfont(core) {
    if (core === this.primary || !this.soundfont) return;
    const filename = this.soundfont;
    core.FS.mkdirTree(filename.slice(0, filename.lastIndexOf("/")));
    core.FS.writeFile(filename, this.primary.FS.readFile(filename));
  }

  async prepare(voices) {
    const ports = new Set(voices.map((voice) => Math.floor(voice / 16)));
    for (const port of ports) {
      if (this.cores.has(port)) continue;
      // Reuse a no-longer-needed port's instance when changing songs.
      const reusable = [...this.cores.keys()].find(
        (key) => key !== 0 && !ports.has(key),
      );
      if (reusable !== undefined) {
        this.cores.set(port, this.cores.get(reusable));
        this.cores.delete(reusable);
        if (this.buffers.has(reusable)) {
          this.buffers.set(port, this.buffers.get(reusable));
          this.buffers.delete(reusable);
        }
        continue;
      }
      const core = await ChipCore({
        locateFile: this.primary.locateFile,
        print: this.primary.print,
        printErr: this.primary.printErr,
      });
      core._tp_init(this.sampleRate);
      for (const [name, args] of this.settings) {
        if (name.startsWith("_fluid_"))
          core[name](core._tp_get_fluid_synth(), ...args);
        else core[name](...args);
      }
      this.copySoundfont(core);
      if (
        this.soundfont &&
        core.ccall(
          "tp_load_soundfont",
          "number",
          ["string"],
          [this.soundfont],
        ) === -1
      )
        throw new Error(`Unable to load soundfont for MIDI port ${port}`);
      this.cores.set(port, core);
    }
    // Old ports must not contribute release tails to the next song.
    this.cores.forEach((core) => core._tp_reset());
    this.renderPorts = ports;
  }

  render(buffer, samples) {
    const output = this.primary.HEAPF32;
    output.fill(0, buffer >> 2, (buffer >> 2) + samples);
    for (const port of this.renderPorts || [0]) {
      const core = this.cores.get(port);
      let scratch = this.buffers.get(port);
      if (!scratch || scratch.samples < samples) {
        scratch = { pointer: core._malloc(samples * 4), samples };
        this.buffers.set(port, scratch);
      }
      core._tp_render(scratch.pointer, samples);
      // Refresh the view after rendering/allocation, which may grow WASM memory.
      const mixed = this.primary.HEAPF32;
      const source = core.HEAPF32;
      for (let i = 0; i < samples; i++)
        mixed[(buffer >> 2) + i] += source[(scratch.pointer >> 2) + i];
    }
  }
}
