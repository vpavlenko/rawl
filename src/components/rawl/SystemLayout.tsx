import * as React from "react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import { DUMMY_CALLBACK, VoiceMask } from "../App";
import { AnalysisGrid, Cursor, MeasureSelection } from "./AnalysisGrid";
import ChordStairs, { MODES } from "./ChordStairs";
import { InlinePianoLegend, PianoLegend } from "./PianoLegend";
import { SecondsConverter, SecondsSpan, SetVoiceMask } from "./Rawl";
import { Analysis, MeasuresSpan } from "./analysis";
import {
  ColoredNote,
  ColoredNotesInVoices,
  Note,
  PitchBendPoint,
} from "./parseMidi";

export type MeasuresAndBeats = {
  measures: number[];
  beats: number[];
};

export const getPhraseStarts = (
  analysis: Analysis,
  numMeasures: number,
): number[] => {
  const result = [];
  let i;
  for (i = 1; i < numMeasures; i += 4) {
    result.push(i);
  }
  result.push(i);
  for (const { measure, diff } of analysis.phrasePatch || []) {
    if (result.indexOf(measure) === -1) {
      alert(`bad phrasePatch, measure ${measure} not found`);
      break;
    }
    for (let j = result.indexOf(measure); j < result.length; ++j) {
      result[j] += diff;
    }
    while (result.at(-1) + 4 < numMeasures) {
      result.push(result.at(-1) + 4);
    }
    if (result[0] !== 1) {
      result.unshift(1);
    }
  }

  return result;
};

const getAverageMidiNumber = (notes: Note[]) =>
  notes.length > 0
    ? notes[0].isDrum
      ? 0
      : notes.reduce((sum, note) => sum + note.note.midiNumber, 0) /
        notes.length
    : Infinity;

// TODO: rename "stacked" to "split" - semantically
export type SystemLayout = "merged" | "stacked";

export type MidiRange = [number, number];

// 🤯 🎯 🪤 💣 🔫 💢

// https://www.stevenestrella.com/midi/gmdrums.gif
const GM_DRUM_KIT = {
  28: "🤜",
  31: "🕒", //"Metronome Click",
  35: "🦵", //"Acoustic Bass Drum",
  36: "🦶🏼", //"Bass Drum 1",
  37: "🏑", //"Side Stick",
  38: "🥁", //"Acoustic Snare",
  39: "👏", //"Hand Clap",
  40: "⚡", //"Electric Snare",
  41: "0️⃣", //"Low Floor Tom",
  42: "🔒", // "Closed Hi Hat",
  43: "1️⃣", //"High Floor Tom",
  44: "🚴‍♀️", //"Pedal Hi-Hat",
  45: "2️⃣", //"Low Tom",
  46: "💿", //"Open Hi-Hat",
  47: "3️⃣", // "Low-Mid Tom",
  48: "4️⃣", //"Hi-Mid Tom",
  49: "💥", //"Crash Cymbal 1",
  50: "5️⃣", //"High Tom",
  51: "🚗", //"Ride Cymbal 1",
  52: "🇨🇳", //"Chinese Cymbal",
  53: "🛎️", //"Ride Bell",
  54: "⏰", //"Tambourine",
  55: "💦", //"Splash Cymbal",
  56: "🐄",
  57: "🔥", //"Crash Cymbal 2",
  58: "📳",
  59: "🚙", //"Ride Cymbal 2",
  60: "🔼",
  61: "🔽",
  62: "🕺",
  63: "💃",
  64: "🪘",
  65: "⬆️",
  66: "⬇️",
  67: "🗼",
  68: "🍦",
  69: "🍡",
  70: "🎉",
  71: "🐦",
  72: "💨",
  73: "#️⃣",
  74: "📶",
  75: "🔑",
  76: "🪵",
  77: "🌳",
  78: "🐭",
  79: "🇧🇷",
  80: "⨻",
  81: "△",
  82: "⚱️", //'Shaker',
  83: "🎅🏻", //"Jingle Bell",
  84: "🚿",
  85: "🌰",
  86: "🍺",
  87: "🛢️",
};

