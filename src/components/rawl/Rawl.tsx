import {
  faArrowUpRightFromSquare,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { doc, getFirestore, updateDoc } from "firebase/firestore/lite";
import * as React from "react";
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link, useHistory } from "react-router-dom";
import { unstable_batchedUpdates } from "react-dom";
import { playRawMidiNote } from "../../sampler/sampler";
import { VoiceMask } from "../App";
import { AppContext } from "../AppContext";
import ErrorBoundary from "../ErrorBoundary";
import { AnalysisTransposeContext, MeasureSelection } from "./AnalysisGrid";
import CompositionTitle from "./CompositionTitle";
import FrozenNotesLayout from "./FrozenNotesLayout";
import { DrumPlaybackContext, useDrumPlaybackClock } from "./drumPlayback";
import { NotePlaybackContext, useNotePlaybackClock } from "./notePlayback";
import { MergedSystemLayout, SystemLayoutProps } from "./SystemLayout";
import {
  ANALYSIS_STUB,
  Analysis,
  PitchClass,
  advanceAnalysis,
  getNewAnalysis,
  getExcludedVoices,
  getDrumVoices,
  getPhraseStarts,
} from "./analysis";
import { findFirstPhraseStart, findTonic } from "./autoAnalysis";
import { beautifySlug } from "./corpora/utils";
import { MouseHandlers } from "./getNoteRectangles";
import LayoutSelector, { SystemLayout } from "./layouts/LayoutSelector";
import { buildManualMeasuresAndBeats } from "./measures";
import { generateFormattedScore } from "./notesToInsertConverter";
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
  latencyCorrectionMs?: number;
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

export const getNoteColorPitchClass = (
  note: Note,
  analysis: Analysis,
  measures: number[],
): number | "default" | "drum" => {
  if (note.isDrum) {
    return "drum";
  }

  if (analysis.modulations[1] === null) {
    return "default";
  }

  // Calculate the note's pitch class relative to the tonic
  const noteMeasure = getNoteMeasure(note, measures);
  const tonic = getTonic(noteMeasure, analysis);
  const pitchClass = (note.note.midiNumber - tonic) % 12;
  // Ensure positive value (JavaScript's % can return negative values)
  return (pitchClass + 12) % 12;
};

export const pitchClassToCssClass = (
  pitchClass: number | "default" | "drum",
): string => {
  return `noteColor_${pitchClass}_colors`;
};

export const getNoteColor = (
  note: Note,
  analysis: Analysis,
  measures: number[],
): string => {
  const pitchClass = getNoteColorPitchClass(note, analysis, measures);
  return pitchClassToCssClass(pitchClass);
};

export type SetBeatsPerMeasureCallback = (beatsPerMeasure: number) => void;

export type RawlProps = {
  parsingResult: ParsingResult;
  getCurrentPositionMs: () => number;
  savedAnalysis?: Analysis;
  saveAnalysis: (analysis: Analysis) => void;
  voiceNames: string[];
  voiceMask: VoiceMask;
  setVoiceMask: (mask: VoiceMask) => void;
  onVoiceHover?: (voiceIndex: number | null) => void;
  setDrumVoices?: (voices: number[]) => void;
  enableManualRemeasuring?: boolean;
  seek: (ms: number) => void;
  latencyCorrectionMs: number;
  sourceUrl: string | null;
  measureStart?: number;
  isEmbedded?: boolean;
  usePageScroll?: boolean;
  editorRef?: React.RefObject<any>;
  navigateToSourceLocation?: (sourceLocation: {
    row: number;
    col: number;
  }) => boolean;
  onEject?: () => void;
};

