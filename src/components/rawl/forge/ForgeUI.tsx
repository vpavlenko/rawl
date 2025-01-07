import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import Rawl from "../Rawl";
import {
  ForgeConfig,
  generateNotes,
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

const ForgeUI: React.FC = () => {
  const [mode, setMode] = useState<ForgeConfig["mode"]>("major");
  const [pattern, setPattern] = useState<"classic" | "alternate">("classic");
  const [progression, setProgression] = useState<ProgressionType>("CLASSIC");
  const { currentMidi, rawlProps, setCurrentMidi, playSongBuffer } =
    useContext(AppContext);

  const prepareMidi = async (
    newMode: ForgeConfig["mode"],
    newPattern: "classic" | "alternate",
    newProgression: ProgressionType,
    shouldAutoPlay: boolean = false,
  ) => {
    console.log(
      "[Forge] Preparing MIDI generation for:",
      newMode,
      newPattern,
      newProgression,
    );

    try {
      // Generate notes using the configuration
      const config: ForgeConfig = {
        mode: newMode,
        pattern: newPattern,
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
      "[Forge] useEffect triggered for mode/pattern/progression change:",
      mode,
      pattern,
      progression,
    );
    // Only prepare if not from a click (which will handle its own preparation)
    if (!isClickPending.current) {
      prepareMidi(mode, pattern, progression, false);
    }
    isClickPending.current = false;
  }, [mode, pattern, progression]);

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
              await prepareMidi("major", pattern, progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Major button hover");
              prepareMidi("major", pattern, progression, false);
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
              await prepareMidi("minor", pattern, progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Minor button hover");
              prepareMidi("minor", pattern, progression, false);
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
              await prepareMidi("natural_minor", pattern, progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Natural minor button hover");
              prepareMidi("natural_minor", pattern, progression, false);
            }}
          >
            Natural Minor
          </Button>
        </CategorySection>

        <CategorySection>
          <CategoryHeader>Pattern</CategoryHeader>
          <Button
            active={pattern === "classic"}
            onClick={async () => {
              console.log("[Forge] Classic pattern clicked");
              isClickPending.current = true;
              setPattern("classic");
              await prepareMidi(mode, "classic", progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Classic pattern hover");
              prepareMidi(mode, "classic", progression, false);
            }}
          >
            r m u m u m u m
          </Button>
          <Button
            active={pattern === "alternate"}
            onClick={async () => {
              console.log("[Forge] Alternate pattern clicked");
              isClickPending.current = true;
              setPattern("alternate");
              await prepareMidi(mode, "alternate", progression, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Alternate pattern hover");
              prepareMidi(mode, "alternate", progression, false);
            }}
          >
            r m u m r m u m
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
                await prepareMidi(mode, pattern, prog, true);
              }}
              onMouseEnter={() => {
                console.log("[Forge] Progression hover:", prog);
                prepareMidi(mode, pattern, prog, false);
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
