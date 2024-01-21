import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalysisBox } from "./AnalysisBox";
import { MeasureSelection } from "./AnalysisGrid";
import Exercise, { ExerciseType } from "./Exercise";
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
import { findFirstPhraseStart, findTonic } from "./autoAnalysis";
import { Note, ParsingResult } from "./parseMidi";

// If not used, the playback cursor isn't exactly where the sound is.
// Sometimes it should be adjusted for external screens.
const LATENCY_CORRECTION_MS =
  (localStorage && parseInt(localStorage.getItem("latency"), 10)) || 400;

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 40;
export const secondsToX = (seconds) => seconds * SECOND_WIDTH;
export const xToSeconds = (x) => x / SECOND_WIDTH;

export type SetVoiceMask = (mask: boolean[]) => void;

const cleanForExercise = (savedAnalysis: Analysis, exercise: ExerciseType) => {
  if (exercise === "tonic") {
    return { ...savedAnalysis, tonic: null, modulations: {} };
  }
  return savedAnalysis;
};

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
  synth: { noteOn; noteOff };
  paused: boolean;
  artist: string;
  song: string;
  exercise: ExerciseType | null;
  sequencer: any;
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
  synth,
  paused,
  artist,
  song,
  exercise,
  sequencer,
}) => {
  useEffect(() => {
    document.title = `Rawl - ${artist.slice(5)} - ${song.slice(0, -4)}`;
  }, [artist, song]);

  const [analysis, setAnalysis] = useState<Analysis>(
    (savedAnalysis && cleanForExercise(savedAnalysis, exercise)) ||
      ANALYSIS_STUB,
  );
  // useEffect(() => setAnalysis(ANALYSIS_STUB), [parsingResult]);
  useEffect(() => {
    // this can be in a race if Firebase is slow
    if (savedAnalysis) {
      setAnalysis(cleanForExercise(savedAnalysis, exercise));
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
      if (!exercise) {
        saveAnalysis(updatedAnalysis);
      }
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

  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);
  const [hoveredAltKey, setHoveredAltKey] = useState<boolean>(false);
  const handleMouseEnter = useCallback(
    (note: Note, altKey: boolean) => {
      if (altKey) {
        setHoveredNote(note);
      }
      setHoveredAltKey(altKey);
      // if (paused) {
      //   synth.noteOn(
      //     note.chipState.on.channel,
      //     note.chipState.on.param1,
      //     note.chipState.on.param2,
      //   );
      //   // Since buffer is large, controlling noteOff from here
      //   // is probably a bad idea - not real-time. Results in very short
      //   // notes sometimes.
      //   setTimeout(
      //     () =>
      //       synth.noteOff(
      //         note.chipState.off.channel,
      //         note.chipState.off.param1,
      //       ),
      //     Math.min((note.span[1] - note.span[0]) * 1000, 4000),
      //   );
      // }
    },
    [paused],
  );
  const handleMouseLeave = useCallback(() => {
    setHoveredNote(null);
  }, []);

  const futureAnalysis = useMemo(
    () =>
      hoveredNote
        ? getNewAnalysis(
            hoveredNote,
            selectedMeasureRef.current,
            analysisRef.current,
            null,
            hoveredAltKey,
          )
        : analysis,
    [hoveredNote, analysis],
  );
  const measuresAndBeats = useMemo(() => {
    return parsingResult?.measuresAndBeats;
  }, [futureAnalysis, allNotes, parsingResult]);

  useEffect(() => {
    if (analysis.phrasePatch?.length > 0) {
      return;
    }

    const firstPhraseStart = findFirstPhraseStart(allNotes, measuresAndBeats);
    const diff: Partial<Analysis> = {};
    if (firstPhraseStart !== -1) {
      diff.phrasePatch = [{ measure: 1, diff: firstPhraseStart }];
    }

    const tonic = findTonic(allNotes);
    if (tonic !== -1 && analysis.tonic === null) {
      diff.tonic = tonic;
    }
    setAnalysis({ ...analysis, ...diff });
  }, [allNotes]);

  const handleNoteClick = useCallback((note: Note, altKey: boolean) => {
    advanceAnalysis(
      note,
      selectedMeasureRef.current,
      setSelectedMeasure,
      analysisRef.current,
      commitAnalysisUpdate,
      null,
      altKey,
    );
  }, []);

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

  const systemClickHandler = useCallback(
    (e: React.MouseEvent, timeOffset = 0) => {
      const targetElement = e.target as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const distance = e.clientX - rect.left + targetElement.scrollLeft;
      const time = xToSeconds(distance) + timeOffset;
      seek(time * 1000);
    },
    [seek],
  );

  const positionSeconds = positionMs / 1000;

  const mouseHandlers: MouseHandlers = useMemo(
    () => ({
      handleNoteClick,
      handleMouseEnter,
      handleMouseLeave,
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
      mouseHandlers,
      measureSelection,
      analysis: futureAnalysis,
    }),
    [
      notes,
      voiceMask,
      measuresAndBeats,
      showVelocity,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      futureAnalysis,
    ],
  );

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        flexGrow: 1,
      }}
    >
      <div
        key="leftPanel"
        style={{
          width: "100%",
          height: "100%",
          padding: 0,
          backgroundColor: "black",
          flexGrow: 1,
          overflowX: "auto",
        }}
      >
        {systemLayout === "merged" ? (
          <MergedSystemLayout
            {...commonParams}
            measuresAndBeats={measuresAndBeats}
            registerSeekCallback={registerSeekCallback}
          />
        ) : (
          <SplitSystemLayout
            {...commonParams}
            voiceNames={voiceNames}
            setVoiceMask={setVoiceMask}
          />
        )}
      </div>
      {showAnalysisBox && !exercise && (
        <div style={{ width: "350px", height: "100%" }}>
          <AnalysisBox
            analysis={analysis}
            commitAnalysisUpdate={commitAnalysisUpdate}
            previouslySelectedMeasure={previouslySelectedMeasure}
            selectedMeasure={selectedMeasure}
            selectMeasure={selectMeasure}
            artist={artist}
            song={song}
          />
        </div>
      )}
      {exercise && (
        <div
          style={{
            position: "fixed",
            right: 0,
            bottom: 0,
            backgroundColor: "black",
            width: "250px",
            height: "120px",
            zIndex: 10000000,
            border: "1px solid yellow",
            padding: "10px",
          }}
        >
          <Exercise
            artist={artist}
            song={song}
            type={exercise}
            analysis={analysis}
            savedAnalysis={savedAnalysis}
            sequencer={sequencer}
          />
        </div>
      )}
      <div
        style={{
          position: "fixed",
          top: "0px",
          right: "500px",
          zIndex: "100",
        }}
      >
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