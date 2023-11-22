import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisBox } from "./AnalysisBox";
import { MeasureSelection } from "./AnalysisGrid";
import { BookExample } from "./Book";
import { PianoLegend } from "./PianoLegend";
import {
  MergedSystemLayout,
  MouseHandlers,
  SplitSystemLayout,
  StackedSystemLayout,
  SystemLayout,
} from "./SystemLayout";
import {
  ANALYSIS_STUB,
  Analysis,
  advanceAnalysis,
  getNewAnalysis,
} from "./analysis";
import { calculateMeasuresAndBeats } from "./measures";
import { ChipStateDump, Note, parseNotes } from "./noteParsers";
import { StripesSpecificProps } from "./tags";

export type Voice = "pulse1" | "pulse2" | "triangle" | "noise" | "under cursor";

// If not used, the playback cursor isn't exactly where the sound is
const LATENCY_CORRECTION_MS =
  (localStorage && parseInt(localStorage.getItem("latency"), 10)) || 70;

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 50;
const HORIZONTAL_HEADER_PADDING = 55;

// TODO: remove HORIZONTAL_HEADER_PADDING for midi
export const secondsToX = (seconds) =>
  seconds * SECOND_WIDTH + HORIZONTAL_HEADER_PADDING;

// TODO: should I subtract HORIZONTAL_HEADER_PADDING here?
export const xToSeconds = (x) => x / SECOND_WIDTH;

