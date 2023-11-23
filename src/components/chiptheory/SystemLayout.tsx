import * as React from "react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnalysisGrid,
  Cursor,
  MeasureSelection,
  STACKED_RN_HEIGHT,
} from "./AnalysisGrid";
import {
  SecondsSpan,
  SetVoiceMask,
  secondsToX,
  xToSeconds,
} from "./Chiptheory";
import { Analysis, MeasuresSpan } from "./analysis";
import { MeasuresAndBeats, getPhrasingMeasures } from "./measures";
import { Note, NotesInVoices } from "./noteParsers";
import {
  TWELVE_CHORD_TONES,
  TWELVE_TONE_COLORS,
  getChordNote,
  getNoteMeasure,
  getTextColorForBackground,
  getTonic,
  hasRomanNumeralInMeasuresSpan,
} from "./romanNumerals";
import { ANALYSIS_HEIGHT, getAverageMidiNumber } from "./tags";

export type SystemLayout = "merged" | "split" | "stacked";

const STACKED_LAYOUT_NOTE_HEIGHT = 5;

export type MidiRange = [number, number];

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

// This is used when tonic isn't set yet.
// TODO: introduce 16 colors for all possible midi channels
const VOICE_TO_COLOR = [
  "#26577C",
  "#AE445A",
  "#63995a",
  "#7c7126",
  "#7c2676",
  "#4e267c",
];

const getNoteColor = (
  voiceIndex: number,
  note: Note,
  analysis,
  measures: number[],
): string => {
  if (analysis.tonic === null) {
    return VOICE_TO_COLOR[voiceIndex % VOICE_TO_COLOR.length];
  }

  return TWELVE_TONE_COLORS[
    (note.note.midiNumber -
      getTonic(getNoteMeasure(note, measures), analysis)) %
      12
  ];
};

const isCenterInsideSpan = (note: Note, span: SecondsSpan) => {
  let center = (note.span[0] + note.span[1]) / 2;
  return span[0] < center && center < span[1];
};

const getIntervalBelow = (note: Note, allNotes: Note[]) => {
  let minDistance = Infinity;
  for (let n of allNotes) {
    if (
      n.note.midiNumber < note.note.midiNumber &&
      isCenterInsideSpan(note, n.span)
    ) {
      minDistance = Math.min(
        minDistance,
        note.note.midiNumber - n.note.midiNumber,
      );
    }
  }
  return minDistance;
};

export type MouseHandlers = {
  handleNoteClick: (note: Note, altKey: boolean) => void;
  handleMouseEnter: (note: Note, altKey: boolean) => void;
  handleMouseLeave: () => void;
  hoveredNote: Note | null;
  hoveredAltKey: boolean;
  systemClickHandler: (e: React.MouseEvent, time?: number) => void;
};

