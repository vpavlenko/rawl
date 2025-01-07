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

const ContentArea = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #111;
  border-radius: 4px;
`;

const TopControls = styled.div`
  display: flex;
  flex-direction: row;
  gap: 24px;
  margin-bottom: 20px;
  align-items: flex-start;
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
      onClick={() => handleStyleInteraction({ [propName]: value }, description)}
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
  const [lastGeneratedConfig, setLastGeneratedConfig] =
    useState<ForgeUIState>(INITIAL_STATE);

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
  ) => {
    console.log(`[Forge] ${description}`);
    setState((prev) => ({ ...prev, ...updates }));
    const newConfig = { ...state, ...updates };
    await prepareMidi(newConfig, true);
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
      // Generate notes using the configuration
      const config: ForgeConfig = {
        ...newConfig,
        pattern: newConfig.patternIndex,
      };
      const { melody, chords } = generateNotes(config);
      const notes = { melody, chords };
      console.log("[Forge] Generated notes:", notes);

      // Generate MIDI with metadata
      const { midiData, midiInfo, analysis } = generateMidiWithMetadata(
        notes,
        newConfig.mode,
        newConfig.tonic,
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
        <ContentArea>
          <div>Current tonic: {PITCH_CLASS_TO_LETTER[state.tonic]}</div>
          <div>Current mode: {state.mode}</div>
          <div>
            Current progression: {getProgressionDisplay(state.progression)}
          </div>
          <div>Playback style: {state.playbackStyle.replace("_", " ")}</div>
          <div>Melody rhythm: {state.melodyRhythm} notes</div>
          <div>Melody type: {state.melodyType.replace("_", " ")}</div>
          {state.playbackStyle === "whole_notes" && (
            <div>
              Whole note style: {state.wholeNoteStyle?.replace("_", " ")}
            </div>
          )}
          {state.playbackStyle === "root_chord_alternation" && (
            <div>
              Alternation style: {state.alternationStyle?.replace("_", " ")}
            </div>
          )}
        </ContentArea>
        {currentMidi && rawlProps && rawlProps.parsingResult && (
          <Rawl {...rawlProps} />
        )}
      </ForgeContainer>
    </ForgeContext.Provider>
  );
};

export default ForgeUI;
