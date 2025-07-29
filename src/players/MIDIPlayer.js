import debounce from "lodash/debounce";
import MIDIFile from "midifile";

import autoBind from "auto-bind";
import range from "lodash/range";
import { DUMMY_CALLBACK } from "../components/App";
import {
  SOUNDFONTS,
  SOUNDFONT_MOUNTPOINT,
  SOUNDFONT_URL_PATH,
} from "../config";
import { ensureEmscFileWithUrl, remap01 } from "../util";
import { GM_DRUM_KITS, GM_INSTRUMENTS } from "./gm-patch-map";
import MIDIFilePlayer from "./MIDIFilePlayer";
import Player from "./Player";

// Define the progressive soundfont loading sequence
const PROGRESSIVE_SOUNDFONTS = [
  // { name: "pcbeep.sf2", size: "31 KB", qualityLevel: 1 },
  { name: "2MBGMGS.SF2", size: "2.1 MB", qualityLevel: 2 },
  { name: "masquerade55v006.sf2", size: "18.4 MB", qualityLevel: 3 },
  // { name: "Abbey-Steinway-D-v1.9.sf2", size: "40.2 MB", qualityLevel: 4 },
];

let core = null;

const dummyMidiOutput = {
  send: DUMMY_CALLBACK,
};

const midiDevices = [dummyMidiOutput];

const fileExtensions = ["mid", "midi", "smf"];

const MIDI_ENGINE_LIBFLUIDLITE = 0;
const MIDI_ENGINE_LIBADLMIDI = 1;
const MIDI_ENGINE_WEBMIDI = 2;

export default class MIDIPlayer extends Player {
  paramDefs = [
    {
      id: "synthengine",
      label: "Synth Engine",
      type: "enum",
      options: [
        {
          label: "MIDI Synthesis Engine",
          items: [
            {
              label: "SoundFont (libFluidLite)",
              value: MIDI_ENGINE_LIBFLUIDLITE,
            },
            {
              label: "Adlib/OPL3 FM (libADLMIDI)",
              value: MIDI_ENGINE_LIBADLMIDI,
            },
            { label: "MIDI Device (Web MIDI)", value: MIDI_ENGINE_WEBMIDI },
          ],
        },
      ],
      defaultValue: 0,
    },
    {
      id: "soundfont",
      label: "Soundfont",
      type: "enum",
      options: SOUNDFONTS,
      defaultValue: SOUNDFONTS[2].items[0].value,
      // defaultValue: SOUNDFONTS[1].items[0].value,
      dependsOn: {
        param: "synthengine",
        value: MIDI_ENGINE_LIBFLUIDLITE,
      },
    },
    {
      id: "reverb",
      label: "Reverb",
      type: "number",
      min: 0.0,
      max: 1.0,
      step: 0.01,
      defaultValue: 0.0,
      dependsOn: {
        param: "synthengine",
        value: MIDI_ENGINE_LIBFLUIDLITE,
      },
    },
    {
      id: "chorus",
      label: "Chorus",
      type: "number",
      min: 0.0,
      max: 1.0,
      step: 0.01,
      defaultValue: 0.0,
      dependsOn: {
        param: "synthengine",
        value: MIDI_ENGINE_LIBFLUIDLITE,
      },
    },
    {
      id: "fluidpoly",
      label: "Polyphony",
      type: "number",
      min: 4,
      max: 256,
      step: 4,
      defaultValue: 128,
      dependsOn: {
        param: "synthengine",
        value: MIDI_ENGINE_LIBFLUIDLITE,
      },
    },
    {
      id: "opl3bank",
      label: "OPL3 Bank",
      type: "enum",
      options: [],
      defaultValue: 58, // Windows 95 bank
      dependsOn: {
        param: "synthengine",
        value: MIDI_ENGINE_LIBADLMIDI,
      },
    },
    {
      id: "mididevice",
      label: "MIDI Device",
      type: "enum",
      options: [
        {
          label: "MIDI Output Devices",
          items: [{ label: "Dummy device", value: 0 }],
        },
      ],
      defaultValue: 0,
      dependsOn: {
        param: "synthengine",
        value: MIDI_ENGINE_WEBMIDI,
      },
    },
    {
      id: "autoengine",
      label: "Auto Synth Engine Switching",
      hint: 'Switch synth engine based on filenames. Files containing "FM" will play through Adlib/OPL3 synth.',
      type: "toggle",
      defaultValue: true,
    },
    {
      id: "gmreset",
      label: "GM Reset",
      hint: "Send a GM Reset sysex and reset all controllers on all channels.",
      type: "button",
    },
  ];