const getNoteRectangles = (
  notes: Note[],
  voiceIndex: number, // -1 if it's a note highlight for notes under cursor. currently can't happen
  isActiveVoice: boolean,
  analysis: Analysis,
  midiNumberToY: (number: number) => number,
  noteHeight: number,
  handleNoteClick = (note: Note, altKey: boolean) => {},
  measures: number[] = null,
  handleMouseEnter = (note: Note, altKey: boolean) => {},
  handleMouseLeave = () => {},
  allNotes: Note[] = [],
  showIntervals = false,
  offsetSeconds: number,
) => {
  return notes.map((note) => {
    const top = midiNumberToY(note.note.midiNumber);
    const left = secondsToX(note.span[0] - offsetSeconds);
    const color = getNoteColor(voiceIndex, note, analysis, measures);
    const chordNote =
      voiceIndex !== -1
        ? getChordNote(note, analysis, measures, analysis.romanNumerals)
        : null;
    const noteElement = chordNote ? (
      <span
        className="noteText"
        style={{
          fontSize: `${Math.min(noteHeight + 2, 14)}px`,
          lineHeight: `${Math.min(noteHeight, 14)}px`,
          fontFamily: "Helvetica, sans-serif",
          fontWeight: 700,
          color: getTextColorForBackground(color),
        }}
      >
        {chordNote}
      </span>
    ) : null;
    const intervalBelow = showIntervals && getIntervalBelow(note, allNotes);

    return (
      <div
        key={`nr_${note.id}`}
        className={"noteRectangleTonal"}
        style={{
          position: "absolute",
          height: `${noteHeight}px`,
          width: secondsToX(note.span[1]) - secondsToX(note.span[0]),
          backgroundColor: color,
          top,
          left,
          pointerEvents: voiceIndex === -1 ? "none" : "auto",
          borderRadius: [10, 3, 0, 5, 20, 7, 1][voiceIndex % 7],
          cursor: "pointer",
          zIndex: 10,
          //   opacity: isActiveVoice ? 0.9 : 0.1,
          opacity: isActiveVoice ? 1 : 0.1,
          display: "grid",
          placeItems: "center",
          ...(voiceIndex === -1
            ? {
                boxShadow: "white 0px 1px",
                boxSizing: "border-box",
                backgroundColor: "transparent",
              }
            : {}),
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleNoteClick(note, e.altKey);
        }}
        onMouseEnter={(e) => handleMouseEnter(note, e.altKey)}
        onMouseLeave={handleMouseLeave}
      >
        {showIntervals && intervalBelow !== Infinity && isActiveVoice && (
          // voiceMask.filter(Boolean).length === 1 &&
          <div
            style={{
              position: "relative",
              top: noteHeight,
              color: "white",
              fontFamily: "sans-serif",
              fontSize: "12px",
            }}
          >
            {TWELVE_CHORD_TONES[intervalBelow % 12]}
          </div>
        )}
        {!showIntervals && noteElement}
      </div>
    );
  });
};

// TODO: add types
// TODO: maybe add React.memo
export const MergedSystemLayout = ({
  voiceMask,
  allActiveNotes,
  positionSeconds,
  futureAnalysis,
  notes,
  measuresAndBeats,
  measureSelection,
  showIntervals,
  registerSeekCallback,
  mouseHandlers,
  stripeSpecificProps,
}) => {
  const {
    handleNoteClick,
    handleMouseEnter,
    handleMouseLeave,
    hoveredNote,
    hoveredAltKey,
    systemClickHandler,
  } = mouseHandlers;

  // TODO: should probably use just "notes" instead, since stretched notes look ugly.
  const midiRange = useMemo(
    () => getMidiRange(allActiveNotes.flat()),
    [allActiveNotes],
  );

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

  const noteHeight =
    (divHeight - ANALYSIS_HEIGHT) / (midiRange[1] - midiRange[0] + 7);
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
          futureAnalysis,
          midiNumberToY,
          noteHeight,
          handleNoteClick,
          measuresAndBeats.measures,
          handleMouseEnter,
          handleMouseLeave,
          allActiveNotes,
          showIntervals,
          0,
        ),
      ),
    [
      notes,
      futureAnalysis,
      measuresAndBeats,
      noteHeight,
      voiceMask,
      hoveredNote,
      hoveredAltKey,
      showIntervals,
    ],
  );
  const phraseStarts = useMemo(
    () => getPhrasingMeasures(futureAnalysis, measuresAndBeats.measures.length),
    [futureAnalysis, measuresAndBeats],
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
        analysis={futureAnalysis}
        measuresAndBeats={measuresAndBeats}
        midiNumberToY={midiNumberToY}
        noteHeight={noteHeight}
        measureSelection={measureSelection}
        stripeSpecificProps={stripeSpecificProps}
        firstMeasureNumber={1}
        secondsToX={secondsToX}
        phraseStarts={phraseStarts}
        systemLayout={"merged"}
        midiRange={midiRange}
        hasRomanNumerals={true}
      />
    </div>
  );
};

const isInSecondsSpan = (time: number, span: SecondsSpan) =>
  span[0] <= time && time <= span[1];

