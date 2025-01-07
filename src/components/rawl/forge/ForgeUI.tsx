import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import Rawl from "../Rawl";
import {
  ForgeConfig,
  generateNotes,
  PATTERNS,
  PlaybackStyle,
  PROGRESSIONS,
  ProgressionType,
  SCALE_CHORDS,
} from "./ForgeGenerator";
import { generateMidiWithMetadata } from "./ForgeMidi";

const ForgeContainer = styled.div`
  padding: 20px;
  width: 100vw;
  color: white;
  box-sizing: border-box;
`;

const SelectorContainer = styled.div`
  display: flex;
  gap: 24px;
  margin: 20px 0;
  padding: 8px;
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  width: fit-content;
`;

const CategoryHeader = styled.div`
  padding-left: 5px;
  color: #999;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-align: left;
  user-select: none;
`;

const Button = styled.button<{ active: boolean }>`
  padding: 0px 5px;
  text-align: left;
  background-color: ${(props) => (props.active ? "white" : "black")};
  color: ${(props) => (props.active ? "black" : "white")};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  border-radius: 4px;
  width: fit-content;
  user-select: none;

  &:hover {
    background-color: ${(props) => (props.active ? "white" : "#333")};
  }
`;

const ContentArea = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #111;
  border-radius: 4px;
`;

const ProgressionButton = styled(Button)`
  font-family: monospace;
`;

const PatternButton = styled(Button)`
  font-family: monospace;