  constructor(...args) {
    super(...args);
    autoBind(this);

    core = this.core;
    core._tp_init(this.sampleRate);

    // Initialize Soundfont filesystem
    core.FS.mkdir(SOUNDFONT_MOUNTPOINT);
    core.FS.mount(core.FS.filesystems.IDBFS, {}, SOUNDFONT_MOUNTPOINT);

    this.name = "MIDI Player";
    this.fileExtensions = fileExtensions;
    this.activeChannels = [];
    this.buffer = core._malloc(this.bufferSize * 4 * 2); // f32 * 2 channels
    this.filepathMeta = {};
    this.midiFilePlayer = new MIDIFilePlayer({
      // playerStateUpdate is debounced to prevent flooding program change events
      programChangeCb: debounce(
        () =>
          this.emit("playerStateUpdate", {
            voiceNames: range(this.getNumVoices()).map(this.getVoiceName),
          }),
        200,
      ),
      output: dummyMidiOutput,
      skipSilence: true,
      sampleRate: this.sampleRate,
      synth: {
        // TODO: Consider removing the tiny player (tp), since a lot of MIDI is now implemented in JS.
        //       All it's really doing is hiding the FluidSynth and libADLMIDI insances behind a singleton.
        //       C object ("context") pointers could also be hidden at the JS layer, if those are annoying.
        //       The original benefit was to tie in tml.h (MIDI file reader) which is not used any more.
        //       Besides, MIDIPlayer.js already calls directly into libADLMIDI functions.
        //       see also ../../scripts/build-chip-core.js:29
        noteOn: core._tp_note_on,
        noteOff: core._tp_note_off,
        pitchBend: core._tp_pitch_bend,
        controlChange: core._tp_control_change,
        programChange: core._tp_program_change,
        panic: core._tp_panic,
        panicChannel: core._tp_panic_channel,
        render: core._tp_render,
        reset: core._tp_reset,
        getValue: core.getValue,
      },
      setChipStateDump: this.setChipStateDump,
    });

    // Populate OPL3 banks
    const numBanks = core._adl_getBanksCount();
    const ptr = core._adl_getBankNames();
    const oplBanks = [];
    for (let i = 0; i < numBanks; i++) {
      oplBanks.push({
        label: core.UTF8ToString(core.getValue(ptr + i * 4, "*")),
        value: i,
      });
    }
    this.paramDefs.find((def) => def.id === "opl3bank").options = [
      { label: "OPL3 Bank", items: oplBanks },
    ];

    this.webMidiIsInitialized = false;
    // this.midiFilePlayer = new MIDIFilePlayer({ output: dummyMidiOutput });

    // Initialize parameters
    this.params = {};
    // Transient parameters hold a parameter that is valid only for the current song.
    // They are reset when another song is loaded.
    this.transientParams = {};
    this.paramDefs
      .filter((p) => p.id !== "soundfont")
      .forEach((p) => this.setParameter(p.id, p.defaultValue));

    // Track the currently loaded soundfont quality level
    this.soundfontQualityLevel = 0; // 0=none, 1=pcbeep, 2=2MBGMGS, 3=masquerade

    // Track which soundfonts are currently loading
    this.loadingSoundfonts = new Set();

    // Track the highest quality soundfont that has been loaded
    this.highestLoadedSoundfontIndex = -1;
  }

  handleFileSystemReady() {
    // Start with the lowest quality soundfont for fast initial loading
    const initialSoundfont = PROGRESSIVE_SOUNDFONTS[0].name;
    this.setParameter("soundfont", initialSoundfont);

    // Begin the progressive loading sequence
    this.startProgressiveSoundfontLoading();

    this.updateSoundfontParamDefs();
  }