const getMidiRange = (notes: Note[], span?: SecondsSpan): MidiRange => {
  let min = +Infinity;
  let max = -Infinity;
  for (const note of notes) {
    if (span && (note.span[1] < span[0] || note.span[0] > span[1])) {
      continue;
    }
    const { midiNumber, relativeNumber } = note.note;
    const number = relativeNumber === undefined ? midiNumber : relativeNumber;
    min = Math.min(min, number);
    max = Math.max(max, number);
  }
  return [min, max];
};

type MouseEventHanlder = (note: Note) => void;
export type MouseHandlers = {
  handleNoteClick: MouseEventHanlder | null;
  handleMouseEnter: MouseEventHanlder;
  handleMouseLeave: () => void;
  hoveredNote: Note | null;
  systemClickHandler: (
    e: React.MouseEvent,
    xToSeconds?: (number) => number,
  ) => void;
};

const convertPitchBendToPathData = (
  pitchBendData: PitchBendPoint[],
  span: SecondsSpan,
  noteHeight: number,
  secondsToX: SecondsConverter,
): string => {
  const pitchBendRange = 8192;
  const noteDuration = span[1] - span[0];
  const noteStartX = secondsToX(span[0]);

  const pitchBendToY = (value) => {
    const normalizedValue = (value + pitchBendRange) / (2 * pitchBendRange); // Normalize to 0-1
    return noteHeight * (1 - normalizedValue) * 4 + noteHeight / 2; // Invert because SVG's Y increases downwards
  };

  // Map a time value to the SVG's X coordinate, relative to the note's duration
  const timeToX = (time) => {
    const relativeTime = time - span[0]; // Time relative to the note's start
    const normalizedTime = relativeTime / noteDuration; // Normalize to 0-1
    return normalizedTime * (secondsToX(span[1]) - noteStartX); // Scale to note's width
  };

  // Start the path data string at the first pitch bend point
  let pathData = `M ${timeToX(pitchBendData[0].time)} ${pitchBendToY(
    pitchBendData[0].value,
  )}`;

  // Add line segments to each subsequent pitch bend point
  pitchBendData.forEach((point, index) => {
    if (index > 0) {
      // Skip the first point as it's already used in 'M'
      pathData += ` L ${timeToX(point.time)} ${pitchBendToY(point.value)}`;
    }
  });

  return pathData;
};