const Rawl: React.FC<RawlProps> = ({
  parsingResult,
  getCurrentPositionMs,
  savedAnalysis,
  saveAnalysis,
  voiceNames,
  voiceMask,
  setVoiceMask,
  onVoiceHover,
  setDrumVoices,
  enableManualRemeasuring = false,
  seek,
  sourceUrl,
  measureStart,
  isEmbedded = false,
  usePageScroll = false,
  editorRef,
  navigateToSourceLocation,
  onEject,
}) => {
  const { currentMidi, setCurrentMidi, rawlProps, togglePause, setFirstTonic, transpose } =
    useContext(AppContext);
  const slug = currentMidi?.slug || "";
  const lakhKey = currentMidi?.analysisKey?.startsWith("c/MIDI/")
    ? currentMidi.analysisKey
    : null;
  // The filename route resolves to the canonical Lakh URL via its catalog.
  const fileUrl = lakhKey
    ? `/${lakhKey.split("/").map(encodeURIComponent).join("/")}`
    : `/f/${slug}`;
  const history = useHistory();

  const [analysis, setAnalysis] = useState<Analysis>(
    savedAnalysis || rawlProps?.savedAnalysis || ANALYSIS_STUB,
  );

  useEffect(() => {
    if (savedAnalysis) {
      setAnalysis(savedAnalysis);
    } else if (rawlProps?.savedAnalysis) {
      setAnalysis(rawlProps.savedAnalysis);
    }
  }, [savedAnalysis, rawlProps?.savedAnalysis]);

  const analysisRef = useRef(analysis);
  useEffect(() => {
    setFirstTonic(getModulations(analysis)[0]?.tonic ?? null);
  }, [analysis.modulations, parsingResult, setFirstTonic]);
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

  const drumVoices = useMemo(
    () => getDrumVoices(analysis, parsingResult.notes.length),
    [analysis.drumVoices, parsingResult.notes.length],
  );
  const drumVoiceSet = useMemo(() => new Set(drumVoices), [drumVoices]);
  const nativeDrumVoices = useMemo(
    () =>
      parsingResult.notes.flatMap((voice, index) =>
        voice.some((note) => note.isDrum) ? [index] : [],
      ),
    [parsingResult.notes],
  );
  useEffect(() => {
    setDrumVoices?.(drumVoices);
  }, [drumVoices, setDrumVoices]);

  const toggleVoiceDrum = useCallback(
    (voiceIndex: number) => {
      if (
        !Number.isInteger(voiceIndex) ||
        voiceIndex < 0 ||
        voiceIndex >= parsingResult.notes.length ||
        nativeDrumVoices.includes(voiceIndex)
      )
        return;
      const next = new Set(drumVoices);
      if (next.has(voiceIndex)) next.delete(voiceIndex);
      else next.add(voiceIndex);
      commitAnalysisUpdate({ drumVoices: [...next].sort((a, b) => a - b) });
      setHoveredNote(null);
    },
    [
      drumVoices,
      parsingResult.notes.length,
      nativeDrumVoices,
      commitAnalysisUpdate,
    ],
  );

  const excludedVoices = useMemo(
    () => getExcludedVoices(analysis, parsingResult.notes.length),
    [analysis.excludedVoices, parsingResult.notes.length],
  );
  const excludedVoiceSet = useMemo(
    () => new Set(excludedVoices),
    [excludedVoices],
  );
  const previousExcludedVoices = useRef(new Set<number>());
  const arrangementVoiceMask = useMemo(
    () =>
      voiceMask.map((active, index) => active && !excludedVoiceSet.has(index)),
    [voiceMask, excludedVoiceSet],
  );
  const setArrangementVoiceMask = useCallback(
    (mask: VoiceMask) => {
      setVoiceMask(
        mask.map((active, index) => active && !excludedVoiceSet.has(index)),
      );
    },
    [setVoiceMask, excludedVoiceSet],
  );

  useEffect(() => {
    const previous = previousExcludedVoices.current;
    previousExcludedVoices.current = excludedVoiceSet;
    const mask = voiceMask.map(
      (active, index) =>
        !excludedVoiceSet.has(index) && (active || previous.has(index)),
    );
    if (mask.some((active, index) => active !== voiceMask[index]))
      setVoiceMask(mask);
  }, [excludedVoiceSet, voiceMask, setVoiceMask]);

  const toggleVoiceExcluded = useCallback(
    (voiceIndex: number) => {
      if (
        !Number.isInteger(voiceIndex) ||
        voiceIndex < 0 ||
        voiceIndex >= parsingResult.notes.length
      )
        return;
      const next = new Set(excludedVoices);
      if (next.has(voiceIndex)) next.delete(voiceIndex);
      else next.add(voiceIndex);
      commitAnalysisUpdate({ excludedVoices: [...next].sort((a, b) => a - b) });
      setHoveredNote(null);
    },
    [excludedVoices, parsingResult.notes.length, commitAnalysisUpdate],
  );

  // Preserve slots and note.voiceIndex so MIDI channels, colors and saved indices
  // continue to refer to the original voices, including after restoration.
  const notes = useMemo(
    () =>
      parsingResult.notes.map((voice, index) =>
        excludedVoiceSet.has(index)
          ? []
          : drumVoiceSet.has(index)
          ? voice.map((note) => ({
              ...note,
              isDrum: true,
              pitchBend: undefined,
            }))
          : voice,
      ),
    [parsingResult.notes, excludedVoiceSet, drumVoiceSet],
  );
  const timingNotes = useMemo(
    () => parsingResult.notes.flat(),
    [parsingResult.notes],
  );
  const allNotes = useMemo(() => {
    return notes.flat();
  }, [notes]);

  const [hoveredNote, setHoveredNote] = useState<Note | null>(null);

  const playNote = useCallback((note: Note) => {
    const duration = note.span[1] - note.span[0];
    playRawMidiNote(
      note.note.midiNumber + (note.isDrum ? 0 : transpose),
      duration * 1000,
    );
  }, [transpose]);

  const handleMouseEnter = useCallback(
    (note: Note) => {
      if (!enableManualRemeasuring) {
        if (selectedMeasureRef.current) {
          setHoveredNote(note);
        } else if (
          window.event instanceof MouseEvent &&
          window.event.shiftKey
        ) {
          playNote(note);
        }
      }
    },
    [enableManualRemeasuring, playNote],
  );

  const handleMouseLeave = useCallback(() => {
    if (!enableManualRemeasuring) {
      setHoveredNote(null);
    }
  }, [enableManualRemeasuring]);

  const futureAnalysis = useMemo(() => {
    return hoveredNote
      ? getNewAnalysis(
          hoveredNote,
          selectedMeasureRef.current,
          enableManualRemeasuring,
          analysisRef.current,
        )
      : analysis;
  }, [hoveredNote, analysis, enableManualRemeasuring]);

  const measuresAndBeats = useMemo(() => {
    if (futureAnalysis.measures) {
      return buildManualMeasuresAndBeats(futureAnalysis.measures, timingNotes);
    }
    return parsingResult?.measuresAndBeats;
  }, [futureAnalysis, timingNotes, parsingResult]);

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
    (groupByPhrasesTillTheEnd: boolean, groupSize: number = 2) => {
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
        if (groupByPhrasesTillTheEnd) {
          for (
            let i = newSections[0];
            i < phraseStarts.length - 1;
            i += groupSize
          ) {
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

  const setBeatsPerMeasure = useCallback(
    (beatsPerMeasure) => {
      setSelectedMeasure(null);

      const analysisUpdate = {
        measures: {
          beatsPerMeasure: {
            ...(analysis.measures?.beatsPerMeasure ?? {}),
            [selectedMeasure]: beatsPerMeasure,
          },
          measureStarts: analysis.measures?.measureStarts ?? {},
        },
      };
      commitAnalysisUpdate(analysisUpdate);
    },
    [analysis, selectedMeasure, commitAnalysisUpdate],
  );

  useEffect(() => {
    if (analysis.phrasePatch?.length > 0 || allNotes.length === 0) {
      return;
    }

    const pitchedNotes = allNotes.filter((note) => !note.isDrum);
    if (pitchedNotes.length === 0) return;
    const firstPhraseStart = findFirstPhraseStart(
      pitchedNotes,
      measuresAndBeats,
    );
    const diff: Partial<Analysis> = {};
    if (firstPhraseStart !== -1) {
      diff.phrasePatch = [{ measure: 1, diff: firstPhraseStart }];
    }

    const tonic = findTonic(pitchedNotes);
    if (tonic !== -1 && analysis.modulations[1] === null) {
      diff.modulations = { 1: tonic };
    }
    setAnalysis({ ...analysis, ...diff });
  }, [allNotes]);

  const coloredNotes: ColoredNotesInVoices = useMemo(() => {
    // Initialize array to count notes by color (0-11)

    const result = notes.map((notesInVoice, voiceIndex) =>
      notesInVoice.map((note) => {
        // Get the pitch class
        const colorPitchClass = note.isDrum
          ? "drum"
          : getNoteColorPitchClass(
              note,
              futureAnalysis,
              measuresAndBeats.measures,
            );

        // Get the CSS class name
        const color = pitchClassToCssClass(colorPitchClass);

        return {
          ...note,
          color,
          isActive: arrangementVoiceMask[voiceIndex],
          colorPitchClass,
          // Include sourceLocation if it exists in the note
          sourceLocation: note.sourceLocation,
        };
      }),
    );

    return result;
  }, [notes, futureAnalysis, measuresAndBeats, arrangementVoiceMask, slug]);

  const handleNoteClick = useCallback(
    (note: Note) => {
      if (selectedMeasureRef.current) {
        advanceAnalysis(
          note,
          selectedMeasureRef.current,
          enableManualRemeasuring,
          setSelectedMeasure,
          analysisRef.current,
          commitAnalysisUpdate,
        );
      } else {
        // First check if we can navigate to the source location
        if (note.sourceLocation && navigateToSourceLocation) {
          // Try to navigate and check if it was successful
          navigateToSourceLocation(note.sourceLocation);
        } else {
          // Default behavior when there's no source location or navigation function
          playNote(note);
        }
      }
    },
    [
      enableManualRemeasuring,
      commitAnalysisUpdate,
      playNote,
      navigateToSourceLocation,
    ],
  );

  const [positionMs, setPositionMs] = useState(0);
  const drumPlaybackClock = useDrumPlaybackClock();
  const notePlaybackClock = useNotePlaybackClock();

  useEffect(() => {
    let running = true;
    drumPlaybackClock.reset();
    notePlaybackClock.reset();

    const animate = () => {
      if (!running) {
        return;
      }

      const position = getCurrentPositionMs();
      // React 16 does not automatically batch requestAnimationFrame updates.
      unstable_batchedUpdates(() => {
        drumPlaybackClock.advance(position / 1000);
        notePlaybackClock.advance(position / 1000);
        setPositionMs(position);
      });
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      running = false;
    };
  }, [getCurrentPositionMs, drumPlaybackClock, notePlaybackClock, parsingResult]);

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
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const distance = e.clientX - rect.left + targetElement.scrollLeft;
      const time = xToSeconds(distance);

      if (enableManualRemeasuring && selectedMeasure) {
        advanceAnalysis(
          {
            span: [time, -1],
            note: { midiNumber: -1 },
            isDrum: false,
            id: "-1",
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

  // Calculate current tonic based on position
  const currentTonic = useMemo(() => {
    if (!measuresAndBeats?.measures) return 0;
    const currentMeasure = getSecondsMeasure(
      positionSeconds,
      measuresAndBeats.measures,
    );
    const tonic = getTonic(currentMeasure, futureAnalysis);
    return tonic == null ? tonic : ((tonic + transpose) % 12 + 12) % 12;
  }, [positionSeconds, measuresAndBeats, futureAnalysis, transpose]);

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
      setBeatsPerMeasure,
    }),
    [
      selectedMeasure,
      selectMeasure,
      splitAtMeasure,
      mergeAtMeasure,
      setBeatsPerMeasure,
    ],
  );

  const [hoveredColors, setHoveredColors] = useState<string[] | null>(null);

  const systemLayoutProps: SystemLayoutProps = useMemo(
    () => ({
      notes: coloredNotes,
      voiceMask: arrangementVoiceMask,
      voiceNames,
      setVoiceMask: setArrangementVoiceMask,
      onVoiceHover,
      excludedVoices,
      drumVoices,
      nativeDrumVoices,
      onToggleVoiceDrum: currentMidi?.analysisKey?.startsWith("c/MIDI/")
        ? toggleVoiceDrum
        : undefined,
      onToggleVoiceExcluded: currentMidi?.analysisKey?.startsWith("c/MIDI/")
        ? toggleVoiceExcluded
        : undefined,
      measuresAndBeats,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      analysis: futureAnalysis,
      frozenNotes: coloredNotes,
      saveAnalysis,
      measureStart,
      slug,
      currentTonic,
      togglePause,
      seek,
      hoveredColors,
      setHoveredColors,
    }),
    [
      coloredNotes,
      arrangementVoiceMask,
      voiceNames,
      setArrangementVoiceMask,
      onVoiceHover,
      excludedVoices,
      drumVoices,
      nativeDrumVoices,
      toggleVoiceDrum,
      toggleVoiceExcluded,
      currentMidi?.analysisKey,
      measuresAndBeats,
      positionSeconds,
      mouseHandlers,
      measureSelection,
      futureAnalysis,
      saveAnalysis,
      measureStart,
      slug,
      currentTonic,
      togglePause,
      seek,
      hoveredColors,
      setHoveredColors,
    ],
  );

  useEffect(() => {
    if (measureStart !== undefined && measuresAndBeats) {
      const absoluteMeasureStart =
        measureStart + (analysis.measureRenumbering?.[1] || 0) - 1;
      const seekTime = measuresAndBeats.measures[absoluteMeasureStart] - 1;
      if (seekTime !== undefined) {
        seek(seekTime * 1000);
      }
    }
  }, [measureStart, measuresAndBeats, analysis.measureRenumbering, seek]);

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

  const [showCopyAnimation, setShowCopyAnimation] = useState(false);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  const handleCopySource = useCallback(() => {
    if (!measuresAndBeats || !coloredNotes || coloredNotes.length === 0) {
      console.error("No data to copy");
      return;
    }

    // Generate complete formatted score with all voices and analysis info
    const formattedScore = generateFormattedScore(
      coloredNotes,
      measuresAndBeats,
      analysis,
    );

    // Get the beautified title to use in the editor
    const beautifiedTitle = beautifySlug(slug);

    // Store both the score and the beautified title
    localStorage.setItem("new_editor_score", formattedScore);
    localStorage.setItem("new_editor_title", beautifiedTitle);

    // Navigate to the editor
    history.push("/e/new");

    // Optional: show a brief feedback animation before navigating
    setShowCopyAnimation(true);
  }, [coloredNotes, measuresAndBeats, analysis, history, slug]);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: usePageScroll ? "auto" : "100%",
        paddingLeft: "30px",
        overflow: usePageScroll ? "visible" : "hidden",
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
            to={fileUrl}
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
            onClick={() => {
              onEject?.();
            }}
          >
            <span>
              {lakhKey
                ? currentMidi?.title
                : slug
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
          overflow: usePageScroll ? "visible" : "hidden",
        }}
      >
        <div
          key="innerLeftPanel"
          style={{
            margin: 0,
            padding: 0,
            position: "relative",
            overflowX: usePageScroll ? "visible" : "scroll",
            overflowY: usePageScroll ? "visible" : "scroll",
            flexGrow: 1,
            backgroundColor: "black",
          }}
          className="Rawl"
        >
          {slug && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                position: "relative",
              }}
            >
              <CompositionTitle
                slug={slug}
                sourceUrl={sourceUrl}
                onSourceUrlUpdate={handleSourceUrlUpdate}
              />
              <button
                ref={copyButtonRef}
                onClick={handleCopySource}
                style={{
                  background: "#333",
                  color: "white",
                  border: "none",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "12px",
                  transition: "background-color 0.2s, transform 0.1s",
                  position: "relative",
                }}
                className="copy-source-button"
              >
                Edit score
              </button>
              {showCopyAnimation && (
                <div
                  style={{
                    position: "absolute",
                    right: copyButtonRef.current
                      ? copyButtonRef.current.offsetWidth / 2
                      : 20,
                    top: 0,
                    animation: "flyUpAndFade 1s forwards",
                    opacity: 0.8,
                    color: "white",
                    pointerEvents: "none",
                  }}
                >
                  <FontAwesomeIcon icon={faCopy} />
                </div>
              )}
              <style>
                {`
                  @keyframes flyUpAndFade {
                    0% {
                      transform: translate(0, 0);
                      opacity: 0.8;
                    }
                    100% {
                      transform: translate(0, -30px);
                      opacity: 0;
                    }
                  }
                  
                  .copy-source-button:hover {
                    background-color: #555 !important;
                  }
                  
                  .copy-source-button:active {
                    transform: scale(0.95);
                    background-color: #222 !important;
                  }
                `}
              </style>
            </div>
          )}
          <AnalysisTransposeContext.Provider value={transpose}>
            {systemLayout === "merged" ? (
              <NotePlaybackContext.Provider value={notePlaybackClock.register}>
                <DrumPlaybackContext.Provider value={drumPlaybackClock.register}>
                  <MergedSystemLayout
                    {...systemLayoutProps}
                    enableManualRemeasuring={enableManualRemeasuring}
                    isEmbedded={isEmbedded}
                    usePageScroll={usePageScroll}
                  />
                </DrumPlaybackContext.Provider>
              </NotePlaybackContext.Provider>
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
          </AnalysisTransposeContext.Provider>
        </div>
        {!isEmbedded && <LayoutSelector setSystemLayout={setSystemLayout} />}
      </div>
      {slug !== "forge_mock" && (
        <div style={{ color: "gray" }}>
          Shift+hover or click the note to play it separately
          <br />
          Press "Space" to play/pause
        </div>
      )}
    </div>
  );
};

export default Rawl;
