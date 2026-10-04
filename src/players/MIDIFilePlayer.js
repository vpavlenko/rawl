import autoBind from "auto-bind";
import chardet from "chardet";
import iconv from "iconv-lite";
import { parseNotes } from "../components/rawl/parseMidi";

const MIDIEvents = require("midievents");
require("./midi-helpers");

/**
 * The MIDIFilePlayer is the engine that parses MIDI file data, and fires
 * appropriate methods on a MIDI softsynth (noteOn, noteOff, etc.) or forwards
 * MIDI messages to Web MIDI devices.
 *
 * A lot of complexity was introduced in the MIDIFilePlayer in an effort to
 * play nicely with hardware MIDI devices. Behaviors that are deterministic
 * in a softsynth can be nondeterministic on a hardware device, such as
 * skipping silence at the beginning of a MIDI file, or seeking through the
 * file. Non-note events must be replayed in these cases, and throttled for
 * hardware devices, especially in the case of sysex commands that might make
 * the hardware busy for 0.5 seconds, such as a GM reset command sent to a
 * Roland SC-55. The time allowed for these events is a best-guess - so your
 * mileage may vary.
 */

// Constants
const BUFFER_AHEAD = 33;

const CC_SUSTAIN_PEDAL = 64;
const CC_ALL_SOUND_OFF = 120;
const META_LABELS = {
  [MIDIEvents.EVENT_META_TEXT]: "Text",
  [MIDIEvents.EVENT_META_COPYRIGHT_NOTICE]: "Copyright",
  [MIDIEvents.EVENT_META_TRACK_NAME]: "Track",
  [MIDIEvents.EVENT_META_INSTRUMENT_NAME]: "Instrument",
  [MIDIEvents.EVENT_META_LYRICS]: "Lyrics",
  [MIDIEvents.EVENT_META_MARKER]: "Marker",
  [MIDIEvents.EVENT_META_CUE_POINT]: "Cue point",
};

function printSysex(data) {
  return (
    "[F0 " +
    data.map((n) => ("0" + n.toString(16)).slice(-2)).join(" ") +
    "]"
  ).toUpperCase();
}

function MIDIFilePlayer(options) {
  autoBind(this);
  options = options || {};
  this.output = options.output || null; // Web MIDI output device (has a .send() method)
  this.synth = options.synth || null; // MIDI synth (has .noteOn(), .noteOff(), render()...)
  this.programChangeCb = options.programChangeCb;
  this.speed = 1;
  this.skipSilence = options.skipSilence || false; // skip silence at beginning of file
  this.lastProcessPlayTimestamp = 0;
  this.lastSendTimestamp = 0;
  this.events = [];
  this.paused = true;
  this.sampleRate = options.sampleRate || 44100;

  this.channelsInUse = [];
  this.channelMask = [];
  this.channelProgramNums = [];
  this.textInfo = [];
  this.setChipStateDump = options.setChipStateDump;
  this.trackNames = {};
  this.channelToTrack = {};

  if (typeof window !== "undefined")
    window.addEventListener("unload", this.stop);
}

// Parsing all tracks and add their events in a single event queue
MIDIFilePlayer.prototype.load = function (midiFile, useTrackLoops = false) {
  this.stop();
  this.position = 0;
  this.elapsedTime = 0;

  const tracks = midiFile.tracks.map((_, i) => midiFile.getTrackEvents(i));
  if (useTrackLoops) {
    console.debug("Processing MIDI track loops...");
    this.events = midiFile.getLoopedEvents(tracks, 2);
  } else {
    this.events = midiFile.getEvents();
  }
  // Port-prefix metadata is local to its track and applies to subsequent events.
  // Keep the source channel for hardware MIDI; channel is the internal voice ID.
  const ports = {};
  const trackByIndex = new Map(
    tracks.flatMap((events, track) =>
      events.map((event) => [event.index, track]),
    ),
  );
  this.events.forEach((event) => {
    const track = event.track ?? trackByIndex.get(event.index) ?? 0;
    event.track = track;
    if (event.type === MIDIEvents.EVENT_META && event.subtype === 0x21) {
      ports[track] = event.data[0];
    } else if (event.type === MIDIEvents.EVENT_MIDI) {
      event.port = ports[track] ?? 0;
      event.midiChannel = event.channel;
      event.channel = event.port * 16 + event.midiChannel;
    }
  });
  const timeEvents = midiFile.getTimeEvents(tracks);
  this.summarizeMidiEvents();

  const activeChannels = [];
  for (let i = 0; i < this.channelsInUse.length; i++) {
    if (this.channelsInUse[i]) {
      activeChannels.push(i);
    }
  }

  const result = parseNotes({
    events: this.events,
    activeChannels,
    timebase: midiFile.header.datas.getUint16(12),
    timeEvents,
  });

  this.setChipStateDump?.(result);

  return result;
};