const getNoteRectangles = (
  notes: ColoredNote[],
  midiNumberToY: (number: number) => number,
  noteHeight: number,
  handleNoteClick: MouseEventHanlder,
  handleMouseEnter: MouseEventHanlder,
  handleMouseLeave: () => void,
  showVelocity = false,
  secondsToX: SecondsConverter,
) => {
  return notes.map((note) => {
    const {
      isDrum,
      note: { midiNumber, relativeNumber },
      color,
      voiceIndex,
      isActive,
    } = note;
    const number = relativeNumber === undefined ? midiNumber : relativeNumber;
    const top = midiNumberToY(number) - noteHeight;
    const left = secondsToX(note.span[0]);
    const drumEmoji = isDrum ? GM_DRUM_KIT[midiNumber] || midiNumber : null;
    const noteElement = drumEmoji ? (
      <span
        className="noteText"
        style={{
          fontSize: isDrum
            ? 4 +
              (noteHeight - 5) * 0.4 +
              (secondsToX(1) - secondsToX(0)) * 0.15
            : `${Math.min(noteHeight + 2, 14)}px`,
          position: "relative",
          left: isDrum ? "-5px" : "0px",
          lineHeight: `${Math.min(noteHeight, 14)}px`,
          fontFamily: "Helvetica, sans-serif",
          fontWeight: isDrum ? 100 : 700,
          color: "white",
        }}
      >
        {drumEmoji}
      </span>
    ) : (
      <span
        style={{
          fontSize: 0,
          textShadow: "0px 0px 2px black",
          top: 8,
          left: voiceIndex,
          position: "relative",
        }}
      >
        {voiceIndex}
      </span>
    );
    const pathData = note.chipState.on.pitchBend
      ? convertPitchBendToPathData(
          note.chipState.on.pitchBend,
          note.span,
          noteHeight,
          secondsToX,
        )
      : null;
    const width = secondsToX(note.span[1]) - secondsToX(note.span[0]);

    return (
      <div
        key={`nr_${note.id}`}
        className={`${color} voiceShape-${voiceIndex}`}
        style={{
          position: "absolute",
          height: `${isActive ? noteHeight * 2 : 1}px`,
          width: isDrum ? "0px" : width,
          overflow: "visible",
          top: isActive ? top : top + noteHeight * 2 - 1,
          left,
          pointerEvents: "auto",
          cursor: handleNoteClick && !isDrum ? "pointer" : "default",
          zIndex: Math.round(10 + 1000 / width),
          // opacity: (showVelocity && note?.chipState?.on?.param2 / 127) || 1,
          // opacity: isActive ? 1 : 0.3,
          // borderRadius: "4px",
          boxSizing: "border-box",
          display: "grid",
          placeItems: drumEmoji ? "center" : "",
          boxShadow: "0 0 0px 0.5px black",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (handleNoteClick && !isDrum) {
            handleNoteClick(note);
          }
        }}
        onMouseEnter={(e) => !isDrum && handleMouseEnter(note)}
        onMouseLeave={() => !isDrum && handleMouseLeave()}
      >
        {pathData && (
          <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                overflow: "visible",
              }}
            >
              <path d={pathData} stroke="white" strokeWidth="4" fill="none" />
              <path d={pathData} stroke="black" strokeWidth="2" fill="none" />
            </svg>
          </div>
        )}
        {noteElement}
      </div>
    );
  });
};

type ScrollInfo = {
  left: number;
  right: number;
};

const VoiceName: React.FC<{
  voiceName: string;
  voiceMask: VoiceMask;
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  scrollInfo: ScrollInfo;
  secondsToX: SecondsConverter;
  midiNumberToY: (number) => number;
}> = ({
  voiceName,
  voiceMask,
  setVoiceMask,
  voiceIndex,
  scrollInfo,
  secondsToX,
  midiNumberToY,
}) => {
  const isSingleActive =
    voiceMask[voiceIndex] && voiceMask.filter((voice) => voice).length === 1;

  const ref = useRef(null);
  const [top, setTop] = useState(0);

  const updatePosition = () => {
    if (ref.current) {
      const outerComponentRect =
        ref.current.parentElement.getBoundingClientRect();
      setTop(outerComponentRect.top + window.scrollY - 5);
    }
  };

  useEffect(updatePosition, [scrollInfo, secondsToX, midiNumberToY]);

  useEffect(() => {
    ref.current
      .closest(".SplitLayout")
      ?.addEventListener("scroll", updatePosition);

    ref.current.closest(".Rawl")?.addEventListener("scroll", updatePosition);

    return () => {
      ref.current
        .closest(".SplitLayout")
        ?.removeEventListener("scroll", updatePosition);
      ref.current
        .closest(".Rawl")
        ?.removeEventListener("scroll", updatePosition);
    };
  }, []);

  return (
    <span
      style={{
        position: "fixed",
        top,
        left: 2,
        marginLeft: 2,
        marginTop: 7,
        fontFamily: "sans-serif",
        fontSize: 12,
        textShadow: "0 0 1px black, 0 0 3px black, 0 0 6px black",
        userSelect: "none",
        zIndex: 100,
      }}
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <span>
        <button
          style={{
            cursor: "pointer",
            userSelect: "none",
            fontFamily: "sans-serif",
            fontSize: 12,
          }}
          onClick={(e) => {
            e.stopPropagation();
            isSingleActive
              ? setVoiceMask(voiceMask.map(() => true))
              : setVoiceMask(voiceMask.map((_, i) => i === voiceIndex));
          }}
        >
          {isSingleActive ? "Unsolo All" : "Solo"}
        </button>

        <input
          title="active"
          type="checkbox"
          onChange={(e) => {
            e.stopPropagation();
            setVoiceMask(
              voiceMask.map((value, i) => (i === voiceIndex ? !value : value)),
            );
          }}
          checked={voiceMask[voiceIndex]}
          style={{
            margin: "0px 0px 0px 17px",
            height: 11,
            display: isSingleActive ? "none" : "inline",
          }}
        />
      </span>
      <span
        style={{
          color: voiceMask[voiceIndex] ? "white" : "#444",
          marginLeft: "10px",
          zIndex: 100,
        }}
      >
        {voiceName}
      </span>
    </span>
  );
};

