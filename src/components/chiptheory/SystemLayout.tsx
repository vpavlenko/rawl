import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnalysisGrid, Cursor } from "./AnalysisGrid";
import { SecondsSpan, secondsToX } from "./Chiptheory";
import { Analysis } from "./analysis";
import { Note } from "./noteParsers";
import {
  TWELVE_CHORD_TONES,
  TWELVE_TONE_COLORS,
  getChordNote,
  getNoteMeasure,
  getTonic,
} from "./romanNumerals";
import { ANALYSIS_HEIGHT } from "./tags";

const getMidiRange = (
  notes: Note[],
): { minMidiNumber: number; maxMidiNumber: number } => {
  let minMidiNumber = +Infinity;
  let maxMidiNumber = -Infinity;
  for (const note of notes) {
    const { midiNumber } = note.note;
    if (midiNumber < minMidiNumber) {
      minMidiNumber = midiNumber;
    }
    if (midiNumber > maxMidiNumber) {
      maxMidiNumber = midiNumber;
    }
  }
  return { minMidiNumber, maxMidiNumber };
};

// This is used when tonic isn't set yet.
const VOICE_TO_COLOR = [
  "#26577C",
  "#AE445A",
  "#63995a",
  "#7c7126",
  "#7c2676",
  "#4e267c",
];

const getNoteColor = (
  voiceIndex: number,
  note: Note,
  analysis,
  measures: number[],
): string => {
  if (analysis.tonic === null) {
    return VOICE_TO_COLOR[voiceIndex % VOICE_TO_COLOR.length]; // TODO: introduce 16 colors for all possible midi channels
  }

  return TWELVE_TONE_COLORS[
    (note.note.midiNumber -
      getTonic(getNoteMeasure(note, measures), analysis)) %
      12
  ];
};

const isCenterInsideSpan = (note: Note, span: SecondsSpan) => {
  let center = (note.span[0] + note.span[1]) / 2;
  return span[0] < center && center < span[1];
};

const getIntervalBelow = (note: Note, allNotes: Note[]) => {
  let minDistance = Infinity;
  for (let n of allNotes) {
    if (
      n.note.midiNumber < note.note.midiNumber &&
      isCenterInsideSpan(note, n.span)
    ) {
      minDistance = Math.min(
        minDistance,
        note.note.midiNumber - n.note.midiNumber,
      );
    }
  }
  return minDistance;
};

const getNoteRectangles = (
  notes: Note[],
  voiceIndex: number, // -1 if it's a note highlight for notes under cursor
  isActiveVoice: boolean,
  analysis: Analysis,
  midiNumberToY: (number: number) => number,
  noteHeight: number,
  handleNoteClick = (note: Note, altKey: boolean) => {},
  measures: number[] = null,
  handleMouseEnter = (note: Note, altKey: boolean) => {},
  handleMouseLeave = () => {},
  allNotes: Note[] = [],
  voiceMask = null,
  showIntervals = false,
) => {
  return notes.map((note) => {
    const top = midiNumberToY(note.note.midiNumber);
    const left = secondsToX(note.span[0]);
    const color = getNoteColor(voiceIndex, note, analysis, measures);
    const chordNote =
      voiceIndex !== -1
        ? getChordNote(note, analysis, measures, analysis.romanNumerals)
        : null;
    const noteElement = chordNote ? (
      <span
        className="noteText"
        style={{
          fontSize: `${Math.min(noteHeight + 2, 14)}px`,
          lineHeight: `${Math.min(noteHeight, 14)}px`,
          fontFamily: "Helvetica, sans-serif",
          fontWeight: 700,
          color:
            ["brown", "blue", "#9400D3", "#787276"].indexOf(color) !== -1
              ? "white"
              : "black",
        }}
      >
        {chordNote}
      </span>
    ) : null;
    const intervalBelow = showIntervals && getIntervalBelow(note, allNotes);

    return (
      <div
        className={"noteRectangleTonal"}
        style={{
          position: "absolute",
          height: `${noteHeight}px`,
          width: secondsToX(note.span[1]) - secondsToX(note.span[0]),
          backgroundColor: color,
          top,
          left,
          pointerEvents: voiceIndex === -1 ? "none" : "auto",
          borderRadius: [10, 3, 0, 5, 20, 7, 1][voiceIndex % 7],
          cursor: "pointer",
          zIndex: 10,
          opacity: isActiveVoice ? 0.9 : 0.1,
          display: "grid",
          placeItems: "center",
          ...(voiceIndex === -1
            ? {
                boxShadow: "white 0px 1px",
                boxSizing: "border-box",
                backgroundColor: "transparent",
              }
            : {}),
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleNoteClick(note, e.altKey);
        }}
        onMouseEnter={(e) => handleMouseEnter(note, e.altKey)}
        onMouseLeave={handleMouseLeave}
      >
        {showIntervals && intervalBelow !== Infinity && isActiveVoice && (
          // voiceMask.filter(Boolean).length === 1 &&
          <div
            style={{
              position: "relative",
              top: noteHeight,
              color: "white",
              fontFamily: "sans-serif",
              fontSize: "12px",
            }}
          >
            {TWELVE_CHORD_TONES[intervalBelow % 12]}
          </div>
        )}
        {!showIntervals && noteElement}
      </div>
    );
  });
};

