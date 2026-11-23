import * as React from "react";
import {
  MeasureRhythmInput,
  PHRASE_SHIFT_KEYS,
  PlaybackMeasureBorders,
  RawlMeasureHeader,
  TonalGrid as SharedTonalGrid,
  TonicSymbol,
  type MeasureSectionAction,
} from "librawl/components";
import { markersForRow, tonicMarkers, tonicRegions, visibleBeatLines } from "librawl/geometry";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../AppContext";
import Anchor from "../icons/Anchor";
import { getSectionAnchorShiftTarget } from "./sectionAnchors";
import type { SetBeatsPerMeasureCallback } from "./Rawl";
import { MeasuresAndBeats, MidiRange } from "./SystemLayout";
import { getModulations, type Analysis, type MeasuresSpan, type PitchClass } from "./analysis";
import { getGroupedBeatLines } from "./rhythmGrouping";

export const STACKED_RN_HEIGHT = 20;
// Only the active score supplies an offset; standalone examples stay in their key.
export const AnalysisTransposeContext = React.createContext(0);
const MOBILE_MEASURE_CLICK_MEDIA_QUERY = "(max-width: 767px)";

const NeighborAnchorButton = styled.button`
  position: absolute;
  top: -20px;
  left: 0;
  padding: 2px 3px;
  display: inline-flex;
  align-items: center;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  z-index: 100;
  transition: color 120ms ease, transform 120ms ease;

  &[aria-pressed="true"] {
    color: #ffc857;
  }

  &:hover,
  &:focus-visible {
    color: white;
    transform: scale(1.15);
  }

  &:active {
    color: #ffc857;
    transform: scale(0.9);
  }
`;

const isMobileMeasureClick = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia(MOBILE_MEASURE_CLICK_MEDIA_QUERY).matches;

export type MeasureSelection = {
  selectedMeasure: number;
  selectMeasure: (number) => void;
  splitAtMeasure: (boolean, number?) => void;
  mergeAtMeasure: () => void;
  setBeatsPerMeasure: SetBeatsPerMeasureCallback;
  rhythmGrouping?: number[];
  setRhythmGrouping?: (groups: number[]) => void;
  formPartName?: string;
  setFormPartName?: (name: string) => void;
  anchorSection?: (target: { phrase: number; edge?: "end" } | null) => void;
  shiftSectionAnchor?: (neighbor: -1 | 1, direction: -1 | 1) => void;
  copySectionModulations?: () => void;
};

export const PITCH_CLASS_TO_LETTER = {
  0: "C",
  1: "D♭",
  2: "D",
  3: "E♭",
  4: "E",
  5: "F",
  6: "F♯",
  7: "G",
  8: "A♭",
  9: "A",
  10: "B♭",
  11: "B",
};

const MeasureInput = styled.input`
  &:focus {
    outline: 1px solid #ddd;
    outline-offset: 2px;
  }
`;

const MeasureFormButton = styled.button`
  margin-left: 5px;
  padding: 0;
  border: none;
  background: transparent;
  color: white;
  font: inherit;
  cursor: pointer;

  &:focus-visible {
    outline: 1px solid #ddd;
    outline-offset: 2px;
  }
`;

