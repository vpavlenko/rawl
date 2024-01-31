import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFullScreenHandle } from "react-full-screen";
import styled from "styled-components";
import { AnalysisBox } from "./AnalysisBox";
import { MeasureSelection } from "./AnalysisGrid";
import Exercise, { ExerciseType } from "./Exercise";
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
import { LinkForSeparateTab } from "./course/Course";
import { Note, ParsingResult } from "./parseMidi";

// If not used, the playback cursor isn't exactly where the sound is.
// Sometimes it should be adjusted for external screens.
const LATENCY_CORRECTION_MS =
  (localStorage && parseInt(localStorage.getItem("latency"), 10)) || 250;

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 40;
export const secondsToX__ = (seconds) => seconds * SECOND_WIDTH;
export const xToSeconds__ = (x) => x / SECOND_WIDTH;

export type SetVoiceMask = (mask: boolean[]) => void;

const cleanForExercise = (savedAnalysis: Analysis, exercise: ExerciseType) => {
  if (exercise === "tonic") {
    return { ...savedAnalysis, tonic: null, modulations: {} };
  }
  return savedAnalysis;
};

const Control = styled.div`
  cursor: pointer;
  color: aqua;
`;

const TagBrowser: React.FC<{ tags?: string[] }> = ({ tags }) => {
  const [isShown, setIsShown] = useState<boolean>(false);
  return (
    tags?.length > 0 &&
    (isShown ? (
      <div>
        <Control onClick={() => setIsShown(false)}>hide</Control>
        {tags.map((tag) => (
          <div>
            <LinkForSeparateTab
              href={`/tags/${tag}`}
              text={`${tag.replace(":", ": ").replace("_", " ")}`}
            />
          </div>
        ))}
      </div>
    ) : (
      <Control onClick={() => setIsShown(true)} style={{}}>
        show <strong>{tags?.length}</strong> tag{tags?.length > 1 && "s"}
      </Control>
    ))
  );
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
  setEnterFullScreen: any;
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
  setEnterFullScreen,
}) => {
  useEffect(() => {
    document.title = `${artist.slice(5)} - ${song.slice(0, -4)} - Rawl`;
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

  const handleNoteClick = useCallback(
    showAnalysisBox
      ? (note: Note, altKey: boolean) => {
          advanceAnalysis(
            note,
            selectedMeasureRef.current,
            setSelectedMeasure,
            analysisRef.current,
            commitAnalysisUpdate,
            altKey,
          );
        }
      : null,
    [showAnalysisBox],
  );

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
        setHoveredNote(null);
      }
    };

    document.addEventListener("keydown", handleEscapePress);

    return () => {
      document.removeEventListener("keydown", handleEscapePress);
    };
  }, []);

  const systemClickHandler = useCallback(
    (e: React.MouseEvent, xToSeconds = xToSeconds__) => {
      const targetElement = e.target as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const distance = e.clientX - rect.left + targetElement.scrollLeft;
      const time = xToSeconds(distance);
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

  const fullScreenHandle = useFullScreenHandle();
  useEffect(() => {
    setEnterFullScreen(fullScreenHandle.enter);
    return () => setEnterFullScreen(() => {});
  }, []);

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
        className="Rawl"
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
            fullScreenHandle={fullScreenHandle}
          />
        )}
      </div>
      {showAnalysisBox && !exercise && (
        <div style={{ width: "350px", height: "100%", zIndex: 20 }}>
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
            right: 280,
            bottom: 30,
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
          top: 40,
          right: 5,
          zIndex: 10000,
          backgroundColor: "black",
          marginRight: 30,
          padding: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "row", gap: 15 }}>
          <label className="inline">
            <input
              title="Velocity"
              type="checkbox"
              onChange={(e) => {
                e.stopPropagation();
                setShowVelocity(e.target.checked);
              }}
              checked={showVelocity}
            />
            Velocity
          </label>
          <label key={"merged"} className="inline">
            <input
              onChange={() => setSystemLayout("merged")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "merged"}
              value={"horizontal"}
            />
            Merged
          </label>
          <label key={"split"} className="inline">
            <input
              onChange={() => setSystemLayout("split")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "split"}
              value={"split"}
            />
            Split
          </label>
          {!fullScreenHandle.active && (
            <FontAwesomeIcon
              icon={faExpand}
              style={{
                cursor: "pointer",
                position: "relative",
                top: 2,
              }}
              onClick={fullScreenHandle.enter}
            />
          )}
        </div>
        <TagBrowser tags={analysis.tags} />
      </div>
      <div></div>
    </div>
  );
};

export default Rawl;