MIDIFilePlayer.prototype.doSkipSilence = function () {
  const firstNote = this.events.find(
    (e) => e.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON,
  );
  if (firstNote && firstNote.playTime > 0) {
    // Accelerated playback of all events prior to first note
    this.setPosition(firstNote.playTime - 1500);
  }
};

MIDIFilePlayer.prototype.play = function (
  endCallback,
  playbackStartedCallback,
) {
  if (0 === this.position) {
    this.endCallback = endCallback;
    this.reset();

    this.lastProcessPlayTimestamp = performance.now();
    if (this.skipSilence) {
      this.doSkipSilence();
    }

    this.resume();
    if (playbackStartedCallback) {
      // Call the callback on the next tick to ensure playback has started
      setTimeout(playbackStartedCallback, 0);
    }
    return 1;
  }
  return 0;
};

MIDIFilePlayer.prototype.processPlaySynth = function (buffer, bufferSize) {
  this.lastProcessPlayTimestamp = performance.now();
  const bufferStart = buffer;
  let bytesWritten = 0;
  let batchSize = 64;
  let event = null;
  const synth = this.synth;
  const msPerBatch = (this.speed * 1000 * (batchSize / this.sampleRate)) / 2;

  for (
    let samplesRemaining = bufferSize * 2;
    samplesRemaining > 0;
    samplesRemaining -= batchSize
  ) {
    if (batchSize > samplesRemaining) batchSize = samplesRemaining;

    if (!this.paused) {
      let pos = this.position;
      for (
        this.elapsedTime += msPerBatch;
        this.events[pos] && this.elapsedTime >= this.events[pos].playTime;
        pos++
      ) {
        event = this.events[pos];
        // Meta events have their own subtype namespace (e.g. 0x08 is a
        // program-name label, not note-off) and carry no MIDI channel.
        if (event.type !== MIDIEvents.EVENT_MIDI) continue;
        switch (event.subtype) {
          case MIDIEvents.EVENT_MIDI_NOTE_ON:
            if (!this.channelMask[event.channel]) break;
            if (event.param2 === 0)
              // velocity
              synth.noteOff(event.channel, event.param1);
            else synth.noteOn(event.channel, event.param1, event.param2);
            break;
          case MIDIEvents.EVENT_MIDI_NOTE_OFF:
            synth.noteOff(event.channel, event.param1);
            break;
          case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
            this.handleProgramChange(event.channel, event.param1);
            synth.programChange(event.channel, event.param1);
            break;
          case MIDIEvents.EVENT_MIDI_PITCH_BEND:
            synth.pitchBend(event.channel, (event.param2 << 7) + event.param1);
            break;
          case MIDIEvents.EVENT_MIDI_CONTROLLER:
            synth.controlChange(event.channel, event.param1, event.param2);
            break;
          // case MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH:
          //   synth.channelAftertouch(event.channel, event.param1);
          //   break;
          // case MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH:
          //   synth.noteAftertouch(event.channel, event.param1, event.param2);
          //   break;
          default:
            break;
        }
      }
      this.position = pos;
    }

    // Render the block of audio samples in float format
    synth.render(buffer, batchSize);
    buffer += batchSize * 4; // sizeof(float)
    bytesWritten += batchSize;
  }

  if (this.position >= this.events.length) {
    // Last MIDI event has been processed.
    // Continue synthesis until silence is detected.
    // This allows voices with a long release tail to complete.
    // Fast method: when entire buffer is below threshold, consider it silence.
    let synthStillActive = 0;
    const threshold = 0.001;
    for (let i = 0; i < bufferSize * 2; i++) {
      if (Math.abs(synth.getValue(bufferStart + i * 4, "float")) > threshold) {
        // Check both channels and both polarities across the entire block.
        synthStillActive = 1; // Exit early
        break;
      }
    }
    if (synthStillActive === 0) {
      this.position = 0;
      this.paused = true;
      return 0;
    }
  }

  return bytesWritten;
};

