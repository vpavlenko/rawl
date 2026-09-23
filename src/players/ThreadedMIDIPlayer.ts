import { EventEmitter } from 'events';
// worker-loader emits a separate bundle with the existing Webpack 4 setup.
// @ts-ignore loader imports are resolved by Webpack
import SynthWorker from 'worker-loader?name=static/js/midi-synth.[hash:8].js!../audio/midi-synth.worker.js';

type PlaybackState = {
  durationMs: number;
  positionMs: number;
  numVoices: number;
  tempo: number;
  voiceMask: boolean[];
  voiceNames: string[];
  isStopped: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  metadata?: any;
};
type Clock = {
  positionMs: number;
  contextTime: number;
  speed: number;
  limitMs: number;
};

// Synchronous UI-facing state; the worker owns the actual sequencer and synth.
export default class ThreadedMIDIPlayer extends EventEmitter {
  private worker: Worker;
  private node: AudioWorkletNode;
  private context: AudioContext;
  private nextId = 0;
  private latestLoadId = 0;
  private generation = 0;
  private disposed = false;
  private failed = false;
  private pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  private clock: Clock | null = null;
  private playbackStartedCallback: (() => void) | null = null;
  private waitingForStart = false;
  private debugTiming: boolean;
  private state: PlaybackState = {
    durationMs: 0, positionMs: 0, numVoices: 0, tempo: 1,
    voiceMask: [], voiceNames: [], isStopped: true, isPlaying: false, isPaused: true,
  };

  constructor(context: AudioContext, debugTiming = false) {
    super();
    this.context = context;
    this.debugTiming = debugTiming;
    this.getPositionMs = this.getPositionMs.bind(this);
  }

  async initialize(destination: AudioNode) {
    if (!this.context.audioWorklet) {
      throw new Error('MIDI playback requires AudioWorklet support and HTTPS (or localhost).');
    }
    const assetBase = new URL(`${(process.env.PUBLIC_URL || '').replace(/\/$/, '')}/`, window.location.href).href;
    try {
      await this.context.audioWorklet.addModule(new URL('midi-output-worklet.js', assetBase).href);
      if (this.disposed) throw new Error('Audio engine disposed.');
      this.node = new AudioWorkletNode(this.context, 'rawl-midi-output', {
        numberOfInputs: 0, numberOfOutputs: 1, outputChannelCount: [2],
      });
      this.node.port.onmessage = ({ data }) => this.receiveAudio(data);
      this.node.onprocessorerror = () => this.fail(new Error('The audio output processor stopped. Reload to restart audio.'));
      this.node.connect(destination);
      this.worker = new SynthWorker();
      this.worker.onmessage = ({ data }) => this.receiveWorker(data);
      this.worker.onerror = (event) => this.fail(new Error(event.message || 'The MIDI synthesis worker stopped.'));
      const channel = new MessageChannel();
      this.node.port.postMessage({ type: 'connect', port: channel.port1 }, [channel.port1]);
      await this.request({
        type: 'init', assetBase, sampleRate: this.context.sampleRate, port: channel.port2,
      }, [channel.port2]);
    } catch (error) {
      this.dispose();
      throw error;
    }
  }