  // Start the progressive loading of better quality soundfonts
  startProgressiveSoundfontLoading() {
    // If nothing has been loaded yet, start from the beginning
    if (this.highestLoadedSoundfontIndex < 0) {
      this.highestLoadedSoundfontIndex = 0;
    }

    // Load the next soundfont in the sequence if we haven't loaded them all
    this.loadNextSoundfont();
  }

  // Load the next soundfont in the sequence
  loadNextSoundfont() {
    const nextIndex = this.highestLoadedSoundfontIndex + 1;

    // Check if there are more soundfonts to load
    if (nextIndex < PROGRESSIVE_SOUNDFONTS.length) {
      const nextSoundfont = PROGRESSIVE_SOUNDFONTS[nextIndex];

      // Skip if already loading this soundfont
      if (this.loadingSoundfonts.has(nextSoundfont.name)) {
        return;
      }

      // Mark this soundfont as loading
      this.loadingSoundfonts.add(nextSoundfont.name);

      console.log(
        `Starting to load ${nextSoundfont.name} (${nextSoundfont.size})`,
      );

      // Start loading the next soundfont
      this.preloadSoundfont(nextSoundfont.name, () => {
        // Update the highest loaded soundfont index
        this.highestLoadedSoundfontIndex = nextIndex;

        // Update the quality level
        this.soundfontQualityLevel = nextSoundfont.qualityLevel;

        // Remove from loading set
        this.loadingSoundfonts.delete(nextSoundfont.name);

        // Load the next one in sequence
        this.loadNextSoundfont();
      });
    }
  }

  processAudioInner(channels) {
    const useWebMIDI = this.params["synthengine"] === MIDI_ENGINE_WEBMIDI;

    // No early return or zero-fill during pause.
    // Notes are allowed to ring out, and the MIDI synth behaves more like external hardware.

    if (useWebMIDI) {
      this.midiFilePlayer.processPlay();
    } else {
      if (this.midiFilePlayer.processPlaySynth(this.buffer, this.bufferSize)) {
        for (let ch = 0; ch < channels.length; ch++) {
          for (let i = 0; i < this.bufferSize; i++) {
            channels[ch][i] = core.getValue(
              this.buffer + // Interleaved channel format
                i * 4 * 2 + // frame offset   * bytes per sample * num channels +
                ch * 4, // channel offset * bytes per sample
              "float",
            );
          }
        }
      } else {
        this.stop();
      }
    }
  }

  metadataFromFilepath(filepath) {
    filepath = decodeURIComponent(filepath); // unescape, %25 -> %
    const parts = filepath.split("/");
    const len = parts.length;
    const meta = {};
    // HACK: MIDI metadata is guessed from filepath
    // based on the directory structure of Chip Player catalog.
    // Ideally, this data should be embedded in the MIDI files.
    if (parts.length >= 3) {
      meta.formatted = {
        title: `${parts[1]} - ${parts[len - 1]}`,
        subtitle: parts[0],
      };
    } else if (parts.length === 2) {
      meta.formatted = {
        title: parts[1],
        subtitle: parts[0],
      };
    } else {
      meta.formatted = {
        title: parts[0],
        subtitle: "MIDI",
      };
    }
    return meta;
  }

  ensureWebMidiInitialized() {
    if (this.webMidiIsInitialized === true) return;
    this.webMidiIsInitialized = true;

    // Initialize MIDI output devices
    console.debug("Requesting MIDI output devices.");
    // if (typeof navigator.requestMIDIAccess === "function") {
    //   navigator.requestMIDIAccess({ sysex: true }).then((access) => {
    //     if (access.outputs.length === 0) {
    //       console.warn("No MIDI output devices found.");
    //     } else {
    //       [...access.outputs.values()].forEach((midiOutput) => {
    //         console.debug("MIDI Output:", midiOutput);
    //         midiDevices.push(midiOutput);
    //         this.paramDefs
    //           .find((def) => def.id === "mididevice")
    //           .options[0].items.push({
    //             label: midiOutput.name,
    //             value: midiDevices.length - 1,
    //           });
    //       });

    //       // TODO: remove if removing Dummy Device
    //       this.setParameter("mididevice", 1);
    //     }
    //   });
    // } else {
    //   console.warn(
    //     "Web MIDI API not supported. Try Chrome if you want to use external MIDI output devices.",
    //   );
    // }
  }

