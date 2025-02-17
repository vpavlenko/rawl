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
import { Note } from "../forge/ForgeGenerator";
import Rawl from "../Rawl";
import {
  calculateGlobalBeatPosition,
  calculateShiftedNote,
  globalBeatToMeasureAndBeat,
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
    baseOctaveRH: 5,
    baseOctaveLH: 3,
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

            let scoreTrack1: LogicalNote[] = [];
            let scoreTrack2: LogicalNote[] = [];
            const newContext: CommandContext = {
              currentKey: { tonic: 0, mode: "major" },
              currentTrack: 1,
              timeSignatures: [{ numerator: 4, measureStart: 1 }],
              baseOctaveRH: 5,
              baseOctaveLH: 3,
            };

            for (const line of lines) {
              const command = parseCommand(line, newContext);
              if (!command) continue;

              switch (command.type) {
                case "track":
                  newContext.currentTrack = command.track;
                  if (command.baseOctave !== undefined) {
                    if (command.track === 1) {
                      newContext.baseOctaveRH = command.baseOctave;
                    } else {
                      newContext.baseOctaveLH = command.baseOctave;
                    }
                  }
                  break;

                case "key":
                  newContext.currentKey = command.key;
                  break;

                case "time":
                  newContext.timeSignatures = command.signatures;
                  break;

                case "insert":
                  if (newContext.currentTrack === 1) {
                    scoreTrack1 = [...scoreTrack1, ...command.notes];
                  } else {
                    scoreTrack2 = [...scoreTrack2, ...command.notes];
                  }
                  break;

                case "copy": {
                  const sourceNotes = (
                    newContext.currentTrack === 1 ? scoreTrack1 : scoreTrack2
                  ).filter((n) => {
                    const { measure, beatInMeasure } =
                      globalBeatToMeasureAndBeat(
                        n.span.start,
                        newContext.timeSignatures,
                      );

                    if (
                      measure < command.sourceStart ||
                      measure > command.sourceEnd
                    ) {
                      return false;
                    }

                    if (
                      measure === command.sourceStart &&
                      beatInMeasure < command.sourceStartBeat
                    ) {
                      return false;
                    }

                    if (
                      measure === command.sourceEnd &&
                      beatInMeasure >= command.sourceEndBeat
                    ) {
                      return false;
                    }

                    return true;
                  });

                  if (sourceNotes.length === 0) {
                    continue;
                  }

                  const sourceStartBeat = calculateGlobalBeatPosition(
                    command.sourceStart,
                    command.sourceStartBeat,
                    newContext.timeSignatures,
                  );
                  const sourceEndBeat = calculateGlobalBeatPosition(
                    command.sourceEnd,
                    command.sourceEndBeat,
                    newContext.timeSignatures,
                  );
                  const spanLengthInBeats = sourceEndBeat - sourceStartBeat;

                  const allCopies = command.shifts
                    .map((shift, idx) => {
                      const targetStartBeat =
                        calculateGlobalBeatPosition(
                          command.targetMeasure,
                          command.targetBeat,
                          newContext.timeSignatures,
                        ) +
                        idx * spanLengthInBeats;

                      if (shift === "x") {
                        return [
                          {
                            scaleDegree: -Infinity,
                            duration: spanLengthInBeats * TICKS_PER_QUARTER,
                            span: {
                              start: targetStartBeat,
                              end: targetStartBeat + spanLengthInBeats,
                            },
                            midiNumber: null,
                          },
                        ];
                      }

                      return sourceNotes.map((n) => {
                        const relativePosition = n.span.start - sourceStartBeat;
                        const targetPosition =
                          targetStartBeat + relativePosition;

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

                  if (newContext.currentTrack === 1) {
                    scoreTrack1 = [...scoreTrack1, ...allCopies];
                  } else {
                    scoreTrack2 = [...scoreTrack2, ...allCopies];
                  }
                  break;
                }
              }
            }

            if (scoreTrack1.length === 0 && scoreTrack2.length === 0) {
              setError("No valid notes found");
              return;
            }

            setError(null);
            setContext(newContext);

            const midiNotesTrack1 = scoreTrack1
              .map((n) => logicalNoteToMidi(n, 1, newContext.timeSignatures))
              .filter((n): n is Note => n !== null);
            const midiNotesTrack2 = scoreTrack2
              .map((n) => logicalNoteToMidi(n, 2, newContext.timeSignatures))
              .filter((n): n is Note => n !== null);

            const allMidiNotes = [...midiNotesTrack1, ...midiNotesTrack2];

            const midiResult = generateMidiWithMetadata(
              allMidiNotes,
              `melody-${slug}`,
              120,
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
      <RawlContainer>
        {rawlProps && <Rawl {...rawlProps} savedAnalysis={analysis} />}
      </RawlContainer>
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
