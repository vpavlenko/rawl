import { toggleComment } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
import { VoiceMask } from "../../App";
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
import { characterBackgroundsPlugin, customTheme } from "./EditorDecorations";
import { generateMidiWithMetadata } from "./EditorMidi";
import {
  EditorPanel as BaseEditorPanel,
  chevronIcons,
  CodeMirrorWrapper,
  EditorContainer,
  EditorContent,
  ErrorMessage,
  FoldButton,
  RawlContainer,
  ResizeHandle,
} from "./EditorStyles";
import Manual from "./Manual";
import { scores } from "./scores";
import { Command, CommandContext, LogicalNote } from "./types";

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
  analysisEnabled?: boolean;
  savedAnalysis?: Analysis | null;
  saveAnalysis?: (analysis: Analysis) => Promise<void>;
  getCurrentPositionMs?: () => number;
  seek?: (ms: number) => void;
  latencyCorrectionMs?: number;
  onEditorChange?: (code: string) => void;
}

// Constants for localStorage
const BACKUP_PREFIX = "rawl_backup_";

// Interface for backup object
interface BackupData {
  code: string;
  timestamp: number;
}

const Editor: React.FC<EditorProps> = ({
  history,
  initialSource,
  disableEditing,
  showProgrammingManual = true,
  isDecompositionMode = false,
  customChild,
  setVoiceMask: propSetVoiceMask,
  voiceMask: propVoiceMask,
  voiceNames: propVoiceNames,
  registerKeyboardHandler: propRegisterKeyboardHandler,
  unregisterKeyboardHandler: propUnregisterKeyboardHandler,
  analysisEnabled: propAnalysisEnabled,
  savedAnalysis: propSavedAnalysis,
  saveAnalysis: propSaveAnalysis,
  getCurrentPositionMs: propGetCurrentPositionMs,
  seek: propSeek,
  latencyCorrectionMs: propLatencyCorrectionMs,
  onEditorChange,
}) => {
  // Update useParams to handle both slug and id
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  // Use either id or slug as the effective slug
  const effectiveSlug = id || slug;

  // Detect if user is on macOS to show Option vs Alt
  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const [error, setError] = useState<string | null>(null);
  const [foldEditor, setFoldEditor] = useState(false);
  const editorRef = useRef<any>(null);
  const cycleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const {
    playSongBuffer,
    rawlProps,
    latencyCorrectionMs,
    tempo,
    togglePause,
    eject,
  } = useContext(AppContext);
  const [score, setScore] = useState("");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
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
            console.error("Error processing measure seek:", error);
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
      const heightVh = Math.round((newHeight / window.innerHeight) * 100);
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

            // Filter lines and stop at % if found
            const lines = allLines
              .slice(0, commentLineIndex >= 0 ? commentLineIndex : undefined)
              .filter((line) => line.trim());

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

            for (const line of lines) {
              const command = parseCommand(line, newContext);
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
                    };
                    return resultNote;
                  })
                  .filter((n): n is MidiNote => n !== null);
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
            console.error("Error during playback:", e);
            setError(
              e instanceof Error ? e.message : "Unknown error during playback",
            );
          }
        }, 0);
      };
    })(),
    [playSongBuffer, effectiveSlug],
  );

  // Add helper function to clean up blinking state
  const cleanupBlinkingState = useCallback(() => {
    if (cycleTimeoutRef.current) {
      clearTimeout(cycleTimeoutRef.current);
      cycleTimeoutRef.current = null;
    }
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  // Setup listener for restore backup event
  useEffect(() => {
    const handleRestoreBackup = (e: CustomEvent<{ code: string }>) => {
      if (e.detail && e.detail.code) {
        setScore(e.detail.code);
        debouncedMelodyPlayback(e.detail.code, false);
      }
    };

    window.addEventListener(
      "rawl-restore-backup",
      handleRestoreBackup as EventListener,
    );

    return () => {
      window.removeEventListener(
        "rawl-restore-backup",
        handleRestoreBackup as EventListener,
      );
    };
  }, [debouncedMelodyPlayback]);

  // Modified handleTextChange to update analysis during command parsing
  const handleTextChange = useCallback(
    (value: string) => {
      // Replace "anacrusis 4" with "sections 2 6"
      value = value.replace(/anacrusis 4/g, "sections 2 6");

      setScore(value);
      // Always clean up any pending or active blinking state on edit
      cleanupBlinkingState();

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
        const lines = value.split("\n");
        for (const line of lines) {
          parseCommand(line, newContext);
        }

        // Update context with new values (including the analysis)
        setContext(newContext);

        // Always trigger MIDI playback with the new value
        debouncedMelodyPlayback(value, false);
      } catch (e) {
        console.error("Error processing score:", e);
      }

      // Save to localStorage for backup
      if (effectiveSlug && value !== initialSource) {
        const urlKey = id ? `/ef/${id}` : slug ? `/e/${slug}` : "";
        if (urlKey) {
          const backupKey = BACKUP_PREFIX + urlKey;
          const backup: BackupData = {
            code: value,
            timestamp: Date.now(),
          };
          localStorage.setItem(backupKey, JSON.stringify(backup));
        }
      }

      if (onEditorChange) {
        onEditorChange(value);
      }
    },
    [
      debouncedMelodyPlayback,
      cleanupBlinkingState,
      effectiveSlug,
      id,
      slug,
      initialSource,
      onEditorChange,
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
        if (id || effectiveSlug.startsWith("ef/")) {
          // For /ef/<id> URLs, fetch from Firebase edits collection
          const editId = id || effectiveSlug.replace("ef/", "");

          try {
            const db = getFirestore();
            const docRef = doc(db, "edits", editId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const data = docSnap.data();
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
  }, [effectiveSlug, id, isDecompositionMode, initialSource]);

  // Update handleCursorChange to use the cleanup function
  const handleCursorChange = useCallback(
    (viewUpdate: any) => {
      const line = viewUpdate.state.selection.main.head;
      const lineNumber = viewUpdate.state.doc.lineAt(line).number;
      const hasSelection = !viewUpdate.state.selection.main.empty;

      if (lineNumber !== currentLine && !hasSelection) {
        // Clean up any existing blinking state
        cleanupBlinkingState();
        debouncedMelodyPlayback(score, false);

        setCurrentLine(lineNumber);

        // Create shadow copy and start the comment/uncomment cycle
        const lines = score.split("\n");
        const currentLineText = lines[lineNumber - 1]?.trim();

        // Only proceed if line is not empty and contains a command
        if (currentLineText) {
          // Parse the command to check if it's a c, i, or ac command
          const command = parseCommand(currentLineText, context);
          if (
            command &&
            (command.type === "copy" ||
              command.type === "insert" ||
              command.type === "ac")
          ) {
            // Add debounce before starting the cycle
            debounceTimeoutRef.current = setTimeout(() => {
              let cycleCount = 0;

              const startCycle = () => {
                if (cycleCount < 4) {
                  // Use requestAnimationFrame to ensure smooth timing
                  requestAnimationFrame(() => {
                    // Toggle comment
                    const newLines = [...lines];
                    if (cycleCount % 2 === 0) {
                      // Comment the line
                      newLines[lineNumber - 1] =
                        "% " + newLines[lineNumber - 1];
                    } else {
                      // Uncomment the line
                      newLines[lineNumber - 1] = newLines[
                        lineNumber - 1
                      ].replace(/^% /, "");
                    }

                    const newScore = newLines.join("\n");

                    // Trigger MIDI generation with shadow score
                    debouncedMelodyPlayback(newScore, false);

                    cycleCount++;
                    // Use setTimeout with requestAnimationFrame for next cycle
                    cycleTimeoutRef.current = setTimeout(() => {
                      requestAnimationFrame(startCycle);
                    }, 200);
                  });
                } else {
                  cleanupBlinkingState();
                  debouncedMelodyPlayback(score, false);
                }
              };

              startCycle();
            }, 300); // 300ms debounce
          }
        }
      }
    },
    [
      currentLine,
      score,
      debouncedMelodyPlayback,
      context,
      cleanupBlinkingState,
    ],
  );

  // Update cleanup effect to use the cleanup function
  useEffect(() => {
    return () => {
      // Clean up blinking state
      cleanupBlinkingState();

      // Stop playback when component is unmounted
      if (eject) {
        eject();
      }
    };
  }, [cleanupBlinkingState, eject]);

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
            />
          )}
        </RawlContainer>
      </div>
      <BaseEditorPanel isFolded={foldEditor} height={panelHeight}>
        <ResizeHandle onMouseDown={handleMouseDown} />
        <FoldButton
          position="side"
          isFolded={foldEditor}
          onClick={() => setFoldEditor(!foldEditor)}
        >
          <FontAwesomeIcon
            icon={foldEditor ? chevronIcons.left : chevronIcons.right}
          />
        </FoldButton>
        <EditorContent>
          {isDecompositionMode ? null : customChild}
          <CodeMirrorWrapper className={foldEditor ? "folded" : ""}>
            <CodeMirror
              ref={editorRef}
              value={score}
              onChange={handleTextChange}
              onUpdate={handleCursorChange}
              theme={customTheme}
              height="100%"
              style={{ flex: 1 }}
              extensions={[
                characterBackgroundsPlugin,
                rawlLanguage,
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
          </CodeMirrorWrapper>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </EditorContent>
        {isDecompositionMode
          ? customChild
          : showProgrammingManual && (
              <Manual
                score={score}
                initialSource={initialSource || ""}
                id={id}
                slug={slug}
                history={history}
                setError={setError}
                analysis={analysis}
              />
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

    const allCopies = command.shifts
      .map((shiftGroup, idx) => {
        const copyStartBeat = targetStartAbsBeat + idx * spanLengthInBeats;

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
            },
          ];
        }

        // For each shift in the group, create a copy of all source notes with that shift
        return shiftGroup.shifts.flatMap((shift) => {
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
              };
            }

            const { newDegree, newMidi } = calculateShiftedNote(
              n.scaleDegree,
              shift as number,
              context.currentKey,
              n.accidental || 0,
              track,
              context,
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
