import { isEqual } from "lodash";
import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { PITCH_CLASS_TO_LETTER } from "../AnalysisGrid";
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

const TopControls = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-bottom: 20px;
  align-items: flex-start;
`;

const BPMSlider = styled.input`
  width: 200px;
  margin: 0 10px;
`;

const BPMLabel = styled.span`
  font-family: monospace;
  color: #999;
  font-size: 14px;
  letter-spacing: 0.5px;
`;

const BPMValue = styled.span`
  font-family: monospace;
  color: white;
  width: 40px;
  display: inline-block;
  text-align: right;
`;

interface ForgeButtonProps<T extends keyof ForgeUIState> {
  propName: T;
  value: ForgeUIState[T];
  children: React.ReactNode;
  description: string;
  className?: string;
}

const ForgeButton = <T extends keyof ForgeUIState>({
  propName,
  value,
  children,
  description,
  className,
}: ForgeButtonProps<T>) => {
  const { state, handleStyleInteraction } = useForgeContext();
  return (
    <Button
      className={className}
      active={state[propName] === value}
      onClick={() =>
        handleStyleInteraction({ [propName]: value }, description, "click")
      }
      onMouseEnter={() =>
        handleStyleInteraction({ [propName]: value }, description, "hover")
      }
      onMouseLeave={() =>
        handleStyleInteraction(
          { [propName]: state[propName] },
          description,
          "leave",
        )
      }
    >
      {children}
    </Button>
  );
};

const ProgressionButton = styled(ForgeButton)`
  font-family: monospace;
`;

const PatternButton = styled(ForgeButton)`
  font-family: monospace;
