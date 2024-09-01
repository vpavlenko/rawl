import { clamp } from "lodash";
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
import { getNoteRectangles, MouseHandlers } from "./getNoteRectangles";
import MergedVoicesLegend from "./layouts/MergedVoicesLegend";
import { ColoredNote, ColoredNotesInVoices, Note } from "./parseMidi";
import { TonalHistogram } from "./tonalSearch/TonalSearch";

const TinyLetter = styled.span`
  font-size: 10px;
  color: #999;
`;

export type MeasuresAndBeats = {
  measures: number[];
  beats: number[];
  ticks?: { measures: number[] };
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
      console.log(`bad phrasePatch, measure ${measure} not found`);
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
export type SystemLayout = "merged" | "stacked" | "tonal" | "frozen";

export type MidiRange = [number, number];

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
      zIndex: 90000,
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
  enableManualRemeasuring: boolean;
}> = ({
  notes,
  measuresAndBeats,
  analysis,
  mouseHandlers,
  measureSelection,
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
  enableManualRemeasuring,
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
        secondsToX,
        enableManualRemeasuring,
      ),
      frozenHeight: height,
      frozenMidiRange: midiRange,
    }),
    [
      notes,
      analysis,
      handleNoteClick,
      handleMouseEnter,
      voiceMask,
      noteHeight,
      secondsToX,
      enableManualRemeasuring,
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
  positionSeconds: number;
  analysis: Analysis;
  mouseHandlers: MouseHandlers;
  measureSelection: MeasureSelection;
  setVoiceMask: SetVoiceMask;
  registerKeyboardHandler: (
    name: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (name: string) => void;
  tonalHistograms: TonalHistogram[];
  frozenNotes: ColoredNote[][];
  enableManualRemeasuring?: boolean;
  measureStart?: number;
};

export const TonalHistogramLayout: React.FC<SystemLayoutProps> = ({
  measuresAndBeats,
  analysis,
  measureSelection,
  tonalHistograms,
}) => {
  const [noteHeight, setNoteHeight] = useState<number>(4);
  const [secondWidth, setSecondWidth] = useState<number>(45);

  const phraseStarts = useMemo(
    () => getPhraseStarts(analysis, measuresAndBeats.measures.length),
    [analysis, measuresAndBeats],
  );

  const secondsToX = useCallback(
    (seconds: number) => seconds * secondWidth,
    [secondWidth],
  );

  return (
    <div style={{ padding: "20px", backgroundColor: "black" }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        {tonalHistograms.map((histogram, index) => (
          <div key={index} style={{ margin: "10px", textAlign: "center" }}>
            <div
              style={{ fontSize: "12px", color: "white", marginBottom: "5px" }}
            >
              Measure {index + 1}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "100px",
                width: "60px",
              }}
            >
              {histogram.map((bar, barIndex) => (
                <div
                  key={barIndex}
                  className={`noteColor_${
                    barIndex === 6 ? 0 : barIndex
                  }_colors`}
                  style={{
                    width: "5px",
                    height: `${bar * 100}%`,
                    marginRight: "1px",
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const StackedSystemLayout: React.FC<
  SystemLayoutProps & { measureStart?: number }
> = ({
  notes,
  voiceNames,
  voiceMask,
  measuresAndBeats,
  positionSeconds,
  analysis,
  mouseHandlers,
  measureSelection,
  setVoiceMask,
  registerKeyboardHandler,
  unregisterKeyboardHandler,
  enableManualRemeasuring = false,
  measureStart,
}) => {
  const [noteHeight, setNoteHeight] = useState<number>(3.5);
  const debounceSetNoteHeight = useCallback(debounce(setNoteHeight, 50), []);
  const [secondWidth, setSecondWidth] = useState<number>(40);
  const setSecondWidthCalled = useRef(false);

  const debounceSetSecondWidth = useCallback(
    debounce((value: number) => {
      setSecondWidthCalled.current = true;
      setSecondWidth(value);
    }, 50),
    [],
  );

  useEffect(() => {
    setSecondWidthCalled.current = false;
  }, [secondWidth]);

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
                  note.span[0] + 1e-2 < measures[end],
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
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const handleSecondWidthChange = useCallback((newWidth: number) => {
    setSecondWidth(clamp(newWidth, 2, 150));
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "a":
          handleSecondWidthChange(secondWidth - 2);
          break;
        case "d":
          handleSecondWidthChange(secondWidth + 2);
          break;
        case "s":
          debounceSetNoteHeight(Math.min(noteHeight + 0.25, 10));
          break;
        case "w":
          debounceSetNoteHeight(Math.max(noteHeight - 0.25, 1));
          break;
      }
    };

    registerKeyboardHandler("systemLayout", handleKeyPress);

    return () => {
      unregisterKeyboardHandler("systemLayout");
    };
  }, [
    registerKeyboardHandler,
    unregisterKeyboardHandler,
    secondWidth,
    handleSecondWidthChange,
    noteHeight,
    debounceSetNoteHeight,
  ]);

  useEffect(() => {
    if (
      measureStart !== undefined &&
      parentRef.current &&
      sectionRefs.current.length > 0
    ) {
      const sectionIndex = sections.findIndex(
        ({ sectionSpan }) =>
          measureStart >= sectionSpan[0] && measureStart <= sectionSpan[1],
      );

      if (sectionIndex !== -1) {
        const sectionElement = sectionRefs.current[sectionIndex];
        if (sectionElement) {
          sectionElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [measureStart, sections]);

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
            bottom: 244,
            right: -93,
            zIndex: 100000,
          }}
        >
          <span style={{ position: "relative", top: -3, left: 18 }}>
            <TinyLetter>w</TinyLetter>
          </span>
          <span
            style={{
              position: "relative",
              top: 169,
              left: 13,
            }}
          >
            <TinyLetter>s</TinyLetter>
          </span>
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
            zIndex: 100000,
          }}
        >
          <span style={{ position: "relative", top: -5, left: 0 }}>
            <TinyLetter>a</TinyLetter>
          </span>
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
          <span style={{ position: "relative", top: -5, left: 0 }}>
            <TinyLetter>d</TinyLetter>
          </span>
        </div>

        {sections.map(
          ({ sectionSpan, secondsToX, xToSeconds, voices }, order) => (
            <div
              style={{ paddingTop: 10 + noteHeight * 5 }}
              key={order}
              ref={(el) => (sectionRefs.current[order] = el)}
            >
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
                    cursor={
                      positionSeconds <
                        measuresAndBeats.measures[sectionSpan[1]] && (
                        <Cursor
                          key={"cursor"}
                          style={{
                            transition:
                              !setSecondWidthCalled.current &&
                              Math.abs(
                                prevPositionSeconds.current - positionSeconds,
                              ) < 2
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
                    enableManualRemeasuring={enableManualRemeasuring}
                  />
                </div>
              ))}
            </div>
          ),
        )}

        <div style={{ height: 600 }}></div>

        <div
          key="piano-legend"
          style={{ position: "fixed", bottom: 90, right: 70, zIndex: 100000 }}
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
  const {
    notes,
    voiceNames,
    voiceMask,
    setVoiceMask,
    enableManualRemeasuring,
  } = props;

  const flattenedNotes = useMemo(
    () => [
      notes
        .filter((notes) => (notes && notes[0].isActive) || !notes[0].isDrum)
        .flat(),
    ],
    [notes],
  );
  const isSingleActive = voiceMask.filter((voice) => voice).length === 1;

  return (
    <div style={{ position: "relative" }}>
      <StackedSystemLayout
        {...props}
        notes={flattenedNotes}
        voiceNames={MERGED_VOICE_NAMES}
        voiceMask={MERGED_VOICE_MASK}
        enableManualRemeasuring={enableManualRemeasuring}
      />
      <MergedVoicesLegend
        voiceNames={voiceNames}
        voiceMask={voiceMask}
        setVoiceMask={setVoiceMask}
      />
    </div>
  );
};