  async loadData(data, filepath, shouldAutoPlay = true) {
    this.ensureWebMidiInitialized();
    this.filepathMeta = this.metadataFromFilepath(filepath);

    const newTransientParams = {};

    // Transient params: synthengine, opl3bank, soundfont.
    if (this.getParameter("autoengine")) {
      newTransientParams["synthengine"] =
        this.getSynthengineBasedOnFilename(filepath);
      newTransientParams["opl3bank"] =
        this.getOpl3bankBasedOnFilename(filepath);
    }

    // Load custom Soundfont if present in the metadata response.
    if (
      this.getParameter("synthengine") === MIDI_ENGINE_LIBFLUIDLITE &&
      !filepath.startsWith("f:")
    ) {
      core._tp_set_ch10_melodic(false);

      // Use the best available soundfont based on current loading state
      const currentSoundfont = this.params["soundfont"];

      // Find the best loaded soundfont
      if (this.highestLoadedSoundfontIndex >= 0) {
        const bestSoundfont =
          PROGRESSIVE_SOUNDFONTS[this.highestLoadedSoundfontIndex].name;

        // If we're not already using the best available soundfont, switch to it
        if (currentSoundfont !== bestSoundfont) {
          console.log(
            `Switching to best available soundfont: ${bestSoundfont}`,
          );
          this.setParameter("soundfont", bestSoundfont);
        }

        // If we haven't started loading sequence or it stopped, restart it
        if (
          this.loadingSoundfonts.size === 0 &&
          this.highestLoadedSoundfontIndex < PROGRESSIVE_SOUNDFONTS.length - 1
        ) {
          this.loadNextSoundfont();
        }
      }
      // If no soundfonts have been loaded yet, start the sequence
      else {
        const initialSoundfont = PROGRESSIVE_SOUNDFONTS[0].name;
        console.log(`Starting with ${initialSoundfont} for fast loading`);
        this.setParameter("soundfont", initialSoundfont);
        this.highestLoadedSoundfontIndex = 0;
        this.startProgressiveSoundfontLoading();
      }
    }

    // Apply transient params. Avoid thrashing of params that haven't changed.
    Object.keys(this.params).forEach((key) => {
      if (newTransientParams[key] !== this.transientParams[key]) {
        this.setTransientParameter(key, newTransientParams[key]);
      }
    });

    const midiFile = new MIDIFile(data);
    const useTrackLoops = filepath.includes("SoundFont MIDI");
    const result = this.midiFilePlayer.load(midiFile, useTrackLoops);

    // Only start playback if shouldAutoPlay is true
    if (shouldAutoPlay) {
      this.midiFilePlayer.play(
        () =>
          this.emit("playerStateUpdate", { isStopped: true, isPlaying: false }),
        () => {
          this.emit("playerStateUpdate", { isPlaying: true });
          if (this.playbackStartedCallback) {
            this.playbackStartedCallback();
            this.playbackStartedCallback = null;
          }
        },
      );
    } else {
      // Just load but don't start playing
      this.midiFilePlayer.paused = true;
      this.emit("playerStateUpdate", { isPlaying: false });
    }

    this.activeChannels = [];
    for (let i = 0; i < 16; i++) {
      if (this.midiFilePlayer.getChannelInUse(i)) this.activeChannels.push(i);
    }

    this.resume();
    this.emit("playerStateUpdate", {
      ...this.getBasePlayerState(),
      isStopped: false,
    });
    return result;
  }

  getSynthengineBasedOnFilename(filepath) {
    // Switch to OPL3 engine if filepath contains 'FM'
    const fp = filepath.toLowerCase().replace("_", " ");
    if (fp.match(/(\bfm|fm\b)/i)) {
      return MIDI_ENGINE_LIBADLMIDI;
    }
    return null;
  }