const MeasureNumbers = ({
  measuresAndBeats,
  analysis,
  phraseStarts,
  measureSelection,
  noteHeight,
  secondsToX,
  sectionSpan,
}: {
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  phraseStarts: number[];
  measureSelection: MeasureSelection;
  noteHeight: number;
  secondsToX: SecondsConverter;
  sectionSpan?: MeasuresSpan;
}) => (
  <div
    key="measure_header"
    style={{
      width:
        secondsToX(
          Math.max(
            measuresAndBeats.measures.at(-1),
            measuresAndBeats.beats.at(-1),
          ),
        ) + 300,
      height: 16,
      marginBottom: "-14px",
      marginLeft: "0px",
      zIndex: 10000,
      position: sectionSpan ? "relative" : "sticky",
      top: 0,
    }}
  >
    <AnalysisGrid
      analysis={analysis}
      measuresAndBeats={measuresAndBeats}
      midiNumberToY={() => 0}
      noteHeight={noteHeight}
      measureSelection={measureSelection}
      phraseStarts={phraseStarts}
      midiRange={[0, 0]}
      showHeader={true}
      showTonalGrid={false}
      secondsToX={secondsToX}
      sectionSpan={sectionSpan}
    />
  </div>
);

export const Voice: React.FC<{
  notes: ColoredNote[];
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  showVelocity: boolean;
  cursor: ReactNode;
  phraseStarts: number[];
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  scrollInfo: ScrollInfo;
  voiceName: string;
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  voiceMask: VoiceMask;
  showTonalGrid?: boolean;
  noteHeight: number;
  secondsToX: SecondsConverter;
  xToSeconds: SecondsConverter;
  sectionSpan?: MeasuresSpan;
}> = ({
  notes,
  measuresAndBeats,
  analysis,
  mouseHandlers,
  measureSelection,
  showVelocity,
  cursor,
  phraseStarts,
  scrollInfo,
  voiceName,
  voiceIndex = -1,
  setVoiceMask = (mask) => {},
  voiceMask,
  showTonalGrid = true,
  noteHeight,
  secondsToX,
  xToSeconds,
  sectionSpan,
}) => {
  // To restore it, we need to lock the calculation of frozenRange and frozenHeight
  // and don't change it after loading the notes.

  const localMidiRange = useMemo(
    () =>
      getMidiRange(notes, [
        xToSeconds(scrollInfo.left),
        xToSeconds(scrollInfo.right),
      ]),
    [notes, scrollInfo, xToSeconds],
  );
  const midiRange = useMemo(() => getMidiRange(notes), [notes]);

  const { systemClickHandler, handleNoteClick, handleMouseEnter } =
    mouseHandlers;

  const height =
    (midiRange[0] === +Infinity ? 0 : midiRange[1] - midiRange[0] + 1) *
    noteHeight;

  const midiNumberToY = useCallback(
    (midiNumber) => height - (midiNumber - midiRange[0] + 1) * noteHeight,
    [height, midiRange, noteHeight],
  );

  // The frozenHeight machinery was used when I experimented with smart
  // collapse/expand of every Voice relative to its current range on a current screen.
  // I'm not sure it's used anymore.
  const { noteRectangles, frozenHeight, frozenMidiRange } = useMemo(
    () => ({
      noteRectangles: getNoteRectangles(
        notes,
        midiNumberToY,
        noteHeight,
        handleNoteClick,
        handleMouseEnter,
        DUMMY_CALLBACK,
        showVelocity,
        secondsToX,
      ),
      frozenHeight: height,
      frozenMidiRange: midiRange,
    }),
    [
      notes,
      analysis,
      showVelocity,
      handleNoteClick,
      handleMouseEnter,
      voiceMask,
      noteHeight,
      secondsToX,
    ],
  );

  const { measures } = measuresAndBeats;
  // TODO: make smarter once Stacked is implemented
  const hasVisibleNotes =
    voiceMask[voiceIndex] &&
    (!!sectionSpan || localMidiRange[1] >= localMidiRange[0]);

  return (
    <div
      key={`voice_${voiceIndex}_${measuresAndBeats.measures.at(-1)}_parent`}
      style={{
        width: secondsToX(measures[sectionSpan?.[1] ?? measures.length - 1]),
        height: hasVisibleNotes ? height : 1,
        position: "relative",
        marginTop: hasVisibleNotes ? "15px" : 0,
        marginBottom: hasVisibleNotes ? "0px" : 0,
        marginLeft: "0px",
        // borderBottom: hasVisibleNotes ? "1px solid #888" : "",
        zIndex: 1,
        backgroundColor: "black",
      }}
      onClick={(e) => systemClickHandler(e, xToSeconds)}
    >
      <div
        style={{
          position: "relative",
          top:
            height -
            frozenHeight +
            (midiRange[0] - frozenMidiRange[0]) * noteHeight,
        }}
      >
        {voiceMask[voiceIndex] ? noteRectangles : null}
      </div>
      {hasVisibleNotes ? (
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={noteHeight}
          measureSelection={measureSelection}
          phraseStarts={phraseStarts}
          midiRange={midiRange}
          showHeader={false}
          showTonalGrid={showTonalGrid && !notes[0]?.isDrum}
          secondsToX={secondsToX}
          sectionSpan={sectionSpan}
        />
      ) : null}
      {cursor}
      {hasVisibleNotes &&
      voiceMask.length > 1 &&
      (sectionSpan?.[0] ?? 0) === 0 &&
      voiceName ? (
        <VoiceName
          voiceName={voiceName}
          voiceMask={voiceMask}
          setVoiceMask={setVoiceMask}
          voiceIndex={voiceIndex}
          scrollInfo={scrollInfo}
          secondsToX={secondsToX}
          midiNumberToY={midiNumberToY}
        />
      ) : null}
    </div>
  );
};