const RemeasuringInput: React.FC<{
  selectedMeasure: number;
  selectMeasure: (number) => void;
  setBeatsPerMeasure: SetBeatsPerMeasureCallback;
  rhythmGrouping?: number[];
  setRhythmGrouping?: MeasureSelection["setRhythmGrouping"];
  onSectionKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  shiftSectionAnchor?: MeasureSelection["shiftSectionAnchor"];
  formPartName?: string;
  setFormPartName?: MeasureSelection["setFormPartName"];
}> = ({
  selectedMeasure,
  selectMeasure,
  setBeatsPerMeasure,
  rhythmGrouping = [],
  setRhythmGrouping,
  onSectionKeyDown,
  shiftSectionAnchor,
  formPartName = "",
  setFormPartName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    } else {
      inputRef.current?.focus();
    }
  }, [editingName]);

  const editName = () => {
    setName(formPartName);
    setEditingName(true);
  };

  const saveName = () => {
    setFormPartName?.(name);
    setEditingName(false);
  };

  const handleFormKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key.toLowerCase() !== "f" || !setFormPartName) return;
    event.preventDefault();
    event.stopPropagation();
    editName();
  };

  const forwardUnusedKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // The page ignores key events from text inputs. Leave measure editing
    // before forwarding an unhandled character from the body.
    event.preventDefault();
    event.stopPropagation();
    const forwardedEvent = new KeyboardEvent("keydown", {
      key: event.key,
      code: event.code,
      shiftKey: event.shiftKey,
      repeat: event.repeat,
      location: event.location,
      bubbles: true,
      cancelable: true,
    });
    event.currentTarget.blur();
    selectMeasure(null);
    document.body.dispatchEvent(forwardedEvent);
  };

  useEffect(() => {
    if (!shiftSectionAnchor) return;
    const handleAnchorKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (event.ctrlKey || event.metaKey || event.altKey ||
        (target !== inputRef.current &&
          (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)))) return;
      const keys: Record<string, [-1 | 1, -1 | 1]> = {
        q: [-1, -1], w: [-1, 1], a: [1, -1], s: [1, 1],
      };
      const movement = keys[event.key.toLowerCase()];
      if (!movement) return;
      event.preventDefault();
      event.stopPropagation();
      shiftSectionAnchor(...movement);
    };
    document.addEventListener("keydown", handleAnchorKey, true);
    return () => document.removeEventListener("keydown", handleAnchorKey, true);
  }, [shiftSectionAnchor]);

  if (editingName) {
    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap" }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <MeasureInput
          ref={nameInputRef}
          type="text"
          aria-label="Form part name"
          placeholder="Form part name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) return;
            if (event.key === "Enter") {
              event.preventDefault();
              saveName();
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditingName(false);
            }
          }}
          style={{ fontSize: 12, width: "24em" }}
        />
        <button type="button" onClick={saveName}>Save</button>
        <button type="button" onClick={() => setEditingName(false)}>Cancel</button>
      </div>
    );
  }

  return (
    <>
      <MeasureRhythmInput
        ref={inputRef}
        value={value}
        onValueChange={setValue}
        onKeyDown={handleFormKey}
        onUnhandledCharacter={forwardUnusedKey}
        onSectionKeyDown={onSectionKeyDown}
        onPhraseShift={(offset) => selectMeasure(selectedMeasure + offset)}
        onBeatsPerMeasure={setBeatsPerMeasure}
        onRhythmGrouping={setRhythmGrouping}
        showReset={false}
      />
      {setFormPartName && (
        <MeasureFormButton
          type="button"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            editName();
          }}
        >
          Form
        </MeasureFormButton>
      )}
      {!!rhythmGrouping.length && setRhythmGrouping && (
        <button type="button" style={{ marginLeft: 5 }}
          onClick={(event) => { event.stopPropagation(); setRhythmGrouping([]); }}>
          Reset
        </button>
      )}
    </>
  );
};

export const NewTonicSymbol: React.FC<{
  left: number;
  number: number;
  previousTonic: PitchClass | null;
  modulationDiff: number | null;
  tonicStart: PitchClass;
  alignToOnset?: boolean;
}> = ({ left, number, previousTonic, modulationDiff, tonicStart, alignToOnset = false }) => {
  const transpose = useContext(AnalysisTransposeContext);
  return (
    <TonicSymbol
      left={left}
      number={number}
      previousTonic={previousTonic}
      modulationDiff={modulationDiff}
      tonicStart={tonicStart}
      alignToOnset={alignToOnset}
      transpose={transpose}
    />
  );
};

