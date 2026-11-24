import React, { useEffect, useRef, useState } from "react";
import { pitchColor } from "../colors";
import Play from "../../icons/Play";
import Square from "../../icons/Square";

export type Excerpt = {
  slug: string;
  measure: number;
  endMeasure: number;
  measures: number[];
  notes: number[][];
  regions: {
    measure: number;
    tonic: string;
    pitchClass: number;
    scale?: string;
  }[];
};

export default function HoroExcerpt({ excerpt }: { excerpt: Excerpt }) {
  const [position, setPosition] = useState<number | null>(null);
  const audio = useRef<AudioContext | undefined>(undefined);
  const frame = useRef<number>(0);
  const duration = excerpt.measures[excerpt.measures.length - 1];
  const low = Math.min(...excerpt.notes.map((note) => note[2]));
  const high = Math.max(...excerpt.notes.map((note) => note[2]));

  function stop() {
    cancelAnimationFrame(frame.current);
    const context = audio.current;
    audio.current = undefined;
    if (context) void context.close();
    setPosition(null);
  }

  useEffect(
    () => () => {
      cancelAnimationFrame(frame.current);
      if (audio.current) void audio.current.close();
    },
    [],
  );

  async function toggle() {
    if (audio.current) {
      stop();
      return;
    }

    const context = new AudioContext();
    audio.current = context;
    setPosition(0);
    try {
      await context.resume();
    } catch {
      if (audio.current === context) stop();
      return;
    }
    if (audio.current !== context) return;

    const startTime = context.currentTime + 0.03;
    for (const [start, end, note] of excerpt.notes) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const onset = startTime + start;
      const release = startTime + end;
      oscillator.type = "triangle";
      oscillator.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
      gain.gain.setValueAtTime(0.001, onset);
      gain.gain.linearRampToValueAtTime(0.13, Math.min(onset + 0.012, release));
      gain.gain.exponentialRampToValueAtTime(0.001, release + 0.035);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(onset);
      oscillator.stop(release + 0.036);
    }
    const update = () => {
      const elapsed = context.currentTime - startTime;
      if (elapsed >= duration + 0.04) {
        stop();
      } else {
        setPosition(Math.max(0, elapsed));
        frame.current = requestAnimationFrame(update);
      }
    };
    update();
  }

  const percent = (time: number) => `${(time / duration) * 100}%`;
  const parallel =
    excerpt.regions.length > 1 &&
    excerpt.regions.every(({ tonic }) => tonic === excerpt.regions[0].tonic);

  return (
    <figure className="horo-excerpt">
      <div className="horo-roll" aria-hidden="true">
        {excerpt.measures.slice(0, -1).map((time, index) => (
          <div
            className="horo-barline"
            key={time}
            style={{ left: percent(time) }}
          >
            <span>{excerpt.measure + index}</span>
          </div>
        ))}
        {excerpt.notes.map(([start, end, note], index) => {
          const region = [...excerpt.regions]
            .reverse()
            .find(
              ({ measure }) =>
                start >= excerpt.measures[measure - excerpt.measure] - 0.001,
            );
          const degree = (note - (region?.pitchClass ?? 0) + 120) % 12;
          return (
            <span
              className="horo-note"
              key={index}
              style={{
                left: percent(start),
                width: percent(end - start),
                top: `${16 + ((high - note) / Math.max(high - low, 1)) * 73}%`,
                backgroundColor: pitchColor(degree),
              }}
            />
          );
        })}
        {position !== null && (
          <span
            className="horo-playhead"
            style={{ left: percent(Math.min(position, duration)) }}
          />
        )}
      </div>
      <figcaption>
        <button
          type="button"
          onClick={toggle}
          aria-label={position === null ? "Play excerpt" : "Stop excerpt"}
        >
          {position === null ? <Play /> : <Square />}
        </button>
        <span>
          Synth melody · mm. {excerpt.measure}–{excerpt.endMeasure}
        </span>
        <span>
          {excerpt.regions
            .map(({ tonic, scale }) =>
              parallel && scale ? `${tonic} ${scale}` : tonic,
            )
            .join(" → ")}
        </span>
      </figcaption>
    </figure>
  );
}
