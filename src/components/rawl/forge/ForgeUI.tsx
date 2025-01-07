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

  // Add ref to track if change is from click
  const isClickPending = useRef(false);

  const handleStyleInteraction = async (
    eventType: "click" | "hover",
    updates: {
      newMode?: ForgeConfig["mode"];
      newPatternIndex?: PatternIndex;
      newProgression?: ProgressionType;
      newPlaybackStyle?: PlaybackStyle;
      newWholeNoteStyle?: ForgeConfig["wholeNoteStyle"];
      newAlternationStyle?: ForgeConfig["alternationStyle"];
    },
    description: string,
  ) => {
    console.log(`[Forge] ${description} ${eventType}`);
    const shouldAutoPlay = eventType === "click";

    if (shouldAutoPlay) {
      isClickPending.current = true;
      // Apply state updates
      if (updates.newMode) setMode(updates.newMode);
      if (updates.newPatternIndex !== undefined)
        setPatternIndex(updates.newPatternIndex);
      if (updates.newProgression) setProgression(updates.newProgression);
      if (updates.newPlaybackStyle) setPlaybackStyle(updates.newPlaybackStyle);
      if (updates.newWholeNoteStyle)
        setWholeNoteStyle(updates.newWholeNoteStyle);
      if (updates.newAlternationStyle)
        setAlternationStyle(updates.newAlternationStyle);
    }

    await prepareMidi(
      updates.newMode || mode,
      updates.newPatternIndex !== undefined
        ? updates.newPatternIndex
        : patternIndex,
      updates.newProgression || progression,
      updates.newPlaybackStyle || playbackStyle,
      updates.newWholeNoteStyle || wholeNoteStyle,
      updates.newAlternationStyle || alternationStyle,
      shouldAutoPlay,
    );
  };

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

  const getProgressionDisplay = (prog: ProgressionType) => {
    const chords = PROGRESSIONS[prog].map(
      (degree) =>
        SCALE_CHORDS[mode][degree as keyof (typeof SCALE_CHORDS)[typeof mode]],
    );
    return chords.join(" ");
  };

  const getInteractionProps = (
    updates: Parameters<typeof handleStyleInteraction>[1],
    description: string,
  ) => ({
    onClick: () => handleStyleInteraction("click", updates, description),
    onMouseEnter: () => handleStyleInteraction("hover", updates, description),
  });

  return (
    <ForgeContainer>
      <SelectorContainer>
        <CategorySection>
          <CategoryHeader>Playback Style</CategoryHeader>
          <Button
            active={playbackStyle === "arpeggio"}
            {...getInteractionProps(
              { newPlaybackStyle: "arpeggio" },
              "Arpeggio style",
            )}
          >
            Arpeggio
          </Button>
          <Button
            active={playbackStyle === "whole_notes"}
            {...getInteractionProps(
              { newPlaybackStyle: "whole_notes" },
              "Whole notes style",
            )}
          >
            Whole Notes
          </Button>
          <Button
            active={playbackStyle === "root_chord_alternation"}
            {...getInteractionProps(
              { newPlaybackStyle: "root_chord_alternation" },
              "Root-chord alternation style",
            )}
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
                  {...getInteractionProps(
                    {
                      newWholeNoteStyle: style as ForgeConfig["wholeNoteStyle"],
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

        {playbackStyle === "root_chord_alternation" && (
          <CategorySection>
            <CategoryHeader>Alternation Style</CategoryHeader>
            <Button
              active={alternationStyle === "half"}
              {...getInteractionProps(
                { newAlternationStyle: "half" },
                "Half note alternation",
              )}
            >
              Half Notes
            </Button>
            <Button
              active={alternationStyle === "quarter"}
              {...getInteractionProps(
                { newAlternationStyle: "quarter" },
                "Quarter note alternation",
              )}
            >
              Quarter Notes
            </Button>
            <Button
              active={alternationStyle === "quarter_fifth"}
              {...getInteractionProps(
                { newAlternationStyle: "quarter_fifth" },
                "Quarter note with fifth alternation",
              )}
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
                {...getInteractionProps(
                  { newPatternIndex: idx as PatternIndex },
                  `Pattern ${idx}`,
                )}
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
            {...getInteractionProps({ newMode: "major" }, "Major button")}
          >
            Major
          </Button>
          <Button
            active={mode === "minor"}
            {...getInteractionProps({ newMode: "minor" }, "Minor button")}
          >
            Minor
          </Button>
          <Button
            active={mode === "natural_minor"}
            {...getInteractionProps(
              { newMode: "natural_minor" },
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
              active={progression === prog}
              {...getInteractionProps(
                { newProgression: prog },
                `Progression ${prog}`,
              )}
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
