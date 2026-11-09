// CC0 qanun recordings by Baris Bozkurt. See public/audio/qanun/SOURCES.md.
import levels from "./qanunLevels.json";
export const QANUN_SAMPLES = [
  { midi: 53, url: "/audio/qanun/qanun-F3.flac" },
  { midi: 55, url: "/audio/qanun/qanun-G3.flac" },
  { midi: 57, url: "/audio/qanun/qanun-A3.flac" },
  { midi: 59, url: "/audio/qanun/qanun-B3.flac" },
  { midi: 61, url: "/audio/qanun/qanun-Cs4.flac" },
  { midi: 63, url: "/audio/qanun/qanun-Ds4.flac" },
  { midi: 65, url: "/audio/qanun/qanun-F4.flac" },
  { midi: 67, url: "/audio/qanun/qanun-G4.flac" },
  { midi: 69, url: "/audio/qanun/qanun-A4.flac" },
  { midi: 71, url: "/audio/qanun/qanun-B4.flac" },
  { midi: 73, url: "/audio/qanun/qanun-Cs5.flac" },
  { midi: 75, url: "/audio/qanun/qanun-Ds5.flac" },
  { midi: 77, url: "/audio/qanun/qanun-F5.flac" },
  { midi: 79, url: "/audio/qanun/qanun-G5.flac" },
  { midi: 81, url: "/audio/qanun/qanun-A5.flac" },
  { midi: 83, url: "/audio/qanun/qanun-B5.flac" },
  { midi: 85, url: "/audio/qanun/qanun-Cs6.flac" },
  { midi: 87, url: "/audio/qanun/qanun-Ds6.flac" },
];
export const nearestQanunSample = (midi: number) =>
  QANUN_SAMPLES.reduce((best, sample) =>
    Math.abs(sample.midi - midi) < Math.abs(best.midi - midi) ? sample : best,
  );
export const QANUN_NOTE_SECONDS = 0.85;
export const QANUN_NOTE_DURATION = 0.78;
export type QanunScheduledNote = {
  midi: number;
  start: number;
  duration: number;
};
let context: AudioContext | null = null;
const buffers = new Map<string, Promise<AudioBuffer>>();
const sampleGains = new WeakMap<AudioBuffer, number>();
let stopPrevious: (() => void) | null = null;

export const playQanun = (
  input: number[] | QanunScheduledNote[],
  onNote: (index: number | null) => void,
  onError: () => void,
  onReady?: (getPositionSeconds: (() => number) | null) => void,
): (() => void) => {
  stopPrevious?.();
  const audio = context ?? (context = new AudioContext());
  const sources: AudioBufferSourceNode[] = [];
  const gains: GainNode[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  const stop = () => {
    if (cancelled) return;
    cancelled = true;
    timers.forEach(clearTimeout);
    sources.forEach((source) => {
      try {
        source.stop();
      } catch {}
      source.disconnect();
    });
    gains.forEach((gain) => gain.disconnect());
    onReady?.(null);
    onNote(null);
    if (stopPrevious === stop) stopPrevious = null;
  };
  stopPrevious = stop;
  const notes: QanunScheduledNote[] = input.map((note, index) =>
    typeof note === "number"
      ? {
          midi: note,
          start: index * QANUN_NOTE_SECONDS,
          duration: QANUN_NOTE_DURATION,
        }
      : note,
  );
  void (async () => {
    await audio.resume();
    const selected = notes.map((note) => nearestQanunSample(note.midi));
    const decoded = await Promise.all(
      selected.map((sample) => {
        if (!buffers.has(sample.url)) {
          const loading = fetch(sample.url)
            .then((response) => {
              if (!response.ok)
                throw new Error(`Qanun sample: HTTP ${response.status}`);
              return response.arrayBuffer();
            })
            .then((data) => audio.decodeAudioData(data))
            .catch((error) => {
              buffers.delete(sample.url);
              throw error;
            });
          buffers.set(sample.url, loading);
        }
        return buffers.get(sample.url)!;
      }),
    );
    if (cancelled) return;
    const start = audio.currentTime + 0.04;
    let finish = start;
    notes.forEach((note, index) => {
      const { midi } = note;
      const noteStart = start + note.start;
      const source = audio.createBufferSource();
      const gain = audio.createGain();
      source.buffer = decoded[index];
      // One recorded pluck, with no repeated attacks or synthetic tremolo.
      source.playbackRate.value = 2 ** ((midi - selected[index].midi) / 12);
      // Sustain: the attack/highlight duration does not choke the recording.
      const duration = decoded[index].duration / source.playbackRate.value;
      const buffer = decoded[index];
      if (!sampleGains.has(buffer)) {
        const pcm = buffer.getChannelData(0);
        let peak = 0;
        for (const sample of pcm) peak = Math.max(peak, Math.abs(sample));
        sampleGains.set(buffer, peak > 0 ? levels.samplePeak / peak : 1);
      }
      const level = levels.previewGain * sampleGains.get(buffer)!;
      gain.gain.setValueAtTime(0, noteStart);
      gain.gain.linearRampToValueAtTime(level, noteStart + 0.003);
      gain.gain.setValueAtTime(
        level,
        noteStart + Math.max(0.003, duration - 0.04),
      );
      gain.gain.linearRampToValueAtTime(0, noteStart + duration);
      source.connect(gain);
      gain.connect(audio.destination);
      source.start(noteStart);
      source.stop(noteStart + duration);
      sources.push(source);
      gains.push(gain);
      finish = Math.max(finish, noteStart + duration);
      timers.push(
        setTimeout(
          () => {
            if (!cancelled) onNote(index);
          },
          Math.max(0, (noteStart - audio.currentTime) * 1000),
        ),
        setTimeout(
          () => {
            if (!cancelled) onNote(null);
          },
          Math.max(
            0,
            (noteStart +
              Math.min(note.duration, duration) -
              audio.currentTime) *
              1000,
          ),
        ),
      );
    });
    onReady?.(() => audio.currentTime - start);
    timers.push(
      setTimeout(stop, Math.max(0, (finish - audio.currentTime) * 1000)),
    );
  })().catch((error) => {
    if (!cancelled) {
      stop();
      onError();
      console.error("Qanun playback:", error);
    }
  });
  return stop;
};
