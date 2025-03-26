import { toggleComment } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import { doc, getDoc, getFirestore } from "firebase/firestore/lite";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RouteComponentProps, useParams, withRouter } from "react-router-dom";
import styled from "styled-components";
import {
  HighlightedNote,
  playHighlightedNotes,
} from "../../../sampler/sampler";
import { ADMIN_USER_ID, VoiceMask } from "../../App";
import { AppContext } from "../../AppContext";
import { Analysis, ANALYSIS_STUB, PitchClass } from "../analysis";
import { TICKS_PER_QUARTER } from "../forge/constants";
import Rawl from "../Rawl";
import {
  calculateGlobalBeatPosition,
  calculateShiftedNote,
  ExtendedCommandContext,
  logicalNoteToMidi,
  parseCommand,
} from "./commandParser";
import {
  activeLineGutterTheme,
  characterBackgroundsPlugin,
  customTheme,
} from "./EditorDecorations";
import { generateMidiWithMetadata, SourceLocation } from "./EditorMidi";
import EditorSavingMenu from "./EditorSavingMenu";
import {
  EditorPanel as BaseEditorPanel,
  CodeMirrorWrapper,
  EditorContainer,
  EditorContent,
  ErrorMessage,
  RawlContainer,
  ResizeHandle,
  StatusBar,
} from "./EditorStyles";
import { FoldButtonWithIcon } from "./FoldButtonWithIcon";
import { useBackup } from "./hooks/useBackup";
import Manual, { MidiWriterJsDisplay, ParseMidiDisplay } from "./Manual";
import { ManualContainer } from "./ManualStyles";
import { scores } from "./scores";
import { Command, CommandContext, LogicalNote, ModeName } from "./types";

// Define a simple language for the editor that supports % comments
const rawlLanguage = StreamLanguage.define({
  name: "rawl",
  languageData: {
    commentTokens: { line: "%" },
  },
  // Basic token method required by StreamLanguage
  token(stream) {
    // Skip whitespace
    if (stream.eatSpace()) return null;

    // Handle comments
    if (stream.match("%")) {
      stream.skipToEnd();
      return "comment";
    }

    // Skip to next token
    stream.next();
    return null;
  },
});

// Types for command handling
declare global {
  interface Window {
    __disableGlobalShortcuts?: boolean;
  }
}

type MidiNote = {
  pitch: number;
  velocity: number;
  startTime: number;
  duration: number;
  channel: number;
};

interface EditorProps extends RouteComponentProps {
  initialSource?: string;
  disableEditing?: boolean;
  showProgrammingManual?: boolean;
  isDecompositionMode?: boolean;
  customChild?: React.ReactNode;
  setVoiceMask?: (voiceMask: VoiceMask) => void;
  voiceMask?: VoiceMask;
  voiceNames?: string[];
  registerKeyboardHandler?: (
    id: string,
    handler: (e: KeyboardEvent) => void,
  ) => void;
  unregisterKeyboardHandler?: (id: string) => void;
  savedAnalysis?: Analysis | null;
  saveAnalysis?: (analysis: Analysis) => Promise<void>;
  getCurrentPositionMs?: () => number;
  seek?: (ms: number) => void;
  latencyCorrectionMs?: number;
  onEditorChange?: (code: string) => void;
}

// New styled components for tabs
const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #444;
  margin-bottom: 10px;
`;

const Tab = styled.div<{ active: boolean }>`
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${({ active }) => (active ? "#2a2a2a" : "transparent")};
  border-bottom: 2px solid
    ${({ active }) => (active ? "#4a8cff" : "transparent")};
  &:hover {
    background-color: #333;
  }
`;

// Add CSS for admin panels
const AdminContent = styled.div`
  height: 100%;
  overflow: auto;

  /* Additional styling for manual */
  .musical-term {
    font-style: italic;
    color: #ddd;
  }

  .keyboard-layout-image {
    width: 100%;
    height: auto;
    object-fit: contain;
    max-width: 250px;
    display: block;
    margin-bottom: 10px;
    border-radius: 4px;
  }

  .key-layout img {
    max-width: 100%;
    display: block;
    margin: 0 auto;
  }

  /* Essential grid styling */
  .grid {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    align-items: center;
  }

  .note-col {
    display: flex;
    align-items: center;
    height: 20px;
  }

  .section {
    margin-bottom: 20px;
  }

  .section h3 {
    margin-top: 16px;
    margin-bottom: 12px;
    color: #ddd;
    font-size: 18px;
  }

  code {
    font-family: monospace;
    background-color: #2a2a2a;
    padding: 2px 4px;
    border-radius: 3px;
  }