MIDIFilePlayer.prototype.processPlay = function () {
  const now = performance.now();
  const deltaTime = (now - this.lastProcessPlayTimestamp) * this.speed;
  this.lastProcessPlayTimestamp = now;

  if (this.paused) return;

  let throttleDelayMs = 0;
  let delay = 0;
  let message = null;

  this.elapsedTime += deltaTime;
  let event = this.events[this.position];
  while (
    this.events[this.position] &&
    event.playTime < this.elapsedTime + BUFFER_AHEAD
  ) {
    message = null;
    delay = 0;
    if (
      event.type === MIDIEvents.EVENT_SYSEX ||
      event.type === MIDIEvents.EVENT_DIVSYSEX
    ) {
      // Spread out scheduling of sysex messages. Example: Predator (XG).mid
      message = [event.type, ...event.data];
      if (event.data && event.data[3] === 0 && event.data[4] === 0) delay = 50;
      else delay = event.data.length / 2;
      if (throttleDelayMs > 0)
        console.debug(
          "Sysex event at %s ms delayed %s ms:",
          Math.floor(event.playTime),
          throttleDelayMs,
          printSysex(event.data),
        );
      else
        console.debug(
          "Sysex event at %s ms:",
          Math.floor(event.playTime),
          printSysex(event.data),
        );
    } else if (event.type === MIDIEvents.EVENT_MIDI) {
      switch (event.subtype) {
        case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
          this.handleProgramChange(event.channel, event.param1);
          message = [
            (event.subtype << 4) + (event.midiChannel ?? event.channel),
            event.param1,
          ];
          break;
        case MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH:
          message = [
            (event.subtype << 4) + (event.midiChannel ?? event.channel),
            event.param1,
          ];
          break;
        case MIDIEvents.EVENT_MIDI_NOTE_OFF:
        case MIDIEvents.EVENT_MIDI_NOTE_ON:
        case MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH:
        case MIDIEvents.EVENT_MIDI_CONTROLLER:
        case MIDIEvents.EVENT_MIDI_PITCH_BEND:
          if (!this.channelMask[event.channel]) break;
          message = [
            (event.subtype << 4) + (event.midiChannel ?? event.channel),
            event.param1,
            event.param2 || 0x00,
          ];
          break;
        default:
      }
    }
    if (message) {
      const scaledPlayTime =
        (event.playTime - this.elapsedTime) / this.speed +
        this.lastProcessPlayTimestamp;
      this.send(message, scaledPlayTime + throttleDelayMs);
      throttleDelayMs += delay;
      this.lastSendTimestamp = scaledPlayTime;
    }
    this.position++;
    event = this.events[this.position];
  }

  if (this.position >= this.events.length) {
    setTimeout(this.endCallback, BUFFER_AHEAD + 100);
    this.position = 0;
    this.paused = true;
  }
};

MIDIFilePlayer.prototype.handleProgramChange = function (channel, program) {
  this.channelProgramNums[channel] = program;
  this.programChangeCb?.();
};

MIDIFilePlayer.prototype.togglePause = function () {
  this.paused = !this.paused;
  if (this.paused === true) {
    this.panic(this.lastSendTimestamp + 10);
  }
  return this.paused;
};