`;

// Add pattern type
export type PatternIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const ForgeUI: React.FC = () => {
  const [mode, setMode] = useState<ForgeConfig["mode"]>("major");
  const [patternIndex, setPatternIndex] = useState<PatternIndex>(0);
  const [progression, setProgression] = useState<ProgressionType>("CLASSIC");
  const [playbackStyle, setPlaybackStyle] = useState<PlaybackStyle>("arpeggio");
  const [wholeNoteStyle, setWholeNoteStyle] =
    useState<ForgeConfig["wholeNoteStyle"]>("triad");
  const [alternationStyle, setAlternationStyle] =
    useState<ForgeConfig["alternationStyle"]>("half");
  const { currentMidi, rawlProps, setCurrentMidi, playSongBuffer } =
    useContext(AppContext);

  // Pattern sequences for display - derived directly from PATTERNS
  const patternSequences = PATTERNS.map((pattern) => pattern.join(" "));

  const prepareMidi = async (
    newMode: ForgeConfig["mode"],
    newPatternIndex: PatternIndex,
    newProgression: ProgressionType,
    newPlaybackStyle: PlaybackStyle = playbackStyle,
    newWholeNoteStyle: ForgeConfig["wholeNoteStyle"] = wholeNoteStyle,
    newAlternationStyle: ForgeConfig["alternationStyle"] = alternationStyle,
    shouldAutoPlay: boolean = false,
  ) => {
    // Skip if all values are the same and it's not an autoplay request
    if (
      !shouldAutoPlay &&
      newMode === mode &&
      newPatternIndex === patternIndex &&
      newProgression === progression &&
      newPlaybackStyle === playbackStyle &&
      newWholeNoteStyle === wholeNoteStyle &&
      newAlternationStyle === alternationStyle
    ) {
      console.log("[Forge] Skipping MIDI generation - values unchanged");
      return null;
    }

    console.log(
      "[Forge] Preparing MIDI generation for:",
      newMode,
      newPatternIndex,
      newProgression,
      newPlaybackStyle,
    );

    try {
      // Generate notes using the configuration
      const config: ForgeConfig = {
        mode: newMode,
        pattern: newPatternIndex,
        progression: newProgression,
        playbackStyle: newPlaybackStyle,
        wholeNoteStyle: newWholeNoteStyle,
        alternationStyle: newAlternationStyle,
      };
      const notes = generateNotes(config);
      console.log("[Forge] Generated notes:", notes.length);

      // Generate MIDI with metadata
      const { midiData, midiInfo } = generateMidiWithMetadata(notes, newMode);
      console.log("[Forge] Generated MIDI data:", midiData.length, "bytes");

      // Set the current MIDI info in global context
      setCurrentMidi(midiInfo);

      // Use playSongBuffer to load the MIDI data globally, with autoplay parameter
      await playSongBuffer("generated-alberti.mid", midiData, shouldAutoPlay);

      return { midiData, midiInfo };
    } catch (error) {
      console.error("[Forge] Error preparing MIDI:", error);
      return null;
    }
  };

  // Prepare MIDI on mode/pattern change
  useEffect(() => {
    console.log(
      "[Forge] useEffect triggered for mode/patternIndex/progression change:",
      mode,
      patternIndex,
      progression,
    );
    // Only prepare if not from a click (which will handle its own preparation)
    if (!isClickPending.current) {
      prepareMidi(mode, patternIndex, progression, playbackStyle);
    }
    isClickPending.current = false;
  }, [mode, patternIndex, progression]);

  // Add ref to track if change is from click
  const isClickPending = useRef(false);

  const getProgressionDisplay = (prog: ProgressionType) => {
    const chords = PROGRESSIONS[prog].map(
      (degree) =>
        SCALE_CHORDS[mode][degree as keyof (typeof SCALE_CHORDS)[typeof mode]],
    );
    return chords.join(" ");
  };

  return (
    <ForgeContainer>
      <SelectorContainer>
        <CategorySection>
          <CategoryHeader>Playback Style</CategoryHeader>
          <Button
            active={playbackStyle === "arpeggio"}
            onClick={async () => {
              console.log("[Forge] Arpeggio style clicked");
              isClickPending.current = true;
              setPlaybackStyle("arpeggio");
              await prepareMidi(
                mode,
                patternIndex,
                progression,
                "arpeggio",
                wholeNoteStyle,
                alternationStyle,
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Arpeggio style hover");
              prepareMidi(
                mode,
                patternIndex,
                progression,
                "arpeggio",
                wholeNoteStyle,
                alternationStyle,
                false,
              );
            }}
          >
            Arpeggio
          </Button>
          <Button
            active={playbackStyle === "whole_notes"}
            onClick={async () => {
              console.log("[Forge] Whole notes style clicked");
              isClickPending.current = true;
              setPlaybackStyle("whole_notes");
              await prepareMidi(
                mode,
                patternIndex,
                progression,
                "whole_notes",
                wholeNoteStyle,
                alternationStyle,
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Whole notes style hover");
              prepareMidi(
                mode,
                patternIndex,
                progression,
                "whole_notes",
                wholeNoteStyle,
                alternationStyle,
                false,
              );
            }}
          >
            Whole Notes
          </Button>
          <Button
            active={playbackStyle === "root_chord_alternation"}
            onClick={async () => {
              console.log("[Forge] Root-chord alternation style clicked");
              isClickPending.current = true;
              setPlaybackStyle("root_chord_alternation");
              await prepareMidi(
                mode,
                patternIndex,
                progression,
                "root_chord_alternation",
                wholeNoteStyle,
                alternationStyle,
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Root-chord alternation style hover");
              prepareMidi(
                mode,
                patternIndex,
                progression,
                "root_chord_alternation",
                wholeNoteStyle,
                alternationStyle,
                false,
              );
            }}
          >
            Root-Chord Alternation
          </Button>
        </CategorySection>

        {playbackStyle === "whole_notes" && (
          <CategorySection>
            <CategoryHeader>Whole Note Style</CategoryHeader>
            {["root", "octave", "power", "triad", "triad_octave"].map(
              (style) => (
                <Button
                  key={style}
                  active={wholeNoteStyle === style}
                  onClick={async () => {
                    console.log("[Forge] Whole note style clicked:", style);
                    isClickPending.current = true;
                    setWholeNoteStyle(style as ForgeConfig["wholeNoteStyle"]);
                    await prepareMidi(
                      mode,
                      patternIndex,
                      progression,
                      "whole_notes",
                      style as ForgeConfig["wholeNoteStyle"],
                      alternationStyle,
                      true,
                    );
                  }}
                  onMouseEnter={() => {
                    console.log("[Forge] Whole note style hover:", style);
                    prepareMidi(
                      mode,
                      patternIndex,
                      progression,
                      "whole_notes",
                      style as ForgeConfig["wholeNoteStyle"],
                      alternationStyle,
                      false,
                    );
                  }}
                >
                  {style.replace("_", " ")}
                </Button>
              ),
            )}
          </CategorySection>
        )}

        {playbackStyle === "root_chord_alternation" && (
          <CategorySection>
            <CategoryHeader>Alternation Style</CategoryHeader>
            <Button
              active={alternationStyle === "half"}
              onClick={async () => {
                console.log("[Forge] Half note alternation clicked");
                isClickPending.current = true;
                setAlternationStyle("half");
                await prepareMidi(
                  mode,
                  patternIndex,
                  progression,
                  "root_chord_alternation",
                  wholeNoteStyle,
                  "half",
                  true,
                );
              }}
              onMouseEnter={() => {
                console.log("[Forge] Half note alternation hover");
                prepareMidi(
                  mode,
                  patternIndex,
                  progression,
                  "root_chord_alternation",
                  wholeNoteStyle,
                  "half",
                  false,
                );
              }}
            >
              Half Notes
            </Button>
            <Button
              active={alternationStyle === "quarter"}
              onClick={async () => {
                console.log("[Forge] Quarter note alternation clicked");
                isClickPending.current = true;
                setAlternationStyle("quarter");
                await prepareMidi(
                  mode,
                  patternIndex,
                  progression,
                  "root_chord_alternation",
                  wholeNoteStyle,
                  "quarter",
                  true,
                );
              }}
              onMouseEnter={() => {
                console.log("[Forge] Quarter note alternation hover");
                prepareMidi(
                  mode,
                  patternIndex,
                  progression,
                  "root_chord_alternation",
                  wholeNoteStyle,
                  "quarter",
                  false,
                );
              }}
            >
              Quarter Notes
            </Button>
            <Button
              active={alternationStyle === "quarter_fifth"}
              onClick={async () => {
                console.log(
                  "[Forge] Quarter note with fifth alternation clicked",
                );
                isClickPending.current = true;
                setAlternationStyle("quarter_fifth");
                await prepareMidi(
                  mode,
                  patternIndex,
                  progression,
                  "root_chord_alternation",
                  wholeNoteStyle,
                  "quarter_fifth",
                  true,
                );
              }}
              onMouseEnter={() => {
                console.log(
                  "[Forge] Quarter note with fifth alternation hover",
                );
                prepareMidi(
                  mode,
                  patternIndex,
                  progression,
                  "root_chord_alternation",
                  wholeNoteStyle,
                  "quarter_fifth",
                  false,
                );
              }}
            >
              Quarter Notes with Fifth
            </Button>
          </CategorySection>
        )}

        {playbackStyle === "arpeggio" && (
          <CategorySection>
            <CategoryHeader>Pattern</CategoryHeader>
            {patternSequences.map((seq, idx) => (
              <PatternButton
                key={idx}
                active={patternIndex === idx}
                onClick={async () => {
                  console.log("[Forge] Pattern clicked:", idx);
                  isClickPending.current = true;
                  setPatternIndex(idx as PatternIndex);
                  await prepareMidi(
                    mode,
                    idx as PatternIndex,
                    progression,
                    "arpeggio",
                    wholeNoteStyle,
                    alternationStyle,
                    true,
                  );
                }}
                onMouseEnter={() => {
                  console.log("[Forge] Pattern hover:", idx);
                  prepareMidi(
                    mode,
                    idx as PatternIndex,
                    progression,
                    "arpeggio",
                    wholeNoteStyle,
                    alternationStyle,
                    false,
                  );
                }}
              >
                {seq}
              </PatternButton>
            ))}
          </CategorySection>
        )}

        <CategorySection>
          <CategoryHeader>Mode</CategoryHeader>
          <Button
            active={mode === "major"}
            onClick={async () => {
              console.log("[Forge] Major button clicked");
              isClickPending.current = true;
              setMode("major");
              await prepareMidi(
                "major",
                patternIndex,
                progression,
                playbackStyle,
                wholeNoteStyle,
                alternationStyle,
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Major button hover");
              prepareMidi(
                "major",
                patternIndex,
                progression,
                playbackStyle,
                wholeNoteStyle,
                alternationStyle,
                false,
              );
            }}
          >
            Major
          </Button>
          <Button
            active={mode === "minor"}
            onClick={async () => {
              console.log("[Forge] Minor button clicked");
              isClickPending.current = true;
              setMode("minor");
              await prepareMidi(
                "minor",
                patternIndex,
                progression,
                playbackStyle,
                wholeNoteStyle,
                alternationStyle,
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Minor button hover");
              prepareMidi(
                "minor",
                patternIndex,
                progression,
                playbackStyle,
                wholeNoteStyle,
                alternationStyle,
                false,
              );
            }}
          >
            Minor
          </Button>
          <Button
            active={mode === "natural_minor"}
            onClick={async () => {
              console.log("[Forge] Natural minor button clicked");
              isClickPending.current = true;
              setMode("natural_minor");
              await prepareMidi(
                "natural_minor",
                patternIndex,
                progression,
                playbackStyle,
                wholeNoteStyle,
                alternationStyle,
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Natural minor button hover");
              prepareMidi(
                "natural_minor",
                patternIndex,
                progression,
                playbackStyle,
                wholeNoteStyle,
                alternationStyle,
                false,
              );
            }}
          >
            Natural Minor
          </Button>
        </CategorySection>

        <CategorySection>
          <CategoryHeader>Progression</CategoryHeader>
          {(Object.keys(PROGRESSIONS) as ProgressionType[]).map((prog) => (
            <ProgressionButton
              key={prog}
              active={progression === prog}
              onClick={async () => {
                console.log("[Forge] Progression clicked:", prog);
                isClickPending.current = true;
                setProgression(prog);
                await prepareMidi(
                  mode,
                  patternIndex,
                  prog,
                  playbackStyle,
                  wholeNoteStyle,
                  alternationStyle,
                  true,
                );
              }}
              onMouseEnter={() => {
                console.log("[Forge] Progression hover:", prog);
                prepareMidi(
                  mode,
                  patternIndex,
                  prog,
                  playbackStyle,
                  wholeNoteStyle,
                  alternationStyle,
                  false,
                );
              }}
            >
              {getProgressionDisplay(prog)}
            </ProgressionButton>
          ))}
        </CategorySection>
      </SelectorContainer>
      <ContentArea>
        <div>Current mode: {mode}</div>
        <div>Current progression: {getProgressionDisplay(progression)}</div>
        <div>Playback style: {playbackStyle.replace("_", " ")}</div>
        {playbackStyle === "whole_notes" && (
          <div>Whole note style: {wholeNoteStyle?.replace("_", " ")}</div>
        )}
        {playbackStyle === "root_chord_alternation" && (
          <div>Alternation style: {alternationStyle?.replace("_", " ")}</div>
        )}
      </ContentArea>
      {currentMidi && rawlProps && rawlProps.parsingResult && (
        <Rawl {...rawlProps} />
      )}
    </ForgeContainer>
  );
};

export default ForgeUI;
