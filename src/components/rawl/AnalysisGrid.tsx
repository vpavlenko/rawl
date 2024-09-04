import * as React from "react";
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { RenumberMeasureCallback, getModulations } from "./Rawl";
import { MeasuresAndBeats, MidiRange } from "./SystemLayout";
import {
  Analysis,
  MeasureRenumbering,
  MeasuresSpan,
  PitchClass,
} from "./analysis";

export const STACKED_RN_HEIGHT = 20;
const MIN_WIDTH_BETWEEN_BEATS = 10;
const MIN_WIDTH_BETWEEN_MEASURES = 25;
const GRADIENT_HEIGHT_IN_NOTES = 3;

const KEY_TO_OFFSET = {
  z: -4,
  x: -3,
  c: -2,
  v: -1,
  b: 1,
  n: 2,
  m: 3,
  ",": 4,
};

const VerticalBar = styled.div`
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  pointer-events: none;
`;

export const Cursor = styled(VerticalBar)`
  background-color: orange;
  pointer-events: none;
`;

const MeasureBar = styled(VerticalBar)`
  background-color: #444;
  z-index: 1; // Lower z-index
`;

const BeatBar = styled(VerticalBar)`
  border-left: 1px dashed #333;
  z-index: 1; // Lower z-index
`;

export type MeasureSelection = {
  selectedMeasure: number;
  selectMeasure: (number) => void;
  splitAtMeasure: (boolean) => void;
  mergeAtMeasure: () => void;
  renumberMeasure: RenumberMeasureCallback;
};

const PITCH_CLASS_TO_LETTER = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
};