  getOpl3bankBasedOnFilename(filepath) {
    // Crude bank matching for a few specific games. :D
    const fp = filepath.toLowerCase().replace("_", " ");
    const opl3def = this.paramDefs.find((def) => def.id === "opl3bank");
    if (opl3def) {
      const opl3banks = opl3def.options[0].items;
      const findBank = (str) =>
        opl3banks.findIndex((bank) => bank.label.indexOf(str) > -1);
      let bankId = opl3def.defaultValue;
      if (fp.indexOf("[rick]") > -1) {
        bankId = findBank("Descent:: Rick");
      } else if (fp.indexOf("[ham]") > -1) {
        bankId = findBank("Descent:: Ham");
      } else if (fp.indexOf("[int]") > -1) {
        bankId = findBank("Descent:: Int");
      } else if (fp.indexOf("descent 2") > -1) {
        bankId = findBank("Descent 2");
      } else if (fp.indexOf("magic carpet") > -1) {
        bankId = findBank("Magic Carpet");
      } else if (fp.indexOf("duke nukem") > -1) {
        bankId = findBank("Duke Nukem");
      } else if (fp.indexOf("wacky wheels") > -1) {
        bankId = findBank("Apogee IMF");
      } else if (fp.indexOf("warcraft 2") > -1) {
        bankId = findBank("Warcraft 2");
      } else if (fp.indexOf("warcraft") > -1) {
        bankId = findBank("Warcraft");
      } else if (fp.indexOf("system shock") > -1) {
        bankId = findBank("System Shock");
      } else if (fp.indexOf("/hexen") > -1 || fp.indexOf("/heretic") > -1) {
        bankId = findBank("Hexen");
      } else if (fp.indexOf("/raptor") > -1) {
        bankId = findBank("Raptor");
      } else if (fp.indexOf("/doom 2") > -1) {
        bankId = findBank("Doom 2");
      } else if (fp.indexOf("/doom") > -1) {
        bankId = findBank("DOOM");
      }
      if (bankId > -1) {
        return bankId;
      }
    }
    return null;
  }

  isPlaying() {
    return !this.midiFilePlayer.paused;
  }

  suspend() {
    super.suspend();
    this.midiFilePlayer.stop();
  }

  stop() {
    this.suspend();
    console.debug("MIDIPlayer.stop()");
    this.emit("playerStateUpdate", { isStopped: true, isPlaying: false });
  }

  togglePause() {
    return this.midiFilePlayer.togglePause();
  }

  getDurationMs() {
    return this.midiFilePlayer.getDuration();
  }

  getPositionMs() {
    return this.midiFilePlayer.getPosition();
  }

  seekMs(ms) {
    return this.midiFilePlayer.setPosition(ms);
  }

  getTempo() {
    return this.midiFilePlayer.getSpeed();
  }

  setTempo(tempo) {
    this.midiFilePlayer.setSpeed(tempo);
  }

  getNumVoices() {
    return this.activeChannels.length;
  }

  getVoiceName(index) {
    const ch = this.activeChannels[index];
    const pgm = this.midiFilePlayer.channelProgramNums[ch];
    const instrumentName =
      ch === 9 ? GM_DRUM_KITS[pgm] || GM_DRUM_KITS[0] : GM_INSTRUMENTS[pgm];
    const areFirstTrackNamesDistinct =
      new Set(
        Object.values(this.midiFilePlayer.channelToTrack)
          .map((track) => this.midiFilePlayer.trackNames[track])
          .slice(0, 2),
      ).size === 2;
    const trackName = areFirstTrackNamesDistinct
      ? this.midiFilePlayer.trackNames[this.midiFilePlayer.channelToTrack[ch]]
      : null;
    return trackName ?? instrumentName;
  }

  getVoiceMask() {
    return this.activeChannels.map((ch) => this.midiFilePlayer.channelMask[ch]);
  }

  setVoiceMask(voiceMask) {
    voiceMask.forEach((isEnabled, i) => {
      const ch = this.activeChannels[i];
      this.midiFilePlayer.setChannelMute(ch, !isEnabled);
    });
  }

  getMetadata() {
    return {
      ...this.filepathMeta,
    };
  }

