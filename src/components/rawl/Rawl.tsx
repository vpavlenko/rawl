import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisBox } from "./AnalysisBox";
import { MeasureSelection } from "./AnalysisGrid";
import { PianoLegend } from "./PianoLegend";
import {
  MergedSystemLayout,
  MouseHandlers,
  SplitSystemLayout,
  SystemLayout,
} from "./SystemLayout";
import {
  ANALYSIS_STUB,
  Analysis,
  advanceAnalysis,
  getNewAnalysis,
} from "./analysis";
import { findPhrasingStart, findTonic } from "./autoAnalysis";
import { Note, ParsingResult } from "./parseMidi";

// If not used, the playback cursor isn't exactly where the sound is.
// Sometimes it should be adjusted for external screens.
const LATENCY_CORRECTION_MS =
  (localStorage && parseInt(localStorage.getItem("latency"), 10)) || 70;

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 50;
export const secondsToX = (seconds) => seconds * SECOND_WIDTH;
export const xToSeconds = (x) => x / SECOND_WIDTH;

export type SetVoiceMask = (mask: boolean[]) => void;

const Rawl: React.FC<{
  parsingResult: ParsingResult;
  getCurrentPositionMs: () => number;
  savedAnalysis?: Analysis;
  saveAnalysis: (Analysis) => void;
  voiceNames: string[];
  voiceMask: boolean[];
  setVoiceMask: SetVoiceMask;
  showAnalysisBox: boolean;
  seek: (ms: number) => void;
  registerSeekCallback: (seekCallback: (ms: number) => void) => void;
}> = ({
  parsingResult,
  getCurrentPositionMs,
  savedAnalysis,
  saveAnalysis,
  voiceNames,
  voiceMask,
  setVoiceMask,
  showAnalysisBox,
  seek,
  registerSeekCallback,
}) => {
  const [analysis, setAnalysis] = useState<Analysis>(
    savedAnalysis || ANALYSIS_STUB,
  );
  useEffect(() => setAnalysis(ANALYSIS_STUB), [parsingResult]);
  useEffect(() => {
    // this can be in a race if Firebase is slow
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
    } else {
      setAnalysis(ANALYSIS_STUB);
    }
  }, [savedAnalysis]);

  // https://chat.openai.com/share/39958f7a-119d-43dc-b7a3-b2cd0958707b
  const analysisRef = useRef(analysis);
  useEffect(() => {
    analysisRef.current = analysis;
  }, [analysis]);

  const [showVelocity, setShowVelocity] = useState(false);
  const [systemLayout, setSystemLayout] = useState<SystemLayout>("split");

  const commitAnalysisUpdate = useCallback(
    (analysisUpdate: Partial<Analysis>) => {
      const updatedAnalysis = { ...analysis, ...analysisUpdate };
      saveAnalysis(updatedAnalysis);
      setAnalysis(updatedAnalysis);
    },
    [analysis, saveAnalysis],
  );

  // The next two variables store a span of selected measures.
  // TODO: refactor via renaming "selectedMeasureStart" and "selectedMeasureEnd", if ever used
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

  const selectedMeasureRef = useRef(selectedMeasure);
  useEffect(() => {
    selectedMeasureRef.current = selectedMeasure;
  }, [selectedMeasure]);

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
            parsingResult?.measuresAndBeats?.measures,
            hoveredAltKey,
          )
        : analysis,
    [hoveredNote, analysis],
  );
  const measuresAndBeats = useMemo(() => {
    return parsingResult?.measuresAndBeats;
  }, [futureAnalysis, allNotes, parsingResult]);

  useEffect(() => {
    const phrasingStart = findPhrasingStart(allNotes, measuresAndBeats);
    const diff: any = {};
    if (
      phrasingStart !== -1 &&
      analysis.fourMeasurePhrasingReferences.length === 0
    ) {
      diff.fourMeasurePhrasingReferences = [phrasingStart + 1];
    }
    const tonic = findTonic(allNotes);
    if (tonic !== -1 && analysis.tonic === null) {
      diff.tonic = tonic;
    }
    setAnalysis({ ...analysis, ...diff });
  }, [allNotes, analysis.tonic]);

  const handleNoteClick = (note: Note, altKey: boolean) => {
    advanceAnalysis(
      note,
      selectedMeasureRef.current,
      setSelectedMeasure,
      analysisRef.current,
      commitAnalysisUpdate,
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

  // TODO: fix to scroll back to top for both layouts
  //
  // useEffect(() => {
  //   divRef.current.scrollLeft = 0;
  // }, [midiSource]);

  const systemClickHandler = useCallback(
    (e: React.MouseEvent, timeOffset = 0) => {
      const targetElement = e.target as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const distance = e.clientX - rect.left + targetElement.scrollLeft;
      const time = xToSeconds(distance) + timeOffset;
      if (selectedMeasure) {
        advanceAnalysis(
          null,
          selectedMeasureRef.current,
          setSelectedMeasure,
          analysisRef.current,
          commitAnalysisUpdate,
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
      showVelocity,
      positionSeconds,
    }),
    [notes, voiceMask, measuresAndBeats, showVelocity, positionSeconds],
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
        {systemLayout === "merged" ? (
          <MergedSystemLayout
            {...commonParams}
            mouseHandlers={mouseHandlers}
            measureSelection={measureSelection}
            allActiveNotes={allActiveNotes}
            futureAnalysis={futureAnalysis}
            measuresAndBeats={measuresAndBeats}
            registerSeekCallback={registerSeekCallback}
          />
        ) : (
          <SplitSystemLayout
            {...commonParams}
            voiceNames={voiceNames}
            mouseHandlers={mouseHandlers}
            measureSelection={measureSelection}
            analysis={futureAnalysis}
            setVoiceMask={setVoiceMask}
          />
        )}
      </div>
      {showAnalysisBox && (
        <AnalysisBox
          analysis={analysis}
          commitAnalysisUpdate={commitAnalysisUpdate}
          previouslySelectedMeasure={previouslySelectedMeasure}
          selectedMeasure={selectedMeasure}
          selectMeasure={selectMeasure}
        />
      )}
      <div
        style={{
          position: "fixed",
          top: "50px",
          right: "15px",
          zIndex: "100",
        }}
      >
        <button onClick={() => commitAnalysisUpdate({})}>Confirm tonic</button>
        {"  "}
        <label className="inline">
          <input
            title="Velocity"
            type="checkbox"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              e.stopPropagation();
              setShowVelocity(e.target.checked);
            }}
            checked={showVelocity}
          />
          Velocity
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

export default Rawl;
