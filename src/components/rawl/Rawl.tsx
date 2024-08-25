import {
  faArrowUpRightFromSquare,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { VoiceMask } from "../App";
import { MeasureSelection } from "./AnalysisGrid";
import FrozenNotesLayout from "./FrozenNotesLayout";
import {
  MergedSystemLayout,
  MouseHandlers,
  StackedSystemLayout,
  SystemLayout,
  SystemLayoutProps,
  TonalHistogramLayout,
  getPhraseStarts,
} from "./SystemLayout";
import { formatTag } from "./TagSearch";
import {
  ANALYSIS_STUB,
  Analysis,
  PitchClass,
  advanceAnalysis,
  getNewAnalysis,
} from "./analysis";
import { findFirstPhraseStart, findTonic } from "./autoAnalysis";
import { corpora } from "./corpora/corpora";
import { LinkForSeparateTab } from "./course/Course";
import { buildManualMeasuresAndBeats } from "./measures";
import { ColoredNotesInVoices, Note, ParsingResult } from "./parseMidi";
import {
  TonalHistogram,
  calculateTonalHistograms,
} from "./tonalSearch/TonalSearch";

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 40;

export type SecondsConverter = (number) => number;
export const secondsToX__: SecondsConverter = (seconds) =>
  seconds * SECOND_WIDTH;
export const xToSeconds__: SecondsConverter = (x) => x / SECOND_WIDTH;

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

export type AppStateForRawl = {
  voiceNames: string[];
  voiceMask: VoiceMask;
  setVoiceMask: SetVoiceMask;
  latencyCorrectionMs: number;
};

export const getTonic = (measure: number, analysis: Analysis): PitchClass => {
  const modulations = getModulations(analysis);
  let i = 0;
  while (i + 1 < modulations.length && modulations[i + 1].measure <= measure) {
    i++;
  }
  return modulations[i].tonic as PitchClass;
};

export const getModulations = (analysis: Analysis) =>
  Object.entries(analysis.modulations || [])
    .map((entry) => ({
      measure: parseInt(entry[0], 10) - 1,
      tonic: entry[1],
    }))
    .sort((a, b) => a.measure - b.measure);

const getSecondsMeasure = (
  seconds: number,
  measures: number[] | null,
): number => {
  if (!measures) {
    return -1;
  }
  const result = measures.findIndex((time) => time >= seconds);
  return (result === -1 ? measures.length - 1 : result) - 1;
};

const getNoteMeasure = (note: Note, measures: number[] | null): number =>
  getSecondsMeasure((note.span[0] + note.span[1]) / 2, measures);

export const getNoteColor = (
  note: Note,
  analysis: Analysis,
  measures: number[],
): string =>
  `noteColor_${
    analysis.modulations[1] === null
      ? "default"
      : (note.note.midiNumber -
          getTonic(getNoteMeasure(note, measures), analysis)) %
        12
  }_colors`;

export type RenumberMeasureCallback = (
  measure: number,
  isShift: boolean,
) => void;

const CompositionTitle: React.FC<{ slug: string; webUrl: string | null }> = ({
  slug,
  webUrl,
}) => {
  const formattedTitle = slug
    .replace(/---/g, " – ")
    .replace(/-/g, " ")
    .replace(/_/g, " ");

  const author = React.useMemo(() => {
    const corpusEntry = corpora.find((corpus) => corpus.midis.includes(slug));
    return corpusEntry
      ? corpusEntry.slug
          .replace(/_/g, " ")
          .split(" ")
          .map(
            (word) =>
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          )
          .join(" ")
      : "";
  }, [slug]);

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontSize: "1.2em",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1em" }}>
        {formattedTitle}
        {author && (
          <span style={{ fontWeight: "normal", marginLeft: "10px" }}>
            ({author})
          </span>
        )}
        {webUrl && (
          <a
            href={webUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "gray",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            <FontAwesomeIcon
              icon={faArrowUpRightFromSquare}
              style={{ width: "15px", marginLeft: "10px" }}
            />
          </a>
        )}
      </h1>
    </div>
  );
};

const Rawl: React.FC<{
  parsingResult: ParsingResult;
  getCurrentPositionMs: () => number;
  savedAnalysis?: Analysis;
  saveAnalysis: (Analysis) => void;
  voiceNames: string[];
  voiceMask: VoiceMask;
  setVoiceMask: SetVoiceMask;
  showAnalysisBox: boolean;
  seek: (ms: number) => void;
  artist: string;
  song: string;
  latencyCorrectionMs: number;
  registerKeyboardHandler: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler: (id: string) => void;
  webUrl: string | null;
}> = ({
  parsingResult,
  getCurrentPositionMs,
  savedAnalysis,
  saveAnalysis,
  voiceNames,
  voiceMask,
  setVoiceMask,
  showAnalysisBox: enableManualRemeasuring,
  seek,
  artist,
  song,
  latencyCorrectionMs,
  registerKeyboardHandler,
  unregisterKeyboardHandler,
  webUrl,
}) => {
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    document.title = `${song} - ${artist} - Rawl`;
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
  const [systemLayout, setSystemLayout] = useState<SystemLayout>("merged");

  const commitAnalysisUpdate = useCallback(
    (analysisUpdate: Partial<Analysis>) => {
      const updatedAnalysis = { ...analysis, ...analysisUpdate };
      saveAnalysis(updatedAnalysis);
      setAnalysis(updatedAnalysis);
    },
    [analysis, saveAnalysis],
  );

  const [selectedMeasure, setSelectedMeasure] = useState<number | null>(null);

  const selectedMeasureRef = useRef(selectedMeasure);
  useEffect(() => {
    selectedMeasureRef.current = selectedMeasure;
  }, [selectedMeasure]);

  const { notes } = parsingResult;
  const allNotes = useMemo(() => notes.flat(), [notes]);

  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);
  const handleMouseEnter = useCallback(
    (note: Note) => {
      if (!enableManualRemeasuring && selectedMeasureRef.current) {
        setHoveredNote(note);
      }
    },
    [enableManualRemeasuring],
  );
  const handleMouseLeave = useCallback(() => {
    if (!enableManualRemeasuring) {
      setHoveredNote(null);
    }
  }, [enableManualRemeasuring]);

  const futureAnalysis = useMemo(
    () =>
      hoveredNote
        ? getNewAnalysis(
            hoveredNote,
            selectedMeasureRef.current,
            enableManualRemeasuring,
            analysisRef.current,
          )
        : analysis,
    [hoveredNote, analysis, enableManualRemeasuring],
  );
  const measuresAndBeats = useMemo(() => {
    if (futureAnalysis.measures) {
      return buildManualMeasuresAndBeats(futureAnalysis.measures, allNotes);
    }
    return parsingResult?.measuresAndBeats;
  }, [futureAnalysis, allNotes, parsingResult]);

  const selectMeasure = useCallback(
    (measure) => {
      if (
        selectedMeasure &&
        getPhraseStarts(analysis, measuresAndBeats.measures.length).indexOf(
          selectedMeasure,
        ) !== -1
      ) {
        const diff = measure - selectedMeasure;
        if (diff >= -4) {
          // prevent accidental misclicks when a selection is forgotten by user
          const analysisUpdate: Partial<Analysis> = {
            phrasePatch: [
              ...analysis.phrasePatch,
              { measure: selectedMeasure, diff },
            ],
          };
          setSelectedMeasure(null);
          commitAnalysisUpdate(analysisUpdate);
        }
      } else {
        setSelectedMeasure(measure);
      }
      setHoveredNote(null);
    },
    [selectedMeasure, analysis, measuresAndBeats],
  );
  const splitAtMeasure = useCallback(
    (groupByTwoPhrasesTillTheEnd: boolean) => {
      const phraseStarts = getPhraseStarts(
        analysis,
        measuresAndBeats.measures.length,
      );
      const newSections = [phraseStarts.indexOf(selectedMeasure)];

      if (newSections[0] === -1) {
        alert(
          `splitAtMeasure, not found ${selectedMeasure} in ${JSON.stringify(
            phraseStarts,
          )}`,
        );
      } else {
        if (groupByTwoPhrasesTillTheEnd) {
          for (let i = newSections[0]; i < phraseStarts.length - 1; i += 2) {
            newSections.push(i);
          }
        }

        const analysisUpdate: Partial<Analysis> = {
          sections: [
            ...new Set([...(analysis.sections ?? [0]), ...newSections]),
          ].sort((a, b) => a - b),
        };
        setSelectedMeasure(null);
        commitAnalysisUpdate(analysisUpdate);
      }
    },
    [selectedMeasure, analysis, measuresAndBeats],
  );
  const mergeAtMeasure = useCallback(() => {
    const phraseStarts = getPhraseStarts(
      analysis,
      measuresAndBeats.measures.length,
    );
    const sectionToRemove = phraseStarts.indexOf(selectedMeasure);
    if (sectionToRemove === -1) {
      alert(
        `mergeAtMeasure, not found ${selectedMeasure} in ${JSON.stringify(
          phraseStarts,
        )}`,
      );
    } else {
      const analysisUpdate: Partial<Analysis> = {
        sections: (analysis.sections ?? [0]).filter(
          (section) => section !== sectionToRemove,
        ),
      };
      setSelectedMeasure(null);
      commitAnalysisUpdate(analysisUpdate);
    }
  }, [selectedMeasure, analysis, measuresAndBeats]);

  const renumberMeasure = useCallback(
    (displayNumber, isShift) => {
      setSelectedMeasure(null);

      const analysisUpdate =
        enableManualRemeasuring && isShift
          ? {
              measures: {
                beatsPerMeasure: {
                  ...(analysis.measures?.beatsPerMeasure ?? {}),
                  [selectedMeasure]: displayNumber,
                },
                measureStarts: analysis.measures?.measureStarts ?? {},
              },
            }
          : {
              measureRenumbering: {
                [selectedMeasure]: displayNumber,
              },
            };
      commitAnalysisUpdate(analysisUpdate);
    },
    [selectMeasure, analysis, selectedMeasure, enableManualRemeasuring],
  );

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
    if (tonic !== -1 && analysis.modulations[1] === null) {
      diff.modulations = { 1: tonic };
    }
    setAnalysis({ ...analysis, ...diff });
  }, [allNotes]);

  const handleNoteClick = useCallback(
    (note: Note) => {
      advanceAnalysis(
        note,
        selectedMeasureRef.current,
        enableManualRemeasuring,
        setSelectedMeasure,
        analysisRef.current,
        commitAnalysisUpdate,
      );
    },
    [enableManualRemeasuring, commitAnalysisUpdate],
  );

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

      if (enableManualRemeasuring && selectedMeasure) {
        advanceAnalysis(
          {
            span: [time, -1],
            note: { midiNumber: -1 },
            isDrum: false,
            chipState: { on: {}, off: {} },
            id: -1,
            voiceIndex: -1,
          },
          selectedMeasureRef.current,
          enableManualRemeasuring,
          setSelectedMeasure,
          analysisRef.current,
          commitAnalysisUpdate,
        );
      } else {
        selectMeasure(null);

        seek(time * 1000);
      }
    },
    [
      seek,
      selectMeasure,
      selectedMeasure,
      enableManualRemeasuring,
      commitAnalysisUpdate,
    ],
  );

  const positionSeconds = positionMs / 1000;

  const mouseHandlers: MouseHandlers = useMemo(
    () => ({
      handleNoteClick,
      handleMouseEnter,
      handleMouseLeave,
      hoveredNote,
      systemClickHandler,
    }),
    [
      handleNoteClick,
      handleMouseEnter,
      handleMouseLeave,
      hoveredNote,
      systemClickHandler,
    ],
  );

  const measureSelection: MeasureSelection = useMemo(
    () => ({
      selectedMeasure,
      selectMeasure,
      splitAtMeasure,
      mergeAtMeasure,
      renumberMeasure,
    }),
    [
      selectedMeasure,
      selectMeasure,
      splitAtMeasure,
      mergeAtMeasure,
      renumberMeasure,
    ],
  );

  const coloredNotes: ColoredNotesInVoices = useMemo(
    () =>
      notes.map((notesInVoice, voiceIndex) =>
        notesInVoice.map((note) => ({
          ...note,
          color: note.isDrum
            ? "noteColor_drum"
            : getNoteColor(note, futureAnalysis, measuresAndBeats.measures),
          isActive: voiceMask[voiceIndex],
        })),
      ),
    [notes, futureAnalysis, measuresAndBeats, voiceMask],
  );

  const tonalHistograms = useMemo((): TonalHistogram[] => {
    return calculateTonalHistograms(
      coloredNotes.flat(),
      measuresAndBeats.measures,
      futureAnalysis,
    );
  }, [coloredNotes, measuresAndBeats.measures, futureAnalysis]);

  const systemLayoutProps: SystemLayoutProps = useMemo(
    () => ({
      notes: coloredNotes,
      voiceMask,
      voiceNames,
      setVoiceMask,
      measuresAndBeats,
      showVelocity,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      analysis: futureAnalysis,
      registerKeyboardHandler,
      unregisterKeyboardHandler,
      tonalHistograms,
      frozenNotes: coloredNotes,
    }),
    [
      coloredNotes,
      voiceMask,
      voiceNames,
      setVoiceMask,
      measuresAndBeats,
      showVelocity,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      futureAnalysis,
      registerKeyboardHandler,
      unregisterKeyboardHandler,
      tonalHistograms,
    ],
  );

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexGrow: 1,
      }}
    >
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
        className="Rawl"
      >
        {slug && <CompositionTitle slug={slug} webUrl={webUrl} />}
        {systemLayout === "merged" ? (
          <MergedSystemLayout {...systemLayoutProps} />
        ) : systemLayout === "stacked" ? (
          <StackedSystemLayout {...systemLayoutProps} />
        ) : systemLayout === "tonal" ? (
          <TonalHistogramLayout
            {...systemLayoutProps}
            tonalHistograms={tonalHistograms}
          />
        ) : (
          <FrozenNotesLayout {...systemLayoutProps} />
        )}
      </div>
      <div
        style={{
          position: "fixed",
          top: 40,
          right: 0,
          zIndex: 1000000,
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
          <label key={"stacked"} className="inline">
            <input
              onChange={() => setSystemLayout("stacked")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "stacked"}
              value={"stacked"}
            />
            ☰
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
          <label key={"tonal"} className="inline">
            <input
              onChange={() => setSystemLayout("tonal")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "tonal"}
              value={"tonal"}
            />
            📊
          </label>
          <label key={"frozen"} className="inline">
            <input
              onChange={() => setSystemLayout("frozen")}
              type="radio"
              name="system-layout"
              checked={systemLayout === "frozen"}
              value={"frozen"}
            />
            🧊
          </label>
          <FontAwesomeIcon
            icon={faCopy}
            style={{
              cursor: "pointer",
              width: "15px",
              color: "gray",
              marginLeft: "10px",
              marginTop: "10px",
            }}
            onClick={() =>
              navigator.clipboard.writeText(
                `"${location.pathname.substring(
                  location.pathname.lastIndexOf("/") + 1,
                )}", `,
              )
            }
          />
        </div>
        <TagBrowser tags={analysis.tags} />
      </div>
    </div>
  );
};

export default Rawl;