  getParameter(id) {
    if (id === "fluidpoly") return core._tp_get_polyphony();
    if (this.transientParams[id] != null) return this.transientParams[id];
    return this.params[id];
  }

  updateSoundfontParamDefs() {
    this.paramDefs = this.paramDefs.map((paramDef) => {
      if (paramDef.id === "soundfont") {
        const userSoundfonts = paramDef.options[0];
        const userSoundfontPath = `${SOUNDFONT_MOUNTPOINT}/user/`;
        if (core.FS.analyzePath(userSoundfontPath).exists) {
          userSoundfonts.items = core.FS.readdir(userSoundfontPath)
            .filter((f) => f.match(/\.sf2$/i))
            .map((f) => ({
              label: f,
              value: `user/${f}`,
            }));
        }
      }
      return paramDef;
    });
  }

  setTransientParameter(id, value) {
    if (value == null) {
      // Unset the transient parameter.
      this.setParameter(id, this.params[id]);
    } else {
      this.setParameter(id, value, true);
    }
  }

  setFluidChorus(value) {
    const fluidSynth = core._tp_get_fluid_synth();
    if (value === 0) {
      core._fluid_synth_set_chorus_on(fluidSynth, false);
    } else {
      core._fluid_synth_set_chorus_on(fluidSynth, true);
      // FLUID_CHORUS_DEFAULT_N 3 (0 to 99)
      const nr = 3;
      // FLUID_CHORUS_DEFAULT_LEVEL 2.0f (0 to 10)
      const level = Math.round(remap01(value, 0, 4));
      // FLUID_CHORUS_DEFAULT_SPEED 0.3f (0.29 to 5)
      const speed = 0.3;
      // FLUID_CHORUS_DEFAULT_DEPTH 8.0f (0 to ~100)
      const depthMs = Math.round(remap01(value, 2, 14));
      // FLUID_CHORUS_DEFAULT_TYPE FLUID_CHORUS_MOD_SINE
      //   FLUID_CHORUS_MOD_SINE = 0,
      //   FLUID_CHORUS_MOD_TRIANGLE = 1
      const type = 0;
      // (fluid_synth_t* synth, int nr, double level, double speed, double depth_ms, int type)
      core._fluid_synth_set_chorus(fluidSynth, nr, level, speed, depthMs, type);
    }
  }

  setParameter(id, value, isTransient = false) {
    switch (id) {
      case "synthengine":
        value = parseInt(value, 10);
        this.midiFilePlayer.panic();
        if (value === MIDI_ENGINE_WEBMIDI) {
          this.midiFilePlayer.setUseWebMIDI(true);
        } else {
          this.midiFilePlayer.setUseWebMIDI(false);
          core._tp_set_synth_engine(value);
        }
        break;
      case "soundfont":
        // Handle soundfont quality level tracking
        const sfIndex = PROGRESSIVE_SOUNDFONTS.findIndex(
          (sf) => sf.name === value,
        );
        if (sfIndex >= 0) {
          // If this is one of our progressive soundfonts, update quality level
          this.soundfontQualityLevel =
            PROGRESSIVE_SOUNDFONTS[sfIndex].qualityLevel;

          // Update the highest loaded index if this is a higher quality soundfont
          if (sfIndex > this.highestLoadedSoundfontIndex) {
            this.highestLoadedSoundfontIndex = sfIndex;
          }
        } else {
          // If user explicitly selects another soundfont, mark as custom
          this.soundfontQualityLevel = 0;
          this.highestLoadedSoundfontIndex = -1;
        }

        const url = `${SOUNDFONT_URL_PATH}/${value}`;
        ensureEmscFileWithUrl(
          core,
          `${SOUNDFONT_MOUNTPOINT}/${value}`,
          url,
        ).then((filename) => this._loadSoundfont(filename));
        break;
      case "reverb":
        // TODO: call fluidsynth directly from JS, similar to chorus
        value = parseFloat(value);
        core._tp_set_reverb(value);
        break;
      case "chorus":
        value = parseFloat(value);
        this.setFluidChorus(value);
        break;
      case "fluidpoly":
        // TODO: call fluidsynth directly from JS, similar to chorus
        value = parseInt(value, 10);
        core._tp_set_polyphony(value);
        break;
      case "opl3bank":
        value = parseInt(value, 10);
        core._tp_set_bank(value);
        break;
      case "autoengine":
        value = !!value;
        break;
      case "mididevice":
        this.midiFilePlayer.setOutput(midiDevices[value]);
        break;
      case "gmreset":
        this.midiFilePlayer.reset();
        break;
      default:
        console.warn('MIDIPlayer has no parameter with id "%s".', id);
    }
    // This should be the only place we modify transientParams.
    if (isTransient) {
      this.transientParams[id] = value;
    } else {
      delete this.transientParams[id];
      this.params[id] = value;
    }
  }