  private request(message: any, transfer: Transferable[] = []): Promise<any> {
    if (this.disposed || this.failed) return Promise.reject(new Error('Audio engine is unavailable.'));
    const id = ++this.nextId;
    if (message.method === 'loadData') this.latestLoadId = id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      try { this.worker.postMessage({ ...message, id }, transfer); }
      catch (error) { this.pending.delete(id); reject(error); }
    });
  }

  private receiveWorker(message: any) {
    if (message.type === 'error') {
      this.fail(new Error(message.message));
      return;
    }
    if (message.type === 'state') {
      if (message.commandId === this.nextId) {
        this.state = { ...this.state, ...message.state };
        this.emit('playerStateUpdate', this.state);
      }
    } else if (message.type === 'reply') {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) pending.reject(new Error(message.error));
      else {
        // Controls may have been sent while a track was loading. Its metadata
        // still has to be available when loadData resolves to the UI.
        if (message.id === this.latestLoadId) {
          const { durationMs, numVoices, voiceNames, metadata } = message.state;
          Object.assign(this.state, { durationMs, numVoices, voiceNames, metadata });
        }
        if (message.id === this.nextId) this.state = { ...this.state, ...message.state };
        pending.resolve(message.result);
      }
    }
  }

  private receiveAudio(message: any) {
    if (message.generation !== this.generation || this.failed) return;
    if (message.type === 'position') {
      this.clock = message;
      if (this.waitingForStart && message.speed > 0) {
        this.waitingForStart = false;
        this.playbackStartedCallback?.();
        this.playbackStartedCallback = null;
      }
      if (this.debugTiming && message.underruns !== this.lastUnderruns) {
        this.lastUnderruns = message.underruns;
        console.debug('[midi timing] output underruns:', message.underruns);
      }
    } else if (message.type === 'ended') {
      this.state = { ...this.state, isPlaying: false, isPaused: true, isStopped: true };
      this.emit('playerStateUpdate', this.state);
    }
  }
  private lastUnderruns = 0;

  private invalidate(positionMs: number) {
    this.generation++;
    this.clock = null;
    this.state.positionMs = positionMs;
    // Immediately discard old PCM, even if the worker is busy loading a file.
    this.node?.port.postMessage({ type: 'invalidate', generation: this.generation, positionMs });
    return this.generation;
  }

  private control(method: string, args: any[] = [], positionMs?: number) {
    const generation = positionMs === undefined ? undefined : this.invalidate(positionMs);
    return this.request({ type: 'command', method, args, generation });
  }

  private send(method: string, args: any[] = [], positionMs?: number) {
    void this.control(method, args, positionMs).catch((error) => {
      if (!this.failed && !this.disposed) this.fail(error);
    });
  }

  async loadData(data: ArrayBuffer | Uint8Array, filepath: string, shouldAutoPlay = true,
                 excludedVoices: number[] = [], drumVoices: number[] = []) {
    this.state.isPlaying = shouldAutoPlay;
    this.state.isPaused = !shouldAutoPlay;
    this.waitingForStart = shouldAutoPlay;
    return this.control('loadData', [data, filepath, shouldAutoPlay, excludedVoices, drumVoices], 0);
  }

  isPlaying() { return this.state.isPlaying; }
  isPaused() { return !this.isPlaying(); }
  getDurationMs() { return this.state.durationMs; }
  getTempo() { return this.state.tempo; }
  getNumVoices() { return this.state.numVoices; }
  getVoiceMask() { return this.state.voiceMask; }
  getVoiceName(index: number) { return this.state.voiceNames[index]; }
  getMetadata() { return this.state.metadata; }

  getPositionMs() {
    if (!this.clock) return this.state.positionMs;
    const { positionMs, contextTime, speed, limitMs } = this.clock;
    // Use the audio clock, not wall time; suspension must freeze the playhead.
    return Math.min(limitMs, positionMs + Math.max(0, this.context.currentTime - contextTime) * 1000 * speed);
  }

  togglePause() {
    if (this.isPlaying()) this.pause();
    else {
      this.state.isPlaying = true;
      this.state.isPaused = false;
      this.waitingForStart = true;
      this.send('resume', [], this.getPositionMs());
    }
    return !this.isPlaying();
  }

  pause() {
    const positionMs = this.getPositionMs();
    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.waitingForStart = false;
    this.send('pause', [positionMs], positionMs);
  }

  stop() {
    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.state.isStopped = true;
    this.waitingForStart = false;
    this.send('stop', [], 0);
  }
  suspend() { this.stop(); }
  eject() { this.stop(); }

  seekMs(ms: number) {
    if (!Number.isFinite(ms) || ms < 0 || ms > this.getDurationMs()) return;
    this.send('seekMs', [ms], ms);
  }
  setTempo(tempo: number) {
    this.state.tempo = Math.max(0.1, Math.min(4, tempo));
    this.send('setTempo', [this.state.tempo]);
  }
  setVoiceMask(mask: boolean[]) {
    this.state.voiceMask = [...mask];
    this.send('setVoiceMask', [mask]);
  }
  setDrumVoices(voices: number[]) { this.send('setDrumVoices', [voices]); }
  setTranspose(semitones: number) { this.send('setTranspose', [semitones]); }
  setParameter(id: string, value: any) {
    this.send('setParameter', [id, value], id === 'soundfont' ? this.getPositionMs() : undefined);
  }
  async loadSoundfont(name: string, data: ArrayBuffer) {
    return this.control('loadSoundfont', [name, data], this.getPositionMs());
  }
  setPlaybackStartedCallback(callback?: (() => void) | null) {
    this.playbackStartedCallback = callback || null;
  }

  private fail(error: Error) {
    if (this.failed || this.disposed) return;
    console.error('[midi playback]', error);
    this.failed = true;
    this.invalidate(this.getPositionMs());
    this.state.isPlaying = false;
    this.state.isPaused = true;
    this.pending.forEach(({ reject }) => reject(error));
    this.pending.clear();
    this.worker?.terminate();
    this.emit('playerStateUpdate', { isStopped: true, isPlaying: false });
    this.emit('playerError', error.message);
  }

  dispose() {
    this.disposed = true;
    this.worker?.terminate();
    this.node?.disconnect();
    this.node?.port.close();
    this.pending.forEach(({ reject }) => reject(new Error('Audio engine disposed.')));
    this.pending.clear();
  }
}