const MeasureEditor: React.FC<{
  number: number;
  width: number;
  measureSelection: MeasureSelection;
  selectedPhraseStart: number;
  sectionAction?: MeasureSectionAction;
  isLastSection: boolean;
  anchorTargets?: { phrase: number; edge?: "end"; active: boolean; shortcut?: string }[];
  canAnchorSection?: boolean;
  hasSectionAnchor?: boolean;
  onSectionKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
}> = ({
  number,
  width,
  measureSelection,
  selectedPhraseStart,
  sectionAction,
  isLastSection,
  anchorTargets = [],
  canAnchorSection = false,
  hasSectionAnchor = false,
  onSectionKeyDown,
}) => {
  const { selectedMeasure, selectMeasure, splitAtMeasure, setBeatsPerMeasure } =
    measureSelection;

  return (
    <>
      {selectedMeasure === number && (
        <>
          <div
            style={{
              position: "absolute",
              top: 23,
              left: 0,
              color: "gray",
              fontSize: 12,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isMobileMeasureClick()) return;
              selectMeasure(null);
            }}
          >
            Esc
          </div>
          <div
            data-measure-toolbar=""
            style={{
              position: "absolute",
              top: -20,
              left: 0,
              display: "flex",
              alignItems: "center",
            }}
          >
            <RemeasuringInput
              setBeatsPerMeasure={setBeatsPerMeasure}
              rhythmGrouping={measureSelection.rhythmGrouping}
              setRhythmGrouping={measureSelection.setRhythmGrouping}
              onSectionKeyDown={onSectionKeyDown}
              selectMeasure={selectMeasure}
              selectedMeasure={selectedMeasure}
              formPartName={measureSelection.formPartName}
              setFormPartName={measureSelection.setFormPartName}
              shiftSectionAnchor={canAnchorSection ? measureSelection.shiftSectionAnchor : undefined}
            />
            {canAnchorSection && !isLastSection && measureSelection.copySectionModulations && (
              <button
                type="button"
                aria-label="Copy section modulations to all sections below"
                title="Replace later modulations with this section’s cycle, restarting at each section’s starting tonic. Short sections copy only the changes that fit; copying continues below them."
                style={{ marginLeft: 5, whiteSpace: "nowrap", background: "#222",
                  color: "white", border: "1px solid #666", cursor: "pointer", fontSize: 11 }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.stopPropagation();
                  measureSelection.copySectionModulations();
                }}
              >
                Copy modulations ↓
              </button>
            )}
            {canAnchorSection && hasSectionAnchor && selectedMeasure === number && (
              <button
                type="button"
                title="Reset section to the left edge"
                aria-label="Reset section alignment"
                style={{ display: "inline-flex", alignItems: "center", gap: 3,
                  marginLeft: 5, whiteSpace: "nowrap",
                  background: "#222", color: "white", border: "1px solid #666", cursor: "pointer" }}
                onMouseDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  event.stopPropagation();
                  measureSelection.anchorSection?.(null);
                  selectMeasure(null);
                }}
              >
                <Anchor /> Reset
              </button>
            )}
          </div>
        </>
      )}
      {selectedMeasure !== null &&
        selectedPhraseStart === selectedMeasure &&
        Object.entries(PHRASE_SHIFT_KEYS).map(([key, offset]) => {
          const targetMeasure = selectedMeasure + offset;
          if (targetMeasure === number) {
            return (
              <div
                key={key}
                style={{
                  position: "absolute",
                  top: -6,
                  left: 0,
                  color: "orange",
                  fontSize: 10,
                }}
              >
                {key}
              </div>
            );
          }
          return null;
        })}
      {sectionAction === "split" && isLastSection && (
          <div
            style={{
              position: "absolute",
              top: -18,
              left: -100,
              color: "red",
              fontSize: 14,
              fontWeight: 700,
              zIndex: 100,
              display: "flex",
              gap: "5px",
            }}
          >
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (isMobileMeasureClick()) return;
                splitAtMeasure(true, 2);
              }}
            >
              /8
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (isMobileMeasureClick()) return;
                splitAtMeasure(true, 3);
              }}
            >
              /12
            </span>
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (isMobileMeasureClick()) return;
                splitAtMeasure(true, 4);
              }}
            >
              /16
            </span>
          </div>
        )}
      {anchorTargets.map((anchorTarget) => (
        <NeighborAnchorButton
          key={`${anchorTarget.phrase}:${anchorTarget.edge ?? "start"}`}
          type="button"
          style={anchorTarget.edge === "end" ? { left: width - 7, top: -36 } : undefined}
          title={`Align selected section ${anchorTarget.edge === "end" ? "end" : "start"} with this phrase ${anchorTarget.edge === "end" ? "end" : "start"}`}
          aria-label={`Anchor selected section ${anchorTarget.edge === "end" ? "end" : "start"} to phrase ${anchorTarget.phrase + 1} ${anchorTarget.edge === "end" ? "end" : "start"}`}
          aria-pressed={anchorTarget.active}
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            event.stopPropagation();
            measureSelection.anchorSection?.({ phrase: anchorTarget.phrase,
              ...(anchorTarget.edge === "end" ? { edge: "end" as const } : {}) });
            selectMeasure(null);
          }}
        >
          <Anchor />
          {anchorTarget.shortcut && (
            <span style={{ marginLeft: 3, color: "orange", fontSize: 10 }}>
              {anchorTarget.shortcut}
            </span>
          )}
        </NeighborAnchorButton>
      ))}
    </>
  );
};

