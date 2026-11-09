import { useCallback, useEffect, useRef, useState } from "react";
import {
  playQanun,
  QANUN_NOTE_DURATION,
  QANUN_NOTE_SECONDS,
} from "../../../sampler/qanun";
import { useNotePlaybackClock } from "../notePlayback";
import {
  MaqamPlaybackEvent,
  maqamPlaybackSection,
  maqamPracticeEvents,
  registerMaqamNoteEvents,
} from "./maqamPlayback";
import { MaqamScale } from "./maqamScales";

export const useMaqamPreview = () => {
  const stop = useRef<(() => void) | null>(null);
  const clock = useNotePlaybackClock();
  const frame = useRef<number | null>(null);
  const [session, setSession] = useState<{
    section: [number, number];
    events: MaqamPlaybackEvent[];
  } | null>(null);
  const [active, setActive] = useState<{
    name: string;
    index: number;
    pitch: number;
  } | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const resetClock = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    clock.reset();
  };
  useEffect(
    () => () => {
      stop.current?.();
      resetClock();
    },
    [],
  );

  const registerNote = useCallback(
    (
      start: number,
      _end: number,
      update: (playing: boolean) => void,
      section?: readonly [number, number] | null,
    ) => {
      if (!session || !section || section[0] !== session.section[0]) {
        update(false);
        return () => {};
      }
      const index = Math.round((start - section[0]) / QANUN_NOTE_SECONDS);
      return registerMaqamNoteEvents(
        clock,
        session.events,
        index,
        section,
        update,
      );
    },
    [clock, session],
  );

  const playEvents = (maqam: MaqamScale, events: MaqamPlaybackEvent[]) => {
    setError(false);
    resetClock();
    const section = maqamPlaybackSection(maqam);
    setSession({ section, events });
    stop.current = playQanun(
      events,
      (index) =>
        setActive(
          index === null
            ? null
            : {
                name: maqam.name,
                index: events[index].index,
                pitch: events[index].midi - 60 - maqam.tonic,
              },
        ),
      () => setError(true),
      (getPositionSeconds) => {
        if (!getPositionSeconds) {
          resetClock();
          setPlaying(null);
          return;
        }
        setPlaying(maqam.name);
        const animate = () => {
          clock.advance(section[0] + getPositionSeconds());
          frame.current = requestAnimationFrame(animate);
        };
        animate();
      },
    );
  };
  const play = (
    maqam: MaqamScale,
    pitches = [...maqam.lower, ...maqam.jins],
    startIndex = 0,
  ) =>
    playEvents(
      maqam,
      pitches.map((pitch, index) => ({
        midi: 60 + maqam.tonic + pitch,
        index: startIndex + index,
        start: index * QANUN_NOTE_SECONDS,
        duration: QANUN_NOTE_DURATION,
      })),
    );
  return {
    active,
    playing,
    error,
    registerNote,
    play,
    practice: (maqam: MaqamScale) =>
      playEvents(maqam, maqamPracticeEvents(maqam)),
    practiceJins: (maqam: MaqamScale) =>
      playEvents(maqam, maqamPracticeEvents(maqam, true)),
    stop: () => stop.current?.(),
  };
};