MIDIFilePlayer.prototype.resume = function () {
  this.paused = false;
};

MIDIFilePlayer.prototype.stop = function () {
  this.paused = true;
  this.panic();
};

MIDIFilePlayer.prototype.send = function (message, timestamp) {
  try {
    this.output.send(message, timestamp);
  } catch (e) {
    console.warn(e);
    console.warn(message);
  }
};

// TODO: fix confusion between reset and panic
MIDIFilePlayer.prototype.panic = function (timestamp) {
  // Release sustain pedal on all channels
  for (const ch of Object.keys(this.channelsInUse)) {
    this.synth?.controlChange(ch, CC_SUSTAIN_PEDAL, 0);
  }
  this.synth?.panic();
};

MIDIFilePlayer.prototype.reset = function (timestamp) {
  this.synth.reset();
  this.position = 0;
  this.paused = true;
};

// --- Chip Player JS support ---

MIDIFilePlayer.prototype.getDuration = function () {
  if (this.events && this.events.length > 0) {
    return this.events[this.events.length - 1].playTime;
  }
  return 0;
};

MIDIFilePlayer.prototype.getPosition = function () {
  return this.elapsedTime;
};

MIDIFilePlayer.prototype.setOutput = function (output) {
  this.panic(this.lastSendTimestamp + 10);
  this.output = output;
  // Trigger replay of all program change events
  this.setPosition(this.getPosition() - 10);
};

MIDIFilePlayer.prototype.getSpeed = function () {
  return this.speed;
};

MIDIFilePlayer.prototype.setSpeed = function (speed) {
  this.speed = Math.max(0.1, Math.min(4, speed));
};

MIDIFilePlayer.prototype.setPositionSynth = function (eventList) {
  const synth = this.synth;
  eventList.forEach((event) => {
    if (event.type !== MIDIEvents.EVENT_MIDI) return;
    switch (event.subtype) {
      case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
        // handleProgramChange() is called in setPosition()
        synth.programChange(event.channel, event.param1);
        break;
      case MIDIEvents.EVENT_MIDI_PITCH_BEND:
        synth.pitchBend(event.channel, (event.param2 << 7) + event.param1);
        break;
      case MIDIEvents.EVENT_MIDI_CONTROLLER:
        synth.controlChange(event.channel, event.param1, event.param2);
        break;
      default:
        break;
    }
  });
};

MIDIFilePlayer.prototype.setPosition = function (ms) {
  if (ms < 0 || ms > this.getDuration()) return;

  this.lastProcessPlayTimestamp = performance.now();
  this.panic(this.lastSendTimestamp + 10);
  const eventList = [];
  const heldNotes = new Map();
  let pos = 0;

  // Replay from the beginning so a backward seek cannot retain a later bank,
  // program, sustain state, or pitch bend on any port.
  this.synth.reset();

  for (const channel in this.channelsInUse) {
    this.synth.pitchBend(channel, 8192);
  }

  while (this.events[pos] && this.events[pos].playTime < ms) {
    const event = this.events[pos++];
    if (event.type !== MIDIEvents.EVENT_MIDI) continue;
    if (event.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON && event.param2 > 0) {
      if (!heldNotes.has(event.channel)) heldNotes.set(event.channel, new Map());
      heldNotes.get(event.channel).set(event.param1, event.param2);
    } else if (
      event.subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF ||
      (event.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON && event.param2 === 0)
    ) {
      heldNotes.get(event.channel)?.delete(event.param1);
    } else if (
      event.subtype === MIDIEvents.EVENT_MIDI_CONTROLLER &&
      (event.param1 === CC_ALL_SOUND_OFF || event.param1 === 123)
    ) {
      heldNotes.get(event.channel)?.clear();
    }
    if (event.subtype === MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE) {
      this.handleProgramChange(event.channel, event.param1);
    }
    if (
      [
        MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE,
        MIDIEvents.EVENT_MIDI_CONTROLLER,
        MIDIEvents.EVENT_MIDI_PITCH_BEND,
      ].includes(event.subtype)
    ) {
      // Preserve source order, including bank/program and RPN/NRPN sequences.
      eventList.push(event);
    }
  }

  this.setPositionSynth(eventList);

  // Restore attacks for notes whose note-off is still ahead of the cursor.
  // Controller/program state must be in place before starting these voices.
  for (const [channel, notes] of heldNotes) {
    if (!this.channelMask[channel]) continue;
    for (const [note, velocity] of notes) {
      this.synth.noteOn(channel, note, velocity);
    }
  }

  this.elapsedTime = ms;
  this.position = pos;
};