const VoiceName: React.FC<{
  voiceName: string;
  voiceMask: boolean[];
  setVoiceMask: SetVoiceMask;
  voiceIndex: number;
}> = React.memo(({ voiceName, voiceMask, setVoiceMask, voiceIndex }) => {
  return (
    <>
      {voiceName}{" "}
      <span
        style={{
          cursor: "pointer",
          userSelect: "none",
          fontFamily: "sans-serif",
          fontSize: 12,
        }}
        onClick={() =>
          voiceMask.filter((voice) => voice).length === 1
            ? setVoiceMask(voiceMask.map(() => true))
            : setVoiceMask(voiceMask.map((_, i) => i === voiceIndex))
        }
      >
        S
      </span>{" "}
      <span
        style={{
          cursor: "pointer",
          userSelect: "none",
          fontFamily: "sans-serif",
          fontSize: 12,
        }}
        onClick={() =>
          setVoiceMask(
            voiceMask.map((value, i) => (i !== voiceIndex ? value : false)),
          )
        }
      >
        M
      </span>{" "}
    </>
  );
});

const Phrase: React.FC<
  DataForPhrase & {
    analysis: Analysis;
    showIntervals: boolean;
    globalMeasures: number[];
    cursor?: ReactNode;
    phraseStarts: number[];
    mouseHandlers: MouseHandlers;
    measureSelection: MeasureSelection;
    showHeader?: boolean;
    scrollLeft?: number;
    scrollRight?: number;
    voiceName?: string;
    voiceMask: boolean[];
    setVoiceMask?: SetVoiceMask;
    voiceIndex?: number;
    bigVoiceMask: boolean[];
  }
> = ({
  notes,
  measuresAndBeats,
  measuresSpan,
  secondsSpan,
  voiceMask,
  analysis,
  globalMeasures,
  mouseHandlers,
  measureSelection,
  showIntervals,
  cursor,
  phraseStarts,
  showHeader = true,
  scrollLeft = -1,
  scrollRight = -1,
  voiceName,
  voiceIndex = -1,
  setVoiceMask = (mask) => {},
  bigVoiceMask,
}) => {
  const midiRange = useMemo(
    () =>
      getMidiRangeWithMask(notes, voiceMask, [
        xToSeconds(scrollLeft),
        xToSeconds(scrollRight),
      ]),
    [notes, voiceMask, scrollLeft, scrollRight],
  );

  const {
    handleNoteClick,
    handleMouseEnter,
    handleMouseLeave,
    hoveredNote,
    hoveredAltKey,
    systemClickHandler,
  } = mouseHandlers;

  const hasRomanNumerals = hasRomanNumeralInMeasuresSpan(
    analysis.romanNumerals,
    measuresSpan,
  );

  const height =
    (midiRange[0] === +Infinity ? 1 : midiRange[1] - midiRange[0] + 1) *
      STACKED_LAYOUT_NOTE_HEIGHT +
    (showHeader ? (hasRomanNumerals ? STACKED_RN_HEIGHT : 15) : 0);

  const midiNumberToY = useCallback(
    (midiNumber) =>
      height - (midiNumber - midiRange[0] + 1) * STACKED_LAYOUT_NOTE_HEIGHT,
    [height, midiRange],
  );

  const mySecondsToX = useCallback(
    (seconds) => secondsToX(seconds - secondsSpan[0]),
    [secondsSpan[0]],
  );

  const { noteRectangles, frozenHeight, frozenMidiRange } = useMemo(
    () => ({
      noteRectangles: notes.flatMap((notesInOneVoice, voice) =>
        voiceMask[voice]
          ? getNoteRectangles(
              notesInOneVoice,
              voice,
              voiceMask[voice],
              analysis,
              midiNumberToY,
              STACKED_LAYOUT_NOTE_HEIGHT,
              () => {},
              globalMeasures,
              () => {},
              () => {},
              [], // TODO: pass allActiveNotes in this phrase to enable showIntervals view
              showIntervals,
              secondsSpan[0],
            )
          : [],
      ),
      frozenHeight: height,
      frozenMidiRange: midiRange,
    }),
    [
      notes,
      analysis,
      globalMeasures,
      voiceMask,
      hoveredNote,
      hoveredAltKey,
      showIntervals,
    ],
  );

  const hasVisibleNotes = midiRange[1] > midiRange[0];

  return (
    <div
      key={`outer_phrase_${measuresSpan[0]}`}
      style={{
        width: mySecondsToX(
          measuresAndBeats.measures[measuresAndBeats.measures.length - 1],
        ),
        height: hasVisibleNotes ? height : 1,
        position: "relative",
        marginTop: hasVisibleNotes ? "10px" : 0,
        marginBottom: hasVisibleNotes ? "20px" : 0,
        borderBottom: hasVisibleNotes ? "1px solid #888" : "",
      }}
      onClick={(e) => systemClickHandler(e, secondsSpan[0])}
    >
      <div
        style={{
          position: "relative",
          top:
            height -
            frozenHeight +
            (midiRange[0] - frozenMidiRange[0]) * STACKED_LAYOUT_NOTE_HEIGHT,
        }}
      >
        {noteRectangles}
      </div>
      {hasVisibleNotes ? (
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={STACKED_LAYOUT_NOTE_HEIGHT}
          measureSelection={measureSelection}
          firstMeasureNumber={measuresSpan[0]}
          phraseStarts={phraseStarts}
          secondsToX={mySecondsToX}
          systemLayout={"stacked"}
          midiRange={midiRange}
          hasRomanNumerals={hasRomanNumerals}
          showHeader={showHeader}
        />
      ) : null}
      {cursor}
      {hasVisibleNotes ? (
        <div
          style={{
            position: "relative",
            left: scrollLeft + 10,
            top: -16,
            zIndex: 2,
            fontFamily: "sans-serif",
            fontSize: "12px",
          }}
        >
          <VoiceName
            voiceName={voiceName}
            voiceMask={bigVoiceMask}
            setVoiceMask={setVoiceMask}
            voiceIndex={voiceIndex}
          />
        </div>
      ) : null}
    </div>
  );
};

