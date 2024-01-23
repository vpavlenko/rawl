import * as React from "react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnalysisGrid, Cursor, MeasureSelection } from "./AnalysisGrid";
import { ColorScheme, useColorScheme } from "./ColorScheme";
import { SecondsSpan, SetVoiceMask, secondsToX, xToSeconds } from "./Rawl";
import { Analysis, PitchClass } from "./analysis";
import { Note, NotesInVoices } from "./parseMidi";

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
  }

  return result;
};

const SPLIT_NOTE_HEIGHT = 7;

export const getModulations = (analysis: Analysis) =>
  [
    { measure: -1, tonic: analysis.tonic },
    ...Object.entries(analysis.modulations || []).map((entry) => ({
      measure: parseInt(entry[0], 10) - 1,
      tonic: entry[1],
    })),
  ].sort((a, b) => a.measure - b.measure);

const getTonic = (measure: number, analysis: Analysis): PitchClass => {
  const modulations = getModulations(analysis);
  let i = 0;
  while (i + 1 < modulations.length && modulations[i + 1].measure <= measure) {
    i++;
  }
  return modulations[i].tonic as PitchClass;
};

const getNoteMeasure = (note: Note, measures: number[] | null): number => {
  if (!measures) {
    return -1;
  }
  const noteMiddle = (note.span[0] + note.span[1]) / 2;
  return measures.findIndex((time) => time >= noteMiddle) - 1;
};

const getAverageMidiNumber = (notes: Note[]) =>
  notes.length > 0
    ? notes[0].isDrum
      ? 0
      : notes.reduce((sum, note) => sum + note.note.midiNumber, 0) /
        notes.length
    : Infinity;

export type SystemLayout = "merged" | "split";

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
  71: "😗",
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
    const { midiNumber } = note.note;
    min = Math.min(min, midiNumber);
    max = Math.max(max, midiNumber);
  }
  return [min, max];
};

const getMidiRangeWithMask = (
  notes: NotesInVoices,
  voiceMask: boolean[],
  span?: SecondsSpan,
): MidiRange => {
  let min = +Infinity;
  let max = -Infinity;
  for (let voice = 0; voice < notes.length; ++voice) {
    if (!voiceMask[voice]) {
      continue;
    }
    const voiceSpan = getMidiRange(notes[voice], span);
    min = Math.min(min, voiceSpan[0]);
    max = Math.max(max, voiceSpan[1]);
  }
  return [min, max];
};

const getNoteColor = (
  note: Note,
  analysis,
  measures: number[],
  colorScheme: ColorScheme,
): string =>
  `noteColor_${
    analysis.tonic === null
      ? "default"
      : (note.note.midiNumber -
          getTonic(getNoteMeasure(note, measures), analysis)) %
        12
  }_${colorScheme}`;

type MouseEventHanlder = (note: Note, altKey: boolean) => void;
export type MouseHandlers = {
  handleNoteClick: MouseEventHanlder | null;
  handleMouseEnter: MouseEventHanlder;
  handleMouseLeave: () => void;
  hoveredNote: Note | null;
  hoveredAltKey: boolean;
  systemClickHandler: (e: React.MouseEvent) => void;
};