export const AnalysisTonalGuides: React.FC<{
  analysis?: Analysis;
  tonic?: number;
  measures: number[];
  midiNumberToY: (pitch: number) => number;
  noteHeight: number;
  midiRange: MidiRange;
  secondsToX: (time: number) => number;
  sectionSpan?: MeasuresSpan;
}> = React.memo(({ analysis, tonic, measures, midiNumberToY, noteHeight, midiRange, secondsToX, sectionSpan }) => {
  if (!measures?.length) return null;
  const events = tonic === undefined
    ? getModulations(analysis, measures)
    : [{ measure: 0, tonic, time: measures[0] }];
  const clipStart = secondsToX(measures[sectionSpan?.[0] ?? 0]);
  const endTime = measures[sectionSpan?.[1] ?? measures.length - 1];
  const clipEnd = secondsToX(endTime) +
    (sectionSpan && events.some(event => event.time === endTime) ? 30 : 0);

  const regions = tonicRegions(
    events.map(event => ({ beat: secondsToX(event.time), tonic: event.tonic })),
    clipStart,
    Math.min(clipEnd, secondsToX(measures.at(-1))),
  ).filter(region => region.tonic != null).map(region => ({
    left: region.start, width: region.end - region.start, tonic: region.tonic,
  }));
  return <SharedTonalGrid
    regions={regions}
    range={{ low: midiRange[0], high: midiRange[1] }}
    pitchToY={midiNumberToY}
    tonicHeight={noteHeight / 2}
  />;
});

interface AnalysisGridProps {
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  phraseStarts: number[];
  midiRange: MidiRange;
  measureSelection: MeasureSelection;
  showHeader?: boolean;
  showGlobalTonicAtStart?: boolean;
  showTonalGrid?: boolean;
  secondsToX: (number) => number;
  sectionSpan?: MeasuresSpan;
  playbackMeasure?: number | null;
  showPlaybackMeasureBottomBorder?: boolean;
}

