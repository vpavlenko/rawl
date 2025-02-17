import CodeMirror from "@uiw/react-codemirror";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../AppContext";
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
  CodeMirrorWrapper,
  EditorContainer,
  EditorPanel,
  ErrorMessage,
  FoldButton,
  RawlContainer,
} from "./EditorStyles";
import { scores } from "./scores";
import { CommandContext, LogicalNote } from "./types";

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

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isFolded, setIsFolded] = useState(false);
  const editorRef = useRef<any>(null);
  const { playSongBuffer, rawlProps, analyses } = useContext(AppContext);
  const [score, setScore] = useState("");
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

  // Get the analysis for this slug if it exists
  const analysis = analyses[`f/${slug}`];

  // Signal to App that this route should not have global shortcuts
  useEffect(() => {
    window.__disableGlobalShortcuts = true;
    return () => {
      delete window.__disableGlobalShortcuts;
    };
  }, []);

  // Create a debounced version of handleMelodyPlayback
  const debouncedMelodyPlayback = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (text: string, autoplay: boolean) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          try {
            const lines = text.split("\n").filter((line) => line.trim());

            // Use a map to store notes for each track
            const scoreByTrack = new Map<number, LogicalNote[]>();

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

            for (const line of lines) {
              console.log("\n=== Processing line ===");
              console.log("Line:", line);
              console.log("Current track:", newContext.currentTrack);
              console.log(
                "Current channel octaves:",
                newContext.channelOctaves,
              );

              const command = parseCommand(line, newContext);
              if (!command) {
                console.log("No command parsed");
                continue;
              }

              console.log("Parsed command:", command);

              switch (command.type) {
                case "track":
                  const oldTrack = newContext.currentTrack;
                  newContext.currentTrack = command.track;
                  if (command.baseOctave !== undefined) {
                    const channel = command.track - 1;
                    newContext.channelOctaves[channel] = command.baseOctave;
                  }
                  console.log(`Track changed: ${oldTrack} -> ${command.track}`);
                  console.log(
                    "Updated channel octaves:",
                    newContext.channelOctaves,
                  );
                  break;

                case "key":
                  newContext.currentKey = command.key;
                  break;

                case "time":
                  newContext.timeSignatures = command.signatures;
                  break;

                case "bpm":
                  newContext.currentBpm = command.tempo;
                  console.log(`BPM changed to: ${command.tempo}`);
                  break;

                case "insert": {
                  console.log(
                    "Insert command for track:",
                    newContext.currentTrack,
                  );
                  const currentTrackNotes =
                    scoreByTrack.get(newContext.currentTrack) || [];
                  console.log(
                    "Existing notes for track:",
                    currentTrackNotes.length,
                  );
                  console.log("Adding notes:", command.notes.length);
                  scoreByTrack.set(newContext.currentTrack, [
                    ...currentTrackNotes,
                    ...command.notes,
                  ]);
                  console.log(
                    "Updated track note count:",
                    scoreByTrack.get(newContext.currentTrack)?.length,
                  );
                  break;
                }

                case "copy": {
                  console.log("=== COPY COMMAND DEBUG ===");

                  // Convert all positions to absolute beats first
                  const sourceStartAbsBeat = calculateGlobalBeatPosition(
                    command.sourceStart,
                    command.sourceStartBeat,
                    newContext.timeSignatures,
                  );

                  const sourceEndAbsBeat = calculateGlobalBeatPosition(
                    command.sourceEnd,
                    command.sourceEndBeat,
                    newContext.timeSignatures,
                  );

                  const targetStartAbsBeat = calculateGlobalBeatPosition(
                    command.targetMeasure,
                    command.targetBeat,
                    newContext.timeSignatures,
                  );

                  const spanLengthInBeats =
                    sourceEndAbsBeat - sourceStartAbsBeat;

                  console.log("Source start (abs beats):", sourceStartAbsBeat);
                  console.log("Source end (abs beats):", sourceEndAbsBeat);
                  console.log("Target start (abs beats):", targetStartAbsBeat);
                  console.log("Span length:", spanLengthInBeats);
                  console.log("Shifts:", command.shifts);

                  const currentTrackNotes =
                    scoreByTrack.get(newContext.currentTrack) || [];
                  const sourceNotes = currentTrackNotes.filter((n) => {
                    return (
                      n.span.start >= sourceStartAbsBeat &&
                      n.span.start < sourceEndAbsBeat
                    );
                  });

                  console.log("Found source notes:", sourceNotes.length);
                  console.log(
                    "Source notes spans:",
                    sourceNotes.map((n) => [n.span.start, n.span.end]),
                  );

                  if (sourceNotes.length === 0) {
                    console.log("No source notes found!");
                    continue;
                  }

                  const allCopies = command.shifts
                    .map((shift, idx) => {
                      const copyStartBeat =
                        targetStartAbsBeat + idx * spanLengthInBeats;
                      console.log(`\nCopy ${idx + 1}:`);
                      console.log("Shift:", shift);
                      console.log("Copy start beat:", copyStartBeat);
                      console.log(
                        "Copy end beat:",
                        copyStartBeat + spanLengthInBeats,
                      );

                      if (shift === "x") {
                        console.log("Creating rest for this copy");
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

                      return sourceNotes.map((n) => {
                        const relativePosition =
                          n.span.start - sourceStartAbsBeat;
                        const targetPosition = copyStartBeat + relativePosition;

                        console.log("Note relative pos:", relativePosition);
                        console.log("Note target pos:", targetPosition);

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
                          shift,
                          newContext.currentKey,
                          n.accidental || 0,
                          newContext.currentTrack,
                          newContext,
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
                    })
                    .flat();

                  console.log(
                    "\nFinal copies spans:",
                    allCopies.map((n) => [n.span.start, n.span.end]),
                  );

                  scoreByTrack.set(newContext.currentTrack, [
                    ...currentTrackNotes,
                    ...allCopies,
                  ]);
                  break;
                }
              }
            }

            if (scoreByTrack.size === 0) {
              setError("No valid notes found");
              return;
            }

            setError(null);
            setContext(newContext);

            // Convert all tracks to MIDI notes
            console.log("\n=== Track to MIDI Conversion Debug ===");
            console.log(
              "Tracks in scoreByTrack:",
              Array.from(scoreByTrack.keys()),
            );
            console.log("Track contents:");
            scoreByTrack.forEach((notes, track) => {
              console.log(`\nTrack ${track}:`);
              console.log("- Note count:", notes.length);
              console.log(
                "- First 3 notes:",
                notes.slice(0, 3).map((n) => ({
                  midiNumber: n.midiNumber,
                  span: n.span,
                  scaleDegree: n.scaleDegree,
                })),
              );
            });

            const allMidiNotes = Array.from(scoreByTrack.entries()).flatMap(
              ([track, notes]) => {
                console.log(`\nProcessing track ${track} to MIDI:`);
                const trackNotes = notes
                  .map((n) => {
                    const midiNote = logicalNoteToMidi(
                      n,
                      track,
                      newContext.timeSignatures,
                    );
                    if (!midiNote) {
                      console.log("- Skipping null MIDI note");
                      return null;
                    }
                    const resultNote = {
                      pitch: midiNote.midiNumber,
                      velocity: 100,
                      startTime: midiNote.startTick,
                      duration: midiNote.durationTicks - 1,
                      channel: track - 1, // Convert 1-based track number back to 0-based channel
                    };
                    console.log("- Converted note:", resultNote);
                    return resultNote;
                  })
                  .filter((n): n is MidiNote => n !== null);
                console.log(
                  `- Generated ${trackNotes.length} MIDI notes for track ${track}`,
                );
                return trackNotes;
              },
            );

            console.log("\nFinal MIDI notes by channel:");
            const notesByChannel = new Map<number, MidiNote[]>();
            allMidiNotes.forEach((note) => {
              const channelNotes = notesByChannel.get(note.channel) || [];
              channelNotes.push(note);
              notesByChannel.set(note.channel, channelNotes);
            });
            notesByChannel.forEach((notes, channel) => {
              console.log(`\nChannel ${channel}:`);
              console.log("- Note count:", notes.length);
              console.log("- Sample notes:", notes.slice(0, 3));
            });
            console.log("=== End Track to MIDI Conversion Debug ===\n");

            const midiResult = generateMidiWithMetadata(
              allMidiNotes,
              `melody-${slug}`,
              newContext.currentBpm, // Use the current BPM from context
              newContext.timeSignatures,
            );

            console.log("\n=== Final Context ===");
            console.log("Channel octaves:", newContext.channelOctaves);
            console.log("Tracks with notes:", Array.from(scoreByTrack.keys()));
            console.log(
              "Note counts by track:",
              Array.from(scoreByTrack.entries()).map(
                ([track, notes]) => `Track ${track}: ${notes.length} notes`,
              ),
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

  const handleTextChange = useCallback(
    (value: string) => {
      setScore(value);
      debouncedMelodyPlayback(value, false);
    },
    [debouncedMelodyPlayback],
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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        debouncedMelodyPlayback(score, true);
      }
    },
    [debouncedMelodyPlayback, score],
  );

  // If no slug is provided, show the index
  if (!slug) {
    return <EditorIndex />;
  }

  return (
    <EditorContainer>
      <div style={{ paddingBottom: "100vh" }}>
        <RawlContainer>
          {rawlProps && <Rawl {...rawlProps} savedAnalysis={analysis} />}
        </RawlContainer>
      </div>
      <EditorPanel isFolded={isFolded}>
        <FoldButton onClick={() => setIsFolded(!isFolded)}>
          {isFolded ? "<" : ">"}
        </FoldButton>
        <CodeMirrorWrapper>
          <CodeMirror
            ref={editorRef}
            value={score}
            onChange={handleTextChange}
            theme={customTheme}
            height="100%"
            style={{ flex: 1 }}
            extensions={[characterBackgroundsPlugin]}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
            }}
          />
        </CodeMirrorWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </EditorPanel>
    </EditorContainer>
  );
};

export default Editor;