const getNoteRectangles = (
  notes: Note[],
  voiceIndex: number, // -1 if it's a note highlight for notes under cursor. currently can't happen
  isActiveVoice: boolean,
  analysis: Analysis,
  midiNumberToY: (number: number) => number,
  noteHeight: number,
  measures: number[] = null,
  handleNoteClick: MouseEventHanlder,
  handleMouseEnter: MouseEventHanlder,
  handleMouseLeave: () => void,
  showVelocity = false,
  colorScheme: ColorScheme,
) => {
  return notes.map((note) => {
    const top = midiNumberToY(note.note.midiNumber);
    const left = secondsToX(note.span[0]);
    const color = note.isDrum
      ? "noteColor_drum"
      : getNoteColor(note, analysis, measures, colorScheme);
    const chordNote = note.isDrum
      ? GM_DRUM_KIT[note.note.midiNumber] || note.note.midiNumber
      : null;
    // TODO: make it only for isDrum
    const noteElement = chordNote ? (
      <span
        className="noteText"
        style={{
          fontSize: note.isDrum ? "10px" : `${Math.min(noteHeight + 2, 14)}px`,
          position: "relative",
          left: note.isDrum ? "-5px" : "0px",
          lineHeight: `${Math.min(noteHeight, 14)}px`,
          fontFamily: "Helvetica, sans-serif",
          fontWeight: note.isDrum ? 100 : 700,
          color: "white",
        }}
      >
        {chordNote}
      </span>
    ) : null;
    return (
      <div
        key={`nr_${note.id}`}
        className={color}
        style={{
          position: "absolute",
          height: `${noteHeight}px`,
          width: note.isDrum
            ? "0px"
            : secondsToX(note.span[1]) - secondsToX(note.span[0]),
          overflow: "visible",
          top,
          left,
          pointerEvents: voiceIndex === -1 ? "none" : "auto",
          cursor: handleNoteClick ? "pointer" : "default",
          zIndex: 10,
          // TODO: make it map onto the dynamic range of a song? of a track?
          opacity: isActiveVoice
            ? (showVelocity && note?.chipState?.on?.param2 / 127) || 1
            : 0.4,
          borderRadius: "5px",
          boxSizing: "border-box",
          display: "grid",
          placeItems: "center",
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (handleNoteClick) {
            handleNoteClick(note, e.altKey);
          }
        }}
        onMouseEnter={(e) => handleMouseEnter(note, e.altKey)}
        onMouseLeave={handleMouseLeave}
      >
        {noteElement}
      </div>
    );
  });
};

