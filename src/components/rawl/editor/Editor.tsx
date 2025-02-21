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
  CodeMirrorWrapper,
  DebugPanel,
  EditorContainer,
  EditorContent,
  EditorPanel,
  ErrorMessage,
  FoldButton,
  RawlContainer,
} from "./EditorStyles";
import { scores } from "./scores";
import { Command, CommandContext, LogicalNote } from "./types";

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
        <DebugPanel>
          <h3>Analysis</h3>
          <pre>{JSON.stringify(analysis, null, 2)}</pre>
        </DebugPanel>
        <EditorContent>
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
        </EditorContent>
      </EditorPanel>
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