`;

const Editor: React.FC<EditorProps> = ({
  history,
  initialSource,
  disableEditing,
  showProgrammingManual = true,
  isDecompositionMode = false,
  customChild,
  onEditorChange,
}) => {
  // Update useParams to handle both slug and id
  const { slug, id, version } = useParams<{
    slug?: string;
    id?: string;
    version?: string;
  }>();
  // Use either id or slug as the effective slug
  const effectiveSlug = id ?? slug;
  // Parse version parameter to number if present
  const versionNum = version ? parseInt(version, 10) : undefined;

  // Detect if user is on macOS to show Option vs Alt
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const [error, setError] = useState<string | null>(null);
  const [foldEditor, setFoldEditor] = useState(false);
  const editorRef = useRef<any>(null);
  const {
    playSongBuffer,
    rawlProps,
    latencyCorrectionMs,
    tempo,
    togglePause,
    eject,
    user,
  } = useContext(AppContext);
  const [score, setScore] = useState("");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [currentColumn, setCurrentColumn] = useState<number | null>(null);
  const [context, setContext] = useState<
    CommandContext & Partial<ExtendedCommandContext>
  >({
    currentKey: { tonic: 0, mode: "major" },
    currentTrack: 1,
    timeSignatures: [{ numerator: 4, measureStart: 1 }],
    channelOctaves: {
      0: 5, // RH default
      1: 3, // LH default
    },
    commentToEndOfFile: false,
    currentBpm: 120, // Default BPM
    analysis: { ...ANALYSIS_STUB },
  });
  const [panelHeight, setPanelHeight] = useState(() => {
    const saved = localStorage.getItem("editorPanelHeight");
    return saved || "50vh";
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);
  const [codeValue, setCodeValue] = useState(initialSource || "");
  const [extractedMidiNotes, setExtractedMidiNotes] = useState<any>(null);
  const [matchedParsingResult, setMatchedParsingResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "manual" | "parseMidi" | "midiWriterJs"
  >("manual");

  // Add state to track previously highlighted notes
  const [previouslyHighlightedNotes, setPreviouslyHighlightedNotes] = useState<
    HighlightedNote[]
  >([]);

  // Add new state to track if we're in backup preview mode
  const [isPreviewingBackup, setIsPreviewingBackup] = useState(false);
  const tempScoreRef = useRef<string | null>(null);

  // Add this near the top of the component with other state declarations
  const [editorMountTime] = useState<number>(Date.now());

  // Replace direct localStorage access with useBackup hook
  const { setBackup } = useBackup(effectiveSlug);

  // Redirect to /e/new if no slug is provided - using useEffect for proper hook ordering
  useEffect(() => {
    if (!effectiveSlug) {
      history.push("/e/new");
    }
  }, [effectiveSlug, history]);

  // Use the analysis from context rather than a separate extraction
  const analysis = context.analysis || ANALYSIS_STUB;

  // Signal to App that this route should not have global shortcuts when editor is focused
  useEffect(() => {
    if (isEditorFocused) {
      window.__disableGlobalShortcuts = true;
    } else {
      delete window.__disableGlobalShortcuts;
    }
  }, [isEditorFocused]);

  // Add keyboard event handler for Shift+Space when the editor is focused
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcut when editor is focused
      if (!isEditorFocused) return;

      // Check for Shift+Space
      if (e.code === "Space" && e.shiftKey) {
        // Different check for Alt/Option key on Mac vs other platforms
        const altOptionPressed = isMac ? e.metaKey || e.altKey : e.altKey;

        // If this is Shift+Space, prevent default to avoid inserting space
        e.preventDefault();

        // If this is Shift+Alt/Option+Space, handle measure coordinate seeking
        if (altOptionPressed && editorRef.current) {
          try {
            const view = editorRef.current.view;
            if (!view) return;

            const cursor = view.state.selection.main;
            const currentLine = view.state.doc.lineAt(cursor.from);
            const lineText = currentLine.text.trim();

            // Check if the line starts with a measure coordinate pattern (number + optional 'b' + optional number)
            const measureCoordMatch = lineText.match(/^(\d+)(b\d+)?(\s+|$)/);

            if (
              measureCoordMatch &&
              rawlProps?.parsingResult?.measuresAndBeats?.measures
            ) {
              // Extract the measure number
              const measureNumber = parseInt(measureCoordMatch[1], 10);

              // Account for renumbering if present
              const absoluteMeasureNum =
                measureNumber + ((analysis?.measureRenumbering?.[1] || 0) - 1);

              // Get the time in seconds for this measure
              const measureTime =
                rawlProps.parsingResult.measuresAndBeats.measures[
                  absoluteMeasureNum
                ];

              if (measureTime !== undefined) {
                // Seek to slightly before the measure (200ms before)
                const seekTime = Math.max(0, (measureTime - 0.2) * 1000);
                rawlProps.seek(seekTime);
              }
            }
          } catch (error) {
            // Remove console.error for measure seek errors
          }
        }

        // Toggle play/pause for both Shift+Space and Shift+Alt/Option+Space
        if (togglePause) {
          togglePause();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditorFocused, togglePause, rawlProps, analysis, isMac]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartY.current = e.clientY;
      const currentHeight = window.innerHeight * (parseInt(panelHeight) / 100);
      dragStartHeight.current = currentHeight;
      e.preventDefault();
      e.stopPropagation();
    },
    [panelHeight],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const delta = e.clientY - dragStartY.current;
      const newHeight = Math.max(200, dragStartHeight.current - delta);
      const heightVh = Math.min(
        95,
        Math.round((newHeight / window.innerHeight) * 100),
      );
      setPanelHeight(`${heightVh}vh`);
      localStorage.setItem("editorPanelHeight", `${heightVh}vh`);
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove, { capture: true });
      window.addEventListener("mouseup", handleMouseUp, { capture: true });
      return () => {
        window.removeEventListener("mousemove", handleMouseMove, {
          capture: true,
        });
        window.removeEventListener("mouseup", handleMouseUp, { capture: true });
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Create a debounced version of handleMelodyPlayback
  const debouncedMelodyPlayback = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (text: string, autoplay: boolean) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            // First pass: find if there's a % on empty line and where it is
            const allLines = text.split("\n");

            const commentLineIndex = allLines.findIndex(
              (line) => line.trim() === "%",
            );

            // Important: Don't filter out empty lines as they affect line numbering
            // Instead, simply stop processing at the % if found
            const lines =
              commentLineIndex >= 0
                ? allLines.slice(0, commentLineIndex)
                : allLines;

            if (lines.length === 0) {
              setError("No valid notes found");
              return;
            }

            setError(null);
            const newContext: CommandContext & Partial<ExtendedCommandContext> =
              {
                currentKey: { tonic: 0, mode: "major" },
                currentTrack: 1,
                timeSignatures: [{ numerator: 4, measureStart: 1 }],
                channelOctaves: {
                  0: 5, // RH default
                  1: 3, // LH default
                },
                commentToEndOfFile: false,
                currentBpm: 120, // Default BPM,
                analysis: { ...ANALYSIS_STUB },
              };

            // Use a map to store notes for each track
            const scoreByTrack = new Map<number, LogicalNote[]>();

            for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
              const line = lines[lineIndex];

              // Pass 1-based line number to parseCommand
              const command = parseCommand(line, newContext, lineIndex + 1);
              if (!command) {
                continue;
              }

              switch (command.type) {
                case "track":
                  newContext.currentTrack = command.track;
                  if (command.baseOctave !== undefined) {
                    const channel = command.track - 1;
                    newContext.channelOctaves[channel] = command.baseOctave;
                  }
                  break;

                case "key":
                  newContext.currentKey = command.key;
                  // Store first key in analysis
                  if (
                    !analysis?.modulations ||
                    Object.keys(analysis.modulations).length === 0
                  ) {
                    const newModulations = {
                      "1": command.key.tonic as PitchClass,
                    };
                    // Update the analysis state directly
                    if (analysis) {
                      analysis.modulations = newModulations;
                    }
                  }
                  break;

                case "time":
                  newContext.timeSignatures = command.signatures;
                  break;

                case "bpm":
                  newContext.currentBpm = command.tempo;
                  break;

                case "insert": {
                  const currentTrackNotes =
                    scoreByTrack.get(newContext.currentTrack) || [];

                  scoreByTrack.set(newContext.currentTrack, [
                    ...currentTrackNotes,
                    ...command.notes,
                  ]);
                  break;
                }

                case "copy": {
                  // Execute copy for just the current track
                  executeCopyForChannels(
                    command,
                    [newContext.currentTrack],
                    newContext,
                    scoreByTrack,
                    lineIndex + 1,
                  );
                  break;
                }

                case "ac": {
                  // Get all non-empty channels
                  const nonEmptyChannels = Array.from(scoreByTrack.keys());

                  // Execute copy for all channels
                  executeCopyForChannels(
                    command,
                    nonEmptyChannels,
                    newContext,
                    scoreByTrack,
                    lineIndex + 1,
                  );
                  break;
                }
              }
            }

            if (scoreByTrack.size === 0) {
              setError("No valid notes found");
              return;
            }

            // Update the context state with the new context that includes the analysis
            setContext(newContext);

            // Convert all tracks to MIDI notes
            const allMidiNotes = Array.from(scoreByTrack.entries()).flatMap(
              ([track, notes]) => {
                const trackNotes = notes
                  .map((n) => {
                    const midiNote = logicalNoteToMidi(
                      n,
                      track,
                      newContext.timeSignatures,
                    );
                    if (!midiNote) {
                      return null;
                    }

                    const resultNote = {
                      pitch: midiNote.midiNumber,
                      velocity: track === 2 ? 70 : 100, // Set velocity to 70 for LH (track 2), 100 for others
                      startTime: midiNote.startTick,
                      duration: midiNote.durationTicks - 1,
                      channel: track - 1, // Convert 1-based track number back to 0-based channel
                      sourceLocation: midiNote.sourceLocation, // Preserve source location
                    };
                    return resultNote;
                  })
                  .filter(
                    (n): n is typeof n & { sourceLocation?: SourceLocation } =>
                      n !== null,
                  );
                return trackNotes;
              },
            );

            const notesByChannel = new Map<number, MidiNote[]>();
            allMidiNotes.forEach((note) => {
              const channelNotes = notesByChannel.get(note.channel) || [];
              channelNotes.push(note);
              notesByChannel.set(note.channel, channelNotes);
            });

            const midiResult = generateMidiWithMetadata(
              allMidiNotes,
              `melody-${effectiveSlug}`,
              newContext.currentBpm, // Use the current BPM from context
              newContext.timeSignatures,
            );

            // Store the extracted notes
            setExtractedMidiNotes(midiResult.extractedNotes);

            if (playSongBuffer) {
              // Disable autoplay specifically for the /e/new route
              const isNewRoute = effectiveSlug === "new";
              playSongBuffer(
                midiResult.midiInfo.id,
                midiResult.midiData,
                !isNewRoute && autoplay, // Only autoplay if it's not /e/new and autoplay is true
              );
            }
          } catch (e) {
            // Remove console.error for playback errors
            setError(
              e instanceof Error ? e.message : "Unknown error during playback",
            );
          }
        }, 0);
      };
    })(),
    [playSongBuffer, effectiveSlug],
  );

  // Setup listeners for backup preview events
  useEffect(() => {
    const handlePreviewBackup = (e: CustomEvent<{ code: string }>) => {
      if (e.detail && e.detail.code) {
        // Store current score in ref
        tempScoreRef.current = score;
        // Update UI with backup code
        setIsPreviewingBackup(true);
        setScore(e.detail.code);
      }
    };

    const handleRestorePreview = (e: CustomEvent<{ code: string }>) => {
      if (e.detail && e.detail.code && isPreviewingBackup) {
        // Restore original code
        setIsPreviewingBackup(false);
        setScore(e.detail.code);
      }
    };

    window.addEventListener(
      "rawl-preview-backup",
      handlePreviewBackup as EventListener,
    );
    window.addEventListener(
      "rawl-restore-preview",
      handleRestorePreview as EventListener,
    );

    return () => {
      window.removeEventListener(
        "rawl-preview-backup",
        handlePreviewBackup as EventListener,
      );
      window.removeEventListener(
        "rawl-restore-preview",
        handleRestorePreview as EventListener,
      );
    };
  }, [score, isPreviewingBackup]);

  // Update handleTextChange to use the hook
  const handleTextChange = useCallback(
    (value: string) => {
      // Replace "anacrusis 4" with "sections 2 6"
      value = value.replace(/anacrusis 4/g, "sections 2 6");

      setScore(value);

      // Process the score to update context and analysis
      try {
        // Create a fresh context for this parsing pass
        const newContext: CommandContext & Partial<ExtendedCommandContext> = {
          currentKey: { tonic: 0, mode: "major" },
          currentTrack: 1,
          timeSignatures: [{ numerator: 4, measureStart: 1 }],
          channelOctaves: {
            0: 5, // RH default
            1: 3, // LH default
          },
          commentToEndOfFile: false,
          currentBpm: 120, // Default BPM
          analysis: { ...ANALYSIS_STUB },
        };

        // Process each line of the score to build the analysis
        // Don't filter out empty lines to preserve line numbers
        const lines = value.split("\n");

        for (let i = 0; i < lines.length; i++) {
          // Pass the exact 1-based line number to parseCommand
          parseCommand(lines[i], newContext, i + 1);
        }

        // Update context with new values (including the analysis)
        setContext(newContext);

        // Always trigger MIDI playback with the new value
        debouncedMelodyPlayback(value, false);
      } catch (e) {
        // Remove console.error for score processing
      }

      // Only save backup if we're not in preview mode
      if (!isPreviewingBackup && effectiveSlug && value !== initialSource) {
        setBackup({
          code: value,
          timestamp: Date.now(),
          sessionTime: editorMountTime,
        });
      }

      if (onEditorChange) {
        onEditorChange(value);
      }
    },
    [
      debouncedMelodyPlayback,
      effectiveSlug,
      initialSource,
      onEditorChange,
      isPreviewingBackup,
      editorMountTime,
      setBackup,
    ],
  );

  // Update score when effectiveSlug changes
  useEffect(() => {
    const loadScore = async () => {
      // If we're in decomposition mode and have an initial source, use that
      if (isDecompositionMode && initialSource) {
        setCodeValue(initialSource);
        setScore(initialSource);
        // Trigger MIDI generation with the new initialSource
        debouncedMelodyPlayback(initialSource, true);
        return;
      }

      if (effectiveSlug) {
        // Check if we're on the /e/new route and have a score in localStorage
        if (effectiveSlug === "new") {
          const newEditorScore = localStorage.getItem("new_editor_score");
          if (newEditorScore) {
            // Clear the localStorage item to prevent it from being used again on refresh
            localStorage.removeItem("new_editor_score");

            setScore(newEditorScore);
            setCodeValue(newEditorScore);

            // Trigger MIDI generation after a delay but don't autoplay
            setTimeout(() => {
              debouncedMelodyPlayback(newEditorScore, false);
            }, 500);
            return;
          }
        }

        if (id || effectiveSlug.startsWith("ef/")) {
          // For /ef/<id> URLs, fetch from Firebase edits collection
          const editId = id || effectiveSlug.replace("ef/", "");

          try {
            const db = getFirestore();
            const docRef = doc(db, "edits", editId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();

              // Handle versions array instead of source field
              if (data.versions && Array.isArray(data.versions)) {
                // Get the specific version or the latest if not specified
                const versionIndex = versionNum
                  ? Math.min(versionNum - 1, data.versions.length - 1)
                  : data.versions.length - 1;

                let newScore = data.versions[versionIndex] || "";

                // If there's a legacy source field and no versions, use that
                if (!newScore && data.source) {
                  newScore = data.source;
                }

                // Replace "anacrusis 4" with "sections 2 6"
                newScore = newScore.replace(/anacrusis 4/g, "sections 2 6");

                setScore(newScore);
                setCodeValue(newScore);

                // Trigger initial MIDI generation after a delay
                setTimeout(() => {
                  // Disable autoplay for /e/new route
                  const isNewRoute = effectiveSlug === "new";
                  debouncedMelodyPlayback(newScore, !isNewRoute);
                }, 1000);
              } else if (data.source) {
                // Handle legacy documents with just a source field
                let newScore = data.source;

                // Replace "anacrusis 4" with "sections 2 6"
                newScore = newScore.replace(/anacrusis 4/g, "sections 2 6");

                setScore(newScore);
                setCodeValue(newScore);

                // Trigger initial MIDI generation after a delay
                setTimeout(() => {
                  // Disable autoplay for /e/new route
                  const isNewRoute = effectiveSlug === "new";
                  debouncedMelodyPlayback(newScore, !isNewRoute);
                }, 1000);
              } else {
                setError("No content found in edit");
                setScore("");
                setCodeValue("");
              }
            } else {
              setError("Edit not found");
              setScore("");
              setCodeValue("");
            }
          } catch (error) {
            console.error("Error fetching edit:", error);
            setError("Failed to load edit");
            setScore("");
            setCodeValue("");
          }
        } else if (scores[effectiveSlug]) {
          let newScore = scores[effectiveSlug];

          // Replace "anacrusis 4" with "sections 2 6"
          newScore = newScore.replace(/anacrusis 4/g, "sections 2 6");

          setScore(newScore);
          setCodeValue(newScore);
          // Trigger initial MIDI generation after a delay
          setTimeout(() => {
            // Disable autoplay for /e/new route
            const isNewRoute = effectiveSlug === "new";
            debouncedMelodyPlayback(newScore, !isNewRoute);
          }, 1000);
        } else {
          setScore("");
          setCodeValue("");
        }
      }
    };

    loadScore();
  }, [
    effectiveSlug,
    id,
    isDecompositionMode,
    initialSource,
    debouncedMelodyPlayback,
    versionNum,
  ]);

  // Track cursor position and trigger playback when cursor moves
  const handleCursorChange = useCallback(
    (viewUpdate: any) => {
      const line = viewUpdate.state.selection.main.head;
      const doc = viewUpdate.state.doc;
      const lineObj = doc.lineAt(line);
      const lineNumber = lineObj.number;
      const colPosition = line - lineObj.from + 1; // +1 because columns are 1-indexed for user display
      const hasSelection = !viewUpdate.state.selection.main.empty;

      // Update cursor position
      setCurrentLine(lineNumber);
      setCurrentColumn(colPosition);

      if (lineNumber !== currentLine && !hasSelection) {
        // Play the current score when cursor position changes
        debouncedMelodyPlayback(score, false);
      }
    },
    [currentLine, score, debouncedMelodyPlayback],
  );

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Stop playback when component is unmounted
      if (eject) {
        eject();
      }
    };
  }, [eject]);

  useEffect(() => {
    // No need to log raw props changes
  }, [rawlProps?.parsingResult]);

  // Function to match notes between ParseMidi and MidiWriterJs data
  const matchNotesWithMidiWriter = useCallback(() => {
    if (!rawlProps?.parsingResult?.notes || !extractedMidiNotes) {
      return null;
    }

    // Verify that notes is an array before proceeding
    if (!Array.isArray(rawlProps.parsingResult.notes)) {
      return rawlProps.parsingResult;
    }

    // Clone the parsing result to avoid mutating the original
    const clonedResult = JSON.parse(JSON.stringify(rawlProps.parsingResult));

    // Extract the MidiWriter notes by channel
    const { eventsByChannel } = extractedMidiNotes;

    // Reset all noteUnderCursor flags to false first
    clonedResult.notes.forEach((voiceNotes) => {
      if (Array.isArray(voiceNotes)) {
        voiceNotes.forEach((note) => {
          if (note && typeof note === "object") {
            note.noteUnderCursor = false;
          }
        });
      }
    });

    // Find the exact note under cursor if it exists
    let foundExactMatch = false;

    // Process each note in the parsing result
    clonedResult.notes.forEach((voiceNotes: any[], voiceIndex: number) => {
      // Check if voiceNotes is actually an array
      if (!Array.isArray(voiceNotes)) {
        return; // Skip this voice
      }

      voiceNotes.forEach((note: any) => {
        // Skip if note is null or not an object
        if (!note || typeof note !== "object") {
          return;
        }

        // MODIFICATION: Instead of only looking in the current voice's channel,
        // search across all channels for a matching note
        let matchingNote = null;
        let matchFound = false;

        // Get all channels and search through each one
        const allChannels = Array.from(eventsByChannel.keys());

        for (const channelIdx of allChannels) {
          const channelEvents = eventsByChannel.get(channelIdx);

          if (!channelEvents) continue;

          // Look for a matching note in this channel
          const foundNote = channelEvents.find((event: any) => {
            // Match by pitch and start tick
            // Add proper null checks to prevent TypeError
            return (
              event &&
              event.pitches &&
              Array.isArray(event.pitches) &&
              note &&
              note.note &&
              note.note.midiNumber !== undefined &&
              event.pitches.includes(note.note.midiNumber) &&
              event.startTick !== undefined &&
              event.duration !== undefined &&
              // Match by duration too for more accuracy
              ((note.tickSpan &&
                Array.isArray(note.tickSpan) &&
                note.tickSpan.length > 1 &&
                Math.abs(event.startTick - note.tickSpan[0]) < 5 && // Allow a small tolerance for start
                Math.abs(note.tickSpan[1] - note.tickSpan[0] - event.duration) <
                  5) || // And for duration
                // Fallback matching approach if tickSpan not available
                (event.startTick !== undefined &&
                  note.id !== undefined &&
                  Math.abs(event.startTick - (note.id % 1000)) < 5)) // More flexible matching
            );
          });

          if (foundNote) {
            matchingNote = foundNote;
            matchFound = true;
            break; // Found a match, no need to check other channels
          }
        }

        // Enhance the note with matching information
        note.matchingMidiWriterNote = matchingNote || null;
        note.hasMatch = matchFound;

        // Transfer source location information from MidiWriter note to parsing result note
        if (matchingNote) {
          if (matchingNote.sourceLocation) {
            note.sourceLocation = matchingNote.sourceLocation;
          }

          // If the note doesn't have a valid tickSpan, get it from the matching note
          if (
            !note.tickSpan ||
            !Array.isArray(note.tickSpan) ||
            note.tickSpan.length < 2
          ) {
            note.tickSpan = [
              matchingNote.startTick,
              matchingNote.startTick + matchingNote.duration,
            ];
          }
        }
      });
    });

    // Collect all source locations with their notes for each row
    const notesByRow = new Map<number, { col: number; note: any }[]>();

    // Collect all source locations with row and column info
    clonedResult.notes.forEach((voiceNotes: any[]) => {
      if (!Array.isArray(voiceNotes)) return;

      voiceNotes.forEach((note: any) => {
        if (
          note &&
          note.sourceLocation &&
          typeof note.sourceLocation.row === "number" &&
          typeof note.sourceLocation.col === "number"
        ) {
          const row = note.sourceLocation.row;
          const rowNotes = notesByRow.get(row) || [];
          rowNotes.push({ col: note.sourceLocation.col, note });
          notesByRow.set(row, rowNotes);
        }
      });
    });

    // Apply highlighting logic based on current cursor position
    if (currentLine !== null && currentColumn !== null) {
      const rowNotes = notesByRow.get(currentLine);

      if (rowNotes && rowNotes.length > 0) {
        // Sort notes by column position
        rowNotes.sort((a, b) => a.col - b.col);

        const leftmostCol = rowNotes[0].col;
        const rightmostCol = rowNotes[rowNotes.length - 1].col;

        let targetSourceCol = null;

        // If cursor is at or before leftmost note column
        if (currentColumn <= leftmostCol) {
          targetSourceCol = leftmostCol;
        }
        // If cursor is at or after rightmost note column
        else if (currentColumn >= rightmostCol) {
          targetSourceCol = rightmostCol;
        }
        // If cursor is between note columns, find nearest left
        else {
          // Find the rightmost column that's still to the left of or equal to cursor
          for (let i = rowNotes.length - 1; i >= 0; i--) {
            if (rowNotes[i].col <= currentColumn) {
              targetSourceCol = rowNotes[i].col;
              break;
            }
          }
        }

        // Now highlight ALL notes with the same source location (row and column)
        if (targetSourceCol !== null) {
          // Highlight all notes across all voices that match this exact source location
          clonedResult.notes.forEach((voiceNotes: any[]) => {
            if (!Array.isArray(voiceNotes)) return;

            voiceNotes.forEach((note: any) => {
              if (
                note &&
                note.sourceLocation &&
                note.sourceLocation.row === currentLine &&
                note.sourceLocation.col === targetSourceCol
              ) {
                note.noteUnderCursor = true;
                foundExactMatch = true;
              }
            });
          });
        }
      }
    }

    return clonedResult;
  }, [
    rawlProps?.parsingResult?.notes,
    extractedMidiNotes,
    currentLine,
    currentColumn,
  ]);

  // Effect to update matched parsing result when either source changes
  useEffect(() => {
    try {
      const matchedResult = matchNotesWithMidiWriter();
      setMatchedParsingResult(matchedResult);
    } catch (error) {
      // Remove console.error for note matching
      // Fall back to original parsing result if matching fails
      setMatchedParsingResult(rawlProps?.parsingResult || null);
    }
  }, [rawlProps?.parsingResult, extractedMidiNotes, matchNotesWithMidiWriter]);

  // Add a callback to navigate to source location
  const navigateToSourceLocation = useCallback(
    (sourceLocation: { row: number; col: number }) => {
      if (!sourceLocation || !editorRef.current) return;

      const { row, col } = sourceLocation;
      const view = editorRef.current.view;

      if (view) {
        try {
          // Calculate the position in the document from line and column
          // CodeMirror is 0-indexed, but our row/col might be 1-indexed
          const line = Math.max(0, row - 1);
          const column = Math.max(0, col - 1);

          // Get the position in the document
          const lineObj = view.state.doc.line(line + 1);
          const position = lineObj.from + column;

          // Create a selection at the position
          const selection = { anchor: position, head: position };

          // Update the view with the new selection
          view.dispatch({
            selection,
            // Scroll the position into view with some padding
            scrollIntoView: true,
          });

          // Focus the editor
          view.focus();

          return true;
        } catch (error) {
          console.error("Error navigating to source location:", error);
          return false;
        }
      }
      return false;
    },
    [],
  );

  // Effect to detect and play highlighted notes whenever matchedParsingResult changes
  useEffect(() => {
    if (!matchedParsingResult || !matchedParsingResult.notes) return;

    // Extract highlighted notes from all voices/channels
    const newHighlightedNotes: HighlightedNote[] = [];

    // Verify notes is an array before processing
    if (Array.isArray(matchedParsingResult.notes)) {
      matchedParsingResult.notes.forEach((voiceNotes, voiceIndex) => {
        // Check if voiceNotes is an array
        if (Array.isArray(voiceNotes)) {
          voiceNotes.forEach((note) => {
            // Check if note is valid, has noteUnderCursor flag set, and has necessary properties
            if (
              note &&
              typeof note === "object" &&
              note.noteUnderCursor === true &&
              note.matchingMidiWriterNote &&
              typeof note.matchingMidiWriterNote.startTick === "number" &&
              typeof note.matchingMidiWriterNote.duration === "number" &&
              note.note &&
              typeof note.note.midiNumber === "number"
            ) {
              // Extract required properties
              newHighlightedNotes.push({
                startTime: note.matchingMidiWriterNote.startTick,
                duration: note.matchingMidiWriterNote.duration,
                midiNumber: note.note.midiNumber,
              });
            }
          });
        }
      });
    }

    // Check if highlighted notes have changed
    const notesChanged =
      newHighlightedNotes.length !== previouslyHighlightedNotes.length ||
      newHighlightedNotes.some((note, index) => {
        const prevNote = previouslyHighlightedNotes[index];
        return (
          !prevNote ||
          note.midiNumber !== prevNote.midiNumber ||
          note.startTime !== prevNote.startTime ||
          note.duration !== prevNote.duration
        );
      });

    // If highlighted notes have changed, play them
    if (notesChanged && newHighlightedNotes.length > 0) {
      console.log("Highlighted notes changed, playing:", newHighlightedNotes);
      playHighlightedNotes(newHighlightedNotes);
      setPreviouslyHighlightedNotes(newHighlightedNotes);
    }
  }, [matchedParsingResult, previouslyHighlightedNotes]);

  return (
    <EditorContainer
      className={isDecompositionMode ? "decomposition-mode" : ""}
    >
      <div style={{ paddingBottom: "100vh", position: "relative" }}>
        <RawlContainer>
          {rawlProps && (
            <Rawl
              {...rawlProps}
              savedAnalysis={analysis}
              latencyCorrectionMs={latencyCorrectionMs * tempo}
              parsingResult={matchedParsingResult || rawlProps.parsingResult}
              editorRef={editorRef}
              navigateToSourceLocation={navigateToSourceLocation}
            />
          )}
        </RawlContainer>
      </div>
      <BaseEditorPanel isFolded={foldEditor} height={panelHeight}>
        <ResizeHandle onMouseDown={handleMouseDown} />
        <FoldButtonWithIcon
          position="top"
          isFolded={foldEditor}
          onClick={() => setFoldEditor(!foldEditor)}
        />
        <EditorContent>
          {isDecompositionMode ? null : customChild}
          <CodeMirrorWrapper className={foldEditor ? "folded" : ""}>
            <CodeMirror
              ref={editorRef}
              value={score}
              onChange={handleTextChange}
              onUpdate={handleCursorChange}
              theme={customTheme}
              height="100%" /* Remove the height adjustment since the bar is now absolute positioned */
              style={{ flex: 1 }}
              extensions={[
                characterBackgroundsPlugin,
                rawlLanguage,
                activeLineGutterTheme,
                keymap.of([
                  {
                    key: "Mod-/",
                    run: toggleComment,
                  },
                ]),
              ]}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightActiveLine: true,
                foldGutter: true,
              }}
              onFocus={() => setIsEditorFocused(true)}
              onBlur={() => setIsEditorFocused(false)}
              readOnly={disableEditing || false}
            />
            <StatusBar>
              {currentLine !== null && currentColumn !== null
                ? `${currentLine}, ${currentColumn}`
                : ""}
            </StatusBar>
          </CodeMirrorWrapper>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </EditorContent>
        {isDecompositionMode
          ? customChild
          : showProgrammingManual && (
              <ManualContainer>
                <EditorSavingMenu
                  effectiveSlug={effectiveSlug}
                  score={score}
                  initialSource={initialSource || ""}
                  id={id}
                  slug={slug}
                  version={versionNum}
                  history={history}
                  setError={setError}
                />

                {/* Admin-only tabs */}
                {user && user.uid === ADMIN_USER_ID && (
                  <TabsContainer>
                    <Tab
                      active={activeTab === "manual"}
                      onClick={() => setActiveTab("manual")}
                    >
                      Manual
                    </Tab>
                    <Tab
                      active={activeTab === "parseMidi"}
                      onClick={() => setActiveTab("parseMidi")}
                    >
                      ParseMidi
                    </Tab>
                    <Tab
                      active={activeTab === "midiWriterJs"}
                      onClick={() => setActiveTab("midiWriterJs")}
                    >
                      MidiWriterJs
                    </Tab>
                  </TabsContainer>
                )}

                {/* Content area - show different content based on active tab */}
                <AdminContent>
                  {activeTab === "manual" && (
                    <Manual
                      score={score}
                      initialSource={initialSource || ""}
                      id={id}
                      slug={slug}
                      history={history}
                      setError={setError}
                      analysis={analysis}
                      extractedMidiNotes={extractedMidiNotes}
                      matchedParsingResult={matchedParsingResult}
                      showSaveOptions={false} // Don't show duplicate save options
                    />
                  )}
                  {user &&
                    user.uid === ADMIN_USER_ID &&
                    activeTab === "parseMidi" &&
                    matchedParsingResult && (
                      <ParseMidiDisplay
                        matchedParsingResult={matchedParsingResult}
                      />
                    )}
                  {user &&
                    user.uid === ADMIN_USER_ID &&
                    activeTab === "midiWriterJs" &&
                    extractedMidiNotes && (
                      <MidiWriterJsDisplay
                        extractedMidiNotes={extractedMidiNotes}
                      />
                    )}
                </AdminContent>
              </ManualContainer>
            )}
      </BaseEditorPanel>
    </EditorContainer>
  );
};

// Helper function to execute copy command for given channels
function executeCopyForChannels(
  command: Command & { type: "copy" | "ac" },
  channels: number[],
  context: CommandContext,
  scoreByTrack: Map<number, LogicalNote[]>,
  lineNumber?: number,
) {
  // Save current track
  const originalTrack = context.currentTrack;

  // Convert all positions to absolute beats first
  const sourceStartAbsBeat = calculateGlobalBeatPosition(
    command.sourceStart,
    command.sourceStartBeat,
    context.timeSignatures,
  );

  const sourceEndAbsBeat = calculateGlobalBeatPosition(
    command.sourceEnd,
    command.sourceEndBeat,
    context.timeSignatures,
  );

  const targetStartAbsBeat = calculateGlobalBeatPosition(
    command.targetMeasure,
    command.targetBeat,
    context.timeSignatures,
  );

  const spanLengthInBeats = sourceEndAbsBeat - sourceStartAbsBeat;

  // For each channel, execute the copy
  for (const track of channels) {
    // Set current track
    context.currentTrack = track;

    const currentTrackNotes = scoreByTrack.get(track) || [];
    const sourceNotes = currentTrackNotes.filter((n) => {
      return (
        n.span.start >= sourceStartAbsBeat && n.span.start < sourceEndAbsBeat
      );
    });

    if (sourceNotes.length === 0) {
      continue;
    }

    const allCopies: LogicalNote[] = command.shifts
      .map((shiftGroup, idx) => {
        const copyStartBeat = targetStartAbsBeat + idx * spanLengthInBeats;

        // Get the source positions for this shift group
        const sourcePositions = shiftGroup.sourcePositions || [];

        // If any shift in the group is 'x', the entire group becomes a rest
        if (shiftGroup.shifts.includes("x")) {
          return [
            {
              scaleDegree: -Infinity,
              duration: spanLengthInBeats * TICKS_PER_QUARTER,
              span: {
                start: copyStartBeat,
                end: copyStartBeat + spanLengthInBeats,
              },
              midiNumber: null,
              sourceLocation: sourcePositions[0] || {
                row: lineNumber || 0,
                col: 1,
                command: command.type,
              },
            } as LogicalNote,
          ];
        }

        // For each shift in the group, create a copy of all source notes with that shift
        return shiftGroup.shifts.flatMap((shift, shiftIndex) => {
          // Get the mode modifier for this shift, if any
          const targetMode = shiftGroup.modes?.[shiftIndex];

          // Get the source position for this specific shift
          const sourcePosition = sourcePositions[shiftIndex] || {
            row: lineNumber || 0,
            col: 1,
            command: command.type,
          };

          return sourceNotes.map((n) => {
            // Calculate relative position from the start of the source
            const relativePosition = n.span.start - sourceStartAbsBeat;
            // Apply this relative position to the copy start
            const targetPosition = copyStartBeat + relativePosition;

            if (n.midiNumber === null) {
              return {
                ...n,
                span: {
                  start: targetPosition,
                  end: targetPosition + (n.span.end - n.span.start),
                },
                sourceLocation: sourcePosition,
              };
            }

            const { newDegree, newMidi } = calculateShiftedNote(
              n.scaleDegree,
              shift as number,
              context.currentKey,
              n.accidental || 0,
              track,
              context,
              targetMode as ModeName,
            );

            return {
              ...n,
              span: {
                start: targetPosition,
                end: targetPosition + (n.span.end - n.span.start),
              },
              scaleDegree: newDegree,
              midiNumber: newMidi,
              accidental: n.accidental,
              sourceLocation: sourcePosition,
            };
          });
        });
      })
      .flat();

    scoreByTrack.set(track, [...currentTrackNotes, ...allCopies]);
  }

  // Restore original track
  context.currentTrack = originalTrack;
}

export default withRouter(Editor);
