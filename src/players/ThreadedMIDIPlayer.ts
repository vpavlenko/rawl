import { EventEmitter } from 'events';
import { createThreadedMIDIPlayerClass } from 'librawl/native-audio';
// @ts-ignore loader imports are resolved by Webpack
import SynthWorker from 'worker-loader?name=static/js/midi-synth.[hash:8].js!../audio/midi-synth.worker.js';

type ThreadedMIDIPlayer = import('librawl/native-audio').ThreadedMIDIPlayer;
const ThreadedMIDIPlayer = createThreadedMIDIPlayerClass({
  EventEmitter,
  createWorker: () => new SynthWorker(),
  assetBase: () => new URL(`${(process.env.PUBLIC_URL || '').replace(/\/$/, '')}/`, window.location.href).href,
  get AudioWorkletNode() { return AudioWorkletNode; },
  get MessageChannel() { return MessageChannel; },
});
export default ThreadedMIDIPlayer;