// TODO: add types
// TODO: maybe add React.memo
export const InfiniteHorizontalScrollSystemLayout = ({
  analysis,
  voiceMask,
  handleNoteClick,
  handleMouseEnter,
  handleMouseLeave,
  allActiveNotes,
  systemClickHandler,
  positionMs,
  futureAnalysis,
  notes,
  seek,
  measuresAndBeats,
  previouslySelectedMeasure,
  selectedMeasure,
  selectMeasure,
  commitAnalysisUpdate,
  setVoiceMask,
  loggedIn,
  showIntervals,
  setShowIntervals,
  fileType,
  registerSeekCallback,
  hoveredNote,
  hoveredAltKey,
}) => {
  const { minMidiNumber, maxMidiNumber } = useMemo(
    () => getMidiRange(allActiveNotes.flat()),
    [allActiveNotes],
  );

  const [divHeight, setDivHeight] = useState(0);
  const divRef = useRef(null);
  useEffect(() => {
    const updateHeight = () => {
      if (divRef.current) {
        setDivHeight(divRef.current.offsetHeight);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    new ResizeObserver(() => updateHeight()).observe(divRef.current);
    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const seekCallback = (seekMs) =>
    (divRef.current.scrollLeft = secondsToX(seekMs / 1000) - 100);

  useEffect(() => {
    registerSeekCallback(seekCallback);
  }, []);

  const noteHeight =
    (divHeight - ANALYSIS_HEIGHT) / (maxMidiNumber - minMidiNumber + 7);
  const midiNumberToY = useMemo(
    () => (midiNumber) =>
      divHeight - (midiNumber - minMidiNumber + 4) * noteHeight,
    [noteHeight],
  );

  const noteRectangles = useMemo(
    () =>
      notes.flatMap((voice, i) =>
        getNoteRectangles(
          voice,
          i,
          voiceMask[i],
          futureAnalysis,
          midiNumberToY,
          noteHeight,
          handleNoteClick,
          measuresAndBeats.measures,
          handleMouseEnter,
          handleMouseLeave,
          allActiveNotes,
          voiceMask,
          showIntervals,
        ),
      ),
    [
      notes,
      analysis,
      measuresAndBeats,
      noteHeight,
      voiceMask,
      hoveredNote,
      hoveredAltKey,
      showIntervals,
    ],
  );

  return (
    <div
      key="leftPanel"
      style={{
        width: "100%",
        height: "100%",
        padding: 0,
        backgroundColor: "black",
      }}
    >
      <div
        ref={divRef}
        style={{
          margin: 0,
          padding: 0,
          position: "relative",
          overflowX: "scroll",
          overflowY: "hidden",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
        }}
        onClick={systemClickHandler}
      >
        {noteRectangles}
        {/* {currentlyPlayedRectangles} */}
        <Cursor style={{ left: secondsToX(positionMs / 1000) }} />
        <AnalysisGrid
          analysis={futureAnalysis}
          voices={notes}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={noteHeight}
          previouslySelectedMeasure={previouslySelectedMeasure}
          selectedMeasure={selectedMeasure}
          selectMeasure={selectMeasure}
          commitAnalysisUpdate={commitAnalysisUpdate}
          setVoiceMask={setVoiceMask}
          loggedIn={loggedIn}
          seek={seek}
          // TODO: rename this argument. very misleading
          showIntervals={setShowIntervals}
          fileType={fileType}
        />
      </div>
    </div>
  );
};

export const StackedSystemLayout = () => {};
