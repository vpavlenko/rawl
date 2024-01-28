import * as React from "react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FullScreen } from "react-full-screen";
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

const getNoteColor = (
  note: Note,
  analysis: Analysis,
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
  voiceIndex: number,
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
    const {
      isDrum,
      note: { midiNumber, relativeNumber },
    } = note;
    const number = relativeNumber === undefined ? midiNumber : relativeNumber;
    const top = midiNumberToY(number);
    const left = secondsToX(note.span[0]);
    const color = isDrum
      ? "noteColor_drum"
      : getNoteColor(note, analysis, measures, colorScheme);
    const drumEmoji = isDrum ? GM_DRUM_KIT[midiNumber] || midiNumber : null;
    const noteElement = drumEmoji ? (
      <span
        className="noteText"
        style={{
          fontSize: isDrum ? "10px" : `${Math.min(noteHeight + 2, 14)}px`,
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
    ) : null;
    return (
      <div
        key={`nr_${note.id}`}
        className={color}
        style={{
          position: "absolute",
          height: `${noteHeight}px`,
          width: isDrum
            ? "0px"
            : secondsToX(note.span[1]) - secondsToX(note.span[0]),
          overflow: "visible",
          top,
          left,
          pointerEvents: voiceIndex === -1 ? "none" : "auto",
          cursor: handleNoteClick && !isDrum ? "pointer" : "default",
          zIndex: 10,
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
          if (handleNoteClick && !isDrum) {
            handleNoteClick(note, e.altKey);
          }
        }}
        onMouseEnter={(e) => !isDrum && handleMouseEnter(note, e.altKey)}
        onMouseLeave={() => !isDrum && handleMouseLeave()}
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
}> = ({ voiceName, voiceMask, setVoiceMask, voiceIndex, scrollLeft }) => {
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
        fontFamily: "sans-serif",
        fontSize: "12px",
        userSelect: "none",
        backgroundColor: "#0009",
        zIndex: 100,
        padding: 7,
        boxShadow: "inset 0 0 1px white",
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
}: {
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  phraseStarts: number[];
  measureSelection: MeasureSelection;
  noteHeight: number;
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
      height: 20,
      marginBottom: "-14px",
      marginLeft: "0px",
      zIndex: 10000,
      position: "sticky",
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
      systemLayout={"split"}
      midiRange={[0, 0]}
      showHeader={true}
      showTonalGrid={false}
    />
  </div>
);

export const Voice: React.FC<{
  notes: Note[];
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  showVelocity: boolean;
  cursor: ReactNode;
  phraseStarts: number[];
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  scrollLeft: number;
  scrollRight: number;
  voiceName: string;
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
  voiceMask: boolean[];
  showTonalGrid?: boolean;
  noteHeight: number;
}> = ({
  notes,
  measuresAndBeats,
  analysis,
  mouseHandlers,
  measureSelection,
  showVelocity,
  cursor,
  phraseStarts,
  scrollLeft = -1,
  scrollRight = -1,
  voiceName,
  voiceIndex = -1,
  setVoiceMask = (mask) => {},
  voiceMask,
  showTonalGrid = true,
  noteHeight,
}) => {
  const { colorScheme } = useColorScheme();

  const midiRange = useMemo(
    () =>
      getMidiRange(notes, [xToSeconds(scrollLeft), xToSeconds(scrollRight)]),
    [notes, scrollLeft, scrollRight],
  );

  const { systemClickHandler, handleNoteClick, handleMouseEnter } =
    mouseHandlers;

  const height =
    (midiRange[0] === +Infinity ? 0 : midiRange[1] - midiRange[0] + 1) *
    noteHeight;

  const midiNumberToY = useCallback(
    (midiNumber) => height - (midiNumber - midiRange[0] + 1) * noteHeight,
    [height, midiRange, noteHeight],
  );

  const { noteRectangles, frozenHeight, frozenMidiRange } = useMemo(
    () => ({
      noteRectangles: getNoteRectangles(
        notes,
        0,
        true,
        analysis,
        midiNumberToY,
        noteHeight,
        measuresAndBeats.measures,
        handleNoteClick,
        handleMouseEnter,
        () => {},
        showVelocity,
        colorScheme,
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
      noteHeight,
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
        marginTop: hasVisibleNotes ? "15px" : 0,
        marginBottom: hasVisibleNotes ? "0px" : 0,
        marginLeft: "0px",
        borderBottom: hasVisibleNotes ? "1px solid #888" : "",
        zIndex: 1,
      }}
      onClick={(e) => systemClickHandler(e)}
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
        {noteRectangles}
      </div>
      {hasVisibleNotes ? (
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={noteHeight}
          measureSelection={measureSelection}
          phraseStarts={phraseStarts}
          systemLayout={"split"}
          midiRange={midiRange}
          showHeader={false}
          showTonalGrid={showTonalGrid && !notes[0]?.isDrum}
        />
      ) : null}
      {cursor}
      {hasVisibleNotes && voiceName ? (
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
  fullScreenHandle: any;
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
  fullScreenHandle,
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
          notes: notes[voiceIndex],
        })),
    [notes],
  );

  const phraseStarts = useMemo(
    () => getPhraseStarts(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  const parentRef = useRef(null);

  const [scrollInfo, setScrollInfo] = useState({ left: -1, right: 100000 });

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

  const [noteHeight, setNoteHeight] = useState(7);

  return (
    <FullScreen handle={fullScreenHandle} className="FullScreen">
      <div
        key="innerLeftPanel"
        style={{
          margin: 0,
          padding: 0,
          position: "relative",
          overflowX: "scroll",
          overflowY: "scroll",
          width: "100%",
          height: "100vh",
          backgroundColor: "black",
        }}
        ref={parentRef}
        className="SplitLayout"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: -60,
            zIndex: 10000,
          }}
        >
          <input
            type="range"
            min="4"
            max="15"
            value={noteHeight}
            onChange={(e) => setNoteHeight(parseInt(e.target.value, 10))}
            style={{
              transform: "rotate(90deg)",
              transformOrigin: "bottom left",
              width: 80,
            }}
          />
        </div>
        <MeasureNumbers
          measuresAndBeats={measuresAndBeats}
          analysis={analysis}
          phraseStarts={phraseStarts}
          measureSelection={measureSelection}
          noteHeight={noteHeight}
        />
        {voicesSortedByAverageMidiNumber.map(({ voiceIndex, notes }, order) => (
          <div style={{ position: "relative" }}>
            <Voice
              key={voiceIndex}
              voiceName={voiceNames[voiceIndex]}
              notes={notes}
              measuresAndBeats={measuresAndBeats}
              analysis={analysis}
              mouseHandlers={mouseHandlers}
              measureSelection={measureSelection}
              showVelocity={showVelocity}
              cursor={
                <Cursor
                  style={{
                    transition:
                      Math.abs(prevPositionSeconds.current - positionSeconds) <
                      1
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
              noteHeight={noteHeight}
            />
          </div>
        ))}
      </div>
    </FullScreen>
  );
};
