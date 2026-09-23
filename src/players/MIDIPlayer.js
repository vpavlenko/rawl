import debounce from "lodash/debounce";
import MIDIFile from "midifile";
import MIDIEvents from "midievents";

import autoBind from "auto-bind";
import range from "lodash/range";
import { SOUNDFONT_MOUNTPOINT, SOUNDFONT_URL_PATH } from "../config";
import { ensureEmscFileWithData, ensureEmscFileWithUrl, remap01 } from "../util";
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
  send: () => {},
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
    this.drumChannels = new Set();
    this.transpose = 0;
    this.soundingNotes = Array.from({ length: 16 }, () => new Map());
    this.sustainPedals = Array(16).fill(0);
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
        noteOn: this.noteOn,
        noteOff: this.noteOff,
        pitchBend: (channel, value) => {
          if (!this.drumChannels.has(channel))
            core._tp_pitch_bend(channel, value);
        },
        controlChange: (channel, controller, value) => {
          if (controller === 64) {
            this.sustainPedals[channel] = value;
            if (value < 64) {
              for (const [note, state] of this.soundingNotes[channel]) {
                if (!state.held) this.soundingNotes[channel].delete(note);
              }
            }
          } else if (controller === 120) {
            this.soundingNotes[channel].clear();
          } else if (controller === 123) {
            if (this.sustainPedals[channel] >= 64) {
              this.soundingNotes[channel].forEach((state) => { state.held = false; });
            } else this.soundingNotes[channel].clear();
          } else if (controller === 121) {
            this.sustainPedals[channel] = 0;
            for (const [note, state] of this.soundingNotes[channel]) {
              if (!state.held) this.soundingNotes[channel].delete(note);
            }
          }
          // A source file's bank selectors must not undo a saved drum override.
          if (
            this.drumChannels.has(channel) &&
            (controller === 0 || controller === 32)
          )
            return;
          core._tp_control_change(channel, controller, value);
        },
        programChange: (channel, program) => {
          if (this.drumChannels.has(channel)) this.applyDrumPreset(channel);
          else core._tp_program_change(channel, program);
        },
        panic: () => {
          this.soundingNotes.forEach((notes) => notes.clear());
          core._tp_panic();
        },
        panicChannel: this.panicChannel,
        render: core._tp_render,
        reset: () => {
          this.soundingNotes.forEach((notes) => notes.clear());
          this.sustainPedals.fill(0);
          core._tp_reset();
          this.applyDrumPresets();
        },
        getValue: core.getValue,
      },
      setChipStateDump: this.setChipStateDump,
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
    this.preloadedSoundfonts = new Map();
  }

  async handleFileSystemReady() {
    // Start with the fast soundfont for immediate playback
    await this.setParameter("soundfont", SOUNDFONTS.FAST.name);

    // Start loading the best soundfont in background
    this.loadBestSoundfontInBackground();
  }

  transposedNote(channel, note) {
    return channel === 9 || this.drumChannels.has(channel)
      ? note
      : note + this.transpose;
  }

  noteOn(channel, note, velocity) {
    this.soundingNotes[channel].set(note, { velocity, held: true });
    const pitch = this.transposedNote(channel, note);
    if (pitch >= 0 && pitch <= 127) core._tp_note_on(channel, pitch, velocity);
  }

  noteOff(channel, note) {
    const state = this.soundingNotes[channel].get(note);
    if (state && this.sustainPedals[channel] >= 64) state.held = false;
    else this.soundingNotes[channel].delete(note);
    const pitch = this.transposedNote(channel, note);
    if (pitch >= 0 && pitch <= 127) core._tp_note_off(channel, pitch);
  }

  panicChannel(channel) {
    this.soundingNotes[channel].clear();
    core._tp_panic_channel(channel);
    // Muting must silence sustained/releasing notes, not merely send note-off.
    core._tp_control_change(channel, 120, 0);
  }

  setTranspose(semitones) {
    if (!Number.isFinite(semitones)) return;
    const next = Math.max(-12, Math.min(12, Math.round(semitones)));
    if (next === this.transpose) return;
    this.transpose = next;
    // Retune held and pedal-sustained notes immediately, without seeking.
    this.soundingNotes.forEach((notes, channel) => {
      if (channel === 9 || this.drumChannels.has(channel)) return;
      core._tp_control_change(channel, 64, 0);
      core._tp_panic_channel(channel);
      core._tp_control_change(channel, 120, 0);
      core._tp_control_change(channel, 64, this.sustainPedals[channel]);
      for (const [note, { velocity, held }] of notes) {
        const pitch = this.transposedNote(channel, note);
        if (pitch < 0 || pitch > 127) continue;
        core._tp_note_on(channel, pitch, velocity);
        if (!held) core._tp_note_off(channel, pitch);
      }
    });
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

  async loadData(
    data,
    filepath,
    shouldAutoPlay = true,
    excludedVoices = [],
    drumVoices = [],
  ) {
    this.midiFilePlayer.panic();
    this.transpose = 0;
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
          await this.setParameter("soundfont", bestSoundfont);
        }
      }
      // If no soundfonts have been loaded yet, start the sequence
      else {
        const initialSoundfont = SOUNDFONTS.FAST.name;
        console.log(`Starting with ${initialSoundfont} for fast loading`);
        await this.setParameter("soundfont", initialSoundfont);
        this.loadBestSoundfontInBackground();
      }
    }

    const midiFile = new MIDIFile(data);
    const useTrackLoops = filepath.includes("SoundFont MIDI");
    const result = this.midiFilePlayer.load(midiFile, useTrackLoops);

    this.activeChannels = [];
    for (let i = 0; i < 16; i++) {
      if (this.midiFilePlayer.getChannelInUse(i)) this.activeChannels.push(i);
    }

    this.setDrumVoices(drumVoices);

    // Apply arrangement exclusions before the first note can be played.
    const excluded = new Set(excludedVoices);
    this.setVoiceMask(
      this.activeChannels.map((_, index) => !excluded.has(index)),
    );

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
    const paused = this.midiFilePlayer.togglePause();
    return paused;
  }

  getDurationMs() {
    return this.midiFilePlayer.getDuration();
  }

  getPositionMs() {
    // Render position only. The UI reads the worklet's consumed-sample clock.
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

  applyDrumPreset(channel) {
    // SoundFont bank 128, preset 0 is the standard GM percussion kit.
    // Keep the original channel: merging into channel 10 would couple mute/solo
    // and note-off events from otherwise independent voices.
    core._fluid_synth_bank_select(core._tp_get_fluid_synth(), channel, 128);
    core._tp_program_change(channel, 0);
    core._tp_pitch_bend(channel, 8192);
  }

  applyDrumPresets() {
    this.drumChannels.forEach((channel) => this.applyDrumPreset(channel));
  }

  restorePitchedChannel(channel) {
    core._fluid_synth_bank_select(core._tp_get_fluid_synth(), channel, 0);
    core._tp_program_change(channel, 0);
    core._tp_pitch_bend(channel, 8192);
    // Replay only the channel's already-processed controller/program state.
    // Do not seek the whole player: other voices must continue uninterrupted.
    for (let index = 0; index < this.midiFilePlayer.position; index++) {
      const event = this.midiFilePlayer.events[index];
      if (event.channel !== channel) continue;
      switch (event.subtype) {
        case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
          core._tp_program_change(channel, event.param1);
          break;
        case MIDIEvents.EVENT_MIDI_CONTROLLER:
          this.midiFilePlayer.synth.controlChange(channel, event.param1, event.param2);
          break;
        case MIDIEvents.EVENT_MIDI_PITCH_BEND:
          core._tp_pitch_bend(channel, (event.param2 << 7) + event.param1);
          break;
        default:
          break;
      }
    }
  }

  setDrumVoices(voices) {
    const next = new Set(
      voices
        .filter(
          (index) =>
            Number.isInteger(index) &&
            index >= 0 &&
            index < this.activeChannels.length,
        )
        .map((index) => this.activeChannels[index])
        .filter((channel) => channel !== 9),
    );
    const previous = this.drumChannels;
    const changed =
      next.size !== previous.size ||
      [...next].some((channel) => !previous.has(channel));
    this.drumChannels = next;
    if (changed) {
      for (const channel of new Set([...previous, ...next])) {
        if (previous.has(channel) === next.has(channel)) continue;
        this.panicChannel(channel);
        if (!next.has(channel)) this.restorePitchedChannel(channel);
      }
    }
    this.applyDrumPresets();
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
      case "soundfont": {
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

        const url = `${SOUNDFONT_URL_PATH}/${value}`;
        const filename = `${SOUNDFONT_MOUNTPOINT}/${value}`;
        const staged = this.preloadedSoundfonts.get(value);
        const ready = staged
          ? ensureEmscFileWithData(core, filename, new Uint8Array(staged))
          : ensureEmscFileWithUrl(core, filename, url);
        return ready.then((filename) => {
          this._loadSoundfont(filename);
          this.currentSoundfont = value;
          this.params[id] = value;
          this.preloadedSoundfonts.delete(value);
          if (value === SOUNDFONTS.BEST.name) this.bestSoundfontLoaded = true;
        });
      }
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
    const err = core.ccall(
      "tp_load_soundfont",
      "number",
      ["string"],
      [filename],
    );
    if (err === -1) throw new Error(`Unable to load soundfont ${filename}`);
    this.applyDrumPresets();
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

  // Download while playing, but defer filesystem copies and synth loading to
  // the next track. Both can otherwise stall the synthesis worker.
  preloadSoundfont(soundfontName, onLoadCallback) {
    if (core.FS.analyzePath(`${SOUNDFONT_MOUNTPOINT}/${soundfontName}`).exists) {
      onLoadCallback?.();
      return;
    }
    const url = `${SOUNDFONT_URL_PATH}/${soundfontName}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status} while fetching ${soundfontName}`);
        return response.arrayBuffer();
      })
      .then((buffer) => {
        this.preloadedSoundfonts.set(soundfontName, buffer);
        onLoadCallback?.();
      })
      .catch((error) => {
        this.isLoadingBestSoundfont = false;
        console.error(`Failed to preload soundfont ${soundfontName}:`, error);
      });
  }
}