// TODO: add types
// TODO: maybe add React.memo
export const MergedSystemLayout = ({
  voiceMask,
  positionSeconds,
  analysis,
  notes,
  measuresAndBeats,
  measureSelection,
  showVelocity,
  registerSeekCallback,
  mouseHandlers,
}) => {
  const {
    handleNoteClick,
    handleMouseEnter,
    handleMouseLeave,
    hoveredNote,
    hoveredAltKey,
    systemClickHandler,
  } = mouseHandlers;

  const { colorScheme } = useColorScheme();

  // TODO: probably should exclude isDrum notes
  const midiRange = useMemo(() => getMidiRange(notes.flat()), [notes]);

  const [divHeight, setDivHeight] = useState(0);
  const divRef = useRef(null);
  useEffect(() => {
    const updateHeight = () => {
      if (divRef.current) {
        setDivHeight(divRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    new ResizeObserver(() => updateHeight()).observe(divRef.current);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  useEffect(() => {
    registerSeekCallback(
      (seekMs) => (divRef.current.scrollLeft = secondsToX(seekMs / 1000) - 100),
    );
  }, []);

  const noteHeight = divHeight / (midiRange[1] - midiRange[0] + 7);
  const midiNumberToY = useMemo(
    () => (midiNumber) =>
      divHeight - (midiNumber - midiRange[0] + 4) * noteHeight,
    [noteHeight],
  );

  const noteRectangles = useMemo(
    () =>
      notes.flatMap((voice, i) =>
        getNoteRectangles(
          voice,
          i,
          voiceMask[i],
          analysis,
          midiNumberToY,
          noteHeight,
          measuresAndBeats.measures,
          handleNoteClick,
          handleMouseEnter,
          handleMouseLeave,
          showVelocity,
          colorScheme,
        ),
      ),
    [
      notes,
      analysis,
      measuresAndBeats,
      noteHeight,
      voiceMask,
      hoveredNote,
      hoveredAltKey,
      showVelocity,
      colorScheme,
    ],
  );
  const phraseStarts = useMemo(
    () => getPhraseStarts(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  return (
    <div
      key="innerLeftPanel"
      ref={divRef}
      style={{
        margin: 0,
        padding: 0,
        position: "relative",
        overflowX: "scroll",
        overflowY: "hidden",
        width: "100%",
        height: "100%",
        backgroundColor: "black",
      }}
      onClick={systemClickHandler}
    >
      {noteRectangles}
      <Cursor style={{ left: secondsToX(positionSeconds) }} />
      <AnalysisGrid
        analysis={analysis}
        measuresAndBeats={measuresAndBeats}
        midiNumberToY={midiNumberToY}
        noteHeight={noteHeight}
        measureSelection={measureSelection}
        phraseStarts={phraseStarts}
        systemLayout={"merged"}
        midiRange={midiRange}
      />
    </div>
  );
};

const VoiceName: React.FC<{
  voiceName: string;
  voiceMask: boolean[];
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  scrollLeft: number;
}> = React.memo(
  ({ voiceName, voiceMask, setVoiceMask, voiceIndex, scrollLeft }) => {
    const isSingleActive =
      voiceMask[voiceIndex] && voiceMask.filter((voice) => voice).length === 1;

    const ref = useRef(null);
    const [top, setTop] = useState(0);

    const updatePosition = () => {
      if (ref.current) {
        const outerComponentRect =
          ref.current.parentElement.getBoundingClientRect();
        setTop(outerComponentRect.top + window.scrollY - 20);
      }
    };

    useEffect(updatePosition, [scrollLeft]);

    useEffect(() => {
      ref.current
        .closest(".SplitLayout")
        ?.addEventListener("scroll", updatePosition);

      return () => {
        ref.current
          .closest(".SplitLayout")
          ?.removeEventListener("scroll", updatePosition);
      };
    }, []);

    return (
      <span
        style={{
          position: "fixed",
          top,
          left: "2px",
          marginLeft: "2px",
          display: voiceName && top > 35 ? "block" : "none",
          fontFamily: "sans-serif",
          fontSize: "12px",
        }}
        ref={ref}
      >
        <span>
          {!isSingleActive && (
            <input
              title="active"
              type="checkbox"
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                e.stopPropagation();
                setVoiceMask(
                  voiceMask.map((value, i) =>
                    i === voiceIndex ? !value : value,
                  ),
                );
              }}
              checked={voiceMask[voiceIndex]}
              style={{ marginRight: 10 }}
            />
          )}
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
  },
);

export const Voice: React.FC<{
  notes: NotesInVoices;
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  showVelocity: boolean;
  cursor: ReactNode;
  phraseStarts: number[];
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  showHeader: boolean;
  scrollLeft: number;
  scrollRight: number;
  voiceName: string;
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  voiceMask: boolean[];
  showTonalGrid?: boolean;
}> = ({
  notes,
  measuresAndBeats,
  analysis,
  mouseHandlers,
  measureSelection,
  showVelocity,
  cursor,
  phraseStarts,
  showHeader = true,
  scrollLeft = -1,
  scrollRight = -1,
  voiceName,
  voiceIndex = -1,
  setVoiceMask = (mask) => {},
  voiceMask,
  showTonalGrid = true,
}) => {
  const { colorScheme } = useColorScheme();

  const midiRange = useMemo(
    () =>
      getMidiRangeWithMask(notes, SPLIT_VOICE_MASK, [
        xToSeconds(scrollLeft),
        xToSeconds(scrollRight),
      ]),
    [notes, scrollLeft, scrollRight],
  );

  const { systemClickHandler, handleNoteClick, handleMouseEnter } =
    mouseHandlers;

  const height =
    (midiRange[0] === +Infinity ? 1 : midiRange[1] - midiRange[0] + 1) *
      SPLIT_NOTE_HEIGHT +
    (showHeader ? 20 : 0);

  const midiNumberToY = useCallback(
    (midiNumber) =>
      height - (midiNumber - midiRange[0] + 1) * SPLIT_NOTE_HEIGHT,
    [height, midiRange],
  );

  const { noteRectangles, frozenHeight, frozenMidiRange } = useMemo(
    () => ({
      noteRectangles: notes.flatMap((notesInOneVoice, voice) =>
        getNoteRectangles(
          notesInOneVoice,
          voice,
          voiceMask[voiceIndex],
          analysis,
          midiNumberToY,
          SPLIT_NOTE_HEIGHT,
          measuresAndBeats.measures,
          handleNoteClick,
          handleMouseEnter,
          () => {},
          showVelocity,
          colorScheme,
        ),
      ),
      frozenHeight: height,
      frozenMidiRange: midiRange,
    }),
    [
      notes,
      measuresAndBeats,
      analysis,
      showVelocity,
      handleMouseEnter,
      voiceMask,
      scrollLeft,
      colorScheme,
    ],
  );

  const hasVisibleNotes = midiRange[1] >= midiRange[0];

  return (
    <div
      key={`voice_${voiceIndex}_${measuresAndBeats.measures.at(-1)}_parent`}
      style={{
        width: secondsToX(
          Math.max(
            measuresAndBeats.measures.at(-1),
            measuresAndBeats.beats.at(-1),
          ),
        ),
        height: hasVisibleNotes ? height : 1,
        position: "relative",
        marginTop: hasVisibleNotes ? "35px" : 0,
        marginBottom: hasVisibleNotes ? "0px" : 0,
        marginLeft: "0px",
        borderBottom: hasVisibleNotes ? "1px solid #888" : "",
      }}
      onClick={(e) => systemClickHandler(e)}
    >
      <div
        style={{
          position: "relative",
          top:
            height -
            frozenHeight +
            (midiRange[0] - frozenMidiRange[0]) * SPLIT_NOTE_HEIGHT,
        }}
      >
        {noteRectangles}
      </div>
      {hasVisibleNotes ? (
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={SPLIT_NOTE_HEIGHT}
          measureSelection={measureSelection}
          phraseStarts={phraseStarts}
          systemLayout={"split"}
          midiRange={midiRange}
          showHeader={showHeader}
          showTonalGrid={showTonalGrid && !notes?.[0]?.[0].isDrum}
        />
      ) : null}
      {cursor}
      {hasVisibleNotes ? (
        <VoiceName
          voiceName={voiceName}
          voiceMask={voiceMask}
          setVoiceMask={setVoiceMask}
          voiceIndex={voiceIndex}
          scrollLeft={scrollLeft}
        />
      ) : null}
    </div>
  );
};

const SPLIT_VOICE_MASK = [true];

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

export const SplitSystemLayout: React.FC<{
  notes: NotesInVoices;
  voiceNames: string[];
  voiceMask: boolean[];
  measuresAndBeats: MeasuresAndBeats;
  showVelocity: boolean;
  positionSeconds: number;
  analysis: Analysis;
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  setVoiceMask: SetVoiceMask;
}> = ({
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
          notes: [notes[voiceIndex]],
        })),
    [notes],
  );

  const phraseStarts = useMemo(
    () => getPhraseStarts(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  // If scroll changed and debounced, we need to calculate which voices have
  // any visible notes and hides those who don't.

  const parentRef = useRef(null);

  const [scrollInfo, setScrollInfo] = useState({ left: 0, right: 100000 });

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
    }

    return () => {
      if (parentDiv) {
        parentDiv.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
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
      <div>
        {voicesSortedByAverageMidiNumber.map(({ voiceIndex, notes }, order) => (
          <Voice
            key={voiceIndex}
            voiceName={voiceNames[voiceIndex]}
            notes={notes}
            measuresAndBeats={measuresAndBeats}
            analysis={analysis}
            mouseHandlers={mouseHandlers}
            measureSelection={measureSelection}
            showVelocity={showVelocity}
            showHeader={order === voicesSortedByAverageMidiNumber.length - 1}
            cursor={
              <Cursor
                style={{
                  transition:
                    Math.abs(prevPositionSeconds.current - positionSeconds) < 1
                      ? "left 0.4s linear"
                      : "",
                  left: secondsToX(positionSeconds),
                }}
              />
            }
            phraseStarts={phraseStarts}
            scrollLeft={scrollInfo.left}
            scrollRight={scrollInfo.right}
            voiceMask={voiceMask}
            setVoiceMask={setVoiceMask}
            voiceIndex={voiceIndex}
          />
        ))}
      </div>
    </div>
  );
};