  _loadSoundfont(filename) {
    console.log("Loading soundfont %s...", filename);
    this.muteAudioDuringCall(this.audioNode, () => {
      const err = core.ccall(
        "tp_load_soundfont",
        "number",
        ["string"],
        [filename],
      );
      if (err !== -1) console.log("Loaded soundfont.");
    });
  }

  eject() {
    this.stop();
    this.midiFilePlayer.reset();
    this.emit("playerStateUpdate", { isStopped: true, isPlaying: false });
  }

  setPlaybackStartedCallback(callback) {
    this.playbackStartedCallback = callback;
  }

  pause() {
    this.midiFilePlayer.paused = true;
    this.emit("playerStateUpdate", { isPlaying: false });
  }

  // Preload a soundfont in the background and switch to it when ready
  preloadSoundfont(soundfontName, onLoadCallback) {
    const url = `${SOUNDFONT_URL_PATH}/${soundfontName}`;
    console.log(`Preloading soundfont ${soundfontName} in background...`);

    ensureEmscFileWithUrl(core, `${SOUNDFONT_MOUNTPOINT}/${soundfontName}`, url)
      .then((filename) => {
        console.log(`Preloaded soundfont ${soundfontName}, switching to it...`);

        // Only switch if we're using the FluidLite engine
        if (this.getParameter("synthengine") === MIDI_ENGINE_LIBFLUIDLITE) {
          // Find quality level of the new soundfont
          const sfIndex = PROGRESSIVE_SOUNDFONTS.findIndex(
            (sf) => sf.name === soundfontName,
          );

          // Check if this is a progressive soundfont and if it has a higher or equal quality level
          // than the current one before applying it
          const newQualityLevel =
            sfIndex >= 0 ? PROGRESSIVE_SOUNDFONTS[sfIndex].qualityLevel : 0;
          if (newQualityLevel >= this.soundfontQualityLevel) {
            // Save current playback state
            const wasPlaying = this.isPlaying();
            const currentPositionMs = this.getPositionMs();

            // Load the new soundfont
            this.muteAudioDuringCall(this.audioNode, () => {
              const err = core.ccall(
                "tp_load_soundfont",
                "number",
                ["string"],
                [filename],
              );
              if (err !== -1) {
                console.log(`Switched to soundfont ${soundfontName}`);
                // Update the parameter value without triggering another load
                this.params["soundfont"] = soundfontName;

                // If we were playing, seek to the previous position
                if (wasPlaying) {
                  this.seekMs(currentPositionMs);
                }

                // Call the callback if provided
                if (onLoadCallback) {
                  onLoadCallback();
                }
              } else {
                console.error(`Failed to load soundfont ${soundfontName}`);
              }
            });
          } else {
            console.log(
              `Not switching to soundfont ${soundfontName} because it has lower quality (${newQualityLevel}) than current (${this.soundfontQualityLevel})`,
            );
            // Still call the callback to continue the loading sequence
            if (onLoadCallback) {
              onLoadCallback();
            }
          }
        } else {
          // Not using FluidLite engine, just call the callback
          if (onLoadCallback) {
            onLoadCallback();
          }
        }
      })
      .catch((error) => {
        console.error(`Failed to preload soundfont ${soundfontName}:`, error);
        // Still call the callback to continue the loading sequence
        if (onLoadCallback) {
          onLoadCallback();
        }
      });
  }
}
