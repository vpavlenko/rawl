import { toggleComment } from "@codemirror/commands";
import { StreamLanguage } from "@codemirror/language";
import { keymap } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import editorMajorLayout from "../../../images/editor_major_layout.png";
import { AppContext } from "../../AppContext";
import { PitchClass } from "../analysis";
import { TICKS_PER_QUARTER } from "../forge/constants";
import Rawl from "../Rawl";
import {
  calculateGlobalBeatPosition,
  calculateShiftedNote,
  logicalNoteToMidi,
  parseCommand,
} from "./commandParser";
import { characterBackgroundsPlugin, customTheme } from "./EditorDecorations";
import EditorIndex from "./EditorIndex";
import { generateMidiWithMetadata } from "./EditorMidi";
import {
  EditorPanel as BaseEditorPanel,
  CodeMirrorWrapper,
  EditorContainer,
  EditorContent,
  ErrorMessage,
  FoldButton,
  RawlContainer,
  ResizeHandle,
} from "./EditorStyles";
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

// Add new styled component after EditorPanel
const KeyboardLayout = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #1e1e1e;
  border-right: 1px solid #333;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  flex: 0 0 250px;
  font-size: 12px;
  color: #ccc;
  line-height: 1.6;

  .top-section {
    display: flex;
    flex-direction: row;
    margin-bottom: 20px;
  }

  .left-column {
    flex: 0 0 15vw;
    margin-right: 5px;
  }

  .right-column {
    flex: 1;
  }

  .full-width-section {
    width: 100%;
  }

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
    z-index: 1;
  }

  .image-caption {
    margin-top: 4px;
    width: 100%;
    color: #999;
  }

  code {
    color: white;
    background: #2a2a2a;
    padding: 1px 4px;
    border-radius: 3px;
    white-space: nowrap;
  }

  .grid {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 4px 8px;
    margin: 8px 0;
    align-items: center;
  }

  .note-col {
    text-align: right;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 4px;
  }

  .section {
    margin: 24px;
  }

  .section:first-child {
    margin-top: 0;
  }

  .section h3 {
    margin: 0px;
  }

  /* Customize scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #1e1e1e;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
`;

const NoteBase = styled.div`
  position: relative;
  height: 6px;
  background: white;
  margin: 0 4px;
  display: inline-block;
  box-shadow: 0 0 0px 0.5px black;
  cursor: pointer;
  vertical-align: middle;
  border-radius: 2px;
`;

const BeatMarker = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: gray;
`;

interface NoteExampleProps {
  beats: number; // Number of beats (e.g. 4 for whole note, 2 for half note)
  style?: { width: string };
}

const NoteExample: React.FC<NoteExampleProps> = ({ beats, style }) => {
  const beatMarkers = [];

  // Add a marker for each internal beat division
  // For n beats we need n-1 markers
  for (let i = 1; i < beats; i++) {
    beatMarkers.push(<BeatMarker key={i} style={{ right: `${i * 30}px` }} />);
  }

  return <NoteBase style={style}>{beatMarkers}</NoteBase>;
};

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isFolded, setIsFolded] = useState(false);
  const editorRef = useRef<any>(null);
  const { playSongBuffer, rawlProps, analyses, latencyCorrectionMs, tempo } =
    useContext(AppContext);
  const [score, setScore] = useState("");
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [currentLine, setCurrentLine] = useState<number | null>(null);
  const [shadowScore, setShadowScore] = useState<string | null>(null);
  const [isPlayingFromShadow, setIsPlayingFromShadow] = useState(false);
  const [context, setContext] = useState<CommandContext>({
    currentKey: { tonic: 0, mode: "major" },
    currentTrack: 1,
    timeSignatures: [{ numerator: 4, measureStart: 1 }],
    channelOctaves: {
      0: 5, // RH default
      1: 3, // LH default
    },
    commentToEndOfFile: false,
    currentBpm: 120, // Default BPM
  });
  const [panelHeight, setPanelHeight] = useState(() => {
    const saved = localStorage.getItem("editorPanelHeight");
    return saved || "50vh";
  });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Get the analysis for this slug if it exists
  const analysis = analyses[`f/${slug}`];

  // Signal to App that this route should not have global shortcuts when editor is focused
  useEffect(() => {
    if (isEditorFocused) {
      window.__disableGlobalShortcuts = true;
    } else {
      delete window.__disableGlobalShortcuts;
    }
  }, [isEditorFocused]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      console.log("Mouse down event triggered");
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
      console.log("Dragging:", { delta, startHeight: dragStartHeight.current });
      const newHeight = Math.max(200, dragStartHeight.current - delta);
      const heightVh = Math.round((newHeight / window.innerHeight) * 100);
      setPanelHeight(`${heightVh}vh`);
      localStorage.setItem("editorPanelHeight", `${heightVh}vh`);
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    console.log("Mouse up event triggered");
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      console.log("Adding global mouse event listeners");
      window.addEventListener("mousemove", handleMouseMove, { capture: true });
      window.addEventListener("mouseup", handleMouseUp, { capture: true });
      return () => {
        console.log("Removing global mouse event listeners");
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
            const newContext: CommandContext = {
              currentKey: { tonic: 0, mode: "major" },
              currentTrack: 1,
              timeSignatures: [{ numerator: 4, measureStart: 1 }],
              channelOctaves: {
                0: 5, // RH default
                1: 3, // LH default
              },
              currentBpm: 120, // Default BPM
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
                  const oldTrack = newContext.currentTrack;
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
              `melody-${slug}`,
              newContext.currentBpm, // Use the current BPM from context
              newContext.timeSignatures,
            );

            if (playSongBuffer) {
              playSongBuffer(
                midiResult.midiInfo.id,
                midiResult.midiData,
                autoplay,
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
    [playSongBuffer, slug],
  );

  // Function to handle cursor position changes
  const handleCursorChange = useCallback(
    (viewUpdate: any) => {
      const line = viewUpdate.state.selection.main.head;
      const lineNumber = viewUpdate.state.doc.lineAt(line).number;

      if (lineNumber !== currentLine) {
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
            let cycleCount = 0;
            const startCycle = () => {
              if (cycleCount < 4) {
                // Toggle comment
                const newLines = [...lines];
                if (cycleCount % 2 === 0) {
                  // Comment the line
                  newLines[lineNumber - 1] = "% " + newLines[lineNumber - 1];
                } else {
                  // Uncomment the line
                  newLines[lineNumber - 1] = newLines[lineNumber - 1].replace(
                    /^% /,
                    "",
                  );
                }

                const newScore = newLines.join("\n");
                setShadowScore(newScore);
                setIsPlayingFromShadow(true);

                // Trigger MIDI generation with shadow score
                debouncedMelodyPlayback(newScore, false);

                cycleCount++;
                setTimeout(startCycle, 200);
              } else {
                // Reset after 4 cycles
                setShadowScore(null);
                setIsPlayingFromShadow(false);
                debouncedMelodyPlayback(score, false);
              }
            };

            startCycle();
          }
        }
      }
    },
    [currentLine, score, debouncedMelodyPlayback, context],
  );

  // Modified handleTextChange to use shadow score when active
  const handleTextChange = useCallback(
    (value: string) => {
      setScore(value);
      if (!isPlayingFromShadow) {
        debouncedMelodyPlayback(value, false);
      }
    },
    [debouncedMelodyPlayback, isPlayingFromShadow],
  );

  // Update score when slug changes
  useEffect(() => {
    if (slug && scores[slug]) {
      const newScore = scores[slug];
      setScore(newScore);
      // Trigger initial MIDI generation after a delay
      setTimeout(() => {
        debouncedMelodyPlayback(newScore, true);
      }, 1000);
    } else {
      setScore("");
    }
  }, [slug, debouncedMelodyPlayback]);

  // If no slug is provided, show the index
  if (!slug) {
    return <EditorIndex />;
  }

  return (
    <EditorContainer>
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
      <BaseEditorPanel isFolded={isFolded} height={panelHeight}>
        <ResizeHandle onMouseDown={handleMouseDown} />
        <FoldButton
          position="side"
          isFolded={isFolded}
          onClick={() => setIsFolded(!isFolded)}
        />
        <EditorContent>
          <CodeMirrorWrapper>
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
            />
          </CodeMirrorWrapper>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </EditorContent>
        <KeyboardLayout>
          <div className="top-section">
            <div className="left-column">
              <img src={editorMajorLayout} alt="Keyboard Layout" />
              <div className="image-caption">
                Prepend note pitch with b and # to lower/raise by semitone, eg.
                b2, #r
              </div>
            </div>
            <div className="right-column">
              <div className="section">
                <div className="grid">
                  <div className="note-col">
                    <NoteExample beats={4} style={{ width: "120px" }} />
                  </div>
                  <span>
                    <code>+</code> 4 beats (whole note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={3} style={{ width: "90px" }} />
                  </div>
                  <span>
                    <code>_.</code> 2 × 3/2 = 3 beats (<code>.</code> elongates
                    by half)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={2} style={{ width: "60px" }} />
                  </div>
                  <span>
                    <code>_</code> 2 beats (half note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={1.33} style={{ width: "40px" }} />
                  </div>
                  <span>
                    <code>_:</code> 2 × ⅔ ≈ 1.33 beats (for triplets,{" "}
                    <code>:</code> reduces by 1/3)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={1} style={{ width: "30px" }} />
                  </div>
                  <span>
                    <code>,</code> 1 beat (quarter note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.5} style={{ width: "15px" }} />
                  </div>
                  <span>
                    <code>-</code> ½ beat (eighth note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.25} style={{ width: "7.5px" }} />
                  </div>
                  <span>
                    <code>=</code> ¼ beat (sixteenth note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.125} style={{ width: "3.75px" }} />
                  </div>
                  <span>
                    <code>'</code> ⅛ beat (thirty-second note)
                  </span>

                  <div className="note-col">
                    <NoteExample beats={0.0625} style={{ width: "1.875px" }} />
                  </div>
                  <span>
                    <code>"</code> 1/16 beat (sixty-fourth note)
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="full-width-section">
            <div className="section">
              <h3>Insert/copy</h3>
              <div className="grid">
                <code>2b2 i q,.x-eti,</code>
                <span>
                  Insert at measure 2 beat 2: 1+1/2 beats (,.) of scale degree
                  one (tonic) in middle octave, then a rest (x) of 1/2 beats,
                  then a beat of a chord 3-5-1, where 1 is in upper octave.
                  Several note pitches under one duration is a chord
                </span>
                <code>5&nbsp;&nbsp;&nbsp;c 1-4&nbsp;&nbsp;&nbsp;0 -4 x 7</code>
                <span>
                  Copy measures 1..4 to measure 5 several times. 0 means
                  "verbatim copy, don't shift note pitches", -4 means "shift
                  down 4 scale degrees", x means "rest for the duration of
                  slice", 7 means "shift up 7 scale degrees, i.e. one octave"
                </span>
                <code>2b2 c 1b2-1b4</code>
                <span>
                  Copy two beats (measure 1 beats 2 to 3), no target defaults to
                  "0" (one verbatim copy)
                </span>
                <code>9&nbsp;&nbsp;&nbsp;ac 1-8</code>
                <span>All Copy: copy notes in all channels</span>
                <code>1&nbsp;&nbsp;&nbsp;c 1&nbsp;&nbsp;&nbsp;2&5</code>
                <span>
                  Layer multiple shifts at same position - for doubling in
                  thirds/sixths etc.
                </span>
              </div>
            </div>
            <div className="section">
              <h3>Other commands</h3>
              <div className="grid">
                <code>C major, Ab minor</code>
                <span>
                  Key signature. Modes: major, minor, lydian, mixolydian,
                  dorian, phrygian
                </span>
                <code>3/4</code> <span>Time signature</span>
                <code>bpm 120</code> <span>Tempo</span>
                <code>lh</code>{" "}
                <span>Left hand (ch1, velocity 70), octave range 2-4</span>
                <code>rh</code>{" "}
                <span>Right hand (ch0, velocity 100), octave range 4-6</span>
                <code>ch2, ch3, ...</code>
                <span>Channels 2 to 15 (velocity 100), octave range 4-6</span>
                <code>rh 3</code>{" "}
                <span>
                  Change octave range to 3-5, can apply to lh, rh or ch2..15
                </span>
                <code>% line</code>{" "}
                <span>
                  Comment using %. Select several lines and press Cmd+/ (Ctrl+/)
                  to toggle
                </span>
              </div>
            </div>
          </div>
        </KeyboardLayout>
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

export default Editor;
