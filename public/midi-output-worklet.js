/* global AudioWorkletProcessor, registerProcessor, currentTime, sampleRate */
// PCM travels directly between this processor and the synthesis worker.
// No main-thread callback, timer, or message forwarding is needed to keep playing.
class MidiOutputProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.generation = -1;
    this.queue = [];
    this.offset = 0;
    this.playing = false;
    this.pending = 0;
    this.ended = false;
    this.buffering = true;
    this.positionMs = 0;
    this.underruns = 0;
    this.port.onmessage = ({ data }) => {
      if (data.type === 'connect') {
        this.audioPort = data.port;
        this.audioPort.onmessage = ({ data: message }) => this.receive(message);
        this.audioPort.start();
      } else if (data.type === 'invalidate' && data.generation > this.generation) {
        this.reset(data, false);
      }
    };
  }

  reset(message, playing) {
    this.generation = message.generation;
    this.queue = [];
    this.offset = 0;
    this.pending = 0;
    this.ended = false;
    this.buffering = true;
    this.playing = playing;
    this.positionMs = message.positionMs;
    this.report(currentTime, 0, this.positionMs);
  }

  receive(message) {
    if (message.generation < this.generation) return;
    if (message.type === 'reset') {
      this.reset(message, message.playing);
      this.requestBuffers();
    } else if (message.generation === this.generation) {
      if (message.type === 'audio') {
        this.pending--;
        this.queue.push(message);
      } else if (message.type === 'end') {
        this.pending = 0;
        this.ended = true;
      }
    }
  }

  requestBuffers() {
    // Four 512-frame blocks: 42.7 ms at 48 kHz, 46.4 ms at 44.1 kHz.
    // Count requests in flight as well as queued blocks to bound render-ahead.
    while (this.playing && !this.ended && this.queue.length + this.pending < 4) {
      this.pending++;
      this.audioPort.postMessage({ type: 'render', generation: this.generation });
    }
  }

  report(contextTime, speed, limitMs) {
    this.port.postMessage({
      type: 'position', generation: this.generation, contextTime,
      positionMs: this.positionMs, speed, limitMs, underruns: this.underruns,
    });
  }

  process(inputs, outputs) {
    const output = outputs[0];
    if (!this.playing || !this.audioPort) return true;
    if (this.buffering) {
      if (this.queue.length < 2 && !this.ended) return true;
      this.buffering = false;
    }
    let written = 0;
    while (written < output[0].length) {
      const block = this.queue[0];
      if (!block) {
        if (this.ended) {
          this.playing = false;
          this.report(currentTime + written / sampleRate, 0, this.positionMs);
          this.port.postMessage({ type: 'ended', generation: this.generation });
        } else {
          this.underruns++;
          this.buffering = true;
          this.report(currentTime + written / sampleRate, 0, this.positionMs);
        }
        break;
      }
      const count = Math.min(output[0].length - written, block.left.length - this.offset);
      for (let i = 0; i < count; i++) {
        output[0][written + i] = block.left[this.offset + i];
        output[1][written + i] = block.right[this.offset + i];
      }
      this.offset += count;
      written += count;
      this.positionMs = block.startMs + (block.endMs - block.startMs) * this.offset / block.left.length;
      if (this.offset === block.left.length) {
        this.queue.shift();
        this.offset = 0;
        const speed = (block.endMs - block.startMs) * sampleRate / (1000 * block.left.length);
        const last = this.queue[this.queue.length - 1];
        this.report(currentTime + written / sampleRate, speed, last ? last.endMs : block.endMs);
        this.requestBuffers();
      }
    }
    return true;
  }
}
registerProcessor('rawl-midi-output', MidiOutputProcessor);
