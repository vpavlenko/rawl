import {
  faArrowUpRightFromSquare,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import * as React from "react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useLocation } from "react-router-dom";
import { VoiceMask } from "../App";
import { AppContext } from "../AppContext";
import ErrorBoundary from "../ErrorBoundary";
import { MeasureSelection } from "./AnalysisGrid";
import FrozenNotesLayout from "./FrozenNotesLayout";
import {
  MergedSystemLayout,
  StackedSystemLayout,
  SystemLayoutProps,
} from "./SystemLayout";
import {
  ANALYSIS_STUB,
  Analysis,
  PitchClass,
  advanceAnalysis,
  getNewAnalysis,
  getPhraseStarts,
} from "./analysis";
import { findFirstPhraseStart, findTonic } from "./autoAnalysis";
import { corpora } from "./corpora/corpora";
import { MouseHandlers } from "./getNoteRectangles";
import LayoutSelector, { SystemLayout } from "./layouts/LayoutSelector";
import { buildManualMeasuresAndBeats } from "./measures";
import { ColoredNotesInVoices, Note, ParsingResult } from "./parseMidi";

export type SecondsSpan = [number, number];

const SECOND_WIDTH = 40;

export type SecondsConverter = (number) => number;
export const secondsToX__: SecondsConverter = (seconds) =>
  seconds * SECOND_WIDTH;
export const xToSeconds__: SecondsConverter = (x) => x / SECOND_WIDTH;

export type SetVoiceMask = (mask: boolean[]) => void;

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

const CompositionTitle: React.FC<{
  slug: string;
  sourceUrl: string | null;
  onSourceUrlUpdate: (newUrl: string) => void;
}> = ({ slug, sourceUrl, onSourceUrlUpdate }) => {
  const [editedUrl, setEditedUrl] = useState(sourceUrl || "");

  const handleSave = () => {
    if (editedUrl !== sourceUrl) {
      onSourceUrlUpdate(editedUrl);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  const formattedTitle = slug
    .replace(/---/g, " – ")
    .replace(/-/g, " ")
    .replace(/_/g, " ");

  const relatedCorpora = React.useMemo(() => {
    return corpora
      .filter((corpus) => corpus.midis.includes(slug))
      .map((corpus) => corpus.slug);
  }, [slug]);

  const searchQuery = encodeURIComponent(formattedTitle);
  const museScoreUrl = `https://musescore.com/sheetmusic?sort=view_count&text=${searchQuery}`;

  return (
    <div
      style={{
        padding: "10px",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        color: "white",
        fontSize: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1em" }}>
        {formattedTitle}
        {relatedCorpora.length > 0 && (
          <span style={{ fontWeight: "normal", marginLeft: "10px" }}>
            (
            {relatedCorpora.map((corpus, index) => (
              <React.Fragment key={corpus}>
                {index > 0 && ", "}
                <Link
                  to={`/corpus/${corpus}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "inherit",
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {corpus.replace(/_/g, " ")}
                </Link>
              </React.Fragment>
            ))}
            )
          </span>
        )}
        {sourceUrl ? (
          <a
            href={sourceUrl}
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
        ) : (
          <>
            <input
              type="text"
              value={editedUrl}
              onChange={(e) => setEditedUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleSave}
              style={{
                marginLeft: "10px",
                fontSize: "0.8em",
                width: "200px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                color: "white",
                padding: "2px 5px",
              }}
              placeholder="Enter source URL"
            />
            <a
              href={museScoreUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                color: "gray",
                textDecoration: "none",
                cursor: "pointer",
                marginLeft: "10px",
              }}
              title="Search on MuseScore"
            >
              <FontAwesomeIcon icon={faLink} />
            </a>
          </>
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
  sourceUrl: string | null;
  measureStart?: number;
  isEmbedded?: boolean;
  isHiddenRoute?: boolean;
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
  sourceUrl,
  measureStart,
  isEmbedded = false,
  isHiddenRoute = false,
}) => {
  const location = useLocation();
  const { currentMidi, setCurrentMidi } = useContext(AppContext);
  const slug = currentMidi?.slug || "";

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

  const systemLayoutProps: SystemLayoutProps = useMemo(
    () => ({
      notes: coloredNotes,
      voiceMask,
      voiceNames,
      setVoiceMask,
      measuresAndBeats,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      analysis: futureAnalysis,
      frozenNotes: coloredNotes,
      saveAnalysis,
      measureStart,
    }),
    [
      coloredNotes,
      voiceMask,
      voiceNames,
      setVoiceMask,
      measuresAndBeats,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      futureAnalysis,
      saveAnalysis,
      measureStart,
    ],
  );

  useEffect(() => {
    console.log("Rawl: measureStart changed", measureStart);
    if (measureStart !== undefined && measuresAndBeats) {
      const absoluteMeasureStart =
        measureStart + (analysis.measureRenumbering?.[1] || 0) - 1;
      const seekTime = measuresAndBeats.measures[absoluteMeasureStart] - 1;
      if (seekTime !== undefined) {
        console.log("Seeking to time:", seekTime * 1000);
        seek(seekTime * 1000);
      }
    }
  }, [measureStart, measuresAndBeats, analysis.measureRenumbering, seek]);

  const handleCopyPath = useCallback(() => {
    navigator.clipboard.writeText(
      `"${location.pathname.substring(
        location.pathname.lastIndexOf("/") + 1,
      )}", `,
    );
  }, [location.pathname]);

  const handleSourceUrlUpdate = async (newUrl: string) => {
    if (currentMidi) {
      const db = getFirestore();
      const midiDocRef = doc(db, "midis", currentMidi.id);

      try {
        await updateDoc(midiDocRef, { url: newUrl });
        setCurrentMidi({ ...currentMidi, sourceUrl: newUrl });
      } catch (error) {
        console.error("Error updating source URL:", error);
        alert("Failed to update source URL. Please try again.");
      }
    }
  };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {isEmbedded && (
        <>
          <div
            style={{
              borderTop: "1px solid #666",
              flexShrink: 0,
            }}
          />
          <Link
            to={`/f/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "fixed",
              top: "calc(50vh + 1px)",
              right: "10px",
              color: "white",
              backgroundColor: "black",
              padding: "5px 10px",
              borderRadius: "5px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              zIndex: 100000000,
              fontSize: "14px",
            }}
          >
            <span>
              {slug
                .replace(/---/g, " – ")
                .replace(/-/g, " ")
                .replace(/_/g, " ")}
            </span>
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
          </Link>
        </>
      )}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
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
            flexGrow: 1,
            backgroundColor: "black",
          }}
          className="Rawl"
        >
          {slug && !isHiddenRoute && (
            <CompositionTitle
              slug={slug}
              sourceUrl={sourceUrl}
              onSourceUrlUpdate={handleSourceUrlUpdate}
            />
          )}
          {systemLayout === "merged" ? (
            <MergedSystemLayout
              {...systemLayoutProps}
              enableManualRemeasuring={enableManualRemeasuring}
              isEmbedded={isEmbedded}
            />
          ) : systemLayout === "stacked" ? (
            <StackedSystemLayout
              {...systemLayoutProps}
              enableManualRemeasuring={enableManualRemeasuring}
              isEmbedded={isEmbedded}
            />
          ) : (
            <ErrorBoundary
              fallback={<div>Error loading Frozen Notes Layout</div>}
            >
              <FrozenNotesLayout
                {...systemLayoutProps}
                saveAnalysis={saveAnalysis}
              />
            </ErrorBoundary>
          )}
        </div>
        {!isEmbedded && (
          <LayoutSelector
            systemLayout={systemLayout}
            setSystemLayout={setSystemLayout}
            onCopyPath={handleCopyPath}
          />
        )}
      </div>
    </div>
  );
};

export default Rawl;