const Chiptheory: React.FC<{
  chipStateDump: ChipStateDump;
  getCurrentPositionMs: () => number;
  savedAnalysis: Analysis;
  saveAnalysis: (Analysis) => void;
  voiceMask: boolean[];
  setVoiceMask: (mask: boolean[]) => void;
  analysisEnabled: boolean;
  seek: (ms: number) => void;
  registerSeekCallback: (seekCallback: (ms: number) => void) => void;
  bookPath: string;
  pause: () => void;
  paused: boolean;
  loggedIn: boolean;
}> = ({
  chipStateDump,
  getCurrentPositionMs,
  savedAnalysis,
  saveAnalysis,
  voiceMask,
  setVoiceMask,
  analysisEnabled, // is it a reasonable argument?
  seek,
  registerSeekCallback,
  bookPath,
  pause,
  paused,
  loggedIn,
}) => {
  const [analysis, setAnalysis] = useState<Analysis>(ANALYSIS_STUB);
  const [showIntervals, setShowIntervals] = useState(false);
  const [systemLayout, setSystemLayout] = useState<SystemLayout>("merged");
  const [playEnd, setPlayEnd] = useState(null);

  const commitAnalysisUpdate = useCallback(
    (analysisUpdate: Partial<Analysis>) => {
      const updatedAnalysis = { ...analysis, ...analysisUpdate };
      saveAnalysis(updatedAnalysis);
      setAnalysis(updatedAnalysis);
    },
    [analysis, saveAnalysis],
  );

  useEffect(() => {
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
    } else {
      setAnalysis(ANALYSIS_STUB);
    }
  }, [savedAnalysis]);

  const [previouslySelectedMeasure, setPreviouslySelectedMeasure] = useState<
    number | null
  >(null);
  const [selectedMeasure, setSelectedMeasure] = useState<number | null>(null);
  const selectMeasure = useCallback(
    (measure) => {
      if (measure === null) {
        setPreviouslySelectedMeasure(null);
        setSelectedMeasure(null);
      } else {
        setPreviouslySelectedMeasure(selectedMeasure);
        setSelectedMeasure(measure);
      }
    },
    [selectedMeasure],
  );

  const analysisRef = useRef(analysis);
  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  const selectedMeasureRef = useRef(selectedMeasure);
  useEffect(() => {
    selectedMeasureRef.current = selectedMeasure;
  }, [selectedMeasure]);

  const parsingResult = useMemo(
    () => parseNotes(chipStateDump),
    [chipStateDump],
  );
  const { notes } = parsingResult;

  const allNotes = useMemo(() => notes.flat(), [notes]);

  const allActiveNotes = useMemo(
    () => notes.filter((_, i) => voiceMask[i]).flat(),
    [notes, voiceMask],
  );

  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);
  const [hoveredAltKey, setHoveredAltKey] = useState<boolean>(false);
  const handleMouseEnter = (note: Note, altKey: boolean) => {
    setHoveredNote(note);
    setHoveredAltKey(altKey);
  };
  const handleMouseLeave = () => {
    setHoveredNote(null);
  };

  const futureAnalysis = useMemo(
    () =>
      hoveredNote
        ? getNewAnalysis(
            hoveredNote,
            selectedMeasureRef.current,
            analysisRef.current,
            null,
            allNotes,
            parsingResult?.measuresAndBeats?.measures ??
              calculateMeasuresAndBeats(analysis, allNotes).measures,
            hoveredAltKey,
            chipStateDump.type,
          )
        : analysis,
    [hoveredNote, analysis],
  );
  const measuresAndBeats = useMemo(() => {
    return (
      parsingResult?.measuresAndBeats ??
      calculateMeasuresAndBeats(futureAnalysis, allNotes)
    );
  }, [futureAnalysis, allNotes, parsingResult]);

  const handleNoteClick = (note: Note, altKey: boolean) => {
    advanceAnalysis(
      note,
      selectedMeasureRef.current,
      setSelectedMeasure,
      analysisRef.current,
      commitAnalysisUpdate,
      chipStateDump.type,
      null,
      allNotes,
      measuresAndBeats.measures,
      altKey,
    );
  };

  const [positionMs, setPositionMs] = useState(0);

  useEffect(() => {
    let running = true;

    const animate = () => {
      if (!running) {
        return;
      }

      setPositionMs(getCurrentPositionMs() - LATENCY_CORRECTION_MS);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
    };
  }, []);

  useEffect(() => {
    const handleEscapePress = (event) => {
      if (event.key === "Escape" || event.keyCode === 27) {
        selectMeasure(null);
      }
    };

    document.addEventListener("keydown", handleEscapePress);

    return () => {
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, []);

  // TODO: we should probably get rid of a tune timeline at some point.
  // MuseScore somehow doesn't have it?

  if (
    !paused &&
    bookPath &&
    analysis.loop &&
    (positionMs - 3000 > measuresAndBeats.measures[analysis.loop - 1] * 1000 ||
      (playEnd && positionMs > measuresAndBeats.measures[playEnd] * 1000))
  ) {
    pause();
  }

  // TODO: fix to scroll back to top for both layouts
  //
  // useEffect(() => {
  //   divRef.current.scrollLeft = 0;
  // }, [chipStateDump]);

  const systemClickHandler = useCallback(
    (e: React.MouseEvent, timeOffset = 0) => {
      const targetElement = e.target as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const distance =
        e.clientX -
        rect.left +
        targetElement.scrollLeft -
        HORIZONTAL_HEADER_PADDING;
      const time = xToSeconds(distance) + timeOffset;
      if (selectedMeasure) {
        advanceAnalysis(
          null,
          selectedMeasureRef.current,
          setSelectedMeasure,
          analysisRef.current,
          commitAnalysisUpdate,
          chipStateDump.type,
          time,
        );
      } else {
        seek(time * 1000);
      }
    },
    [
      selectedMeasure,
      selectedMeasureRef,
      setSelectedMeasure,
      analysisRef,
      commitAnalysisUpdate,
      seek,
    ],
  );

  const stripeSpecificProps: StripesSpecificProps = chipStateDump.type ===
    "nes" && {
    commitAnalysisUpdate,
    setVoiceMask,
    loggedIn,
    seek,
    setShowIntervals,
    voices: notes,
  };

  const positionSeconds = positionMs / 1000;

  const mouseHandlers: MouseHandlers = useMemo(
    () => ({
      handleNoteClick,
      handleMouseEnter,
      handleMouseLeave,
      // TODO: do we really need to pass hoveredNote?
      hoveredNote,
      hoveredAltKey,
      systemClickHandler,
    }),
    [
      handleNoteClick,
      handleMouseEnter,
      handleMouseLeave,
      hoveredNote,
      hoveredAltKey,
      systemClickHandler,
    ],
  );

  const measureSelection: MeasureSelection = useMemo(
    () => ({
      previouslySelectedMeasure,
      selectedMeasure,
      selectMeasure,
    }),
    [previouslySelectedMeasure, selectedMeasure, selectMeasure],
  );

  const commonParams = useMemo(
    () => ({
      notes,
      voiceMask,
      measuresAndBeats,
      showIntervals,
      positionSeconds,
    }),
    [notes, voiceMask, measuresAndBeats, showIntervals, positionSeconds],
  );

  return (
    <div
      className="App-main-content-and-settings"
      style={{ position: "relative" }}
    >
      <div
        key="leftPanel"
        style={{
          width: "100%",
          height: "100%",
          padding: 0,
          backgroundColor: "black",
        }}
      >
        {systemLayout === "stacked" ? (
          <StackedSystemLayout
            {...commonParams}
            mouseHandlers={mouseHandlers}
            measureSelection={measureSelection}
            analysis={analysis}
            futureAnalysis={futureAnalysis}
          />
        ) : systemLayout === "merged" ? (
          <MergedSystemLayout
            {...commonParams}
            mouseHandlers={mouseHandlers}
            measureSelection={measureSelection}
            allActiveNotes={allActiveNotes}
            futureAnalysis={futureAnalysis}
            measuresAndBeats={measuresAndBeats}
            stripeSpecificProps={stripeSpecificProps}
            registerSeekCallback={registerSeekCallback}
          />
        ) : (
          <SplitSystemLayout
            {...commonParams}
            mouseHandlers={mouseHandlers}
            measureSelection={measureSelection}
            analysis={futureAnalysis}
          />
        )}
      </div>
      {analysisEnabled &&
        (bookPath ? (
          <BookExample
            path={bookPath}
            playSegment={(span, mask) => {
              const newVoiceMask = [...voiceMask];
              for (let i = 0; i < mask.length; ++i) {
                newVoiceMask[i] = mask[i] === "1";
              }
              setVoiceMask(newVoiceMask);
              setPlayEnd(span ? span[1] : null);
              const start = span
                ? measuresAndBeats.measures[span[0] - 1] * 1000
                : 0;
              seek(start);
              // TODO: enable it
              // seekCallback(start);
            }}
            analysis={analysis}
          />
        ) : (
          <AnalysisBox
            analysis={analysis}
            commitAnalysisUpdate={commitAnalysisUpdate}
            previouslySelectedMeasure={previouslySelectedMeasure}
            selectedMeasure={selectedMeasure}
            selectMeasure={selectMeasure}
          />
        ))}
      <div
        style={{
          position: "fixed",
          top: "50px",
          right: "15px",
          zIndex: "100",
        }}
      >
        <label className="inline">
          <input
            title="Intervals"
            type="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              e.stopPropagation();
              setShowIntervals(e.target.checked);
            }}
            checked={showIntervals}
          />
          Intervals
        </label>{" "}
        <label key={"merged"} className="inline">
          <input
            onClick={() => setSystemLayout("merged")}
            type="radio"
            name="system-layout"
            defaultChecked={systemLayout === "merged"}
            value={"horizontal"}
          />
          Merged
        </label>{" "}
        <label key={"split"} className="inline">
          <input
            onClick={() => setSystemLayout("split")}
            type="radio"
            name="system-layout"
            defaultChecked={systemLayout === "split"}
            value={"split"}
          />
          Split
        </label>{" "}
        <label key={"stacked"} className="inline">
          <input
            onClick={() => setSystemLayout("stacked")}
            type="radio"
            name="system-layout"
            defaultChecked={systemLayout === "stacked"}
            value={"stacked"}
          />
          Stacked
        </label>
      </div>
      <div
        key="piano-legend"
        style={{ position: "absolute", bottom: 10, left: 10, zIndex: 10000000 }}
      >
        <PianoLegend />
      </div>
    </div>
  );
};

export default Chiptheory;
