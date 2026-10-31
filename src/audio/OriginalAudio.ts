export type OriginalAudioState = {
  active: boolean;
  playing: boolean;
  loading: boolean;
  error: boolean;
};

// The recording is the clock while selected. No periodic corrections or time
// stretching of the transcription are needed; every score consumer reads it.
export default class OriginalAudio {
  private active = false;
  private playing = false;
  private loading = false;
  private error = false;
  private revision = 0;
  private pendingPosition: number | null = null;
  private source: MediaElementAudioSourceNode;
  private listeners: Array<[string, EventListener]> = [];

  constructor(
    private audio: HTMLAudioElement,
    context: AudioContext,
    destination: AudioNode,
    private onChange: (state: OriginalAudioState) => void,
    private onFailure: (positionMs: number, wasPlaying: boolean) => void,
  ) {
    audio.crossOrigin = "anonymous";
    audio.preload = "metadata";
    audio.preservesPitch = true;
    this.source = context.createMediaElementSource(audio);
    this.source.connect(destination);
    this.listen("loadedmetadata", () => {
      if (this.pendingPosition !== null) this.seekMs(this.pendingPosition);
    });
    this.listen("waiting", () => {
      if (this.active) {
        this.loading = true;
        this.publish();
      }
    });
    this.listen("playing", () => {
      if (this.active) {
        this.loading = false;
        this.publish();
      }
    });
    this.listen("canplay", () => {
      if (this.active) {
        this.loading = false;
        this.publish();
      }
    });
    this.listen("ended", () => {
      if (!this.active) return;
      this.playing = false;
      this.loading = false;
      this.publish();
    });
    this.listen("error", () => {
      if (this.active) this.fail();
    });
  }

  private listen(name: string, listener: EventListener) {
    this.audio.addEventListener(name, listener);
    this.listeners.push([name, listener]);
  }

  private publish() {
    this.onChange({
      active: this.active,
      playing: this.playing,
      loading: this.loading,
      error: this.error,
    });
  }

  isActive() {
    return this.active;
  }
  isPlaying() {
    return this.playing;
  }
  getPositionMs() {
    return this.pendingPosition ?? this.audio.currentTime * 1000;
  }

  activate(url: string, positionMs: number, playing: boolean, tempo: number) {
    this.revision++;
    this.active = true;
    this.error = false;
    this.loading =
      this.audio.readyState < 3 || this.audio.getAttribute("src") !== url;
    if (this.audio.getAttribute("src") !== url) this.audio.src = url;
    this.setTempo(tempo);
    this.seekMs(positionMs);
    this.setPaused(!playing);
  }

  setPaused(paused: boolean) {
    if (!this.active) return;
    const revision = ++this.revision;
    this.playing = !paused;
    if (paused) {
      this.audio.pause();
      this.loading = false;
    } else {
      this.loading = this.audio.readyState < 3;
      void this.audio.play().catch((error) => {
        if (revision !== this.revision || !this.active) return;
        if (error.name === "NotAllowedError") {
          // Autoplay policy requires a gesture, not a different audio source.
          this.playing = false;
          this.loading = false;
          this.audio.pause();
          this.publish();
        } else {
          this.fail();
        }
      });
    }
    this.publish();
  }

  seekMs(positionMs: number) {
    if (!Number.isFinite(positionMs)) return;
    const seconds = Math.max(0, positionMs / 1000);
    // currentTime before metadata is a default start position; keep it visible
    // to the cursor until the browser has actually applied the seek.
    this.pendingPosition = this.audio.readyState === 0 ? seconds * 1000 : null;
    this.audio.currentTime = seconds;
  }

  setTempo(tempo: number) {
    this.audio.playbackRate = Math.max(0.1, Math.min(4, tempo));
  }

  deactivate() {
    this.revision++;
    this.active = false;
    this.playing = false;
    this.loading = false;
    this.audio.pause();
    this.publish();
  }

  reset() {
    this.deactivate();
    this.error = false;
    this.pendingPosition = null;
    this.audio.removeAttribute("src");
    this.audio.load();
    this.publish();
  }

  private fail() {
    const positionMs = this.getPositionMs();
    const wasPlaying = this.playing;
    this.error = true;
    this.deactivate();
    this.onFailure(positionMs, wasPlaying);
  }

  dispose() {
    this.revision++;
    this.active = false;
    this.audio.pause();
    this.listeners.forEach(([name, listener]) =>
      this.audio.removeEventListener(name, listener),
    );
    this.audio.removeAttribute("src");
    this.audio.load();
    this.source.disconnect();
    this.audio.remove();
  }
}