// TODO: if it's too slow, we can split notes into phrases more efficiently using linear scans.
// I'm just too lazy to implement it now.
const getNotesBetweenTimestamps = (
  notes: NotesInVoices,
  secondsSpan: SecondsSpan,
): NotesInVoices =>
  notes.map((notesInOneVoice) =>
    notesInOneVoice.filter((note) =>
      isInSecondsSpan((note.span[0] + note.span[1]) / 2, secondsSpan),
    ),
  );

type DataForPhrase = {
  notes: NotesInVoices;
  measuresAndBeats: MeasuresAndBeats;
  measuresSpan: MeasuresSpan;
  secondsSpan: SecondsSpan;
};

const calculateDataForPhrases = (
  notes: NotesInVoices,
  measuresAndBeats: MeasuresAndBeats,
  phraseStarts: number[],
): DataForPhrase[] => {
  const { measures, beats } = measuresAndBeats;
  const data = [];
  const X = 2;
  for (let i = 0; i < phraseStarts.length - X; i += X) {
    const measuresSpan = [phraseStarts[i], phraseStarts[i + X]];
    const secondsSpan = [
      measures[measuresSpan[0] - 1],
      measures[measuresSpan[1] - 1],
    ] as SecondsSpan;
    data.push({
      notes: getNotesBetweenTimestamps(notes, secondsSpan),
      measuresSpan,
      secondsSpan,
      measuresAndBeats: {
        measures: measures.filter((measure) =>
          isInSecondsSpan(measure, secondsSpan),
        ),
        beats: beats.filter((beat) => isInSecondsSpan(beat, secondsSpan)),
      },
    });
  }
  return data;
};

