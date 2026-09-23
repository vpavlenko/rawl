/* eslint-env worker */
import ChipCore from '../chip-core';
import MIDIPlayer from '../players/MIDIPlayer';
import { ensureEmscFileWithData } from '../util';
import { SOUNDFONT_MOUNTPOINT } from '../config';

// This module runs in a dedicated worker, where self is the worker global.
// eslint-disable-next-line no-restricted-globals
const workerScope = self;

const BLOCK_FRAMES = 512;
let player;
let core;
let audioPort;
let generation = 0;
let commandId = 0;
let ended = false;
let changingTransport = false;

function state() {
  return {
    ...player.getBasePlayerState(),
    isPlaying: player.isPlaying(),
    isPaused: !player.isPlaying(),
  };
}

function publishState() {
  if (ended) return; // EOF is reported only once the worklet drains the tail.
  workerScope.postMessage({ type: 'state', commandId, state: state() });
}

function resetOutput() {
  ended = false;
  audioPort.postMessage({
    type: 'reset', generation, playing: player.isPlaying(),
    positionMs: player.midiFilePlayer.getPosition(),
  });
}

function render(message) {
  if (message.type !== 'render' || message.generation !== generation ||
      changingTransport || ended || !player.isPlaying()) return;
  const startMs = player.midiFilePlayer.getPosition();
  // Use the existing sequencer/synth, including release-tail detection, without
  // its legacy main-thread stop callback. The worklet drains before announcing EOF.
  const count = player.midiFilePlayer.processPlaySynth(player.buffer, BLOCK_FRAMES);
  if (!count) {
    ended = true;
    audioPort.postMessage({ type: 'end', generation });
    return;
  }
  const left = new Float32Array(BLOCK_FRAMES);
  const right = new Float32Array(BLOCK_FRAMES);
  // Refresh the heap view each block: the Emscripten heap can grow.
  const heap = core.HEAPF32;
  const offset = player.buffer >> 2;
  for (let i = 0; i < BLOCK_FRAMES; i++) {
    left[i] = heap[offset + i * 2];
    right[i] = heap[offset + i * 2 + 1];
  }
  audioPort.postMessage({
    type: 'audio', generation, left, right, startMs,
    endMs: player.midiFilePlayer.getPosition(),
  }, [left.buffer, right.buffer]);
}

async function initialize(message) {
  audioPort = message.port;
  core = await ChipCore({
    locateFile: (name) => new URL(name, message.assetBase).href,
    print: (text) => console.debug('[synth]', text),
    printErr: (text) => console.warn('[synth]', text),
  });
  player = new MIDIPlayer(core, message.sampleRate, BLOCK_FRAMES, false, null, () => {});
  await new Promise((resolve) => core.FS.syncfs(true, (error) => {
    // Attempt normal loading even if restoring the persistent cache failed.
    if (error) console.warn('Soundfont cache unavailable:', error);
    resolve();
  }));
  await player.handleFileSystemReady();
  player.on('playerStateUpdate', () => {
    if (!changingTransport) publishState();
  });
  audioPort.onmessage = ({ data }) => {
    try { render(data); } catch (error) { fail(error); }
  };
  audioPort.start();
  return state();
}

function fail(error) {
  if (player) player.midiFilePlayer.paused = true;
  if (audioPort) audioPort.postMessage({ type: 'reset', generation, playing: false, positionMs: 0 });
  workerScope.postMessage({ type: 'error', message: error.message || String(error) });
}

async function command(message) {
  commandId = message.id;
  const args = message.args || [];
  const resets = message.generation !== undefined;
  if (resets) {
    generation = message.generation;
    changingTransport = true;
  }
  let result;
  try {
    switch (message.method) {
      case 'loadData':
        player.midiFilePlayer.paused = true;
        result = await player.loadData(...args);
        player.stopped = false;
        break;
      case 'pause':
        player.midiFilePlayer.paused = true;
        player.midiFilePlayer.panic();
        player.seekMs(args[0]);
        break;
      case 'resume':
        if (ended || player.stopped) player.seekMs(0);
        player.stopped = false;
        player.midiFilePlayer.resume();
        break;
      case 'stop':
        player.midiFilePlayer.stop();
        player.seekMs(0);
        player.stopped = true;
        break;
      case 'seekMs': player.seekMs(args[0]); break;
      case 'setTempo': player.setTempo(args[0]); break;
      case 'setVoiceMask': player.setVoiceMask(args[0]); break;
      case 'setForcedPanning': player.setForcedPanning(args[0]); break;
      case 'setDrumVoices': player.setDrumVoices(args[0]); break;
      case 'setTranspose': player.setTranspose(args[0]); break;
      case 'setParameter': await player.setParameter(...args); break;
      case 'loadSoundfont': {
        const filename = `${SOUNDFONT_MOUNTPOINT}/user/${args[0]}`;
        await ensureEmscFileWithData(core, filename, new Uint8Array(args[1]), true);
        await player.setParameter('soundfont', `user/${args[0]}`);
        break;
      }
      default: throw new Error(`Unknown audio command: ${message.method}`);
    }
  } finally {
    changingTransport = false;
  }
  if (resets) resetOutput();
  publishState();
  return result;
}

// Serialize async loads and controls so an old download cannot replace a newer
// song/font or race pause, seek, mute, or transpose commands.
let commands = Promise.resolve();
workerScope.onmessage = ({ data }) => {
  commands = commands.then(async () => {
    try {
      const result = data.type === 'init' ? await initialize(data) : await command(data);
      workerScope.postMessage({ type: 'reply', id: data.id, result, state: state() });
    } catch (error) {
      if (data.type === 'init') fail(error);
      else {
        player.midiFilePlayer.stop();
        player.stopped = true;
        resetOutput();
        publishState();
      }
      workerScope.postMessage({ type: 'reply', id: data.id, error: error.message || String(error) });
    }
  });
};
