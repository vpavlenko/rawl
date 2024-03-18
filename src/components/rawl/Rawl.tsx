import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { AnalysisBox } from "./AnalysisBox";
import { MeasureSelection } from "./AnalysisGrid";
import {
  MergedSystemLayout,
  MouseHandlers,
  SplitSystemLayout,
  SystemLayout,
} from "./SystemLayout";
import { formatTag } from "./TagSearch";
import {
  ANALYSIS_STUB,
  Analysis,
  advanceAnalysis,
  getNewAnalysis,
} from "./analysis";
import { findFirstPhraseStart, findTonic } from "./autoAnalysis";
import { LinkForSeparateTab } from "./course/Course";
import { Note, ParsingResult } from "./parseMidi";

export const CHORD_HIGHLIGHT_LATENCY_CORRECTION_MS = -200;

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 40;
export const secondsToX__ = (seconds) => seconds * SECOND_WIDTH;
export const xToSeconds__ = (x) => x / SECOND_WIDTH;

export type SetVoiceMask = (mask: boolean[]) => void;

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
              text={`${formatTag(tag)}`}
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
  artist: string;
  song: string;
  sequencer: any;
  latencyCorrectionMs: number;
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
  artist,
  song,
  sequencer,
  latencyCorrectionMs,
}) => {
  useEffect(() => {
    document.title = `${artist?.slice(5)} - ${song?.slice(0, -4)} - Rawl`;
  }, [artist, song]);

  const [analysis, setAnalysis] = useState<Analysis>(
    savedAnalysis || ANALYSIS_STUB,
  );
  // useEffect(() => setAnalysis(ANALYSIS_STUB), [parsingResult]);
  useEffect(() => {
    // this can be in a race if Firebase is slow
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
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

  const [selectedMeasure, setSelectedMeasure] = useState<number | null>(null);
  const selectMeasure = useCallback(
    (measure) => setSelectedMeasure(measure),
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
  const handleMouseEnter = useCallback((note: Note, altKey: boolean) => {
    if (altKey) {
      setHoveredNote(note);
    }
    setHoveredAltKey(altKey);
  }, []);
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

  const handleNoteClick = useCallback((note: Note, altKey: boolean) => {
    advanceAnalysis(
      note,
      selectedMeasureRef.current,
      setSelectedMeasure,
      analysisRef.current,
      commitAnalysisUpdate,
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

      setPositionMs(getCurrentPositionMs() - latencyCorrectionMs);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
    };
  }, [latencyCorrectionMs]);

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
      selectedMeasure,
      selectMeasure,
    }),
    [selectedMeasure, selectMeasure],
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
          />
        )}
      </div>
      {showAnalysisBox && (
        <div style={{ width: "350px", height: "100%", zIndex: 20 }}>
          <AnalysisBox
            analysis={analysis}
            commitAnalysisUpdate={commitAnalysisUpdate}
            selectedMeasure={selectedMeasure}
            selectMeasure={selectMeasure}
            artist={artist}
            song={song}
          />
        </div>
      )}
      <div
        style={{
          position: "fixed",
          top: 40,
          right: 0,
          zIndex: 10000,
          backgroundColor: "black",
          marginRight: 0,
          padding: 10,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
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
            🔊
          </label>
          <label key={"merged"} className="inline">
            <input
              onChange={() => setSystemLayout("merged")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "merged"}
              value={"horizontal"}
            />
            █
          </label>
          <label key={"split"} className="inline">
            <input
              onChange={() => setSystemLayout("split")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "split"}
              value={"split"}
            />
            ☰
          </label>
        </div>
        <TagBrowser tags={analysis.tags} />
      </div>
    </div>
  );
};

export default Rawl;