export const AnalysisGrid: React.FC<AnalysisGridProps> = React.memo(
  ({
    analysis,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    measureSelection,
    phraseStarts,
    midiRange,
    showHeader = true,
    showGlobalTonicAtStart = false,
    showTonalGrid = true,
    secondsToX,
    sectionSpan = null,
    playbackMeasure = null,
    showPlaybackMeasureBottomBorder = false,
  }) => {
    const { measures } = measuresAndBeats;
    const beatLines = React.useMemo(
      () => getGroupedBeatLines(measuresAndBeats, analysis.rhythmGrouping),
      [measuresAndBeats, analysis.rhythmGrouping],
    );
    if (sectionSpan == null) {
      sectionSpan = [0, measures.length - 1];
    }
    const modulationsArray = getModulations(analysis, measures).map((mod, index) =>
      showGlobalTonicAtStart && index === 0 && mod.time < measures[sectionSpan[0]]
        ? { ...mod, measure: sectionSpan[0], time: measures[sectionSpan[0]] }
        : mod,
    );
    const [firstMeasure, lastMeasure] = sectionSpan;
    const firstTime = measures[firstMeasure];
    const lastTime = measures[lastMeasure];
    const isInSection = (time: number) => time >= firstTime && time <= lastTime;
    const { hoveredMeasuresSpan } = useContext(AppContext);
    const transpose = useContext(AnalysisTransposeContext);
    const measureLines = measures.slice(firstMeasure, lastMeasure + 1);
    const sectionBeatLines = beatLines.filter(isInSection);
    const selectedPhraseStart =
      phraseStarts.indexOf(measureSelection.selectedMeasure) !== -1
        ? measureSelection.selectedMeasure
        : -1;
    const sections = analysis.sections ?? [0];
    const selectedSection = phraseStarts.indexOf(measureSelection.selectedMeasure);
    const selectedSectionIndex = sections.indexOf(selectedSection);
    const currentSectionIndex = sections.findIndex((phrase) => phraseStarts[phrase] - 1 === sectionSpan[0]);
    const canAnchorSection = !!measureSelection.anchorSection && sections.length > 1 &&
      selectedSectionIndex >= 0 && currentSectionIndex === selectedSectionIndex;
    const isAnchorTargetSection = !!measureSelection.anchorSection && selectedSectionIndex >= 0 &&
      currentSectionIndex >= 0 && currentSectionIndex !== selectedSectionIndex;
    const selectedAnchor = analysis.sectionAnchors?.[selectedSection];
    const phraseEnds = new Map<number, number>();
    phraseStarts.forEach((start, phrase) => {
      if (start < measures.length) {
        phraseEnds.set(Math.min(phraseStarts[phrase + 1] ?? measures.length, measures.length) - 1, phrase);
      }
    });
    const anchorShortcuts: Record<number, string> = {};
    if (isAnchorTargetSection && Math.abs(currentSectionIndex - selectedSectionIndex) === 1 &&
      measureSelection.shiftSectionAnchor) {
      const neighbor = currentSectionIndex < selectedSectionIndex ? -1 : 1;
      for (const direction of [-1, 1] as const) {
        const target = getSectionAnchorShiftTarget(
          analysis, phraseStarts, measures, measureSelection.selectedMeasure, neighbor, direction,
        );
        if (target != null) {
          anchorShortcuts[target] = neighbor === -1
            ? (direction === -1 ? "q" : "w")
            : (direction === -1 ? "a" : "s");
        }
      }
    }
    const events = tonicMarkers(modulationsArray.map((change, index) => ({
      beat: change.time,
      number: change.measure + 1,
      tonic: change.tonic,
      onsetOverride: !(showGlobalTonicAtStart && index === 0) &&
        analysis.modulationOnset?.[change.measure + 1] != null,
    })));
    const markers = markersForRow(events, {
      start: firstTime,
      end: lastTime,
      toPixels: secondsToX,
      numberAt: beat => measures.findLastIndex(time => time <= beat) + 1,
    }).map(marker => ({ ...marker, left: secondsToX(marker.beat) + marker.pixelOffset }));
    const layout = {
      measures: measureLines.flatMap((beat, offset) => {
        const number = firstMeasure + offset + 1;
        const terminal = offset === measureLines.length - 1;
        const isPhraseStart = phraseStarts.includes(number);
        if (terminal && !isPhraseStart) return [];
        const x = secondsToX(beat);
        const width = secondsToX(measures[number] ?? beat) - x;
        const highlighted = !!hoveredMeasuresSpan &&
          number >= hoveredMeasuresSpan[0] && number <= hoveredMeasuresSpan[1];
        const hasModulation = markers.some(marker => marker.beat === beat && marker.delta !== null);
        const color = measureSelection.selectedMeasure === number
          ? "red"
          : selectedPhraseStart !== -1 && Math.abs(number - selectedPhraseStart) <= 4
            ? "orange"
            : highlighted ? "white" : hasModulation ? "black" : "#666";
        return [{ beat, number, left: x - 1, width, isPhraseStart, terminal, showLabel: !!width, color, hasModulation }];
      }),
      beats: visibleBeatLines(measureLines, sectionBeatLines, secondsToX)
        .map(beat => ({ beat, left: secondsToX(beat) })),
      markers,
    };
    const playing = layout.measures.find(measure => measure.number === playbackMeasure && !measure.terminal);

    return (
      <div style={{ zIndex: 15 }}>
        {playing && (showHeader || showPlaybackMeasureBottomBorder) && (
          <PlaybackMeasureBorders
            left={playing.left}
            width={playing.width + 1}
            top={showHeader}
            bottom={showPlaybackMeasureBottomBorder}
          />
        )}
        <RawlMeasureHeader
          layout={layout}
          transpose={transpose}
          showHeader={showHeader}
          showModulationTonics
          showContinuedTonic
          selectedMeasure={measures[measureSelection.selectedMeasure - 1] ?? null}
          onMeasureSelect={(_beat, measure) => {
            if (!isMobileMeasureClick() && typeof measure.number === "number") {
              measureSelection.selectMeasure(measure.number);
            }
          }}
          sectionEditing={{
            sectionStarts: sections.map(phrase => measures[phraseStarts[phrase] - 1]).filter(Number.isFinite),
            onSplit: () => measureSelection.splitAtMeasure(false),
            onGlue: measureSelection.mergeAtMeasure,
          }}
          renderMeasureExtras={(measure, onSectionKeyDown, sectionAction) => {
            if (typeof measure.number !== "number") return null;
            const number = measure.number;
            const i = number - 1;
            return <MeasureEditor
              number={number}
              width={measure.width ?? 0}
              measureSelection={measureSelection}
              onSectionKeyDown={onSectionKeyDown}
              selectedPhraseStart={selectedPhraseStart}
              sectionAction={sectionAction}
              isLastSection={lastMeasure + 1 === measures.length}
              canAnchorSection={canAnchorSection && i === firstMeasure}
              hasSectionAnchor={!!selectedAnchor}
              anchorTargets={isAnchorTargetSection && i < lastMeasure ? [
                ...(phraseStarts.includes(number) ? [{
                  phrase: phraseStarts.indexOf(number),
                  shortcut: anchorShortcuts[phraseStarts.indexOf(number)],
                  active: selectedAnchor?.section === sections[currentSectionIndex] &&
                    selectedAnchor?.phrase === phraseStarts.indexOf(number) && selectedAnchor?.edge !== "end",
                }] : []),
                ...(phraseEnds.has(number) ? [{
                  phrase: phraseEnds.get(number)!,
                  edge: "end" as const,
                  active: selectedAnchor?.section === sections[currentSectionIndex] &&
                    selectedAnchor?.phrase === phraseEnds.get(number) &&
                    selectedAnchor?.edge === "end",
                }] : []),
              ].filter((target) => target.phrase >= sections[currentSectionIndex] &&
                target.phrase < (sections[currentSectionIndex + 1] ?? phraseStarts.length)) : undefined}
            />;
          }}
        />
        {showTonalGrid && analysis.modulations[0] !== null && (
          <AnalysisTonalGuides
            analysis={analysis}
            measures={measures}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
            midiRange={midiRange}
            secondsToX={secondsToX}
            sectionSpan={sectionSpan}
          />
        )}
      </div>
    );
  },
);