export const StackedSystemLayout: React.FC<{
  analysis: Analysis;
  futureAnalysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
  notes: NotesInVoices;
  voiceMask: boolean[];
  showIntervals: boolean;
  positionSeconds: number;
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
}> = ({
  analysis,
  futureAnalysis,
  measuresAndBeats,
  notes,
  voiceMask,
  mouseHandlers,
  measureSelection,
  showIntervals,
  positionSeconds,
}) => {
  const phraseStarts = useMemo(
    () => getPhrasingMeasures(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  // This is good to display anacrusis. But right now it breaks the 8-mm. grid at the start.
  //
  //   if (phraseStarts[0] !== 1) {
  //   phraseStarts.unshift(1);
  //   phraseStarts.unshift(1);
  //   phraseStarts.unshift(1);
  //   }
  // TODO: support loops
  const dataForPhrases = useMemo(
    () => calculateDataForPhrases(notes, measuresAndBeats, phraseStarts),
    [notes, measuresAndBeats, phraseStarts],
  );

  return (
    <div
      key="stacked_system_layout"
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
    >
      {/* <div style={{ position: "absolute", right: 20, top: 20 }}>
          by 4 or by 8
        </div> */}
      {dataForPhrases.map((data) => (
        <Phrase
          key={data.measuresSpan[0]}
          {...data}
          analysis={futureAnalysis}
          voiceMask={voiceMask}
          globalMeasures={measuresAndBeats.measures}
          mouseHandlers={mouseHandlers}
          measureSelection={measureSelection}
          showIntervals={showIntervals}
          phraseStarts={phraseStarts}
          cursor={
            isInSecondsSpan(positionSeconds, data.secondsSpan) && (
              <Cursor
                style={{
                  left: secondsToX(positionSeconds - data.secondsSpan[0]),
                }}
              />
            )
          }
          bigVoiceMask={voiceMask}
        />
      ))}
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
  showIntervals: boolean;
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
  showIntervals,
  positionSeconds,
  analysis,
  mouseHandlers,
  measureSelection,
  setVoiceMask,
}) => {
  const voicesSortedByAverageMidiNumber = useMemo(
    () =>
      notes
        .map((voice, voiceIndex) => ({
          average: getAverageMidiNumber(voice),
          voiceIndex,
        }))
        .sort((a, b) => b.average - a.average)
        .map(({ voiceIndex }) => ({ voiceIndex, notes: [notes[voiceIndex]] })),
    [notes],
  );

  const phraseStarts = useMemo(
    () => getPhrasingMeasures(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  // If scroll changed and debounced, we need to calculate which voices have
  // any visible notes and hides those who don't.

  const parentRef = useRef(null);

  const [scrollInfo, setScrollInfo] = useState({ left: 0, right: 100000 });

  const handleScroll = () => {
    const { scrollLeft, offsetWidth } = parentRef.current;
    const scrollRight = scrollLeft + offsetWidth;

    debounce(
      setScrollInfo({
        left: scrollLeft,
        right: scrollRight,
      }),
      500,
    );
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

  console.log("split rerender");

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
    >
      <div>
        {voicesSortedByAverageMidiNumber.map(({ voiceIndex, notes }, order) =>
          voiceMask[voiceIndex] ? (
            <Phrase
              key={voiceIndex}
              voiceName={voiceNames[voiceIndex]}
              notes={notes}
              // this is legacy for Stacked
              voiceMask={SPLIT_VOICE_MASK}
              measuresAndBeats={measuresAndBeats}
              measuresSpan={[1, measuresAndBeats.measures.length]}
              secondsSpan={[
                0,
                measuresAndBeats.measures[measuresAndBeats.measures.length - 1],
              ]}
              analysis={analysis}
              globalMeasures={measuresAndBeats.measures}
              mouseHandlers={mouseHandlers}
              measureSelection={measureSelection}
              showIntervals={showIntervals}
              showHeader={order === voicesSortedByAverageMidiNumber.length - 1}
              cursor={<Cursor style={{ left: secondsToX(positionSeconds) }} />}
              phraseStarts={phraseStarts}
              scrollLeft={scrollInfo.left}
              scrollRight={scrollInfo.right}
              bigVoiceMask={voiceMask}
              setVoiceMask={setVoiceMask}
              voiceIndex={voiceIndex}
            />
          ) : null,
        )}
      </div>
    </div>
  );
};