const debounce = (func, delay) => {
  let timer;
  let frameId;

  return (...args) => {
    clearTimeout(timer);
    cancelAnimationFrame(frameId);

    timer = setTimeout(() => {
      frameId = requestAnimationFrame(() => {
        func.apply(this, args);
      });
    }, delay);
  };
};

type Section = {
  sectionSpan: MeasuresSpan;
  secondsToX: SecondsConverter;
  xToSeconds: SecondsConverter;
  voices: { voiceIndex: number; notes: ColoredNote[] }[];
};

const FoldButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px 15px;
`;

export type SystemLayoutProps = {
  notes: ColoredNotesInVoices;
  voiceNames: string[];
  voiceMask: VoiceMask;
  measuresAndBeats: MeasuresAndBeats;
  showVelocity: boolean;
  positionSeconds: number;
  analysis: Analysis;
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  setVoiceMask: SetVoiceMask;
};

export const StackedSystemLayout: React.FC<SystemLayoutProps> = ({
  notes,
  voiceNames,
  voiceMask,
  measuresAndBeats,
  showVelocity,
  positionSeconds,
  analysis,
  mouseHandlers,
  measureSelection,
  setVoiceMask,
}) => {
  const [noteHeight, setNoteHeight] = useState<number>(4);
  const debounceSetNoteHeight = useCallback(debounce(setNoteHeight, 50), []);
  const [secondWidth, setSecondWidth] = useState<number>(45);
  const debounceSetSecondWidth = useCallback(debounce(setSecondWidth, 50), []);

  const prevPositionSeconds = useRef<number>(0);
  useEffect(() => {
    prevPositionSeconds.current = positionSeconds;
  }, [positionSeconds]);

  const voicesSortedByAverageMidiNumber = useMemo(
    () =>
      notes
        .map((voice, voiceIndex) => ({
          average: getAverageMidiNumber(voice),
          voiceIndex,
        }))
        .sort((a, b) => b.average - a.average)
        .map(({ voiceIndex }) => ({
          voiceIndex,
          notes: notes[voiceIndex],
        })),
    [notes],
  );

  // TODO: make sure the very last measure is also a phrase start
  const phraseStarts = useMemo(
    () => getPhraseStarts(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  const sections: Section[] = useMemo(
    () =>
      (analysis.sections ?? [0]).map((sectionStartInPhrases, index) => {
        const { measures } = measuresAndBeats;
        const start = phraseStarts[sectionStartInPhrases] - 1;
        const end =
          (index + 1 < (analysis.sections ?? [0]).length
            ? phraseStarts[(analysis.sections ?? [0])[index + 1]]
            : measures.length) - 1;

        const secondsToX = (seconds) =>
          (seconds - measures[start]) * secondWidth;
        const xToSeconds = (x) => x / secondWidth + measures[start];
        return {
          sectionSpan: [start, end],
          secondsToX,
          xToSeconds,
          voices: voicesSortedByAverageMidiNumber.map(
            ({ voiceIndex, notes }) => ({
              voiceIndex,
              notes: notes.filter(
                (note) =>
                  note.span[1] >= measures[start] &&
                  note.span[0] + 1e-3 < measures[end],
              ),
            }),
          ),
        };
      }),
    [
      voicesSortedByAverageMidiNumber,
      phraseStarts,
      measuresAndBeats,
      secondWidth,
      analysis.sections,
    ],
  );

  const parentRef = useRef(null);

  const [scrollInfo, setScrollInfo] = useState<ScrollInfo>({
    left: -1,
    right: 100000,
  });

  const debouncedScroll = useCallback(
    debounce(
      (left, right) =>
        setScrollInfo({
          left,
          right,
        }),
      50,
    ),
    [],
  );

  const handleScroll = () => {
    const { scrollLeft, offsetWidth } = parentRef.current;
    const scrollRight = scrollLeft + offsetWidth;

    debouncedScroll(scrollLeft, scrollRight);
  };

  useEffect(() => {
    const parentDiv = parentRef.current;
    if (parentDiv) {
      parentDiv.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (parentDiv) {
        parentDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const [showLegend, setShowLegend] = useLocalStorage("showLegend", true);

  return (
    <>
      <div
        key="innerLeftPanel"
        style={{
          margin: 0,
          padding: 0,
          position: "relative",
          overflowX: "scroll",
          overflowY: "scroll",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        }}
        ref={parentRef}
        className="SplitLayout"
      >
        <div
          style={{
            position: "fixed",
            bottom: 243,
            right: -93,
            zIndex: 10000,
          }}
        >
          <input
            type="range"
            min="1"
            max="10"
            value={noteHeight}
            onChange={(e) =>
              debounceSetNoteHeight(parseInt(e.target.value, 10))
            }
            style={{
              transform: "rotate(90deg)",
              transformOrigin: "bottom left",
              width: 160,
            }}
          />
        </div>
        <div
          style={{
            position: "fixed",
            bottom: 70,
            right: 79,
            zIndex: 10000,
          }}
        >
          <input
            type="range"
            min="2"
            max="150"
            value={secondWidth}
            onChange={(e) =>
              debounceSetSecondWidth(parseInt(e.target.value, 10))
            }
            style={{
              width: 240,
            }}
          />
        </div>

        {sections.map(
          ({ sectionSpan, secondsToX, xToSeconds, voices }, order) => (
            <div style={{ marginTop: 40 }} key={order}>
              <MeasureNumbers
                measuresAndBeats={measuresAndBeats}
                analysis={analysis}
                phraseStarts={phraseStarts}
                measureSelection={measureSelection}
                noteHeight={noteHeight}
                secondsToX={secondsToX}
                sectionSpan={sectionSpan}
              />
              {voices.map(({ notes, voiceIndex }) => (
                <div
                  key={voiceIndex}
                  style={{ display: "flex", flexDirection: "row" }}
                >
                  <Voice
                    voiceName={voiceNames[voiceIndex]}
                    notes={notes}
                    measuresAndBeats={measuresAndBeats}
                    analysis={analysis}
                    mouseHandlers={mouseHandlers}
                    measureSelection={measureSelection}
                    showVelocity={showVelocity}
                    cursor={
                      positionSeconds <
                        measuresAndBeats.measures[sectionSpan[1]] && (
                        <Cursor
                          key={"cursor"}
                          style={{
                            transition:
                              Math.abs(
                                prevPositionSeconds.current - positionSeconds,
                              ) < 1
                                ? "left 0.74s linear"
                                : "",
                            left: secondsToX(positionSeconds),
                          }}
                        />
                      )
                    }
                    phraseStarts={phraseStarts}
                    scrollInfo={scrollInfo}
                    voiceMask={voiceMask}
                    setVoiceMask={setVoiceMask}
                    voiceIndex={voiceIndex}
                    noteHeight={noteHeight}
                    secondsToX={secondsToX}
                    xToSeconds={xToSeconds}
                    sectionSpan={sectionSpan}
                  />
                </div>
              ))}
            </div>
          ),
        )}

        <div style={{ height: 600 }}></div>

        <div
          key="piano-legend"
          style={{ position: "fixed", bottom: 90, right: 70, zIndex: 10000 }}
        >
          {showLegend ? (
            <div>
              <FoldButton onClick={() => setShowLegend(false)}>X</FoldButton>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 90,
                  backgroundColor: "black",
                  padding: 10,
                  border: "1px solid #666",
                  zIndex: 100000,
                }}
              >
                <ChordStairs mode={MODES[1]} />
                <ChordStairs mode={MODES[0]} />
                <ChordStairs mode={MODES[2]} />
                <div
                  style={{ margin: "auto" }}
                  onClick={() => setShowLegend(false)}
                >
                  <PianoLegend />
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowLegend(true)}
              style={{ background: "none" }}
            >
              <InlinePianoLegend />
            </button>
          )}
        </div>
      </div>
    </>
  );
};

const MERGED_VOICE_NAMES = ["merged"];
const MERGED_VOICE_MASK = [true];

export const MergedSystemLayout: React.FC<SystemLayoutProps> = (props) => {
  const { notes, voiceNames, voiceMask, setVoiceMask } = props;

  const flattenedNotes = useMemo(() => [notes.flat()], [notes]);
  const isSingleActive = voiceMask.filter((voice) => voice).length === 1;

  return (
    <div style={{ position: "relative" }}>
      <StackedSystemLayout
        {...props}
        notes={flattenedNotes}
        voiceNames={MERGED_VOICE_NAMES}
        voiceMask={MERGED_VOICE_MASK}
      />
      <div style={{ position: "fixed", top: 50, right: 100 }}>
        {voiceNames.map((voiceName, voiceIndex) => (
          <div>
            <input
              title="active"
              type="checkbox"
              onChange={(e) => {
                e.stopPropagation();
                setVoiceMask(
                  voiceMask.map((value, i) =>
                    i === voiceIndex ? !value : value,
                  ),
                );
              }}
              checked={voiceMask[voiceIndex]}
              style={{
                margin: "0px 0px 0px 17px",
                height: 11,
                display: "inline",
              }}
            />{" "}
            <span
              className={`voiceShape-${voiceIndex}`}
              style={{
                display: "inline-block",
                backgroundColor: "white",
                height: 8,
                width: 20,
              }}
            />{" "}
            {voiceName}
            <button
              style={{
                cursor: "pointer",
                userSelect: "none",
                fontFamily: "sans-serif",
                fontSize: 12,
              }}
              onClick={(e) => {
                e.stopPropagation();
                isSingleActive
                  ? setVoiceMask(voiceMask.map(() => true))
                  : setVoiceMask(voiceMask.map((_, i) => i === voiceIndex));
              }}
            >
              {isSingleActive ? "Unsolo All" : "Solo"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
