import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import Rawl from "../Rawl";
import {
  ForgeConfig,
  generateNotes,
  PATTERNS,
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
  const { currentMidi, rawlProps, setCurrentMidi, playSongBuffer } =
    useContext(AppContext);

  // Pattern sequences for display - derived directly from PATTERNS
  const patternSequences = PATTERNS.map((pattern) => pattern.join(" "));

  const prepareMidi = async (
    newMode: ForgeConfig["mode"],
    newPatternIndex: PatternIndex,
    newProgression: ProgressionType,
    shouldAutoPlay: boolean = false,
  ) => {
    // Skip if all values are the same and it's not an autoplay request
    if (
      !shouldAutoPlay &&
      newMode === mode &&
      newPatternIndex === patternIndex &&
      newProgression === progression
    ) {
      console.log("[Forge] Skipping MIDI generation - values unchanged");
      return null;
    }

    console.log(
      "[Forge] Preparing MIDI generation for:",
      newMode,
      newPatternIndex,
      newProgression,
    );

    try {
      // Generate notes using the configuration
      const config: ForgeConfig = {
        mode: newMode,
        pattern: newPatternIndex,
        progression: newProgression,
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
      prepareMidi(mode, patternIndex, progression, false);
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
          <CategoryHeader>Mode</CategoryHeader>
          <Button
            active={mode === "major"}
            onClick={async () => {
              console.log("[Forge] Major button clicked");
              isClickPending.current = true;
              setMode("major");
              await prepareMidi("major", patternIndex, progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Major button hover");
              prepareMidi("major", patternIndex, progression, false);
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
              await prepareMidi("minor", patternIndex, progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Minor button hover");
              prepareMidi("minor", patternIndex, progression, false);
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
                true,
              );
            }}
            onMouseEnter={() => {
              console.log("[Forge] Natural minor button hover");
              prepareMidi("natural_minor", patternIndex, progression, false);
            }}
          >
            Natural Minor
          </Button>
        </CategorySection>

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
                await prepareMidi(mode, idx as PatternIndex, progression, true);
              }}
              onMouseEnter={() => {
                console.log("[Forge] Pattern hover:", idx);
                prepareMidi(mode, idx as PatternIndex, progression, false);
              }}
            >
              {seq}
            </PatternButton>
          ))}
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
                await prepareMidi(mode, patternIndex, prog, true);
              }}
              onMouseEnter={() => {
                console.log("[Forge] Progression hover:", prog);
                prepareMidi(mode, patternIndex, prog, false);
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
      </ContentArea>
      {currentMidi && rawlProps && rawlProps.parsingResult && (
        <Rawl {...rawlProps} />
      )}
    </ForgeContainer>
  );
};

export default ForgeUI;