`;

// Add pattern type
export type PatternIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

const INITIAL_STATE: ForgeUIState = {
  mode: "major",
  patternIndex: 0,
  progression: "CLASSIC",
  playbackStyle: "arpeggio",
  wholeNoteStyle: "triad",
  alternationStyle: "half",
  tonic: 0,
  melodyRhythm: "eighth",
  melodyType: "static",
  bpm: 120,
};

interface ForgeUIState {
  mode: ForgeConfig["mode"];
  patternIndex: PatternIndex;
  progression: ProgressionType;
  playbackStyle: PlaybackStyle;
  wholeNoteStyle: ForgeConfig["wholeNoteStyle"];
  alternationStyle: ForgeConfig["alternationStyle"];
  tonic: number;
  melodyRhythm: ForgeConfig["melodyRhythm"];
  melodyType: ForgeConfig["melodyType"];
  bpm: number;
}

const MODE_OPTIONS: Array<{ value: ForgeUIState["mode"]; label: string }> = [
  { value: "major", label: "Major" },
  { value: "minor", label: "Minor" },
  { value: "natural_minor", label: "Natural Minor" },
];

const PLAYBACK_STYLES: Array<{
  value: ForgeUIState["playbackStyle"];
  label: string;
}> = [
  { value: "arpeggio", label: "Arpeggio" },
  { value: "whole_notes", label: "Whole Notes" },
  { value: "root_chord_alternation", label: "Root-Chord Alternation" },
];

const WHOLE_NOTE_STYLES: Array<{
  value: ForgeUIState["wholeNoteStyle"];
  label: string;
}> = [
  { value: "root", label: "Root" },
  { value: "octave", label: "Octave" },
  { value: "power", label: "Power" },
  { value: "triad", label: "Triad" },
  { value: "triad_octave", label: "Triad Octave" },
];

const ALTERNATION_STYLES: Array<{
  value: ForgeUIState["alternationStyle"];
  label: string;
}> = [
  { value: "half", label: "Half Notes" },
  { value: "quarter", label: "Quarter Notes" },
  { value: "quarter_fifth", label: "Quarter Notes with Fifth" },
];

const MELODY_RHYTHMS: Array<{
  value: ForgeUIState["melodyRhythm"];
  label: string;
}> = [
  { value: "quarter", label: "Quarter Notes" },
  { value: "eighth", label: "Eighth Notes" },
  { value: "sixteenth", label: "Sixteenth Notes" },
];

const MELODY_TYPES: Array<{
  value: ForgeUIState["melodyType"];
  label: string;
}> = [
  { value: "static", label: "Static Scale" },
  { value: "chord_based", label: "Chord Based" },
];

interface ForgeContextType {
  state: ForgeUIState;
  handleStyleInteraction: (
    updates: Partial<ForgeUIState>,
    description: string,
    eventType?: "click" | "hover" | "leave",
  ) => void;
}

const ForgeContext = React.createContext<ForgeContextType | null>(null);

const useForgeContext = () => {
  const context = useContext(ForgeContext);
  if (!context) {
    throw new Error(
      "useForgeContext must be used within a ForgeContextProvider",
    );
  }
  return context;
};

interface ButtonOption<T> {
  value: T;
  label: string;
}

interface ButtonSectionProps<T extends keyof ForgeUIState> {
  title: string;
  options: ButtonOption<ForgeUIState[T]>[];
  propName: T;
  customButton?: React.ComponentType<ForgeButtonProps<T>>;
  horizontal?: boolean;
}

const ButtonSection = <T extends keyof ForgeUIState>({
  title,
  options,
  propName,
  customButton: CustomButton,
  horizontal = false,
}: ButtonSectionProps<T> & { horizontal?: boolean }) => {
  const ButtonComponent = CustomButton || ForgeButton;
  const SectionComponent = horizontal
    ? HorizontalCategorySection
    : CategorySection;
  return (
    <SectionComponent>
      <CategoryHeader>{title}</CategoryHeader>
      {options.map(({ value, label }) => (
        <ButtonComponent
          key={value.toString()}
          propName={propName}
          value={value}
          description={`${title} ${label}`}
        >
          {label}
        </ButtonComponent>
      ))}
    </SectionComponent>
  );
};

const HorizontalCategorySection = styled(CategorySection)`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 4px;
`;

const TONIC_OPTIONS = Object.entries(PITCH_CLASS_TO_LETTER).map(
  ([pitchClass, letter]) => ({
    value: parseInt(pitchClass),
    label: letter,
  }),
);

const ForgeUI: React.FC = () => {
  const [state, setState] = useState<ForgeUIState>(INITIAL_STATE);
  const [lastClickedState, setLastClickedState] =
    useState<ForgeUIState>(INITIAL_STATE);
  const [lastGeneratedConfig, setLastGeneratedConfig] =
    useState<ForgeUIState>(INITIAL_STATE);
  const [isDraggingBPM, setIsDraggingBPM] = useState(false);

  const {
    currentMidi,
    setCurrentMidi,
    playSongBuffer,
    rawlProps,
    setRawlProps,
  } = useContext(AppContext);

  // Add ref to track if change is from click
  const isClickPending = useRef(false);

  // Pattern sequences for display - derived directly from PATTERNS
  const patternSequences = PATTERNS.map((pattern) => pattern.join(" "));

  const handleStyleInteraction = async (
    updates: Partial<ForgeUIState>,
    description: string,
    eventType: "click" | "hover" | "leave" = "click",
  ) => {
    console.log(`[Forge] ${description} ${eventType}`);
    const shouldAutoPlay = eventType === "click";

    if (eventType === "click") {
      isClickPending.current = true;
      const newState = { ...state, ...updates };
      setState(newState);
      setLastClickedState(newState);
    } else if (eventType === "hover") {
      setState((prev) => ({ ...prev, ...updates }));
    } else if (eventType === "leave") {
      setState(lastClickedState);
    }

    const newConfig =
      eventType === "leave" ? lastClickedState : { ...state, ...updates };
    await prepareMidi(newConfig, shouldAutoPlay);
  };

  const prepareMidi = async (
    newConfig: ForgeUIState,
    shouldAutoPlay: boolean = false,
  ) => {
    // Compare against last generated config using lodash isEqual
    if (!shouldAutoPlay && isEqual(newConfig, lastGeneratedConfig)) {
      console.log(
        "[Forge] Skipping MIDI generation - values match last generated config",
      );
      return null;
    }

    console.log("[Forge] Preparing MIDI generation for:", newConfig);

    try {
      // Convert ForgeUIState to ForgeConfig
      const config: ForgeConfig = {
        ...newConfig,
        pattern: newConfig.patternIndex,
      };

      // Generate notes using the configuration
      const { melody, chords } = generateNotes(config);
      const notes = { melody, chords };
      console.log("[Forge] Generated notes:", notes);

      // Generate MIDI with metadata
      const { midiData, midiInfo, analysis } = generateMidiWithMetadata(
        notes,
        config.mode,
        config.tonic,
        config,
      );
      console.log("[Forge] Generated MIDI data:", midiData.length, "bytes");

      // Update last generated config
      setLastGeneratedConfig(newConfig);

      // Set the current MIDI info in global context
      setCurrentMidi(midiInfo);

      // Set rawlProps with the generated analysis
      if (rawlProps) {
        setRawlProps({
          ...rawlProps,
          savedAnalysis: analysis,
        });
      }

      // Use playSongBuffer to load the MIDI data globally, with autoplay parameter
      await playSongBuffer("generated-alberti.mid", midiData, shouldAutoPlay);

      return { midiData, midiInfo };
    } catch (error) {
      console.error("[Forge] Error preparing MIDI:", error);
      return null;
    }
  };

  // Prepare MIDI on state change
  useEffect(() => {
    if (!isClickPending.current) {
      prepareMidi(state, false);
    }
    isClickPending.current = false;
  }, [state]);

  const getProgressionDisplay = (prog: ProgressionType) => {
    const chords = PROGRESSIONS[prog].map(
      (degree) =>
        SCALE_CHORDS[state.mode][
          degree as keyof (typeof SCALE_CHORDS)[typeof state.mode]
        ],
    );
    return chords.join(" ");
  };

  const getInteractionProps = (
    updates: Partial<ForgeUIState>,
    description: string,
  ) => ({
    onClick: () => handleStyleInteraction(updates, description),
  });

  const handleBPMChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newBPM = parseInt(event.target.value);
    setState((prev) => ({ ...prev, bpm: newBPM }));
  };

  const handleBPMDragStart = () => {
    setIsDraggingBPM(true);
  };

  const handleBPMDragEnd = () => {
    setIsDraggingBPM(false);
    setLastClickedState(state);
    prepareMidi(state, true);
  };

  const contextValue = {
    state,
    handleStyleInteraction,
  };

  return (
    <ForgeContext.Provider value={contextValue}>
      <ForgeContainer>
        <TopControls>
          <ButtonSection
            title="Tonic"
            options={TONIC_OPTIONS}
            propName="tonic"
            horizontal
          />
          <ButtonSection
            title="Mode"
            options={MODE_OPTIONS}
            propName="mode"
            horizontal
          />
          <div style={{ display: "flex", alignItems: "center" }}>
            <BPMLabel>BPM</BPMLabel>
            <BPMSlider
              type="range"
              min="60"
              max="240"
              value={state.bpm}
              onChange={handleBPMChange}
              onMouseDown={handleBPMDragStart}
              onMouseUp={handleBPMDragEnd}
            />
            <BPMValue>{state.bpm}</BPMValue>
          </div>
        </TopControls>

        <SelectorContainer>
          <ButtonSection
            title="Progression"
            options={Object.keys(PROGRESSIONS).map((prog) => ({
              value: prog as ProgressionType,
              label: getProgressionDisplay(prog as ProgressionType),
            }))}
            propName="progression"
            customButton={ProgressionButton}
          />

          <ButtonSection
            title="Playback Style"
            options={PLAYBACK_STYLES}
            propName="playbackStyle"
          />

          {state.playbackStyle === "whole_notes" && (
            <ButtonSection
              title="Whole Note Style"
              options={WHOLE_NOTE_STYLES}
              propName="wholeNoteStyle"
            />
          )}

          {state.playbackStyle === "root_chord_alternation" && (
            <ButtonSection
              title="Alternation Style"
              options={ALTERNATION_STYLES}
              propName="alternationStyle"
            />
          )}

          {state.playbackStyle === "arpeggio" && (
            <ButtonSection
              title="Pattern"
              options={patternSequences.map((seq, idx) => ({
                value: idx as PatternIndex,
                label: seq,
              }))}
              propName="patternIndex"
              customButton={PatternButton}
            />
          )}

          <ButtonSection
            title="Melody Rhythm"
            options={MELODY_RHYTHMS}
            propName="melodyRhythm"
          />

          <ButtonSection
            title="Melody Type"
            options={MELODY_TYPES}
            propName="melodyType"
          />
        </SelectorContainer>
        {currentMidi && rawlProps && rawlProps.parsingResult && (
          <Rawl {...rawlProps} />
        )}
      </ForgeContainer>
    </ForgeContext.Provider>
  );
};

export default ForgeUI;
