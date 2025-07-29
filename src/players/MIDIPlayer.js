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
      setChipStateDump: this.setChipStateDump,
    });

    // Initialize parameters
    this.params = {};
    // Transient parameters hold a parameter that is valid only for the current song.
    // They are reset when another song is loaded.
    this.transientParams = {};

    // Initialize parameters with default values
    this.setParameter("synthengine", 0);
    this.setParameter("reverb", 0.0);
    this.setParameter("chorus", 0.0);
    this.setParameter("fluidpoly", 128);

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

    const newTransientParams = {};

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
        this.midiFilePlayer.setUseWebMIDI(false);
        core._tp_set_synth_engine(value);

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