const RemeasuringInput: React.FC<{
  selectedMeasure: number;
  selectMeasure: (number) => void;
  renumberMeasure: RenumberMeasureCallback;
  splitAtMeasure: (boolean) => void;
  mergeAtMeasure: () => void;
}> = ({
  selectedMeasure,
  selectMeasure,
  renumberMeasure,
  splitAtMeasure,
  mergeAtMeasure,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState<string>("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key in KEY_TO_OFFSET) {
      event.preventDefault();
      const offset = KEY_TO_OFFSET[event.key];
      selectMeasure(selectedMeasure + offset);
    }
    if (event.key === "Enter") {
      event.stopPropagation();
      if (value === "") {
        if (event.shiftKey) {
          mergeAtMeasure();
        } else {
          splitAtMeasure(false);
        }
      } else {
        const parsedValue = parseInt(value, 10);
        if (!isNaN(parsedValue)) {
          renumberMeasure(parsedValue, event.shiftKey);
        }
      }
    }
  };

  useEffect(() => inputRef.current.focus(), []);

  return (
    <input
      type="text"
      ref={inputRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={{ fontSize: "10px", width: "3em" }}
      aria-label="Renumber measure"
      autoFocus
    />
  );
};

const Measure: React.FC<{
  span: [number, number];
  number: number;
  displayNumber: number;
  isPhraseStart: boolean;
  formSection: string;
  measureSelection: MeasureSelection;
  showHeader: boolean;
  secondsToX: (number) => number;
  showNonPhraseStarts: boolean;
  tonicStart?: PitchClass;
  selectedPhraseStart: number;
  sectionSpan: MeasuresSpan;
  previousTonic: PitchClass | null;
  isLastSection: boolean;
}> = ({
  span,
  number,
  displayNumber,
  isPhraseStart,
  formSection,
  measureSelection,
  showHeader,
  secondsToX,
  showNonPhraseStarts,
  tonicStart,
  selectedPhraseStart,
  sectionSpan,
  previousTonic,
  isLastSection,
}) => {
  const {
    selectedMeasure,
    selectMeasure,
    splitAtMeasure,
    mergeAtMeasure,
    renumberMeasure,
  } = measureSelection;

  const left = secondsToX(span[0]) - 1;
  const width = secondsToX(span[1]) - left - 1;

  let modulationDiff: number | null = null;
  if (tonicStart !== undefined && previousTonic !== null) {
    modulationDiff = (tonicStart - previousTonic + 12) % 12;
  }

  return (
    <>
      {showHeader && tonicStart !== undefined && (
        <>
          <span
            style={{
              color: "white",
              position: "absolute",
              top: -2,
              left:
                left +
                (previousTonic === null ? String(number).length * 8 + 10 : 30),
              fontSize: 12,
              zIndex: 100,
              fontWeight: 700,
              userSelect: "none",
            }}
          >
            {previousTonic !== null && (
              <>{`${
                modulationDiff > 6
                  ? `↓${Math.abs(modulationDiff - 12)}`
                  : `↑${modulationDiff}`
              } `}</>
            )}
            {PITCH_CLASS_TO_LETTER[tonicStart]}
          </span>

          <div
            className={`noteColor_${
              modulationDiff === 6 ? 0 : modulationDiff
            }_colors`}
            style={{
              width: 80,
              height: 12,
              position: "absolute",
              top: 0,
              left: left,
              zIndex: 3,
              userSelect: "none",
              maskImage:
                "linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%)",
            }}
          />
        </>
      )}
      {(showNonPhraseStarts || isPhraseStart) && (
        <>
          <MeasureBar
            key={`db_${number}`}
            style={{
              left,
              ...(showNonPhraseStarts && isPhraseStart
                ? { backgroundColor: "#aaa" }
                : {}),
            }}
          />
          {width && showHeader ? (
            <>
              <div
                key={`db_n_${number}`}
                style={{
                  position: "absolute",
                  top: -6,
                  left: left + 7,
                  color:
                    selectedMeasure === number
                      ? "red"
                      : selectedPhraseStart !== -1 &&
                        Math.abs(number - selectedPhraseStart) <= 4
                      ? "orange"
                      : modulationDiff === null
                      ? "#666"
                      : "black",
                  zIndex: 15,
                  cursor: "pointer",
                  userSelect: "none",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectMeasure(number);
                }}
              >
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
                        selectMeasure(null);
                        e.stopPropagation();
                      }}
                    >
                      Esc
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: -20,
                        left: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <RemeasuringInput
                        renumberMeasure={renumberMeasure}
                        splitAtMeasure={splitAtMeasure}
                        mergeAtMeasure={mergeAtMeasure}
                        selectMeasure={selectMeasure}
                        selectedMeasure={selectedMeasure}
                      />
                      <div
                        style={{
                          marginLeft: 5,
                          color: "white",
                          fontSize: 10,
                          whiteSpace: "nowrap",
                        }}
                      >
                        hover the new tonic, click to save modulation
                        {selectedPhraseStart === number &&
                        sectionSpan?.[0] === number - 1 ? (
                          <span>
                            . Shift+Enter to merge back to previous section
                          </span>
                        ) : (
                          <span>. Enter to split into two sections</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
                {selectedMeasure !== null &&
                  selectedPhraseStart === selectedMeasure &&
                  Object.entries(KEY_TO_OFFSET).map(([key, offset]) => {
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
                {selectedPhraseStart === number &&
                  sectionSpan?.[0] !== number - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -12,
                        left: -26,
                        color: "red",
                        fontSize: 14,
                        fontWeight: 700,
                        zIndex: 100,
                      }}
                      onClick={(e) => {
                        splitAtMeasure(false);
                        e.stopPropagation();
                      }}
                    >
                      ↵
                    </div>
                  )}
                {selectedPhraseStart === number &&
                  sectionSpan?.[0] !== number - 1 &&
                  isLastSection && (
                    <div
                      style={{
                        position: "absolute",
                        top: -12,
                        left: -40,
                        color: "red",
                        fontSize: 14,
                        fontWeight: 700,
                        zIndex: 100,
                      }}
                      onClick={(e) => {
                        splitAtMeasure(true);
                        e.stopPropagation();
                      }}
                    >
                      /8
                    </div>
                  )}
                {selectedPhraseStart === number &&
                  sectionSpan?.[0] === number - 1 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        left: 18,
                        color: "red",
                        fontSize: 14,
                        fontWeight: 700,
                        zIndex: 100,
                      }}
                      onClick={(e) => {
                        mergeAtMeasure();
                        e.stopPropagation();
                      }}
                    >
                      ↱
                    </div>
                  )}
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "sans-serif",
                  }}
                >
                  {displayNumber}
                </span>
              </div>
              {formSection && (
                <div
                  key={`form_section_${number}`}
                  style={{
                    position: "absolute",
                    left: left + 23,
                    top: 0,
                    zIndex: 95,
                    backgroundColor: "#3339",
                    padding: "5px 10px 5px 10px",
                    color: "#ffe",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {formSection}
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </>
  );
};

const Beat: React.FC<{ second: number; secondsToX: (number) => number }> = ({
  second,
  secondsToX,
}) => (
  <BeatBar
    style={{ left: secondsToX(second), zIndex: 2, pointerEvents: "none" }}
  />
);

const TonalGrid: React.FC<{
  analysis: Analysis;
  measures: number[];
  midiNumberToY: (number) => number;
  noteHeight: number;
  midiRange: MidiRange;
  secondsToX: (number) => number;
  sectionSpan?: MeasuresSpan;
}> = React.memo(
  ({
    analysis,
    measures,
    midiNumberToY,
    noteHeight,
    midiRange,
    secondsToX,
    sectionSpan,
  }) => {
    const modulations = getModulations(analysis);
    if (!modulations || !measures) return;
    modulations.push({
      measure: measures.length,
      tonic: modulations[0].tonic,
    });

    const minX = secondsToX(measures[sectionSpan?.[0] ?? 0]);
    const maxX =
      secondsToX(measures[sectionSpan?.[1] ?? measures.length - 1]) +
      (modulations.filter(({ measure }) => measure === sectionSpan?.[1])
        .length > 0
        ? 30
        : 0);

    const result = [];
    for (let i = 0; i + 1 < modulations.length; ++i) {
      const fromIndex = modulations[i].measure;
      const toIndex = modulations[i + 1].measure;
      if (toIndex < 0 || fromIndex >= measures.length) {
        continue;
      }
      const from = measures[Math.max(fromIndex, 0)];
      const to = measures[Math.min(toIndex, measures.length - 1)];
      const { tonic } = modulations[i];
      const fromX = secondsToX(from);
      const toX = secondsToX(to);
      const width = Math.min(toX, maxX) - fromX;
      for (let octave = 2; octave <= 9; ++octave) {
        const midiNumber = tonic + octave * 12;
        if (toX >= minX && fromX <= maxX) {
          if (
            midiNumber - 12 >= midiRange[0] &&
            midiNumber - 12 <= midiRange[1]
          )
            // TODO: display a note like C4 gracefully at each gradient start
            result.push(
              <div
                key={`tonalgrid_octave_${i}_${midiNumber}`}
                style={{
                  position: "absolute",
                  width,
                  height: GRADIENT_HEIGHT_IN_NOTES * noteHeight,
                  left: fromX,
                  top: midiNumberToY(
                    midiNumber - 13 + GRADIENT_HEIGHT_IN_NOTES,
                  ),
                  pointerEvents: "none",
                  background: `linear-gradient(to top, #333, transparent)`,
                  zIndex: 0,
                }}
              />,
            );
          if (midiNumber - 7 >= midiRange[0] && midiNumber - 7 <= midiRange[1])
            result.push(
              <div
                key={`tonalgrid_octave_${i}_fifth_${midiNumber}`}
                style={{
                  position: "absolute",
                  width,
                  height: 0,
                  left: fromX,
                  top: midiNumberToY(midiNumber - 6) - 1,
                  pointerEvents: "none",
                  borderBottom: "1px solid #222",
                  zIndex: 0,
                }}
              />,
            );
        }
      }
    }
    return result;
  },
);

const renumberMeasure: (
  measureStart: number,
  measureRenumbering: MeasureRenumbering,
) => number = (measureStart, measureRenumbering) => {
  if (measureRenumbering === undefined) {
    return measureStart;
  }

  let maxKey: number | undefined = undefined;
  Object.keys(measureRenumbering).forEach((key) => {
    const numericKey = parseInt(key, 10);
    if (
      numericKey <= measureStart &&
      (maxKey === undefined || numericKey > maxKey)
    ) {
      maxKey = numericKey;
    }
  });

  if (maxKey === undefined) {
    return measureStart;
  }
  return measureStart + measureRenumbering[maxKey] - maxKey;
};

export const AnalysisGrid: React.FC<{
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  phraseStarts: number[];
  midiRange: MidiRange;
  measureSelection: MeasureSelection;
  showHeader?: boolean;
  showTonalGrid?: boolean;
  secondsToX: (number) => number;
  sectionSpan?: MeasuresSpan;
}> = React.memo(
  ({
    analysis,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    measureSelection,
    phraseStarts,
    midiRange,
    showHeader = true,
    showTonalGrid = true,
    secondsToX,
    sectionSpan = null,
  }) => {
    const { measures, beats } = measuresAndBeats;
    if (sectionSpan == null) {
      sectionSpan = [0, measures.length - 1];
    }
    const modulationsArray = getModulations(analysis);
    const modulations = new Map(
      modulationsArray.map(({ measure, tonic }) => [measure, tonic]),
    );
    const findPreviousTonic = (currentMeasure: number): PitchClass | null =>
      modulationsArray.reduce(
        (acc, { measure, tonic }) =>
          measure < currentMeasure && measure > acc.measure
            ? { measure, tonic }
            : acc,
        { measure: -Infinity, tonic: null },
      ).tonic;

    // const beatsInThirdMeasure = beats.filter(
    //   (beat) =>
    //     beat > measures[Math.min(sectionSpan[0] + 2, sectionSpan[1] - 1)],
    // );
    // const showBeats = true;
    // beatsInThirdMeasure.length < 2 ||
    // secondsToX(beatsInThirdMeasure[1]) - secondsToX(beatsInThirdMeasure[0]) >=
    //   MIN_WIDTH_BETWEEN_BEATS;
    const showAllMeasureBars = true;
    // showBeats ||
    // secondsToX(measures[2]) - secondsToX(measures[1]) >=
    //   MIN_WIDTH_BETWEEN_MEASURES;

    // TODO: filter measures and beats using sectionSpan
    const showBeats = React.useMemo(() => {
      const relevantBars = [...measures, ...beats]
        .filter(
          (bar) =>
            bar !== 0 &&
            bar >= measures[sectionSpan[0]] &&
            bar <= measures[sectionSpan[1]],
        )
        .sort((a, b) => a - b);
      return (
        (secondsToX(relevantBars.at(-1)) - secondsToX(relevantBars.at(0))) /
          (relevantBars.length + 1) >=
        MIN_WIDTH_BETWEEN_BEATS
      );
    }, [measures, beats, secondsToX, sectionSpan]);

    const selectedPhraseStart =
      phraseStarts.indexOf(measureSelection.selectedMeasure) !== -1
        ? measureSelection.selectedMeasure
        : -1;
    return (
      <div style={{ zIndex: 15 }}>
        {measures.map((time, i) => {
          const number = i + 1;
          const displayNumber = renumberMeasure(
            i + 1,
            analysis.measureRenumbering,
          );
          return sectionSpan[0] <= i && i <= sectionSpan[1] ? (
            <Measure
              key={i}
              showHeader={showHeader && i < sectionSpan[1]}
              span={[time, measures[number] ?? time]}
              isPhraseStart={phraseStarts.indexOf(number) !== -1}
              formSection={(analysis.form ?? {})[number]}
              number={number}
              displayNumber={displayNumber}
              measureSelection={measureSelection}
              secondsToX={secondsToX}
              showNonPhraseStarts={showAllMeasureBars}
              tonicStart={modulations.get(i)}
              previousTonic={findPreviousTonic(i)}
              selectedPhraseStart={selectedPhraseStart}
              sectionSpan={sectionSpan}
              isLastSection={sectionSpan?.[1] + 1 === measures.length}
            />
          ) : null;
        })}
        {showBeats &&
          beats.map((time) =>
            time >= measures[sectionSpan[0]] &&
            time <= measures[sectionSpan[1]] ? (
              <Beat key={time} second={time} secondsToX={secondsToX} />
            ) : null,
          )}
        {showTonalGrid && analysis.modulations[0] !== null && (
          <TonalGrid
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