MIDIFilePlayer.prototype.getChannelInUse = function (ch) {
  return !!this.channelsInUse[ch];
};

MIDIFilePlayer.prototype.getChannelProgramNum = function (ch) {
  return this.channelProgramNums[ch];
};

MIDIFilePlayer.prototype.summarizeMidiEvents = function () {
  this.textInfo = [];
  this.trackNames = {};
  this.channelToTrack = {};
  const channelsInUse = (this.channelsInUse = []);
  const channelProgramNums = (this.channelProgramNums = []);
  const channelMask = (this.channelMask = []);
  for (const event of this.events) {
    if (event.type !== MIDIEvents.EVENT_MIDI) continue;
    channelsInUse[event.channel] = 0;
    channelProgramNums[event.channel] = undefined;
    channelMask[event.channel] = true;
  }

  for (let j = 0; j < this.events.length; j++) {
    const event = this.events[j];
    const { channel, track } = event;
    if (typeof channel !== "undefined" && typeof track !== "undefined") {
      this.channelToTrack[channel] = track;
    }
    switch (event.subtype) {
      case MIDIEvents.EVENT_MIDI_NOTE_ON:
        if (event.type !== MIDIEvents.EVENT_MIDI) break;
        channelsInUse[channel] = 1;
        break;
      case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
        if (event.type !== MIDIEvents.EVENT_MIDI) break;
        if (channelProgramNums[channel] === undefined)
          this.handleProgramChange(channel, event.param1);
        break;
      case MIDIEvents.EVENT_META_TEXT:
      case MIDIEvents.EVENT_META_COPYRIGHT_NOTICE:
      case MIDIEvents.EVENT_META_TRACK_NAME:
      // case MIDIEvents.EVENT_META_INSTRUMENT_NAME:
      case MIDIEvents.EVENT_META_LYRICS:
      case MIDIEvents.EVENT_META_MARKER:
      case MIDIEvents.EVENT_META_CUE_POINT:
        if (event.type !== MIDIEvents.EVENT_META) break;
        const text = event.data
          .map((c) => String.fromCharCode(c))
          .join("")
          .trim();
        if (text && !text.match(/nstd/i))
          this.textInfo.push(`${META_LABELS[event.subtype]}: ${text}`);
        if (event.subtype === MIDIEvents.EVENT_META_TRACK_NAME) {
          this.trackNames[track] = iconv.decode(
            event.data,
            chardet.detect(event.data),
          );
        }
        break;
      default:
        break;
    }
  }
};

MIDIFilePlayer.prototype.setChannelMute = function (ch, isMuted) {
  this.channelMask[ch] = !isMuted;
  if (isMuted) {
    // TODO separate synth from webMidi
    const timestamp = this.lastSendTimestamp + 10;
    const midiChannel = ch % 16;
    this.send(
      [
        (MIDIEvents.EVENT_MIDI_CONTROLLER << 4) + midiChannel,
        CC_SUSTAIN_PEDAL,
        0,
      ],
      timestamp,
    );
    this.send(
      [
        (MIDIEvents.EVENT_MIDI_CONTROLLER << 4) + midiChannel,
        CC_ALL_SOUND_OFF,
        0,
      ],
      timestamp,
    );
    this.synth.panicChannel(ch);
  }
};

MIDIFilePlayer.prototype.setUseWebMIDI = function () {
  // Trigger replay of all program change events
  this.setPosition(this.getPosition() - 10);
};

export default MIDIFilePlayer;
