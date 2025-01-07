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

const TonicSelector = styled.div`
  display: flex;
  flex-direction: row;
  gap: 8px;
  margin-bottom: 20px;
  align-items: center;
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

const TonicHeader = styled(CategoryHeader)`
  margin-right: 8px;
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

const ForgeUI: React.FC = () => {
  const [state, setState] = useState<ForgeUIState>({
    mode: "major",
    patternIndex: 0,
    progression: "CLASSIC",
    playbackStyle: "arpeggio",
    wholeNoteStyle: "triad",
    alternationStyle: "half",
    tonic: 0,
    melodyRhythm: "eighth",
    melodyType: "static",
  });

  // Add state to track last generated configuration
  const [lastGeneratedConfig, setLastGeneratedConfig] = useState<ForgeUIState>({
    mode: "major",
    patternIndex: 0,
    progression: "CLASSIC",
    playbackStyle: "arpeggio",
    wholeNoteStyle: "triad",
    alternationStyle: "half",
    tonic: 0,
    melodyRhythm: "eighth",
    melodyType: "static",
  });

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
    eventType: "click" | "hover",
    updates: Partial<ForgeUIState>,
    description: string,
  ) => {
    console.log(`[Forge] ${description} ${eventType}`);
    const shouldAutoPlay = eventType === "click";

    if (shouldAutoPlay) {
      isClickPending.current = true;
      setState((prev) => ({ ...prev, ...updates }));
    }

    const newConfig = { ...state, ...updates };
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
      // Generate notes using the configuration
      const config: ForgeConfig = {
        mode: newConfig.mode,
        pattern: newConfig.patternIndex,
        progression: newConfig.progression,
        playbackStyle: newConfig.playbackStyle,
        wholeNoteStyle: newConfig.wholeNoteStyle,
        alternationStyle: newConfig.alternationStyle,
        tonic: newConfig.tonic,
        melodyRhythm: newConfig.melodyRhythm,
        melodyType: newConfig.melodyType,
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
    onClick: () => handleStyleInteraction("click", updates, description),
    onMouseEnter: () => handleStyleInteraction("hover", updates, description),
  });

  return (
    <ForgeContainer>
      <TonicSelector>
        <TonicHeader>Tonic</TonicHeader>
        {Object.entries(PITCH_CLASS_TO_LETTER).map(([pitchClass, letter]) => (
          <Button
            key={pitchClass}
            active={state.tonic === parseInt(pitchClass)}
            {...getInteractionProps(
              { tonic: parseInt(pitchClass) },
              `Tonic ${letter}`,
            )}
          >
            {letter}
          </Button>
        ))}
      </TonicSelector>
      <SelectorContainer>
        <CategorySection>
          <CategoryHeader>Mode</CategoryHeader>
          <Button
            active={state.mode === "major"}
            {...getInteractionProps({ mode: "major" }, "Major button")}
          >
            Major
          </Button>
          <Button
            active={state.mode === "minor"}
            {...getInteractionProps({ mode: "minor" }, "Minor button")}
          >
            Minor
          </Button>
          <Button
            active={state.mode === "natural_minor"}
            {...getInteractionProps(
              { mode: "natural_minor" },
              "Natural minor button",
            )}
          >
            Natural Minor
          </Button>
        </CategorySection>

        <CategorySection>
          <CategoryHeader>Progression</CategoryHeader>
          {(Object.keys(PROGRESSIONS) as ProgressionType[]).map((prog) => (
            <ProgressionButton
              key={prog}
              active={state.progression === prog}
              {...getInteractionProps(
                { progression: prog },
                `Progression ${prog}`,
              )}
            >
              {getProgressionDisplay(prog)}
            </ProgressionButton>
          ))}
        </CategorySection>

        <CategorySection>
          <CategoryHeader>Playback Style</CategoryHeader>
          <Button
            active={state.playbackStyle === "arpeggio"}
            {...getInteractionProps(
              { playbackStyle: "arpeggio" },
              "Arpeggio style",
            )}
          >
            Arpeggio
          </Button>
          <Button
            active={state.playbackStyle === "whole_notes"}
            {...getInteractionProps(
              { playbackStyle: "whole_notes" },
              "Whole notes style",
            )}
          >
            Whole Notes
          </Button>
          <Button
            active={state.playbackStyle === "root_chord_alternation"}
            {...getInteractionProps(
              { playbackStyle: "root_chord_alternation" },
              "Root-chord alternation style",
            )}
          >
            Root-Chord Alternation
          </Button>
        </CategorySection>

        {state.playbackStyle === "whole_notes" && (
          <CategorySection>
            <CategoryHeader>Whole Note Style</CategoryHeader>
            {["root", "octave", "power", "triad", "triad_octave"].map(
              (style) => (
                <Button
                  key={style}
                  active={state.wholeNoteStyle === style}
                  {...getInteractionProps(
                    {
                      wholeNoteStyle: style as ForgeConfig["wholeNoteStyle"],
                    },
                    `Whole note style ${style}`,
                  )}
                >
                  {style.replace("_", " ")}
                </Button>
              ),
            )}
          </CategorySection>
        )}

        {state.playbackStyle === "root_chord_alternation" && (
          <CategorySection>
            <CategoryHeader>Alternation Style</CategoryHeader>
            <Button
              active={state.alternationStyle === "half"}
              {...getInteractionProps(
                { alternationStyle: "half" },
                "Half note alternation",
              )}
            >
              Half Notes
            </Button>
            <Button
              active={state.alternationStyle === "quarter"}
              {...getInteractionProps(
                { alternationStyle: "quarter" },
                "Quarter note alternation",
              )}
            >
              Quarter Notes
            </Button>
            <Button
              active={state.alternationStyle === "quarter_fifth"}
              {...getInteractionProps(
                { alternationStyle: "quarter_fifth" },
                "Quarter note with fifth alternation",
              )}
            >
              Quarter Notes with Fifth
            </Button>
          </CategorySection>
        )}

        {state.playbackStyle === "arpeggio" && (
          <CategorySection>
            <CategoryHeader>Pattern</CategoryHeader>
            {patternSequences.map((seq, idx) => (
              <PatternButton
                key={idx}
                active={state.patternIndex === idx}
                {...getInteractionProps(
                  { patternIndex: idx as PatternIndex },
                  `Pattern ${idx}`,
                )}
              >
                {seq}
              </PatternButton>
            ))}
          </CategorySection>
        )}

        <CategorySection>
          <CategoryHeader>Melody Rhythm</CategoryHeader>
          <Button
            active={state.melodyRhythm === "quarter"}
            {...getInteractionProps(
              { melodyRhythm: "quarter" },
              "Quarter note melody",
            )}
          >
            Quarter Notes
          </Button>
          <Button
            active={state.melodyRhythm === "eighth"}
            {...getInteractionProps(
              { melodyRhythm: "eighth" },
              "Eighth note melody",
            )}
          >
            Eighth Notes
          </Button>
          <Button
            active={state.melodyRhythm === "sixteenth"}
            {...getInteractionProps(
              { melodyRhythm: "sixteenth" },
              "Sixteenth note melody",
            )}
          >
            Sixteenth Notes
          </Button>
        </CategorySection>

        <CategorySection>
          <CategoryHeader>Melody Type</CategoryHeader>
          <Button
            active={state.melodyType === "static"}
            {...getInteractionProps(
              { melodyType: "static" },
              "Static scale-based melody",
            )}
          >
            Static Scale
          </Button>
          <Button
            active={state.melodyType === "chord_based"}
            {...getInteractionProps(
              { melodyType: "chord_based" },
              "Chord-based melody",
            )}
          >
            Chord Based
          </Button>
        </CategorySection>
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
          <div>Whole note style: {state.wholeNoteStyle?.replace("_", " ")}</div>
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
  );
};

export default ForgeUI;
