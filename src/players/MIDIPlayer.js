import debounce from "lodash/debounce";
import MIDIFile from "midifile";

import autoBind from "auto-bind";
import range from "lodash/range";
import { DUMMY_CALLBACK } from "../components/App";
import { SOUNDFONT_MOUNTPOINT, SOUNDFONT_URL_PATH } from "../config";
import { ensureEmscFileWithUrl, remap01 } from "../util";
import { GM_DRUM_KITS, GM_INSTRUMENTS } from "./gm-patch-map";
import MIDIFilePlayer from "./MIDIFilePlayer";
import Player from "./Player";

// Define the progressive soundfont loading sequence
const SOUNDFONTS = {
  FAST: { name: "2MBGMGS.SF2", size: "2.1 MB" },
  BEST: { name: "masquerade55v006.sf2", size: "18.4 MB" },
};

let core = null;

const dummyMidiOutput = {
  send: DUMMY_CALLBACK,
};

const fileExtensions = ["mid", "midi", "smf"];

export default class MIDIPlayer extends Player {
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
    });

    // Initialize parameters
    this.params = {};

    // Initialize parameters with default values
    this.setParameter("synthengine", 0);
    this.setParameter("reverb", 0.0);
    this.setParameter("chorus", 0.0);
    this.setParameter("fluidpoly", 128);

    // Track soundfont loading state
    this.currentSoundfont = null;
    this.isLoadingBestSoundfont = false;
    this.bestSoundfontLoaded = false;
  }

  handleFileSystemReady() {
    // Start with the fast soundfont for immediate playback
    this.setParameter("soundfont", SOUNDFONTS.FAST.name);

    // Start loading the best soundfont in background
    this.loadBestSoundfontInBackground();
  }

  // Load the best quality soundfont in the background
  loadBestSoundfontInBackground() {
    if (this.isLoadingBestSoundfont || this.bestSoundfontLoaded) {
      return;
    }

    this.isLoadingBestSoundfont = true;
    console.log(
      `Starting to load ${SOUNDFONTS.BEST.name} (${SOUNDFONTS.BEST.size}) in background`,
    );

    this.preloadSoundfont(SOUNDFONTS.BEST.name, () => {
      this.bestSoundfontLoaded = true;
      this.isLoadingBestSoundfont = false;
      console.log(`${SOUNDFONTS.BEST.name} loaded and ready`);
    });
  }

  processAudioInner(channels) {
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

  async loadData(data, filepath, shouldAutoPlay = true) {
    this.filepathMeta = this.metadataFromFilepath(filepath);

    // Load custom Soundfont if present in the metadata response.
    if (!filepath.startsWith("f:")) {
      core._tp_set_ch10_melodic(false);

      // Use the best available soundfont based on current loading state
      const currentSoundfont = this.params["soundfont"];

      // Find the best loaded soundfont
      if (this.bestSoundfontLoaded) {
        const bestSoundfont = SOUNDFONTS.BEST.name;

        // If we're not already using the best available soundfont, switch to it
        if (currentSoundfont !== bestSoundfont) {
          console.log(
            `Switching to best available soundfont: ${bestSoundfont}`,
          );
          this.setParameter("soundfont", bestSoundfont);
        }
      }
      // If no soundfonts have been loaded yet, start the sequence
      else {
        const initialSoundfont = SOUNDFONTS.FAST.name;
        console.log(`Starting with ${initialSoundfont} for fast loading`);
        this.setParameter("soundfont", initialSoundfont);
        this.bestSoundfontLoaded = false;
        this.isLoadingBestSoundfont = false;
        this.loadBestSoundfontInBackground();
      }
    }

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

  setParameter(id, value) {
    switch (id) {
      case "synthengine":
        value = parseInt(value, 10);
        this.midiFilePlayer.panic();
        this.midiFilePlayer.setUseWebMIDI(false);
        core._tp_set_synth_engine(value);

        break;
      case "soundfont":
        // Don't downgrade from BEST to FAST
        if (
          this.currentSoundfont === SOUNDFONTS.BEST.name &&
          value === SOUNDFONTS.FAST.name
        ) {
          console.log(
            `Not downgrading from ${SOUNDFONTS.BEST.name} to ${SOUNDFONTS.FAST.name}`,
          );
          return; // Don't update params or load the soundfont
        }

        // Track which soundfont is currently set
        this.currentSoundfont = value;

        // If setting the best soundfont, mark it as loaded
        if (value === SOUNDFONTS.BEST.name) {
          this.bestSoundfontLoaded = true;
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
      default:
        console.warn('MIDIPlayer has no parameter with id "%s".', id);
    }

    this.params[id] = value;
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

        // Only switch to the best soundfont if we're not already using it
        const isBestSoundfont = soundfontName === SOUNDFONTS.BEST.name;
        const shouldSwitch =
          isBestSoundfont && this.currentSoundfont !== SOUNDFONTS.BEST.name;

        if (shouldSwitch) {
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
            `Not switching to soundfont ${soundfontName} - already using best available`,
          );
          // Still call the callback to continue the loading sequence
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
